import { useCallback,  useState } from 'react';
import { View, Text, TextInput,  TouchableOpacity, Alert, ScrollView } from 'react-native';

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
  <SafeAreaView className="flex-1 bg-slate-50">
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 32, paddingBottom: 60 }}>
      {/* HEADER */}
      <View className="mb-8 flex-row items-start justify-between">
        <View>
          <View className="mb-3 flex-row items-center gap-2">
            <View className="h-3 w-3 rounded-full bg-blue-600" />

            <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Administración
            </Text>
          </View>

          <Text className="text-3xl font-black text-slate-900">
            Catálogos
          </Text>

          <Text className="mt-2 text-base text-slate-500">
            Administra categorías, marcas, colores, tallas y plantillas.
          </Text>
        </View>
      </View>

      <View className="flex-row items-start gap-6">
        {/* PANEL IZQUIERDO */}
        <View className="w-[380px] gap-6">
          {/* TIPO */}
          <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Tipo de catálogo
            </Text>

            <Picker
              selectedValue={catalogType}
              onValueChange={setCatalogType}>
              <Picker.Item label="Categorías" value="CATEGORIES" />
              <Picker.Item label="Marcas" value="BRANDS" />
              <Picker.Item label="Colores" value="COLORS" />
              <Picker.Item label="Tallas" value="SIZES" />
              <Picker.Item label="Plantillas" value="TEMPLATES" />
            </Picker>
          </View>

          {(catalogType === 'SIZES' || catalogType === 'CATEGORIES') && (
            <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Plantilla
              </Text>

              <Picker
                selectedValue={selectedTemplate}
                onValueChange={setSelectedTemplate}>
                <Picker.Item
                  label="Seleccione una plantilla"
                  value={0}
                />

                {templates.map((template) => (
                  <Picker.Item
                    key={template.id}
                    label={template.name}
                    value={template.id}
                  />
                ))}
              </Picker>
            </View>
          )}

          {/* FORMULARIO */}
          <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              {editing ? 'Editar registro' : 'Nuevo registro'}
            </Text>

            <TextInput
              placeholder="Nombre"
              placeholderTextColor="#94a3b8"
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-lg font-bold text-slate-900"
              value={newItemName}
              onChangeText={setNewItemName}
            />

            <TouchableOpacity
              className="mt-5 rounded-2xl bg-slate-900 p-4"
              onPress={handleSave}>
              <Text className="text-center font-bold text-white">
                {editing ? 'Actualizar' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PANEL DERECHO */}
        <View className="flex-1 gap-6">
          {/* RESUMEN */}
          <View className="rounded-3xl bg-slate-900 p-6 shadow-sm">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Resumen
            </Text>

            <View className="mt-5 flex-row gap-10">
              <View>
                <Text className="text-sm text-slate-500">
                  Registros
                </Text>

                <Text className="text-4xl font-black text-white">
                  {items.length}
                </Text>
              </View>

              <View>
                <Text className="text-sm text-slate-500">
                  Catálogo
                </Text>

                <Text className="text-2xl font-black text-white">
                  {catalogType.replace('_', ' ')}
                </Text>
              </View>
            </View>
          </View>

          {/* LISTA */}
          <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Text className="mb-6 text-xs font-bold uppercase tracking-wider text-slate-400">
              Registros
            </Text>

            {items.length === 0 ? (
              <View className="items-center py-16">
                <Text className="text-lg font-semibold text-slate-500">
                  No hay registros.
                </Text>
              </View>
            ) : (
              <View className="gap-4">
                {items.map((item) => (
                  <View
                    key={item.id}
                    className="flex-row items-center rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <TouchableOpacity
                      className="flex-1"
                      onPress={() => {
                        setEditing(true);
                        setEditingId(item.id);
                        setNewItemName(item.name);
                      }}>
                      <Text
                        className={`text-xl font-black ${
                          item.active
                            ? 'text-slate-900'
                            : 'text-slate-400'
                        }`}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>

                   

                    <TouchableOpacity
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3"
                      onPress={() => toggleStatus(item)}>
                      <Text className="font-bold text-slate-700">
                        {item.active
                          ? 'Desactivar'
                          : 'Activar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
);
}
