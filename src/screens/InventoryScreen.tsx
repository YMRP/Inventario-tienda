import { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ProductCard from '@/components/ProductCard';

import { getInventoryProducts } from '@/repositories/productRepository';

import { InventoryProduct, RootStackParamList } from '@/types/types';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'inventory'>;

export default function InventoryScreen() {
  const navigation = useNavigation<NavigationProps>();

  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<InventoryProduct[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const data = await getInventoryProducts();

    setProducts(data);
    setFilteredProducts(data);
  }

  function handleSearch(text: string) {
    setSearch(text);

    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredProducts(filtered);
  }

  return (
    <View className="flex-1 bg-gray-100">
      <Text className="p-5 text-2xl font-bold">Inventario</Text>

      <TextInput
        className="mx-5 mb-5 rounded-xl border bg-white p-4"
        placeholder="Buscar producto..."
        value={search}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() =>
              navigation.navigate('ProductDetail', {
                productId: item.id,
              })
            }
          />
        )}
        ListEmptyComponent={() => (
          <View className="mt-20 items-center">
            <Text className="text-gray-500">No hay productos</Text>
          </View>
        )}
      />
    </View>
  );
}
