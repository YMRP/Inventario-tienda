import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { logout, getCurrentUser } from '@/auth/auth';
import { RootStackParamList } from '@/types/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { getInventoryProducts } from '@/repositories/productRepository';

export default function Dashboard() {
  type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

  const navigation = useNavigation<DashboardNavigationProp>();
  const user = getCurrentUser();

  const isAdmin = user?.role === 'ADMIN';


  function handleLogout() {
    console.log('CERRANDO SESION');
    logout();
    navigation.replace('Login');
  }

  return (
    <View className="flex-1 bg-white px-6 pt-12">
      {/* HEADER */}
      <Text className="text-2xl font-bold text-blue-700">Inventario Local</Text>

      <Text className="mt-1 text-gray-600">Usuario: {user?.full_name}</Text>

      <Text className="mb-6 text-gray-500">Rol: {user?.role}</Text>

      {/* ACCIONES PRINCIPALES */}
      <Text className="mb-3 text-lg font-bold">Acciones</Text>

      <View className="gap-3">
        {/* CONSULTA INVENTARIO (TODOS) */}
        <TouchableOpacity className="rounded-xl bg-blue-400 p-4"     onPress={() => navigation.navigate("inventory")}
>
          <Text className="font-bold text-white">Consultar Inventario</Text>
        </TouchableOpacity>

        {/* VENTAS (USUARIO Y ADMIN) */}
        <TouchableOpacity className="rounded-xl bg-green-600 p-4">
          <Text className="font-bold text-white">Registrar Venta</Text>
        </TouchableOpacity>

        {/* APARTADOS */}
        <TouchableOpacity className="rounded-xl bg-yellow-500 p-4">
          <Text className="font-bold text-white">Apartados</Text>
        </TouchableOpacity>

        {/* ESCANER */}
        <TouchableOpacity className="rounded-xl bg-purple-600 p-4" onPress={()=>{navigation.navigate('Scan')}}>
          <Text className="font-bold text-white">Escanear Código de Barras</Text>
        </TouchableOpacity>

        {/* ADMIN ONLY */}
        {isAdmin && (
          <>
            <Text className="mb-2 mt-4 text-lg font-bold">Administración</Text>

            <TouchableOpacity
              className="rounded-xl bg-gray-800 p-4"
              onPress={() => {
                navigation.navigate('NewProduct');
              }}>
              <Text className="font-bold text-white">Productos</Text>
            </TouchableOpacity>

            <TouchableOpacity className="rounded-xl bg-gray-800 p-4">
              <Text className="font-bold text-white">
                Catálogos (Categorías / Marcas / Colores / Tallas)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="rounded-xl bg-gray-800 p-4">
              <Text className="font-bold text-white">Reportes</Text>
            </TouchableOpacity>

            <TouchableOpacity className="rounded-xl bg-gray-800 p-4">
              <Text className="font-bold text-white">Respaldo de Base de Datos</Text>
            </TouchableOpacity>
          </>
        )}

        {/* LOGOUT */}
        <TouchableOpacity className="mt-6 rounded-xl bg-red-600 p-4" onPress={handleLogout}>
          <Text className="text-center font-bold text-white">Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
