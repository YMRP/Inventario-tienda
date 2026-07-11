import { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';

import { Picker } from '@react-native-picker/picker';

import {
  getAllBrands,
  getAllCategories,
  createCategory,
  createBrand,
  updateCategory,
  updateBrand,
  setCategoryStatus,
  setBrandStatus,
  categoryHasProducts,
  brandHasProducts,
} from '@/repositories/productRepository';

import {
  getVariantTemplates,
  getCatalogColors,
  getSizesByTemplate,
  createColor,
  createSize,
  createVariantTemplate,
  updateColor,
  updateSize,
  updateVariantTemplate,
  setColorStatus,
  setSizeStatus,
  setVariantTemplateStatus,
  colorHasVariants,
  sizeHasVariants,
  templateHasCategories,
} from '@/repositories/variantRepository';

import { CatalogItem } from '@/types/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

export default function CatalogScreen() {
  const [catalogType, setCatalogType] = useState('CATEGORIES');

  const [templates, setTemplates] = useState<CatalogItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  const [items, setItems] = useState<CatalogItem[]>([]);

  const [newItemName, setNewItemName] = useState('');

  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useFocusEffect(
  useCallback(() => {
    loadTemplates();
  }, [])
);

  useFocusEffect(
  useCallback(() => {
    loadCatalog();
  }, [catalogType,selectedTemplate])
);

  async function loadTemplates() {
    const data = await getVariantTemplates();
    setTemplates(data);
  }

  async function updateStatus(type: string, id: number, active: number) {
    switch (type) {
      case 'CATEGORIES':
        await setCategoryStatus(id, active);
        break;

      case 'BRANDS':
        await setBrandStatus(id, active);
        break;

      case 'COLORS':
        await setColorStatus(id, active);
        break;

      case 'SIZES':
        await setSizeStatus(id, active);
        break;

      case 'TEMPLATES':
        await setVariantTemplateStatus(id, active);
        break;
    }
  }
  async function loadCatalog() {
    switch (catalogType) {
      case 'CATEGORIES':
        setItems(await getAllCategories());
        break;

      case 'BRANDS':
        setItems(await getAllBrands());
        break;

      case 'COLORS':
        setItems(await getCatalogColors());
        break;

      case 'SIZES':
        if (selectedTemplate === 0) {
          setItems([]);
        } else {
          setItems(await getSizesByTemplate(selectedTemplate));
        }
        break;

      case 'TEMPLATES':
        setItems(await getVariantTemplates());
        break;
    }
  }

  async function handleSave() {
    try {
      if (newItemName.trim() === '') {
        Alert.alert('Ingrese un nombre');
        return;
      }

      if (editing) {
        switch (catalogType) {
          case 'CATEGORIES':
            await updateCategory(editingId!, newItemName);
            break;

          case 'BRANDS':
            await updateBrand(editingId!, newItemName);
            break;

          case 'COLORS':
            await updateColor(editingId!, newItemName);
            break;

          case 'SIZES':
            await updateSize(editingId!, selectedTemplate, newItemName);
            break;

          case 'TEMPLATES':
            await updateVariantTemplate(editingId!, newItemName);
            break;
        }
      } else {
        switch (catalogType) {
          case 'CATEGORIES':
            if (selectedTemplate === 0) {
              Alert.alert('Seleccione una plantilla');
              return;
            }

            await createCategory(newItemName, selectedTemplate);
            break;

          case 'BRANDS':
            await createBrand(newItemName);
            break;

          case 'COLORS':
            await createColor(newItemName);
            break;

          case 'SIZES':
            if (selectedTemplate === 0) {
              Alert.alert('Seleccione una plantilla');
              return;
            }

            await createSize(selectedTemplate, newItemName);
            break;

          case 'TEMPLATES':
            await createVariantTemplate(newItemName);

            await loadTemplates();
            break;
        }
      }

      setEditing(false);
      setEditingId(null);
      setNewItemName('');

      await loadCatalog();
      Alert.alert('Guardado Correctamente')
    } catch (error) {
      console.log(error);

      Alert.alert('Error', 'No fue posible guardar.');
    }
  }
  async function toggleStatus(item: CatalogItem) {
    try {
      // Si se está ACTIVANDO no hay validaciones.
      if (item.active === 0) {
        await updateStatus(catalogType, item.id, 1);

        await loadCatalog();
        return;
      }

      let isUsed = false;
      let message = '';

      switch (catalogType) {
        case 'CATEGORIES':
          isUsed = await categoryHasProducts(item.id);
          message = 'La categoría está siendo utilizada por uno o más productos.';
          break;

        case 'BRANDS':
          isUsed = await brandHasProducts(item.id);
          message = 'La marca está siendo utilizada por uno o más productos.';
          break;

        case 'COLORS':
          isUsed = await colorHasVariants(item.id);
          message = 'El color está siendo utilizado por una o más variantes.';
          break;

        case 'SIZES':
          isUsed = await sizeHasVariants(item.id);
          message = 'La talla está siendo utilizada por una o más variantes.';
          break;

        case 'TEMPLATES':
          isUsed = await templateHasCategories(item.id);
          message = 'La plantilla está siendo utilizada por una o más categorías.';
          break;
      }

      if (isUsed) {
        Alert.alert('No es posible desactivar', message);
        return;
      }

      await updateStatus(catalogType, item.id, 0);

      await loadCatalog();
    } catch (error) {
      console.log(error);

      Alert.alert('Error', 'No fue posible actualizar el estado.');
    }
  }
  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      <Text className="mb-6 text-2xl font-bold">Catálogos</Text>

      <Text className="mb-2 font-semibold">Tipo de catálogo</Text>

      <Picker selectedValue={catalogType} onValueChange={setCatalogType}>
        <Picker.Item label="Categorías" value="CATEGORIES" />
        <Picker.Item label="Marcas" value="BRANDS" />
        <Picker.Item label="Colores" value="COLORS" />
        <Picker.Item label="Tallas" value="SIZES" />
        <Picker.Item label="Plantillas" value="TEMPLATES" />
      </Picker>

      {(catalogType === 'SIZES' || catalogType === 'CATEGORIES') && (
        <>
          <Text className="mb-2 mt-6 font-semibold">Plantilla</Text>

          <Picker selectedValue={selectedTemplate} onValueChange={setSelectedTemplate}>
            <Picker.Item label="Seleccione una plantilla" value={0} />

            {templates.map((template) => (
              <Picker.Item key={template.id} label={template.name} value={template.id} />
            ))}
          </Picker>
        </>
      )}

      <Text className="mb-2 mt-6 font-semibold">Nombre</Text>

      <TextInput
        className="rounded-lg border p-3"
        value={newItemName}
        onChangeText={setNewItemName}
      />

      <TouchableOpacity className="mt-4 rounded-lg bg-blue-700 p-4" onPress={handleSave}>
        <Text className="text-center font-bold text-white">
          {editing ? 'Actualizar' : 'Guardar'}
        </Text>
      </TouchableOpacity>

      <FlatList
        className="mt-6"
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="mb-2 flex-row items-center rounded-lg border border-gray-200 bg-white p-4">
            {/* Nombre */}
            <TouchableOpacity
              className="flex-1"
              onPress={() => {
                setEditing(true);
                setEditingId(item.id);
                setNewItemName(item.name);
              }}>
              <Text
                className={`text-base font-semibold ${
                  item.active === 1 ? 'text-black' : 'text-gray-400'
                }`}>
                {item.name}
              </Text>
            </TouchableOpacity>

            {/* Botón activar/desactivar */}
            <TouchableOpacity className="ml-4" onPress={() => toggleStatus(item)}>
              <Text className="text-xl">{item.active === 1 ? 'x' : '🔴'}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
