import { NavigationContainer } from '@react-navigation/native';
import PrimaryButton from '@/components/PrimaryButton';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '@/screens/Login';
import { RootStackParamList } from '@/types/types';
import Dashboard from '@/screens/Dashboard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import NewProduct from '@/screens/NewProduct';
import { StackScreen } from 'react-native-screens';
import NewVariant from '@/screens/NewVariant';
import InventoryScreen from '@/screens/InventoryScreen';
import ProductDetailScreen from '@/screens/ProductDetailScreen';
import EditProductScreen from '@/screens/EditScreen';
import ScanResultScreen from '@/screens/ScanResultScreen';

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
        <Stack.Screen name="ScanResult"component={ScanResultScreen}/>
        <Stack.Screen name="Scan" component={ScanResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
