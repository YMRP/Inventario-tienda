import { useEffect, useState } from 'react';
import { View, Text, Button, Alert, FlatList, TextInput } from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';

import { getVariantByBarcode } from '@/repositories/variantRepository';
import { createSale } from '@/repositories/SalesRepository';
import { getCurrentUser } from '@/auth/auth';

type CartItem = {
  variantId: number;
  name: string;
  unitPrice: number;
  quantity: number;
};

export default function ScanResultScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [useCamera, setUseCamera] = useState(false);

  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    requestPermission();
  }, []);

  function addToCart(item: CartItem) {
    setCart((prev) => {
      const exists = prev.find((p) => p.variantId === item.variantId);

      if (exists) {
        return prev.map((p) =>
          p.variantId === item.variantId
            ? {
                ...p,
                quantity: p.quantity + 1,
              }
            : p
        );
      }

      return [...prev, item];
    });
  }

  async function searchBarcode(code: string) {
    if (!code.trim()) {
      return;
    }

    try {
      const variant = await getVariantByBarcode(code);

      if (!variant) {
        Alert.alert('No encontrado', 'Producto no existe');

        return;
      }

      addToCart({
        variantId: variant.id,
        name: variant.product_name,
        unitPrice: variant.sale_price,
        quantity: 1,
      });

      setBarcode('');

      Alert.alert('Agregado al carrito', variant.product_name);
    } catch (error) {
      console.log(error);

      Alert.alert('Error', 'Error al buscar producto');
    }
  }

  async function handleBarCodeScanned({ data }: any) {
    setScanned(true);
    console.log('Código leído:', data);
    await searchBarcode(data);
  }

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  async function handleCheckout() {
    try {
      const user = getCurrentUser();

      if (cart.length === 0) {
        Alert.alert('Carrito vacío');

        return;
      }

      await createSale(
        user?.id ?? 0,
        cart.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      );

      Alert.alert('Venta realizada');

      setCart([]);
    } catch (error) {
      console.log(error);

      Alert.alert('Error al procesar venta');
    }
  }

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Cargando cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No hay acceso a cámara</Text>

        <Button title="Permitir cámara" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Selector */}

      <View className="bg-white p-4">
        <Text className="mb-3 text-lg font-bold">Método de captura</Text>

        <Button
          title={useCamera ? 'Cambiar a Scanner Físico' : 'Cambiar a Cámara'}
          onPress={() => setUseCamera(!useCamera)}
        />
      </View>

      {/* Scanner */}

      <View style={{ flex: 1 }}>
        {useCamera ? (
          <>
            <CameraView
              style={{ flex: 1 }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            {scanned && (
              <View className="absolute bottom-10 w-full px-5">
                <Button title="Escanear otra vez" onPress={() => setScanned(false)} />
              </View>
            )}
          </>
        ) : (
          <View className="p-5">
            <Text className="mb-2 font-semibold">Código de barras</Text>

            <TextInput
              className="rounded-lg border bg-white p-4"
              placeholder="Escanee o escriba el código"
              value={barcode}
              onChangeText={setBarcode}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={() => searchBarcode(barcode)}
            />

            <View className="mt-3">
              <Button title="Buscar" onPress={() => searchBarcode(barcode)} />
            </View>
          </View>
        )}
      </View>

      {/* Carrito */}

      <View className="bg-white p-4">
        <Text className="mb-2 text-xl font-bold">Carrito</Text>

        <FlatList
          data={cart}
          keyExtractor={(item) => item.variantId.toString()}
          renderItem={({ item }) => (
            <View className="flex-row justify-between py-1">
              <Text>
                {item.name} x{item.quantity}
              </Text>

              <Text>${(item.unitPrice * item.quantity).toFixed(2)}</Text>
            </View>
          )}
        />

        <Text className="mt-3 text-lg font-bold">Total: ${total.toFixed(2)}</Text>

        <Button title="Confirmar venta" onPress={handleCheckout} />
      </View>
    </View>
  );
}
