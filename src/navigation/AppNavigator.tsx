import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '@/screens/Login';
import { RootStackParamList } from '@/types/types';
import Dashboard from '@/screens/Dashboard';

import NewProduct from '@/screens/NewProduct';
import NewVariant from '@/screens/NewVariant';
import InventoryScreen from '@/screens/InventoryScreen';
import ProductDetailScreen from '@/screens/ProductDetailScreen';
import EditProductScreen from '@/screens/EditScreen';
import ScanResultScreen from '@/screens/ScanResultScreen';
import SalesScreen from '@/screens/SalesScreen';
import SaleDetailScreen from '@/screens/SaleDetailScreen';
import ReservationsScreen from '@/screens/ReservationScreen';
import ReservationDetailScreen from '@/screens/ReservationDetailScreen';
import CatalogScreen from '@/screens/CatalogScreen';
/**
 * Creamos el Stack Navigator.
 *
 * Aquí se registrarán todas
 * las pantallas de la aplicación.
 */
const Stack = createNativeStackNavigator<RootStackParamList>();
/**
 * Navegación principal.
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="NewProduct" component={NewProduct} />
        <Stack.Screen name="NewVariant" component={NewVariant} />
        <Stack.Screen name="inventory" component={InventoryScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="EditProduct" component={EditProductScreen} />
        <Stack.Screen name="ScanResult" component={ScanResultScreen} />
        <Stack.Screen name="Scan" component={ScanResultScreen} />
        <Stack.Screen name="Sales" component={SalesScreen} />
        <Stack.Screen name="SaleDetail" component={SaleDetailScreen} />
        <Stack.Screen name="Reservations" component={ReservationsScreen} />
        <Stack.Screen name="ReservationDetail" component={ReservationDetailScreen} />
        <Stack.Screen name="CatalogScreen" component={CatalogScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
