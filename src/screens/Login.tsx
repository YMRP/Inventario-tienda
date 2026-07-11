import { login } from '@/auth/auth';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/types/types';

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

function Login() {
  const navigation = useNavigation<LoginNavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handeLogin = async () => {
    try {
      console.log('Entro al handlelogin');
      setMessage('');
      console.log('despues del set');

      const result = await login(username.trim(), password);
      console.log('result: ', result);
      setMessage(result.message);

      if (result.success === true) {
        console.log('Entro al success');
        navigation.replace('Dashboard');
      }
      console.log('Se paso el if');

      console.log('RESULT FINAL:', result);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View className="flex-1 justify-center  px-8 bg-blue-400 items-center">

      <View className='bg-white rounded-2xl shadow-xl p-10 w-1/2'>
        <Text className="mb-10 text-center text-3xl font-bold text-blue-700">
          Gestión y control de inventario
        </Text>

        <Text className="mb-2 text-base font-semibold">Usuario</Text>

        <TextInput
          className="mb-5 rounded-lg border border-gray-300 p-3 text-black"
          placeholder="Ingresa tu nombre de usuario"
          value={username}
          onChangeText={setUsername}
        />

        <Text className="mb-2 text-base font-semibold">Contraseña</Text>

        <TextInput
          className="mb-8 rounded-lg border border-gray-300 p-3 text-black"
          placeholder="Ingresa tu contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity className="rounded-lg bg-blue-600 p-4" onPress={handeLogin}>
          <Text className="text-center font-bold text-white">Iniciar sesión</Text>
        </TouchableOpacity>
      </View>

      <Text className="mt-6 text-center text-red-600">{message}</Text>
    </View>
  );
}

export default Login;
