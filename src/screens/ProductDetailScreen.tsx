import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList, ProductDetail, ProductVariantDetail } from '@/types/types';

import { getCurrentUser } from '@/auth/auth';

import { getProductDetail } from '@/repositories/productRepository';
import { getVariantsByProduct } from '@/repositories/variantRepository';

import VariantCard from '@/components/VariantCard';
import PrimaryButton from '@/components/PrimaryButton';

type RouteProps = RouteProp<RootStackParamList, 'ProductDetail'>;

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();

  const { productId } = route.params;

  const user = getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const [product, setProduct] = useState<ProductDetail | null>(null);

  const [variants, setVariants] = useState<ProductVariantDetail[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [productId])
  );

  async function loadData() {
    const productData = await getProductDetail(productId);

    const variantsData = await getVariantsByProduct(productId);

    setProduct(productData);
    setVariants(variantsData);

    console.log(productData);
    console.log(variantsData);
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* CABECERA */}
      <View className="bg-white p-5 shadow-sm">
        <Text className="text-2xl font-bold">{product?.name}</Text>

        <Text className="mt-2 text-gray-600">Marca: {product?.brand}</Text>

        <Text className="text-gray-600">Categoría: {product?.category}</Text>

        <Text className="mt-3 text-xl font-bold text-blue-700">
          ${product?.sale_price?.toFixed(2)}
        </Text>

        {product?.description ? (
          <>
            <Text className="mt-4 font-semibold">Descripción</Text>

            <Text className="mb-5 text-gray-600">{product.description}</Text>
          </>
        ) : null}

        {isAdmin && product && (
          <>
            <Text className="mb-3 text-lg font-bold">Acciones</Text>

            <PrimaryButton
              title="Editar Producto"
              onPress={() =>
                navigation.navigate('EditProduct', {
                  productId: product.id,
                })
              }
            />

            <PrimaryButton
              title="Agregar Variante"
              onPress={() =>
                navigation.navigate('NewVariant', {
                  productId: product.id,
                })
              }
            />
          </>
        )}
      </View>

      {/* VARIANTES */}
      <FlatList
        data={variants}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          padding: 20,
        }}
        renderItem={({ item }) => <VariantCard variant={item} onPress={() => console.log(item)} />}
        ListHeaderComponent={() => <Text className="mb-4 text-xl font-bold">Variantes</Text>}
        ListEmptyComponent={() => (
          <View className="mt-20 items-center">
            <Text className="text-gray-500">Este producto no tiene variantes.</Text>
          </View>
        )}
      />
    </View>
  );
}
