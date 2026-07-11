import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
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
import { resetDatabase } from '@/services/databaseReset.service';

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

/* ---------- Reusable presentational pieces ---------- */

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="mb-4">
      <Text className="text-xl text-center font-bold text-slate-900">{title}</Text>
      {subtitle ? <Text className=" text-center mt-1 text-sm text-slate-500">{subtitle}</Text> : null}
    </View>
  );
}

function StatCard({
  label,
  value,
  tone = 'default',
  onPress,
}: {
  label: string;
  value: string | number;
  tone?: 'default' | 'warning' | 'danger' | 'success' | 'info';
  onPress?: () => void;
}) {
  const tones = {
    default: {
      bg: 'bg-white',
      label: 'text-slate-500',
      value: 'text-slate-900',
      bar: 'bg-blue-500',
    },
    warning: {
      bg: 'bg-amber-50',
      label: 'text-amber-700',
      value: 'text-amber-800',
      bar: 'bg-amber-500',
    },
    danger: { bg: 'bg-red-50', label: 'text-red-700', value: 'text-red-800', bar: 'bg-red-500' },
    success: {
      bg: 'bg-emerald-50',
      label: 'text-emerald-700',
      value: 'text-emerald-800',
      bar: 'bg-emerald-500',
    },
    info: { bg: 'bg-blue-50', label: 'text-blue-700', value: 'text-blue-900', bar: 'bg-blue-500' },
  }[tone];

  const Wrapper: any = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.85}
      className={`flex-1 overflow-hidden rounded-2xl shadow-2xl ${tones.bg} p-5 shadow-sm`}>
      <View className={`absolute left-0 top-0 h-full  w-1 ${tones.bar}`} />
      <Text className={`shadow-2xl text-xs font-medium uppercase tracking-wide ${tones.label}`}>{label}</Text>
      <Text className={`mt-2 shadow-2xl text-3xl font-extrabold ${tones.value}`}>{value}</Text>
    </Wrapper>
  );
}

function ActionCard({
  title,
  subtitle,
  onPress,
  variant = 'primary',
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  variant?: 'primary' | 'success' | 'dark' | 'danger' | 'ghost';
}) {
  const styles = {
    primary: 'bg-blue-600',
    success: 'bg-emerald-600',
    dark: 'bg-slate-800',
    danger: 'bg-red-600',
    ghost: 'bg-white border border-slate-200',
  }[variant];

  const textColor = variant === 'ghost' ? 'text-slate-900' : 'text-white';
  const subColor = variant === 'ghost' ? 'text-slate-500' : 'text-white/70';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      className={ ` shadow-2xl  flex-1 rounded-2xl ${styles} p-5 `}>
      <Text className={`text-xl font-bold ${textColor}`}>{title}</Text>
      {subtitle ? <Text className={`mt-1 text-sm ${subColor}`}>{subtitle}</Text> : null}
    </TouchableOpacity>
  );
}

/* Fills the remaining columns in a row so cards keep equal width */
function Spacer({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className="flex-1" />
      ))}
    </>
  );
}

/* ---------- Screen ---------- */

