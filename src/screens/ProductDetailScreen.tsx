import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList, ProductDetail, ProductVariantDetail } from '@/types/types';
import { getCurrentUser } from '@/auth/auth';
import { getProductDetail } from '@/repositories/productRepository';
import { getVariantsByProduct } from '@/repositories/variantRepository';

type RouteProps = RouteProp<RootStackParamList, 'ProductDetail'>;
type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;
  const numColumns = width >= 1200 ? 3 : width >= 900 ? 2 : 1;

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
  }

  const totalStock = variants.reduce((acc, v) => acc + (v.available_stock ?? 0), 0);
  const lowStock = variants.filter(
    (v) => (v.available_stock ?? 0) <= (v.minimum_stock ?? 0)
  ).length;

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
                  {product?.category ?? 'Producto'}
                </Text>
              </View>
              <Text className="mt-2 text-3xl font-black text-slate-900" numberOfLines={2}>
                {product?.name ?? 'Cargando...'}
              </Text>
              <Text className="mt-1 text-base text-slate-500">
                {product?.brand ? `Marca: ${product.brand}` : ' '}
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
          {/* Columna izquierda: Info + Acciones */}
          <View className={`gap-6 ${isTablet ? 'w-[380px]' : 'mb-6'}`}>
            {/* Precio */}
            <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Precio de venta
              </Text>
              <Text className="mt-2 text-4xl font-black text-slate-900">
                ${product?.sale_price?.toFixed(2) ?? '0.00'}
              </Text>
            </View>

            {/* Descripción */}
            {product?.description ? (
              <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Descripción
                </Text>
                <Text className="text-sm leading-6 text-slate-600">{product.description}</Text>
              </View>
            ) : null}

            {/* Acciones admin */}
            {isAdmin && product && (
              <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Acciones
                </Text>
                <View className="gap-3">
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('EditProduct', { productId: product.id })
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-4">
                    <Text className="text-center font-bold text-slate-700">
                      ✎ Editar producto
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('NewVariant', {
                        productId: product.id,
                        categoryId: product.category_id,
                      })
                    }
                    className="rounded-2xl bg-slate-900 p-4">
                    <Text className="text-center font-bold text-white">
                      + Agregar variante
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Columna derecha: Resumen + Variantes */}
          <View className={`gap-6 ${isTablet ? 'flex-1' : ''}`}>
            {/* Resumen oscuro */}
            <View className="rounded-3xl bg-slate-900 p-6 shadow-sm">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resumen de inventario
              </Text>
              <View className="mt-4 flex-row flex-wrap gap-6">
                <SummaryItem label="Variantes" value={variants.length.toString()} />
                <SummaryItem label="Stock total" value={totalStock.toString()} />
                <SummaryItem
                  label="Stock bajo"
                  value={lowStock.toString()}
                  accent={lowStock > 0}
                />
              </View>
            </View>

            {/* Variantes */}
            <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Variantes
                </Text>
                <Text className="text-sm font-bold text-slate-900">
                  {variants.length} en total
                </Text>
              </View>

              {variants.length === 0 ? (
                <View className="items-center py-16">
                  <Text className="text-sm text-slate-400">
                    Este producto no tiene variantes.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={variants}
                  key={numColumns}
                  numColumns={numColumns}
                  scrollEnabled={false}
                  keyExtractor={(item) => item.id.toString()}
                  columnWrapperStyle={numColumns > 1 ? { gap: 12 } : undefined}
                  contentContainerStyle={{ gap: 12 }}
                  renderItem={({ item }) => (
                    <View style={{ flex: 1 / numColumns }}>
                      <VariantCard variant={item} onPress={() => console.log(item)} />
                    </View>
                  )}
                />
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function VariantCard({
  variant,
  onPress,
}: {
  variant: ProductVariantDetail;
  onPress?: () => void;
}) {
  const low = (variant.available_stock ?? 0) <= (variant.minimum_stock ?? 0);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-black text-slate-900" numberOfLines={1}>
          {variant.color} · {variant.size}
        </Text>
        <View
          className={`rounded-full px-2.5 py-1 ${low ? 'bg-red-100' : 'bg-emerald-100'}`}>
          <Text
            className={`text-[10px] font-bold uppercase tracking-wider ${
              low ? 'text-red-700' : 'text-emerald-700'
            }`}>
            {low ? 'Bajo' : 'OK'}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row gap-2">
        <View className="flex-1 rounded-xl bg-white p-3">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Disponible
          </Text>
          <Text className="mt-1 text-xl font-black text-slate-900">
            {variant.available_stock}
          </Text>
        </View>
        <View className="flex-1 rounded-xl bg-white p-3">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Mínimo
          </Text>
          <Text className="mt-1 text-xl font-black text-slate-900">
            {variant.minimum_stock}
          </Text>
        </View>
      </View>

      <View className="mt-4">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Código de barras
        </Text>
        <Text className="mt-1 font-mono text-sm font-bold text-slate-800">
          {variant.barcode}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function SummaryItem({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View className="min-w-[80px]">
      <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </Text>
      <Text
        className={`mt-1 text-2xl font-black ${accent ? 'text-red-400' : 'text-white'}`}
        numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
