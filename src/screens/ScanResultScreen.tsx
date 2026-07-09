import { useEffect, useState } from 'react';
import { View, Text, Button, Alert, FlatList, TextInput } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getAvailableToSell } from '@/utils/inventoryService';
import { createReservation } from '@/repositories/reservationRepository';
import { getVariantByBarcode } from '@/repositories/variantRepository';
import { createSale } from '@/repositories/SalesRepository';
import { getCurrentUser } from '@/auth/auth';
import { CartItem, ReservationProps } from '@/types/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanResultScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  type NavProps = NativeStackNavigationProp<RootStackParamList, 'ScanResult'>;
  const navigation = useNavigation<NavProps>();
  const [barcode, setBarcode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [daysToHold, setDaysToHold] = useState('3');
  const cartItems = cart;
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

  function decreaseQuantity(variantId: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.variantId === variantId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function increaseQuantity(variantId: number) {
    setCart((prev) =>
      prev.map((item) => {
        if (item.variantId !== variantId) {
          return item;
        }

        if (item.quantity >= item.availableStock) {
          Alert.alert('Stock insuficiente', `Solo hay ${item.availableStock} piezas disponibles.`);

          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  }

  function removeItem(variantId: number) {
    setCart((prev) => prev.filter((item) => item.variantId !== variantId));
  }

  function clearCart() {
    setCart([]);
  }

  async function searchBarcode(code: string) {
    if (!code.trim()) return;

    try {
      const variant = await getVariantByBarcode(code);

      if (!variant) {
        Alert.alert('No encontrado', 'Producto no existe');
        return;
      }

      // 🔥 ALERTA DE APARTADOS
      if (variant.reserved_stock > 0) {
        Alert.alert(
          'Producto apartado',
          `Este producto tiene ${variant.reserved_stock} unidades apartadas.`
        );
      }

      const availableToSell = getAvailableToSell(variant);

      if (availableToSell <= 0) {
        Alert.alert('Sin disponibilidad', 'Este producto está completamente apartado o sin stock.');
        return;
      }

      addToCart({
        variantId: variant.id,
        name: variant.product_name,
        unitPrice: variant.sale_price,
        quantity: 1,
        availableStock: availableToSell,
        color: '',
        size: '',
      });

      setBarcode('');

      Alert.alert('Agregado al carrito', variant.product_name);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Error al buscar producto');
    }
  }

  async function handleApartar() {
    if (cart.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de apartar.');
      return;
    }

    //  VALIDACIÓN REAL DE STOCK (incluye apartados)
    const hasStockError = cart.some((item) => {
      return item.quantity > item.availableStock;
    });

    if (hasStockError) {
      Alert.alert(
        'Stock insuficiente',
        'Uno o más productos superan el stock disponible (incluyendo apartados).'
      );
      return;
    }

    const reservationId = await createReservation(
      customerName,
      customerPhone,
      Number(daysToHold),
      cart
    );

    navigation.navigate('ReservationDetail', {
      reservationId,
    });
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
    } catch (error: any) {
      console.log(error);

      if (error?.message === 'Stock insuficiente') {
        Alert.alert(
          'Stock insuficiente',
          'Uno de los productos ya no tiene existencias suficientes.'
        );

        return;
      }

      Alert.alert('Error', 'No fue posible completar la venta.');
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
    <SafeAreaView className='flex-1'>
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
            <View className="mb-4 rounded-lg border bg-gray-50 p-3">
              <Text className="text-lg font-semibold">{item.name}</Text>

              <Text className="text-gray-600">
                {item.color} • Talla {item.size}
              </Text>

              <Text className="mt-1">Precio: ${item.unitPrice.toFixed(2)}</Text>

              <Text className="mt-1">Stock disponible: {item.availableStock}</Text>

              <Text className="mt-1">Cantidad: {item.quantity}</Text>

              <Text className="mb-3">Total: ${(item.unitPrice * item.quantity).toFixed(2)}</Text>

              <View className="flex-row justify-between">
                <Button title="-" onPress={() => decreaseQuantity(item.variantId)} />
                <Button title="+" onPress={() => increaseQuantity(item.variantId)} />
                <Button
                  title="Apartar Producto"
                  onPress={() => setShowReservationForm(true)}
                  disabled={cart.length === 0 || cart.some((i) => i.quantity > i.availableStock)}
                />
                <Button title="Eliminar" color="red" onPress={() => removeItem(item.variantId)} />
              </View>
            </View>
          )}
        />
        <Text className="mt-3 text-lg font-bold">Total: ${total.toFixed(2)}</Text>
        <Button title="Confirmar venta" onPress={handleCheckout} />
        {showReservationForm && (
          <View className="mt-4 rounded-xl bg-gray-100 p-4">
            <Text className="mb-2 font-bold">Datos del apartado</Text>

            <TextInput
              className="mb-3 rounded-lg border bg-white p-3"
              placeholder="Nombre del cliente"
              value={customerName}
              onChangeText={setCustomerName}
            />

            <TextInput
              className="mb-3 rounded-lg border bg-white p-3"
              placeholder="Teléfono"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
            />

            <TextInput
              className="mb-3 rounded-lg border bg-white p-3"
              placeholder="Días para recoger"
              value={daysToHold}
              onChangeText={setDaysToHold}
              keyboardType="numeric"
            />

            <Button title="Guardar apartado" onPress={handleApartar} />
          </View>
        )}
        <View className="mt-3">
          <Button title="Vaciar carrito" color="red" onPress={clearCart} />
        </View>
      </View>
    </View>
    </SafeAreaView>
  );
}