export default function Dashboard() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { width } = useWindowDimensions();
  const isWide = width >= 900; // tablet landscape / large tablets

  const barcodeRef = useRef<React.ElementRef<typeof ViewShot>>(null);
  const [barcodeLabels, setBarcodeLabels] = useState<BarcodeLabel[]>([]);
  const user = getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const [storage, setStorage] = useState({ databaseSize: 0, freeSpace: 0 });
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
        { text: 'Cancelar', style: 'cancel' },
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
    const dashboard = await getDashboardStats();
    await expireReservations();
    await loadDashboard();
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
        const base64 = await barcodeRef.current!.capture!();
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
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-slate-600">Cargando Dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: isWide ? 32 : 20, paddingBottom: 48 }}>
        {/* HEADER */}
        <View className="mb-8 flex-row items-center justify-between rounded-3xl bg-white p-6 shadow-sm">
          <View className="flex-1 pr-4  ">
            <Text className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Inventario Local
            </Text>
            <Text className="border-black shadow-2xl  mt-2 text-4xl font-extrabold text-slate-900">
              Bienvenido, {user?.full_name}
            </Text>
            <Text className="mt-1 text-sm text-slate-500">Sesión activa · Rol {user?.role}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} className="rounded-xl bg-red-500 px-5 py-3">
            <Text className="text-xl font-bold text-white">Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

        {/* DASHBOARD ADMIN */}
        {isAdmin && (
          <View className="mb-8">
            <SectionTitle title="Estado del negocio" subtitle="Resumen general del inventario" />

            {/* Row 1: 4 métricas */}
            <View className={`${isWide ? 'flex-row' : 'flex-row flex-wrap'} gap-4`}>
              <StatCard
                label="Productos"
                value={stats.products}
                onPress={() => navigation.navigate('inventory', { filter: 'ALL' })}
              />
              <StatCard
                label="Variantes"
                value={stats.variants}
                onPress={() => navigation.navigate('inventory', { filter: 'ALL' })}
              />
              <StatCard
                label="Stock bajo"
                value={stats.lowStock}
                tone="warning"
                onPress={() => navigation.navigate('inventory', { filter: 'LOW_STOCK' })}
              />
              <StatCard
                label="Agotadas"
                value={stats.outOfStock}
                tone="danger"
                onPress={() => navigation.navigate('inventory', { filter: 'OUT_OF_STOCK' })}
              />
            </View>

            {/* Row 2: ventas del día grande */}
            <View className="shadow-2xl mt-4 rounded-2xl bg-emerald-600 p-6 border-green-950 ">
              <Text className="text-xs font-semibold uppercase tracking-widest text-emerald-100">
                Total vendido hoy
              </Text>
              <Text className="mt-2 text-5xl font-extrabold text-white">
                ${stats.todaySales.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* ESTADÍSTICAS DE VENTAS */}
        {isAdmin && (
          <View className="mb-8">
            <SectionTitle title="Estadísticas de ventas" />

            <View className={`${isWide ? 'flex-row' : ''} gap-4`}>
              {/* Top + Least product columna */}
              <View className={`${isWide ? 'flex-1' : ''} gap-4`}>
                <View className="rounded-2xl  bg-blue-100   p-5">
                  <Text className="text-lg font-semibold uppercase tracking-widest text-blue-700">
                    Más vendido
                  </Text>
                  <Text className="mt-2 text-xl font-bold text-blue-900">
                    {topProduct?.name ?? 'Sin datos'}
                  </Text>
                  <Text className="mt-1 text-lg text-blue-700">
                    {topProduct?.total_sold ?? 0} unidades
                  </Text>
                </View>

                <View className="rounded-2xl bg-slate-100 p-5">
                  <Text className="text-lg font-semibold uppercase tracking-widest text-slate-600">
                    Menos vendido
                  </Text>
                  <Text className="mt-2 text-xl font-bold text-slate-900">
                    {leastProduct?.name ?? 'Sin datos'}
                  </Text>
                  <Text className="mt-1 text-lg text-slate-600">
                    {leastProduct?.total_sold ?? 0} unidades
                  </Text>
                </View>
              </View>

              {/* Top list */}
              <View
                className={`${isWide ? 'flex-[1.4]' : 'mt-4'} rounded-2xl bg-white p-5 shadow-sm`}>
                <Text className="mb-3 text-lg font-bold text-slate-900">Top productos</Text>
                {topList.length === 0 ? (
                  <Text className="text-sm text-slate-500">Sin datos disponibles</Text>
                ) : (
                  topList.map((item, idx) => (
                    <View
                      key={item.id}
                      className={`flex-row items-center justify-between py-3 ${
                        idx !== topList.length - 1 ? 'border-b border-slate-100' : ''
                      }`}>
                      <View className="flex-row items-center gap-3">
                        <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <Text className="text-sm  font-bold text-blue-700">{idx + 1}</Text>
                        </View>
                        <Text className="text-lg text-slate-800">{item.name}</Text>
                      </View>
                      <Text className="text-sm font-bold text-slate-900">
                        {item.total_sold} uds
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        )}

        {/* ACCIONES */}
        <View className="mb-8">
          <SectionTitle title="Acciones rápidas" subtitle="Operaciones del día a día" />

          <View className={`${isWide ? 'flex-row' : 'flex-row flex-wrap'} gap-4`}>
            <ActionCard
              title="Consultar Inventario"
              subtitle="Buscar productos y stock"
              variant="primary"
              onPress={() => navigation.navigate('inventory')}
            />
            <ActionCard
              title="Registrar Venta"
              subtitle="Escanear y cobrar"
              variant="success"
              onPress={() => navigation.navigate('Scan')}
            />
            <ActionCard
              title="Historial de ventas"
              subtitle="Revisar transacciones"
              variant="dark"
              onPress={() => navigation.navigate('Sales')}
            />
          </View>

          <View className={`mt-4 ${isWide ? 'flex-row' : 'flex-row flex-wrap'} gap-4`}>
            <ActionCard
              title="Apartados"
              subtitle="Reservas activas"
              variant="dark"
              onPress={() => navigation.navigate('Reservations')}
            />
            <ActionCard
              title="Exportar códigos"
              subtitle="Generar PDF de etiquetas"
              variant="ghost"
              onPress={handleExportBarcodes}
            />
            {isWide && <Spacer count={1} />}
          </View>
        </View>

        {/* ADMIN */}
        {isAdmin && (
          <View className="mb-8">
            <SectionTitle title="Administración" subtitle="Gestión y mantenimiento del sistema" />

            <View className={`${isWide ? 'flex-row' : 'flex-row flex-wrap'} gap-4`}>
              <ActionCard
                title="Productos"
                subtitle="Alta y edición"
                variant="dark"
                onPress={() => navigation.navigate('NewProduct')}
              />
              <ActionCard
                title="Catálogos"
                subtitle="Categorías y marcas"
                variant="dark"
                onPress={() => navigation.navigate('CatalogScreen')}
              />
              <ActionCard
                title="Movimientos"
                subtitle="Reporte de inventario"
                variant="dark"
                onPress={() => navigation.navigate('MovementReport')}
              />
            </View>

            <View className={`mt-4 ${isWide ? 'flex-row' : 'flex-row flex-wrap'} gap-4`}>
              <ActionCard
                title="Respaldo de BD"
                subtitle="Exportar información"
                variant="dark"
                onPress={async () => {
                  try {
                    await createBackup();
                  } catch (error) {
                    console.log('Error export Respaldo DB, Dashboard: ', error);
                  }
                }}
              />
              <ActionCard
                title="Restaurar BD"
                subtitle="Importar respaldo"
                variant="dark"
                onPress={async () => {
                  try {
                    const file = await selectBackupFile();
                    if (!file) return;
                    const restored = await restoreBackup(file.uri);
                    if (restored) {
                      Alert.alert(
                        'Restauración completada',
                        'La base de datos fue restaurada correctamente.\n\nCierra sesión y vuelve a iniciar para cargar la información restaurada.'
                      );
                    } else {
                      Alert.alert('Error', 'No fue posible restaurar la base de datos.');
                    }
                  } catch (error) {
                    console.log('Error backup Respaldo DB, Dashboard: ', error);
                  }
                }}
              />
              <ActionCard
                title="Reiniciar BD"
                subtitle="Eliminar todo"
                variant="danger"
                onPress={handleResetDatabase}
              />
            </View>

            {/* Almacenamiento */}
            <View className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
              <Text className="text-base font-bold text-slate-900">Almacenamiento</Text>
              <View className={`mt-4 ${isWide ? 'flex-row' : ''} gap-4`}>
                <View className="flex-1 rounded-xl bg-slate-50 p-4">
                  <Text className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Base de datos
                  </Text>
                  <Text className="mt-2 text-2xl font-bold text-slate-900">
                    {formatBytes(storage.databaseSize)}
                  </Text>
                </View>
                <View className="flex-1 rounded-xl bg-slate-50 p-4">
                  <Text className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Espacio libre
                  </Text>
                  <Text className="mt-2 text-2xl font-bold text-slate-900">
                    {formatBytes(storage.freeSpace)}
                  </Text>
                </View>
              </View>
            </View>

            {barcodeLabels.length > 0 && (
              <BarcodeCapture
                ref={barcodeRef}
                labels={barcodeLabels}
                onReady={() => setBarcodeReady(true)}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
