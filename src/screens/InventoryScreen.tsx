import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { getAllCategories } from '@/repositories/productRepository';
import ProductCard from '@/components/ProductCard';
import { getBarcodeLabels } from '@/repositories/barcodeRepository';
import {
  getInventoryProducts,
  getOutOfStockVariants,
  restockVariant,
} from '@/repositories/productRepository';
import {
  InventoryProduct,
  RootStackParamList,
  CatalogItem,
  OutOfStockVariant,
} from '@/types/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentUser } from '@/auth/auth';
type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'inventory'>;

export default function InventoryScreen() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute();

  const filter =
    (route.params as { filter?: 'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK' } | undefined)?.filter ??
    'ALL';
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<InventoryProduct[]>([]);
  const [outProducts, setOutProducts] = useState<OutOfStockVariant[]>([]);

  const [filteredOutProducts, setFilteredOutProducts] = useState<OutOfStockVariant[]>([]);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<CatalogItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showRestockModal, setShowRestockModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<OutOfStockVariant | null>(null);
  const [restockQuantity, setRestockQuantity] = useState('');

  const [restockNotes, setRestockNotes] = useState('');
  useFocusEffect(
  useCallback(() => {
    loadProducts();
  }, [filter])
);

  useEffect(() => {
    async function test() {
      console.log('BAR CODE TEEEEEEEEEEST');
      const data = await getBarcodeLabels();
      console.log(data);

      console.log('END BAR CODE TEEEEEEEEEEST');
    }

    test();
  }, []);

  async function loadProducts() {
    try {
      const categoryData = await getAllCategories();

      setCategories(categoryData);

      if (filter === 'OUT_OF_STOCK') {
        const data = await getOutOfStockVariants();

        setOutProducts(data);
        setFilteredOutProducts(data);

        return;
      }

      const data = await getInventoryProducts(filter);

      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.log(error);
    }
  }

  function applyFilters(text: string, category: string) {
    if (filter === 'OUT_OF_STOCK') {
      let data = [...outProducts];

      if (category !== 'ALL') {
        data = data.filter((item) => item.category === category);
      }

      if (text.trim() !== '') {
        data = data.filter((item) => item.name.toLowerCase().includes(text.toLowerCase()));
      }

      setFilteredOutProducts(data);

      return;
    }

    let data = [...products];

    if (category !== 'ALL') {
      data = data.filter((item) => item.category === category);
    }

    if (text.trim() !== '') {
      data = data.filter((item) => item.name.toLowerCase().includes(text.toLowerCase()));
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

        {filter === 'OUT_OF_STOCK' ? (
          <FlatList
            data={filteredOutProducts}
            keyExtractor={(item) => item.variant_id.toString()}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 20,
            }}
            renderItem={({ item }) => (
              <View>
                <ProductCard
                  product={item}
                  onPress={() =>
                    navigation.navigate('ProductDetail', {
                      productId: item.id,
                    })
                  }
                />

                <TouchableOpacity
                  className="mb-5 rounded-xl bg-green-600 p-4"
                  onPress={() => {
                    setSelectedProduct(item);
                    setRestockQuantity('');
                    setRestockNotes('');
                    setShowRestockModal(true);
                  }}>
                  <Text className="text-center font-bold text-white">Reabastecer Stock</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={() => (
              <View className="mt-20 items-center">
                <Text className="text-gray-500">No hay variantes agotadas</Text>
              </View>
            )}
          />
        ) : (
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
        )}
      </View>
      <Modal visible={showRestockModal} transparent animationType="fade">
        <View
          className="flex-1 items-center justify-center"
          style={{
            backgroundColor: 'rgba(0,0,0,0.35)',
          }}>
          <View className="w-11/12 rounded-2xl bg-white p-6">
            <Text className="mb-4 text-xl font-bold">Reabastecer inventario</Text>

            <Text className="font-semibold">{selectedProduct?.name}</Text>

            <Text className="mb-4 text-gray-500">
              {' '}
              {selectedProduct?.color} - {selectedProduct?.size}
            </Text>

            <Text className="mb-1 font-semibold">Cantidad a agregar</Text>

            <TextInput
              keyboardType="numeric"
              value={restockQuantity}
              onChangeText={setRestockQuantity}
              className="mb-4 rounded-xl border p-3"
            />

            <Text className="mb-1 font-semibold">Nota</Text>

            <TextInput
              value={restockNotes}
              onChangeText={setRestockNotes}
              className="mb-6 rounded-xl border p-3"
              placeholder="Opcional"
            />

            <View className="flex-row justify-end">
              <TouchableOpacity
                className="mr-3 rounded-xl bg-gray-400 px-5 py-3"
                onPress={() => setShowRestockModal(false)}>
                <Text className="font-bold text-white">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-xl bg-green-600 px-5 py-3"
                onPress={async () => {
                  if (!selectedProduct) {
                    return;
                  }

                  const quantity = Number(restockQuantity);

                  if (Number.isNaN(quantity) || quantity <= 0) {
                    Alert.alert('Cantidad inválida', 'Ingresa una cantidad mayor a cero.');
                    return;
                  }

                  const currentUser = getCurrentUser();

                  if (!currentUser) {
                    Alert.alert('Error', 'No existe un usuario autenticado.');
                    return;
                  }

                  try {
                    await restockVariant(
                      selectedProduct.variant_id,
                      quantity,
                      restockNotes,
                      currentUser.id
                    );

                    await loadProducts();

                    setShowRestockModal(false);
                    setSelectedProduct(null);
                    setRestockQuantity('');
                    setRestockNotes('');

                    Alert.alert('Éxito', 'El stock se actualizó correctamente.');
                  } catch (error) {
                    console.log(error);

                    Alert.alert('Error', 'No fue posible actualizar el stock.');
                  }
                }}>
                <Text className="font-bold text-white">Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
