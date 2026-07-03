import { View, Text, Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ProductForm from '@/components/ProductForm';

import { RootStackParamList } from '@/types/types';

type NavigationProps =
  NativeStackNavigationProp<
    RootStackParamList,
    'NewProduct'
  >;

export default function NewProduct() {
  const navigation = useNavigation<NavigationProps>();

  function handleSaved(productId: number) {
    Alert.alert(
      'Producto guardado',
      'Ahora registre la primera variante.',
      [
        {
          text: 'Continuar',
          onPress: () =>
            navigation.navigate('NewVariant', {
              productId,
            }),
        },
      ]
    );
  }

  return (
    <View className="flex-1 bg-white p-6">

      <Text className="mb-8 text-2xl font-bold">
        Nuevo Producto
      </Text>

      <ProductForm
        onSaved={handleSaved} mode={'create'}      />

    </View>
  );
}