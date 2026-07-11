import { useEffect, useState, useRef } from 'react';
import { View, Text, Button, Alert, FlatList, TextInput } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getAvailableToSell } from '@/utils/inventoryService';
import { createReservation } from '@/repositories/reservationRepository';
import { getVariantByBarcode } from '@/repositories/variantRepository';
import { createSale } from '@/repositories/SalesRepository';
import { getCurrentUser } from '@/auth/auth';
import { CartItem } from '@/types/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanResultScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const barcodeInputRef = useRef<TextInput>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  type NavProps = NativeStackNavigationProp<RootStackParamList, 'ScanResult'>;
  const navigation = useNavigation<NavProps>();
  const [barcode, setBarcode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [daysToHold, setDaysToHold] = useState('3');

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

      // Revisar cuántas piezas ya están en el carrito
      const itemInCart = cart.find((item) => item.variantId === variant.id);

      const quantityInCart = itemInCart?.quantity ?? 0;

      // No permitir agregar más de las disponibles
      if (quantityInCart >= availableToSell) {
        Alert.alert('Stock insuficiente', `Solo hay ${availableToSell} piezas disponibles.`);
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

      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 50);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Error al buscar producto');
    }
  }

  async function handleApartar() {
    if (!customerName.trim()) {
      Alert.alert('Ingrese el nombre de la persona');
      return;
    }

    if(Number(daysToHold)<=0){
       Alert.alert('El número de dias apartados debe ser mayor que cero');
      return;
    }

     

    if (!/^\d{10}$/.test(customerPhone.trim())) {
      Alert.alert('Error', 'El teléfono debe contener exactamente 10 dígitos.');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de apartar.');
      return;
    }

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
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 flex-row p-4">
        {/* COLUMNA 1: LISTADO DE PRODUCTOS (65% del ancho) */}
        <View className="mr-4 flex-[0.65] justify-between rounded-xl bg-white p-4">
          <View className="flex-1">
            <Text className="mb-2 text-xl font-bold">Carrito</Text>

            {/* FlatList genera el scroll automático si hay muchos productos */}
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
                  <Text className="mb-3 font-bold">
                    Total: ${(item.unitPrice * item.quantity).toFixed(2)}
                  </Text>

                  {/* Botones del artículo controlados en su ancho */}
                  <View className="flex-row justify-start gap-2">
                    <Button title=" - " onPress={() => decreaseQuantity(item.variantId)} />
                    <Button title=" + " onPress={() => increaseQuantity(item.variantId)} />
                    <Button
                      title="Apartar"
                      onPress={() => setShowReservationForm(true)}
                      disabled={
                        cart.length === 0 || cart.some((i) => i.quantity > i.availableStock)
                      }
                    />
                    <Button
                      title="Eliminar"
                      color="red"
                      onPress={() => removeItem(item.variantId)}
                    />
                  </View>
                </View>
              )}
            />
          </View>

          {/* Sección fija de totales al fondo de la primera columna */}
          <View className="mt-2 border-t border-gray-200 pt-3">
            <Text className="mb-3 text-lg font-bold">Total: ${total.toFixed(2)}</Text>
            <Button title="Confirmar venta" onPress={handleCheckout} />
            <View className="mt-2">
              <Button title="Vaciar carrito" color="red" onPress={clearCart} />
            </View>
          </View>
        </View>

        {/* COLUMNA 2: MÉTODOS DE CAPTURA Y FORMULARIOS (35% del ancho) */}
        <View className="flex-[0.35] flex-col">
          {/* Selector de Método */}
          <View className="mb-4 rounded-xl bg-white p-4">
            <Text className="mb-3 text-lg font-bold">Método de captura</Text>
            <Button
              title={useCamera ? 'Cambiar a Scanner Físico' : 'Cambiar a Cámara'}
              onPress={() => setUseCamera(!useCamera)}
            />
          </View>

          {/* Área de Captura (Cámara o Input manual) */}
          <View className="flex-1 justify-center overflow-hidden rounded-xl bg-white">
            {useCamera ? (
              <View className="relative flex-1">
                <CameraView
                  style={{ flex: 1 }}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                />
                {scanned && (
                  <View className="absolute bottom-5 left-5 right-5">
                    <Button title="Escanear otra vez" onPress={() => setScanned(false)} />
                  </View>
                )}
              </View>
            ) : (
              <View className="p-5">
                <Text className="mb-2 font-semibold">Código de barras</Text>
                <TextInput
                  className="rounded-lg border bg-gray-50 p-4"
                  placeholder="Escanee o escriba el código"
                  value={barcode}
                  onChangeText={setBarcode}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={() => searchBarcode(barcode)}
                  ref={barcodeInputRef}
                  blurOnSubmit={false}
                />
                <View className="mt-3">
                  <Button title="Buscar" onPress={() => searchBarcode(barcode)} />
                </View>
              </View>
            )}
          </View>

          {/* Formulario de Apartados (Si está activo, aparece abajo en la columna 2) */}
          {showReservationForm && (
            <View className="mt-4 rounded-xl bg-white p-4">
              <Text className="mb-2 font-bold">Datos del apartado</Text>

              <TextInput
                className="mb-3 rounded-lg border bg-gray-50 p-3"
                placeholder="Nombre del cliente"
                value={customerName}
                onChangeText={setCustomerName}
              />

              <TextInput
                className="mb-3 rounded-lg border bg-gray-50 p-3"
                placeholder="Teléfono"
                value={customerPhone}
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
              />

              <TextInput
                className="mb-3 rounded-lg border bg-gray-50 p-3"
                placeholder="Días para recoger"
                value={daysToHold}
                onChangeText={setDaysToHold}
                keyboardType="numeric"
              />

              <Button title="Guardar apartado" onPress={handleApartar} />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
