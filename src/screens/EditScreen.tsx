import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ProductDetail } from '@/types/types';
import { getProductDetail } from '@/repositories/productRepository';
import ProductForm from '@/components/ProductForm';
import { SafeAreaView } from 'react-native-safe-area-context';
type RouteProps = RouteProp<RootStackParamList, 'EditProduct'>;
type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'EditProduct'>;

export default function EditProductScreen() {
  const route = useRoute<RouteProps>();

  const navigation = useNavigation<NavigationProps>();

  const { productId } = route.params;

  const [product, setProduct] = useState<ProductDetail | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, []);

  async function loadProduct() {
    const result = await getProductDetail(productId);

    if (!result) {
      Alert.alert('Producto no encontrado');

      navigation.goBack();

      return;
    }

    setProduct(result);

    setLoading(false);
  }

  function handleUpdated() {
    Alert.alert('Producto actualizado');

    navigation.goBack();
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 bg-white p-6">
        <Text className="mb-8 text-2xl font-bold">Editar Producto</Text>

        {product && <ProductForm mode="edit" product={product} onUpdated={handleUpdated} />}
      </View>
    </SafeAreaView>
  );
}
