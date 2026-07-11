import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList, ProductDetail } from '@/types/types';
import { getProductDetail } from '@/repositories/productRepository';
import ProductForm from '@/components/ProductForm';

type RouteProps = RouteProp<RootStackParamList, 'EditProduct'>;
type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'EditProduct'>;

export default function EditProductScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

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
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
            Cargando producto...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Header */}
        <View className="px-8 pb-6 pt-8">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <View className="flex-row items-center gap-3">
                <View className="h-3 w-3 rounded-full bg-blue-600" />
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Catálogo
                </Text>
              </View>
              <Text className="mt-2 text-3xl font-black text-slate-900" numberOfLines={2}>
                Editar producto
              </Text>
              <Text className="mt-1 text-base text-slate-500">
                Actualiza los datos generales del producto seleccionado
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3">
              <Text className="font-bold text-slate-700">← Volver</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Grid principal */}
        <View className={`px-8 ${isTablet ? 'flex-row items-start gap-6' : ''}`}>
          {/* Columna izquierda: contexto del producto */}
          <View className={`gap-6 ${isTablet ? 'w-[380px]' : 'mb-6'}`}>
            {/* Card contexto */}
            <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {product?.category ?? 'Producto'}
              </Text>
              <Text className="mt-2 text-2xl font-black text-slate-900" numberOfLines={2}>
                {product?.name}
              </Text>
              <Text className="mt-1 text-sm text-slate-500">{product?.brand}</Text>

              <View className="mt-5 rounded-2xl bg-slate-50 p-4">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Precio actual
                </Text>
                <Text className="mt-1 text-3xl font-black text-slate-900">
                  ${product?.sale_price?.toFixed(2) ?? '0.00'}
                </Text>
              </View>
            </View>

         
          </View>

          {/* Columna derecha: formulario */}
          <View className={`gap-6 ${isTablet ? 'flex-1' : ''}`}>
            <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Datos del producto
                </Text>
                <View className="rounded-full bg-blue-50 px-3 py-1">
                  <Text className="text-xs font-bold text-blue-700">Editando</Text>
                </View>
              </View>

              {product && (
                <ProductForm mode="edit" product={product} onUpdated={handleUpdated} />
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
