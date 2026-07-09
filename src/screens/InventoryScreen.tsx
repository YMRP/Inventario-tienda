import { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { CatalogItem } from '@/types/types';
import { getAllCategories } from '@/repositories/productRepository';
import ProductCard from '@/components/ProductCard';
  import { getBarcodeLabels } from '@/repositories/barcodeRepository';

import { getInventoryProducts } from '@/repositories/productRepository';

import { InventoryProduct, RootStackParamList } from '@/types/types';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'inventory'>;

export default function InventoryScreen() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute();

  const filter =
    (route.params as { filter?: 'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK' } | undefined)?.filter ??
    'ALL';
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<InventoryProduct[]>([]);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<CatalogItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    loadProducts();
  }, [filter]);

  useEffect(() => {
  async function test() {
    console.log("BAR CODE TEEEEEEEEEEST")
    const data = await getBarcodeLabels();
    console.log(data);

    console.log("END BAR CODE TEEEEEEEEEEST")
  }

  test();
}, []);

  async function loadProducts() {
    try {
      const data = await getInventoryProducts(filter);

      setProducts(data);
      setFilteredProducts(data);
      const categoryData = await getAllCategories();

      setCategories(categoryData);
    } catch (error: any) {
      console.log('Error InventoryScreen, loadProducts: ', error);
    }
  }

  function applyFilters(text: string, category: string) {
    let data = [...products];

    if (category !== 'ALL') {
      data = data.filter((product) => product.category === category);
    }

    if (text.trim() !== '') {
      data = data.filter((product) => product.name.toLowerCase().includes(text.toLowerCase()));
    }

    setFilteredProducts(data);
  }

  function handleSearch(text: string) {
    setSearch(text);

    applyFilters(text, selectedCategory);
  }
  return (
    <SafeAreaView className="flex-1 ">
      <View className="flex bg-gray-100">
        <Text className="px-5 pt-5 text-2xl font-bold">Inventario</Text>

        <Text className="px-5 pb-4 text-gray-500">
          {filter === 'ALL' && 'Todos los productos'}

          {filter === 'LOW_STOCK' && 'Productos con stock bajo'}

          {filter === 'OUT_OF_STOCK' && 'Productos agotados'}
        </Text>
        <TextInput
          className="mx-5 mb-5 rounded-xl border bg-white p-4"
          placeholder="Buscar producto..."
          value={search}
          onChangeText={handleSearch}
        />
        <Text className="mx-5 mb-2 font-semibold">Categoría</Text>

        <Picker
          selectedValue={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value);
            applyFilters(search, value);
          }}>
          <Picker.Item label="Todas" value="ALL" />

          {categories.map((category) => (
            <Picker.Item key={category.id} label={category.name} value={category.name} />
          ))}
        </Picker>

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
    </SafeAreaView>
  );
}
