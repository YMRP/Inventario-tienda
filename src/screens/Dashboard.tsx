import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { logout, getCurrentUser } from "@/auth/auth";
import { RootStackParamList } from "@/types/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function Dashboard() {
type DashboardNavigationProp =
  NativeStackNavigationProp<RootStackParamList, "Dashboard">;

const navigation = useNavigation<DashboardNavigationProp>();  const user = getCurrentUser();

  const isAdmin = user?.role === "ADMIN";

  function handleLogout() {
    console.log("CERRANDO SESION")
    logout();
    navigation.replace("Login");
  }

  return (
    <View className="flex-1 bg-white px-6 pt-12">

      {/* HEADER */}
      <Text className="text-2xl font-bold text-blue-700">
        Inventario Local
      </Text>

      <Text className="text-gray-600 mt-1">
        Usuario: {user?.full_name}
      </Text>

      <Text className="text-gray-500 mb-6">
        Rol: {user?.role}
      </Text>

      {/* ACCIONES PRINCIPALES */}
      <Text className="font-bold text-lg mb-3">
        Acciones
      </Text>

      <View className="gap-3">

        {/* CONSULTA INVENTARIO (TODOS) */}
        <TouchableOpacity className="bg-blue-400 p-4 rounded-xl">
          <Text className="text-white font-bold">
            Consultar Inventario
          </Text>
        </TouchableOpacity>

        {/* VENTAS (USUARIO Y ADMIN) */}
        <TouchableOpacity className="bg-green-600 p-4 rounded-xl">
          <Text className="text-white font-bold">
            Registrar Venta
          </Text>
        </TouchableOpacity>

        {/* APARTADOS */}
        <TouchableOpacity className="bg-yellow-500 p-4 rounded-xl">
          <Text className="text-white font-bold">
            Apartados
          </Text>
        </TouchableOpacity>

        {/* ESCANER */}
        <TouchableOpacity className="bg-purple-600 p-4 rounded-xl">
          <Text className="text-white font-bold">
            Escanear Código de Barras
          </Text>
        </TouchableOpacity>

        {/* ADMIN ONLY */}
        {isAdmin && (
          <>
            <Text className="font-bold text-lg mt-4 mb-2">
              Administración
            </Text>

            <TouchableOpacity className="bg-gray-800 p-4 rounded-xl">
              <Text className="text-white font-bold">
                Productos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-800 p-4 rounded-xl">
              <Text className="text-white font-bold">
                Catálogos (Categorías / Marcas / Colores / Tallas)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-800 p-4 rounded-xl">
              <Text className="text-white font-bold">
                Reportes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-800 p-4 rounded-xl">
              <Text className="text-white font-bold">
                Respaldo de Base de Datos
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* LOGOUT */}
        <TouchableOpacity
          className="bg-red-600 p-4 rounded-xl mt-6"
          onPress={handleLogout}
        >
          <Text className="text-white font-bold text-center">
            Cerrar Sesión
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}