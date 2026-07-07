import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

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
    if (name.trim() === '') {
      Alert.alert('Ingrese el nombre');
      return;
    }

    if (selectedBrand === 0) {
      Alert.alert('Seleccione una marca');
      return;
    }

    if (selectedCategory === 0) {
      Alert.alert('Seleccione una categoría');
      return;
    }

    if (salePrice.trim() === '') {
      Alert.alert('Ingrese el precio');
      return;
    }

    const price = Number(salePrice);

    if (isNaN(price) || price < 0) {
      Alert.alert('Precio inválido');
      return;
    }

    if (mode === 'create') {
      const productId = await createProduct(
  name,
  description,
  selectedBrand,
  selectedCategory,
  price
);

onSaved?.({
  productId,
  categoryId: selectedCategory,
});

      return;
    }

    if (mode === 'edit' && product) {
      await updateProduct(product.id, name, description, selectedBrand, selectedCategory, price);

      onUpdated?.();

      return;
    }
  }

  return (
    <View>
      <Text className="mb-2 font-semibold">Nombre</Text>

      <TextInput className="mb-4 rounded-lg border p-3" value={name} onChangeText={setName} />

      <Text className="mb-2 font-semibold">Descripción</Text>

      <TextInput
        className="mb-4 rounded-lg border p-3"
        value={description}
        onChangeText={setDescription}
      />

      <Text className="mb-2 font-semibold">Marca</Text>

      <Picker selectedValue={selectedBrand} onValueChange={setSelectedBrand}>
        <Picker.Item label="Seleccione una marca" value={0} />

        {brands.map((brand) => (
          <Picker.Item key={brand.id} label={brand.name} value={brand.id} />
        ))}
      </Picker>

      <Text className="mb-2 mt-4 font-semibold">Categoría</Text>

      <Picker selectedValue={selectedCategory} onValueChange={setSelectedCategory}>
        <Picker.Item label="Seleccione una categoría" value={0} />

        {categories.map((category) => (
          <Picker.Item key={category.id} label={category.name} value={category.id} />
        ))}
      </Picker>

      <Text className="mb-2 mt-4 font-semibold">Precio</Text>

      <TextInput
        className="mb-6 rounded-lg border p-3"
        keyboardType="numeric"
        value={salePrice}
        onChangeText={setSalePrice}
      />

      <TouchableOpacity className="rounded-xl bg-blue-700 p-4" onPress={handleSave}>
        <Text className="text-center font-bold text-white">Guardar Producto</Text>
      </TouchableOpacity>
    </View>
  );
}
