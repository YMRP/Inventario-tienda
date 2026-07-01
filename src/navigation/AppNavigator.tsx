import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "@/screens/Login";
import { RootStackParamList } from "@/types/types";
import Dashboard from "@/screens/Dashboard";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import NewProduct from "@/screens/NewProduct";


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
                }}
            >

                <Stack.Screen
                    name="Login"
                    component={Login}
                />

                <Stack.Screen
                    name="Dashboard"
                    component={Dashboard}
                />

                <Stack.Screen
                name="NewProduct"
                component={NewProduct}
                />  

            </Stack.Navigator>

        </NavigationContainer>

    );

}