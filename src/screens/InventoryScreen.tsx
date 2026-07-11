// screens/InventoryScreen.tsx
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '@/components/ProductCard';
import {
  getAllCategories,
  getInventoryProducts,
  getOutOfStockVariants,
  restockVariant,
} from '@/repositories/productRepository';
import { getBarcodeLabels } from '@/repositories/barcodeRepository';
import {
  InventoryProduct,
  RootStackParamList,
  CatalogItem,
  OutOfStockVariant,
} from '@/types/types';
import { getCurrentUser } from '@/auth/auth';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'inventory'>;
type FilterType = 'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export default function InventoryScreen() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute();
  const { width } = useWindowDimensions();

  // Grid responsivo: 1 col en móvil, 2 en tablet vertical, 3 en tablet horizontal
  const numColumns = width >= 1100 ? 3 : width >= 700 ? 2 : 1;

  const filter =
    (route.params as { filter?: FilterType } | undefined)?.filter ?? 'ALL';

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
    (async () => {
      const data = await getBarcodeLabels();
      console.log(data);
    })();
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
      if (category !== 'ALL') data = data.filter((i) => i.category === category);
      if (text.trim() !== '')
        data = data.filter((i) => i.name.toLowerCase().includes(text.toLowerCase()));
      setFilteredOutProducts(data);
      return;
    }
    let data = [...products];
    if (category !== 'ALL') data = data.filter((i) => i.category === category);
    if (text.trim() !== '')
      data = data.filter((i) => i.name.toLowerCase().includes(text.toLowerCase()));
    setFilteredProducts(data);
  }

  function handleSearch(text: string) {
    setSearch(text);
    applyFilters(text, selectedCategory);
  }

  function handleCategory(value: string) {
    setSelectedCategory(value);
    applyFilters(search, value);
  }

  const filterMeta: Record<FilterType, { title: string; subtitle: string; accent: string }> = {
    ALL: { title: 'Inventario', subtitle: 'Todos los productos', accent: 'bg-blue-600' },
    LOW_STOCK: {
      title: 'Stock bajo',
      subtitle: 'Productos con inventario reducido',
      accent: 'bg-amber-500',
    },
    OUT_OF_STOCK: {
      title: 'Agotados',
      subtitle: 'Variantes sin existencias',
      accent: 'bg-red-600',
    },
  };
  const meta = filterMeta[filter];

  const totalItems =
    filter === 'OUT_OF_STOCK' ? filteredOutProducts.length : filteredProducts.length;

  // Chips de categoría (reemplazan al Picker: más cómodo en tableta)
  const CategoryChips = (
    <View className="flex-row flex-wrap gap-2 px-6 pb-4">
      <CategoryChip
        label="Todas"
        active={selectedCategory === 'ALL'}
        onPress={() => handleCategory('ALL')}
      />
      {categories.map((c) => (
        <CategoryChip
          key={c.id}
          label={c.name}
          active={selectedCategory === c.name}
          onPress={() => handleCategory(c.name)}
        />
      ))}
    </View>
  );

  const Header = (
    <View className="bg-slate-50 pb-2 pt-6">
      {/* Título + badge de conteo */}
      <View className="flex-row items-center justify-between px-6 pb-4">
        <View className="flex-1">
          <View className="flex-row items-center gap-3">
            <View className={`h-3 w-3 rounded-full ${meta.accent}`} />
            <Text className="text-3xl font-black text-slate-900">{meta.title}</Text>
          </View>
          <Text className="mt-1 text-base text-slate-500">{meta.subtitle}</Text>
        </View>
        <View className="rounded-2xl bg-white px-5 py-3 shadow-sm">
          <Text className="text-xs uppercase tracking-wider text-slate-400">Total</Text>
          <Text className="text-2xl font-black text-slate-900">{totalItems}</Text>
        </View>
      </View>

      {/* Search + filtros rápidos en grid */}
      <View className="flex-row items-center gap-3 px-6 pb-4">
        <View className="flex-1 flex-row items-center rounded-2xl border border-slate-200 bg-white px-4">
          <Text className="mr-2 text-lg text-slate-400">⌕</Text>
          <TextInput
            className="flex-1 py-4 text-base text-slate-900"
            placeholder="Buscar producto..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        <QuickFilter
          label="Todos"
          active={filter === 'ALL'}
          onPress={() => navigation.setParams({ filter: 'ALL' } as never)}
        />
        <QuickFilter
          label="Stock bajo"
          active={filter === 'LOW_STOCK'}
          onPress={() => navigation.setParams({ filter: 'LOW_STOCK' } as never)}
        />
        <QuickFilter
          label="Agotados"
          active={filter === 'OUT_OF_STOCK'}
          onPress={() => navigation.setParams({ filter: 'OUT_OF_STOCK' } as never)}
        />
      </View>

      <Text className="px-6 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        Categoría
      </Text>
      {CategoryChips}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {filter === 'OUT_OF_STOCK' ? (
        <FlatList
          key={`out-${numColumns}`}
          data={filteredOutProducts}
          keyExtractor={(item) => item.variant_id.toString()}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? { gap: 16, paddingHorizontal: 24 } : undefined}
          contentContainerStyle={{
            paddingHorizontal: numColumns > 1 ? 0 : 24,
            paddingBottom: 40,
            gap: 16,
          }}
          ListHeaderComponent={Header}
          renderItem={({ item }) => (
            <View className="flex-1">
              <ProductCard
                product={item}
                onPress={() =>
                  navigation.navigate('ProductDetail', { productId: item.id })
                }
              />
              <TouchableOpacity
                className="-mt-2 mb-1 rounded-2xl bg-emerald-600 p-4 shadow-sm"
                onPress={() => {
                  setSelectedProduct(item);
                  setRestockQuantity('');
                  setRestockNotes('');
                  setShowRestockModal(true);
                }}>
                <Text className="text-center font-bold text-white">＋ Reabastecer</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <Text className="text-slate-400">No hay variantes agotadas</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          key={`inv-${numColumns}`}
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? { gap: 16, paddingHorizontal: 24 } : undefined}
          contentContainerStyle={{
            paddingHorizontal: numColumns > 1 ? 0 : 24,
            paddingBottom: 40,
            gap: 16,
          }}
          ListHeaderComponent={Header}
          renderItem={({ item }) => (
            <View className="flex-1">
              <ProductCard
                product={item}
                onPress={() =>
                  navigation.navigate('ProductDetail', { productId: item.id })
                }
              />
            </View>
          )}
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <Text className="text-slate-400">No hay productos</Text>
            </View>
          }
        />
      )}

      {/* MODAL */}
      <Modal visible={showRestockModal} transparent animationType="fade">
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(15,23,42,0.5)' }}>
          <View className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
            <Text className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Reabastecer inventario
            </Text>
            <Text className="mt-2 text-2xl font-black text-slate-900">
              {selectedProduct?.name}
            </Text>
            <Text className="mb-6 text-slate-500">
              {selectedProduct?.color} · {selectedProduct?.size}
            </Text>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cantidad
                </Text>
                <TextInput
                  keyboardType="numeric"
                  value={restockQuantity}
                  onChangeText={setRestockQuantity}
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-lg font-bold text-slate-900"
                />
              </View>
              <View className="flex-[2]">
                <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Nota
                </Text>
                <TextInput
                  value={restockNotes}
                  onChangeText={setRestockNotes}
                  placeholder="Opcional"
                  placeholderTextColor="#94a3b8"
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900"
                />
              </View>
            </View>

            <View className="mt-8 flex-row justify-end gap-3">
              <TouchableOpacity
                className="rounded-2xl bg-slate-100 px-6 py-4"
                onPress={() => setShowRestockModal(false)}>
                <Text className="font-bold text-slate-700">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-2xl bg-emerald-600 px-8 py-4 shadow-sm"
                onPress={async () => {
                  if (!selectedProduct) return;
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

function CategoryChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-full border px-5 py-2.5 ${
        active
          ? 'border-slate-900 bg-slate-900'
          : 'border-slate-200 bg-white'
      }`}>
      <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-slate-700'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function QuickFilter({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-2xl px-5 py-4 ${
        active ? 'bg-slate-900' : 'bg-white border border-slate-200'
      }`}>
      <Text className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-700'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
