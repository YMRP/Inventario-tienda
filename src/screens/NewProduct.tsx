import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAllBrands, getAllCategories } from '@/repositories/productRepository';
import { CatalogItem } from '@/types/types';
import { createProduct } from '@/repositories/productRepository';

export default function NewProduct() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [brands, setBrands] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<CatalogItem[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  useEffect(() => {
    loadCatalogs();
  }, []);

  async function loadCatalogs() {
    try {
      const categoriesData = await getAllCategories();
      const brandsData = await getAllBrands();
      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSaveProduct() {
    try {
      if (name.trim() === '') {
        Alert.alert('Ingrese el nombre del producto');
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
        Alert.alert('Ingrese un precio válido');
        return;
      }

      const productId = await createProduct(
        name,
        description,
        selectedBrand,
        selectedCategory,
        price
      );

      console.log('Producto creado con ID:', productId);
      Alert.alert('Producto guardado correctamente con ID: ', productId.toString());
    } catch (error: any) {
      console.log(error);
      Alert.alert('Ha ocurrido un error');
    }
  }

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="mb-8 text-2xl font-bold">Nuevo Producto</Text>

      {/* Nombre */}

      <Text className="mb-2 font-semibold">Nombre</Text>

      <TextInput className="mb-4 rounded-lg border p-3" value={name} onChangeText={setName} />

      {/* Descripción */}

      <Text className="mb-2 font-semibold">Descripción</Text>

      <TextInput
        className="mb-4 rounded-lg border p-3"
        value={description}
        onChangeText={setDescription}
      />

      {/* Marca */}

      <Text className="mb-2 font-semibold">Marca</Text>

      <Picker selectedValue={selectedBrand} onValueChange={(value) => setSelectedBrand(value)}>
        <Picker.Item label="Seleccione una marca" value={0} />

        {brands.map((brand) => (
          <Picker.Item key={brand.id} label={brand.name} value={brand.id} />
        ))}
      </Picker>

      {/* Categoría */}

      {/* Categoría */}

      <Text className="mb-2 font-semibold">Categoría</Text>

      <Picker
        selectedValue={selectedCategory}
        onValueChange={(value) => setSelectedCategory(value)}>
        <Picker.Item label="Seleccione una categoría" value={0} />

        {categories.map((category) => (
          <Picker.Item key={category.id} label={category.name} value={category.id} />
        ))}
      </Picker>

      {/* Precio */}

      <Text className="mb-2 font-semibold">Precio de venta</Text>

      <TextInput
        className="mb-6 rounded-lg border p-3"
        keyboardType="numeric"
        value={salePrice}
        onChangeText={setSalePrice}
      />

      <TouchableOpacity className="rounded-lg bg-blue-700 p-4" onPress={handleSaveProduct}>
        <Text className="text-center font-bold text-white">Guardar Producto</Text>
      </TouchableOpacity>
    </View>
  );
}
