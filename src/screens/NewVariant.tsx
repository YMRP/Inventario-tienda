import { View, Text, Alert, TouchableOpacity, TextInput } from 'react-native';
import { getCurrentUser } from '@/auth/auth';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { CatalogItem, RootStackParamList } from '@/types/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  createVariant,
  generateUniqueBarcode,
  getAllColors,
  getSizesByTemplate,
  getTemplateByCategory,
  registerInventoryMovement,
} from '@/repositories/variantRepository';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';

type NewVariantRouteProp = RouteProp<RootStackParamList, 'NewVariant'>;


type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'NewVariant'>;

export default function NewVariant() {
  const user = getCurrentUser();
  const navigation = useNavigation<NavigationProps>();

  const [colors, setColors] = useState<CatalogItem[]>([]);
  const [sizes, setSizes] = useState<CatalogItem[]>([]);

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);

  const [availableStock, setAvailableStock] = useState('');
  const [minimumStock, setMinimumStock] = useState('');

  const [barcode, setBarcode] = useState('');

  const route = useRoute<NewVariantRouteProp>();

  const { productId, categoryId } = route.params;
  useFocusEffect(
  useCallback(() => {
    loadData();
  }, [])
);

  async function handleSaveVariant() {
    try {
      if (selectedColor === 0) {
        Alert.alert('Seleccione un color');
        return;
      }

      if (selectedSize === 0) {
        Alert.alert('Seleccione una talla');
        return;
      }

      if (availableStock.trim() === '') {
        Alert.alert('Ingrese el stock inicial');
        return;
      }

      if (minimumStock.trim() === '') {
        Alert.alert('Ingrese el stock mínimo');
        return;
      }

      const stock = Number(availableStock);
      const minimum = Number(minimumStock);

      if (isNaN(stock) || stock < 0) {
        Alert.alert('Stock inválido');
        return;
      }

      if (isNaN(minimum) || minimum < 0) {
        Alert.alert('Stock mínimo inválido');
        return;
      }

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
    }
  }

  async function loadData() {
    try {
      console.log('======================');
      console.log('productId:', productId);
      console.log('categoryId:', categoryId);

      const colorsData = await getAllColors();

      const templateId = await getTemplateByCategory(categoryId);

      console.log('templateId:', templateId);
      console.log('======================');

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

  return (
    <SafeAreaView className='flex-1'>
    <View className="flex-1 bg-white p-6">
      <Text className="mb-8 text-2xl font-bold">Nueva Variante</Text>

      {/* Color */}

      <Text className="mb-2 font-semibold">Color</Text>

      <Picker selectedValue={selectedColor} onValueChange={(value) => setSelectedColor(value)}>
        <Picker.Item label="Seleccione un color" value={0} />

        {colors.map((color) => (
          <Picker.Item key={color.id} label={color.name} value={color.id} />
        ))}
      </Picker>

      {/* Talla */}

      <Text className="mb-2 mt-4 font-semibold">Talla</Text>

      <Picker selectedValue={selectedSize} onValueChange={(value) => setSelectedSize(value)}>
        <Picker.Item label="Seleccione una talla" value={0} />

        {sizes.map((size) => (
          <Picker.Item key={size.id} label={size.name} value={size.id} />
        ))}
      </Picker>

      {/* Stock */}

      <Text className="mb-2 mt-4 font-semibold">Stock inicial</Text>

      <TextInput
        className="rounded-lg border p-3"
        keyboardType="numeric"
        value={availableStock}
        onChangeText={setAvailableStock}
      />

      <Text className="mb-2 mt-4 font-semibold">Stock mínimo</Text>

      <TextInput
        className="rounded-lg border p-3"
        keyboardType="numeric"
        value={minimumStock}
        onChangeText={setMinimumStock}
      />

      {/* Código */}

      <Text className="mt-5 font-semibold">Código de barras</Text>

      <Text className="mt-2 text-lg text-blue-700">{barcode}</Text>

      <TouchableOpacity
        className="mt-3 rounded-lg bg-gray-600 p-3"
        onPress={async () => {
          const newBarcode = await generateUniqueBarcode();

          setBarcode(newBarcode);
        }}>
        <Text className="text-center font-bold text-white">Generar otro código</Text>
      </TouchableOpacity>

      <TouchableOpacity className="mt-8 rounded-lg bg-blue-700 p-4" onPress={handleSaveVariant}>
        <Text className="text-center font-bold text-white">Guardar Variante</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
}
