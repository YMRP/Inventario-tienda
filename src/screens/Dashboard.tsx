import { useEffect, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { logout, getCurrentUser } from '@/auth/auth';
import { RootStackParamList } from '@/types/types';

import { getDashboardStats } from '@/repositories/dashboardRepository';
import {
  getTopSellingProduct,
  getLeastSellingProduct,
  getTopProducts,
} from '@/repositories/statsRepository';
import { expireReservations } from '@/repositories/reservationRepository';
type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export default function Dashboard() {
  const navigation = useNavigation<DashboardNavigationProp>();

  const user = getCurrentUser();

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

  async function loadStats() {
    const dashboard = await getDashboardStats();
    await expireReservations();
    await loadDashboard();
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
    loadStats();
  }, []);

  useEffect(() => {
    expireReservations();
  }, []);

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

  function getBusinessStatus() {
    if (stats.outOfStock > 0) {
      return {
        icon: '🔴',
        color: '#DC2626',
        title: 'Estado crítico',
        message: `Hay ${stats.outOfStock} productos agotados.`,
      };
    }

    if (stats.lowStock > 0) {
      return {
        icon: '🟠',
        color: '#EA580C',
        title: 'Atención',
        message: `Hay ${stats.lowStock} variantes con stock bajo.`,
      };
    }

    return {
      icon: '🟢',
      color: '#16A34A',
      title: 'Inventario saludable',
      message: 'Todo el inventario se encuentra disponible.',
    };
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
    <SafeAreaView className='flex-1'>
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

              <TouchableOpacity className="rounded-2xl bg-gray-800 p-6">
                <Text className="text-lg font-bold text-white">Reportes</Text>
              </TouchableOpacity>

              <TouchableOpacity className="rounded-2xl bg-gray-800 p-6">
                <Text className="text-lg font-bold text-white">Respaldo de Base de Datos</Text>
              </TouchableOpacity>
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
