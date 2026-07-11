import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { logout, getCurrentUser } from '@/auth/auth';
import { BarcodeLabel, RootStackParamList } from '@/types/types';
import ViewShot from 'react-native-view-shot';
import { generateBarcodePdf } from '@/services/barcodePDF.service';
import BarcodeCapture from '@/components/BarcodeCapture';
import { getBarcodeLabels } from '@/repositories/barcodeRepository';
import { getDashboardStats } from '@/repositories/dashboardRepository';
import { getStorageInfo } from '@/services/storage.service';
import {
  getTopSellingProduct,
  getLeastSellingProduct,
  getTopProducts,
} from '@/repositories/statsRepository';
import { expireReservations } from '@/repositories/reservationRepository';
import { createBackup } from '@/services/backup.service';
import { restoreBackup, selectBackupFile } from '@/services/restore.service';
type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
import { resetDatabase } from '@/services/databaseReset.service';
export default function Dashboard() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const barcodeRef = useRef<React.ElementRef<typeof ViewShot>>(null);

  const [barcodeLabels, setBarcodeLabels] = useState<BarcodeLabel[]>([]);
  const user = getCurrentUser();
  const [storage, setStorage] = useState({
    databaseSize: 0,
    freeSpace: 0,
  });
  const isAdmin = user?.role === 'ADMIN';

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    products: 0,
    variants: 0,
    lowStock: 0,
    outOfStock: 0,
    todaySales: 0,
  });

  const [topProduct, setTopProduct] = useState<any>(null);
  const [leastProduct, setLeastProduct] = useState<any>(null);
  const [topList, setTopList] = useState<any[]>([]);
  const [barcodeReady, setBarcodeReady] = useState(false);
  const handleExportBarcodes = async () => {
    try {
      const labels = await getBarcodeLabels();

      if (labels.length === 0) {
        Alert.alert('No existen etiquetas');
        return;
      }

      console.log('Etiquetas encontradas:', labels.length);

      setBarcodeReady(false);
      setBarcodeLabels(labels);
    } catch (error) {
      console.log('Error cargando etiquetas:', error);
    }
  };

  async function handleResetDatabase() {
    Alert.alert(
      'Reiniciar Base de Datos',
      'Esta acción eliminará toda la información almacenada.\n\nSe recomienda crear un respaldo antes de continuar.\n\n¿Deseas continuar?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await resetDatabase();

            if (success) {
              Alert.alert(
                'Proceso completado',
                'La base de datos fue reiniciada correctamente.\n\nCierra y vuelve a abrir la aplicación.'
              );
            } else {
              Alert.alert('Error', 'No fue posible reiniciar la base de datos.');
            }
          },
        },
      ]
    );
  }

  async function loadStats() {
    console.log('LOAD STATS');

    const dashboard = await getDashboardStats();

    await expireReservations();
    await loadDashboard();

    console.log('Antes de getStorageInfo');

    const storageInfo = await getStorageInfo();

    setStorage(storageInfo);

    const [top, least, topListData] = await Promise.all([
      getTopSellingProduct(),
      getLeastSellingProduct(),
      getTopProducts(5),
    ]);

    setStats(dashboard);
    setTopProduct(top);
    setLeastProduct(least);
    setTopList(topListData);
  }

  useEffect(() => {
    if (!barcodeReady) return;

    const exportPdf = async () => {
      try {
        if (!barcodeRef.current) return;

        const base64 = await barcodeRef.current.capture();

        await generateBarcodePdf(base64);

        setBarcodeReady(false);
        setBarcodeLabels([]);
      } catch (error) {
        console.log(error);
      }
    };

    exportPdf();
  }, [barcodeReady]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

 useFocusEffect(
    useCallback(() => {
      expireReservations();
    }, [])
  );

  async function loadDashboard() {
    try {
      const result = await getDashboardStats();
      setStats(result);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigation.replace('Login');
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    }

    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }
  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />

        <Text className="mt-4">Cargando Dashboard...</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 40,
        }}>
        {/* HEADER */}

        <Text className="text-3xl font-bold text-blue-700">Inventario Local</Text>

        <Text className="mt-3 text-lg text-gray-700">Bienvenido</Text>

        <Text className="text-2xl font-bold">{user?.full_name}</Text>

        <Text className="mb-6 text-base text-gray-500">Rol: {user?.role}</Text>

        {/* DASHBOARD ADMIN */}

        {isAdmin && (
          <>
            <View className="mb-6">
              <Text className="mb-3 text-lg font-bold">Estado del negocio</Text>

              <View className="flex-row flex-wrap justify-between">
                {/* PRODUCTOS */}
                <TouchableOpacity
                  className="mb-3 w-[48%] rounded-xl bg-white p-4 shadow"
                  onPress={() =>
                    navigation.navigate('inventory', {
                      filter: 'ALL',
                    })
                  }>
                  <Text className="text-sm text-gray-500">Productos registrados</Text>

                  <Text className="mt-1 text-2xl font-bold">{stats.products}</Text>
                </TouchableOpacity>

                {/* VARIANTES */}
                <TouchableOpacity
                  className="mb-3 w-[48%] rounded-xl bg-white p-4 shadow"
                  onPress={() =>
                    navigation.navigate('inventory', {
                      filter: 'ALL',
                    })
                  }>
                  <Text className="text-sm text-gray-500">Variantes registradas</Text>

                  <Text className="mt-1 text-2xl font-bold">{stats.variants}</Text>
                </TouchableOpacity>

                {/* STOCK BAJO */}
                <TouchableOpacity
                  className="mb-3 w-[48%] rounded-xl bg-yellow-50 p-4 shadow"
                  onPress={() =>
                    navigation.navigate('inventory', {
                      filter: 'LOW_STOCK',
                    })
                  }>
                  <Text className="text-sm text-yellow-700">Variantes con stock bajo</Text>

                  <Text className="mt-1 text-2xl font-bold text-yellow-700">{stats.lowStock}</Text>
                </TouchableOpacity>

                {/* AGOTADOS */}
                <TouchableOpacity
                  className="mb-3 w-[48%] rounded-xl bg-red-50 p-4 shadow"
                  onPress={() =>
                    navigation.navigate('inventory', {
                      filter: 'OUT_OF_STOCK',
                    })
                  }>
                  <Text className="text-sm text-red-700">Variantes agotadas</Text>

                  <Text className="mt-1 text-2xl font-bold text-red-700">{stats.outOfStock}</Text>
                </TouchableOpacity>

                {/* VENTAS DEL DÍA (SIN ACCIÓN AÚN) */}
                <View className="w-full rounded-xl bg-green-50 p-4 shadow">
                  <Text className="text-sm text-green-700">Total vendido hoy</Text>

                  <Text className="mt-1 text-3xl font-bold text-green-700">
                    ${stats.todaySales.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
            <View className="mt-6">
              <Text className="mb-3 text-lg font-bold">Estadísticas de ventas</Text>

              {/* TOP PRODUCT */}
              <View className="mb-3 rounded-xl bg-blue-50 p-4">
                <Text className="text-sm text-blue-700">Producto más vendido</Text>

                <Text className="mt-1 text-lg font-bold text-blue-900">
                  {topProduct?.name ?? 'Sin datos'}
                </Text>

                <Text className="text-blue-700">{topProduct?.total_sold ?? 0} unidades</Text>
              </View>

              {/* LEAST PRODUCT */}
              <View className="mb-3 rounded-xl bg-gray-100 p-4">
                <Text className="text-sm text-gray-600">Producto menos vendido</Text>

                <Text className="mt-1 text-lg font-bold">{leastProduct?.name ?? 'Sin datos'}</Text>

                <Text className="text-gray-600">{leastProduct?.total_sold ?? 0} unidades</Text>
              </View>

              {/* TOP LIST */}
              <View className="rounded-xl bg-white p-4 shadow">
                <Text className="mb-2 font-bold">Top productos</Text>

                {topList.map((item) => (
                  <View key={item.id} className="flex-row justify-between py-1">
                    <Text>{item.name}</Text>

                    <Text className="font-bold">{item.total_sold} uds</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* ACCIONES */}

        <Text className="mb-4 text-2xl font-bold">Acciones</Text>

        <View className="gap-4">
          <TouchableOpacity
            className="rounded-2xl bg-blue-500 p-6"
            onPress={() => navigation.navigate('inventory')}>
            <Text className="text-lg font-bold text-white">Consultar Inventario</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mb-3 w-[48%] rounded-xl bg-white p-4 shadow"
            onPress={handleExportBarcodes}>
            <Text className="text-sm text-gray-500">Exportar códigos</Text>

            <Text className="mt-1 text-2xl font-bold">PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-2xl bg-green-600 p-6"
            onPress={() => navigation.navigate('Scan')}>
            <Text className="text-lg font-bold text-white">Registrar Venta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-xl bg-gray-800 p-4"
            onPress={() => navigation.navigate('Reservations')}>
            <Text className="font-bold text-white">Apartados</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-2xl bg-green-600 p-6"
            onPress={() => navigation.navigate('Sales')}>
            <Text className="text-lg font-bold text-white"> Historial de ventas</Text>
          </TouchableOpacity>
        </View>

        {/* ADMIN */}

        {isAdmin && (
          <>
            <Text className="mb-4 mt-10 text-2xl font-bold">Administración</Text>

            <View className="gap-4">
              <TouchableOpacity
                className="rounded-2xl bg-gray-800 p-6"
                onPress={() => navigation.navigate('NewProduct')}>
                <Text className="text-lg font-bold text-white">Productos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-2xl bg-gray-800 p-6"
                onPress={() => {
                  navigation.navigate('CatalogScreen');
                }}>
                <Text className="text-lg font-bold text-white">Catálogos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-2xl bg-gray-800 p-6"
                onPress={() => navigation.navigate('MovementReport')}>
                <Text className="text-lg font-bold text-white">Movimientos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  try {
                    await createBackup();
                  } catch (error) {
                    console.log('Error export Respaldo DB, Dashboard: ', error);
                  }
                }}
                className="rounded-2xl bg-gray-800 p-6">
                <Text className="text-lg font-bold text-white">Respaldo de Base de Datos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-2xl bg-red-700 p-6"
                onPress={handleResetDatabase}>
                <Text className="text-lg font-bold text-white">Reiniciar Base de Datos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  try {
                    const file = await selectBackupFile();

                    if (!file) {
                      return;
                    }

                    const restored = await restoreBackup(file.uri);

                    if (restored) {
                      Alert.alert(
                        'Restauración completada',
                        'La base de datos fue restaurada correctamente.\n\nCierra sesión vuelve a iniciar para cargar la información restaurada.'
                      );
                    } else {
                      Alert.alert('Error', 'No fue posible restaurar la base de datos.');
                    }

                    await restoreBackup(file.uri);
                  } catch (error) {
                    console.log('Error backup Respaldo DB, Dashboard: ', error);
                  }
                }}
                className="rounded-2xl bg-gray-800 p-6">
                <Text className="text-lg font-bold text-white">Restauración de Base de Datos</Text>
              </TouchableOpacity>

              <View className="mt-4 rounded-xl bg-white p-4 shadow">
                <Text className="text-lg font-bold">Almacenamiento</Text>

                <Text className="mt-3">Base de datos: {formatBytes(storage.databaseSize)}</Text>

                <Text className="mt-2">Espacio libre: {formatBytes(storage.freeSpace)}</Text>
              </View>

              {/* Aquí va BarcodeCapture */}
              {barcodeLabels.length > 0 && (
                <BarcodeCapture
                  ref={barcodeRef}
                  labels={barcodeLabels}
                  onReady={() => setBarcodeReady(true)}
                />
              )}
            </View>
          </>
        )}

        {/* LOGOUT */}

        <TouchableOpacity className="mt-10 rounded-2xl bg-red-600 p-6" onPress={handleLogout}>
          <Text className="text-center text-lg font-bold text-white">Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
