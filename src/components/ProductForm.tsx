import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';

import {
  getAllBrands,
  getAllCategories,
  createProduct,
  updateProduct,
} from '@/repositories/productRepository';

import { CatalogItem, ProductDetail } from '@/types/types';

type Props = {
  mode: 'create' | 'edit';
  product?: ProductDetail;
  onSaved?: (data: { productId: number; categoryId: number }) => void;
  onUpdated?: () => void;
};

export default function ProductForm({ mode, product, onSaved, onUpdated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [salePrice, setSalePrice] = useState('');

  const [brands, setBrands] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<CatalogItem[]>([]);

  const [selectedBrand, setSelectedBrand] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCatalogs();
  }, []);

  async function loadCatalogs() {
    const brandsData = await getAllBrands();
    const categoriesData = await getAllCategories();
    setBrands(brandsData);
    setCategories(categoriesData);
  }

  useEffect(() => {
    if (mode === 'edit' && product) {
      setName(product.name);
      setDescription(product.description ?? '');
      setSelectedBrand(product.brand_id);
      setSelectedCategory(product.category_id);
      setSalePrice(product.sale_price.toString());
    }
  }, [mode, product]);

  async function handleSave() {
    if (name.trim() === '') return Alert.alert('Ingrese el nombre');
    if (selectedBrand === 0) return Alert.alert('Seleccione una marca');
    if (selectedCategory === 0) return Alert.alert('Seleccione una categoría');
    if (salePrice.trim() === '') return Alert.alert('Ingrese el precio');

    const price = Number(salePrice);
    if (isNaN(price) || price < 0) return Alert.alert('Precio inválido');

    try {
      setSaving(true);
      if (mode === 'create') {
        const productId = await createProduct(
          name,
          description,
          selectedBrand,
          selectedCategory,
          price
        );
        onSaved?.({ productId, categoryId: selectedCategory });
        return;
      }

      if (mode === 'edit' && product) {
        await updateProduct(
          product.id,
          name,
          description,
          selectedBrand,
          selectedCategory,
          price
        );
        onUpdated?.();
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No fue posible guardar.');
    } finally {
      setSaving(false);
    }
  }

  const selectedBrandName =
    brands.find((b) => b.id === selectedBrand)?.name ?? 'Sin seleccionar';
  const selectedCategoryName =
    categories.find((c) => c.id === selectedCategory)?.name ?? 'Sin seleccionar';

  return (
    <View className="gap-6">
      {/* Nombre */}
      <View>
        <Text className="mb-2 text-sm font-semibold text-slate-700">Nombre</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ej. Camiseta básica"
          placeholderTextColor="#94a3b8"
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base font-bold text-slate-900"
        />
      </View>

      {/* Descripción */}
      <View>
        <Text className="mb-2 text-sm font-semibold text-slate-700">Descripción</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Detalles opcionales del producto"
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900"
        />
      </View>

      {/* Marca */}
      <View>
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Marca
          </Text>
          <Text className="text-sm font-bold text-slate-900">{selectedBrandName}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
          {brands.length === 0 ? (
            <Text className="text-sm text-slate-400">Cargando marcas...</Text>
          ) : (
            brands.map((b) => (
              <ChipOption
                key={b.id}
                label={b.name}
                active={selectedBrand === b.id}
                onPress={() => setSelectedBrand(b.id)}
              />
            ))
          )}
        </ScrollView>
      </View>

      {/* Categoría */}
      <View>
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Categoría
          </Text>
          <Text className="text-sm font-bold text-slate-900">{selectedCategoryName}</Text>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {categories.length === 0 ? (
            <Text className="text-sm text-slate-400">Cargando categorías...</Text>
          ) : (
            categories.map((c) => (
              <ChipOption
                key={c.id}
                label={c.name}
                active={selectedCategory === c.id}
                onPress={() => setSelectedCategory(c.id)}
                compact
              />
            ))
          )}
        </View>
      </View>

      {/* Precio */}
      <View>
        <Text className="mb-2 text-sm font-semibold text-slate-700">Precio de venta</Text>
        <View className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-4">
          <Text className="text-lg font-black text-slate-400">$</Text>
          <TextInput
            keyboardType="numeric"
            value={salePrice}
            onChangeText={setSalePrice}
            placeholder="0.00"
            placeholderTextColor="#94a3b8"
            className="flex-1 p-4 text-lg font-black text-slate-900"
          />
        </View>
      </View>

      {/* Resumen + CTA */}
      <View className="rounded-3xl bg-slate-900 p-6">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Resumen
        </Text>
        <View className="mt-4 flex-row flex-wrap gap-6">
          <SummaryItem label="Nombre" value={name || '—'} />
          <SummaryItem label="Marca" value={selectedBrandName} />
          <SummaryItem label="Categoría" value={selectedCategoryName} />
          <SummaryItem label="Precio" value={salePrice ? `$${salePrice}` : '—'} />
        </View>

        <TouchableOpacity
          disabled={saving}
          onPress={handleSave}
          className={`mt-6 rounded-2xl p-5 ${saving ? 'bg-blue-400' : 'bg-blue-600'}`}>
          <Text className="text-center text-lg font-black text-white">
            {saving
              ? 'Guardando...'
              : mode === 'edit'
                ? 'Guardar cambios'
                : 'Crear producto'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
        className={`text-sm font-semibold ${active ? 'text-white' : 'text-slate-700'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[100px] max-w-[180px]">
      <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </Text>
      <Text className="mt-1 text-lg font-black text-white" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
