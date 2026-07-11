import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getCurrentUser } from '@/auth/auth';
import { CatalogItem, RootStackParamList } from '@/types/types';
import {
  createVariant,
  generateUniqueBarcode,
  getAllColors,
  getSizesByTemplate,
  getTemplateByCategory,
  registerInventoryMovement,
} from '@/repositories/variantRepository';

type NewVariantRouteProp = RouteProp<RootStackParamList, 'NewVariant'>;
type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'NewVariant'>;

export default function NewVariant() {
  const user = getCurrentUser();
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<NewVariantRouteProp>();
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  const { productId, categoryId } = route.params;

  const [colors, setColors] = useState<CatalogItem[]>([]);
  const [sizes, setSizes] = useState<CatalogItem[]>([]);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [availableStock, setAvailableStock] = useState('');
  const [minimumStock, setMinimumStock] = useState('');
  const [barcode, setBarcode] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      const colorsData = await getAllColors();
      const templateId = await getTemplateByCategory(categoryId);

      if (!templateId) {
        Alert.alert('La categoría no tiene una plantilla asignada.');
        navigation.goBack();
        return;
      }

      const sizesData = await getSizesByTemplate(templateId);
      const newBarcode = await generateUniqueBarcode();

      setColors(colorsData);
      setSizes(sizesData);
      setBarcode(newBarcode);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No fue posible cargar la información.');
    }
  }

  async function handleSaveVariant() {
    try {
      if (selectedColor === 0) return Alert.alert('Seleccione un color');
      if (selectedSize === 0) return Alert.alert('Seleccione una talla');
      if (availableStock.trim() === '') return Alert.alert('Ingrese el stock inicial');
      if (minimumStock.trim() === '') return Alert.alert('Ingrese el stock mínimo');

      const stock = Number(availableStock);
      const minimum = Number(minimumStock);
      if (isNaN(stock) || stock < 0) return Alert.alert('Stock inválido');
      if (isNaN(minimum) || minimum < 0) return Alert.alert('Stock mínimo inválido');

      setSaving(true);
      const variantId = await createVariant(
        productId,
        selectedColor,
        selectedSize,
        barcode,
        stock,
        minimum
      );
      await registerInventoryMovement(variantId, stock, user!.id);
      Alert.alert('Éxito', 'Producto registrado correctamente.');
      navigation.popToTop();
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No fue posible guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function regenerateBarcode() {
    const newBarcode = await generateUniqueBarcode();
    setBarcode(newBarcode);
  }

  const selectedColorName =
    colors.find((c) => c.id === selectedColor)?.name ?? 'Sin seleccionar';
  const selectedSizeName =
    sizes.find((s) => s.id === selectedSize)?.name ?? 'Sin seleccionar';

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Header */}
        <View className="px-8 pb-6 pt-8">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-3">
                <View className="h-3 w-3 rounded-full bg-blue-600" />
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Inventario
                </Text>
              </View>
              <Text className="mt-2 text-3xl font-black text-slate-900">Nueva variante</Text>
              <Text className="mt-1 text-base text-slate-500">
                Registra color, talla y stock inicial del producto
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
        <View
          className={`px-8 ${isTablet ? 'flex-row items-start gap-6' : ''}`}>
          {/* Columna izquierda: Color + Talla */}
          <View className={`gap-6 ${isTablet ? 'flex-1' : 'mb-6'}`}>
            {/* Color */}
            <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Color
                </Text>
                <Text className="text-sm font-bold text-slate-900">{selectedColorName}</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {colors.map((c) => (
                  <ChipOption
                    key={c.id}
                    label={c.name}
                    active={selectedColor === c.id}
                    onPress={() => setSelectedColor(c.id)}
                  />
                ))}
                {colors.length === 0 && (
                  <Text className="text-sm text-slate-400">Cargando colores...</Text>
                )}
              </View>
            </View>

            {/* Talla */}
            <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Talla
                </Text>
                <Text className="text-sm font-bold text-slate-900">{selectedSizeName}</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {sizes.map((s) => (
                  <ChipOption
                    key={s.id}
                    label={s.name}
                    active={selectedSize === s.id}
                    onPress={() => setSelectedSize(s.id)}
                    compact
                  />
                ))}
                {sizes.length === 0 && (
                  <Text className="text-sm text-slate-400">Cargando tallas...</Text>
                )}
              </View>
            </View>
          </View>

          {/* Columna derecha: Stock + Barcode */}
          <View className={`gap-6 ${isTablet ? 'flex-1' : ''}`}>
            {/* Stock en grid 2 cols */}
            <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Inventario
              </Text>
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="mb-2 text-sm font-semibold text-slate-700">
                    Stock inicial
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={availableStock}
                    onChangeText={setAvailableStock}
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-lg font-bold text-slate-900"
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-2 text-sm font-semibold text-slate-700">
                    Stock mínimo
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={minimumStock}
                    onChangeText={setMinimumStock}
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-lg font-bold text-slate-900"
                  />
                </View>
              </View>
            </View>

            {/* Código de barras */}
            <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Código de barras
                </Text>
                <View className="rounded-full bg-blue-50 px-3 py-1">
                  <Text className="text-xs font-bold text-blue-700">Auto</Text>
                </View>
              </View>

              <View className="rounded-2xl bg-slate-900 p-6">
                <Text className="text-center text-2xl font-black tracking-widest text-white">
                  {barcode || '—'}
                </Text>
              </View>

              <TouchableOpacity
                className="mt-4 rounded-2xl border border-slate-200 bg-white p-4"
                onPress={regenerateBarcode}>
                <Text className="text-center font-bold text-slate-700">
                  ↻ Generar otro código
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Resumen + acción principal */}
        <View className="mt-8 px-8">
          <View className="rounded-3xl bg-slate-900 p-6 shadow-sm">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Resumen
            </Text>
            <View className="mt-4 flex-row flex-wrap gap-6">
              <SummaryItem label="Color" value={selectedColorName} />
              <SummaryItem label="Talla" value={selectedSizeName} />
              <SummaryItem label="Stock" value={availableStock || '0'} />
              <SummaryItem label="Mínimo" value={minimumStock || '0'} />
            </View>

            <TouchableOpacity
              disabled={saving}
              onPress={handleSaveVariant}
              className={`mt-6 rounded-2xl p-5 ${
                saving ? 'bg-blue-400' : 'bg-blue-600'
              }`}>
              <Text className="text-center text-lg font-black text-white">
                {saving ? 'Guardando...' : 'Guardar variante'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ChipOption({
  label,
  active,
  onPress,
  compact = false,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-full border ${
        compact ? 'px-4 py-2' : 'px-5 py-2.5'
      } ${active ? 'border-slate-900 bg-slate-900' : 'border-slate-200 bg-white'}`}>
      <Text
        className={`font-semibold ${compact ? 'text-sm' : 'text-sm'} ${
          active ? 'text-white' : 'text-slate-700'
        }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[80px]">
      <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </Text>
      <Text className="mt-1 text-lg font-black text-white" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
