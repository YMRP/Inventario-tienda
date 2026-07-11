import { useEffect, useState, useRef } from 'react';
import { View, Text, Button, Alert, FlatList, TextInput, TouchableOpacity } from 'react-native';
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
        color: variant.color,
        size: variant.size,
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
  <SafeAreaView className="flex-1 bg-slate-50">
    <View className="flex-1 flex-row gap-6 p-8">
      {/* ================= IZQUIERDA ================= */}
      <View className="flex-[0.65] rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <View className="mb-6">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Venta actual
          </Text>

          <Text className="text-3xl font-black text-slate-900">
            Carrito
          </Text>

          <Text className="mt-2 text-slate-500">
            Productos agregados para la venta.
          </Text>
        </View>

        {/* LISTADO */}
        <FlatList
          className="flex-1"
          data={cart}
          keyExtractor={(item) => item.variantId.toString()}
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item }) => (
            <View className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-xl font-black text-slate-900">
                    {item.name}
                  </Text>

                  <Text className="mt-1 text-slate-500">
                    {item.color} · Talla {item.size}
                  </Text>
                </View>

                <View className="rounded-full bg-blue-50 px-3 py-1">
                  <Text className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    En carrito
                  </Text>
                </View>
              </View>

              <View className="mt-6 flex-row gap-4">
                <View className="flex-1 rounded-2xl bg-white p-4">
                  <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Precio
                  </Text>

                  <Text className="mt-2 text-2xl font-black text-slate-900">
                    ${item.unitPrice.toFixed(2)}
                  </Text>
                </View>

                <View className="flex-1 rounded-2xl bg-white p-4">
                  <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Stock
                  </Text>

                  <Text className="mt-2 text-2xl font-black text-slate-900">
                    {item.availableStock}
                  </Text>
                </View>

                <View className="flex-1 rounded-2xl bg-white p-4">
                  <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Cantidad
                  </Text>

                  <Text className="mt-2 text-2xl font-black text-slate-900">
                    {item.quantity}
                  </Text>
                </View>

                <View className="flex-1 rounded-2xl bg-white p-4">
                  <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Total
                  </Text>

                  <Text className="mt-2 text-2xl font-black text-slate-900">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>

              <View className="mt-6 flex-row flex-wrap gap-3">
                <TouchableOpacity
                  onPress={() => decreaseQuantity(item.variantId)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3">
                  <Text className="font-bold text-slate-700">−</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => increaseQuantity(item.variantId)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3">
                  <Text className="font-bold text-slate-700">+</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowReservationForm(true)}
                  disabled={
                    cart.length === 0 ||
                    cart.some((i) => i.quantity > i.availableStock)
                  }
                  className="rounded-2xl bg-blue-600 px-5 py-3">
                  <Text className="font-bold text-white">
                    Apartar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => removeItem(item.variantId)}
                  className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3">
                  <Text className="font-bold text-red-700">
                    Eliminar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        {/* PANEL RESUMEN */}
        <View className="mt-6 rounded-3xl bg-slate-900 p-6">
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Resumen
          </Text>

          <View className="mt-5 flex-row gap-8">
            <View>
              <Text className="text-slate-500">
                Productos
              </Text>

              <Text className="text-3xl font-black text-white">
                {cart.length}
              </Text>
            </View>

            <View>
              <Text className="text-slate-500">
                Total
              </Text>

              <Text className="text-4xl font-black text-white">
                ${total.toFixed(2)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCheckout}
            className="mt-8 rounded-2xl bg-blue-600 p-5">
            <Text className="text-center text-lg font-black text-white">
              Confirmar venta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={clearCart}
            className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <Text className="text-center font-bold text-red-700">
              Vaciar carrito
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= DERECHA ================= */}
      <View className="flex-[0.35] gap-6">
        {/* MÉTODO */}
        <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            Método de captura
          </Text>

          <TouchableOpacity
            onPress={() => setUseCamera(!useCamera)}
            className="rounded-2xl bg-slate-900 p-4">
            <Text className="text-center font-bold text-white">
              {useCamera
                ? 'Usar scanner físico'
                : 'Usar cámara'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SCANNER */}
        <View className="flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {useCamera ? (
            <View className="flex-1">
              <CameraView
                style={{ flex: 1 }}
                onBarcodeScanned={
                  scanned ? undefined : handleBarCodeScanned
                }
              />

              {scanned && (
                <View className="absolute bottom-5 left-5 right-5">
                  <TouchableOpacity
                    onPress={() => setScanned(false)}
                    className="rounded-2xl bg-blue-600 p-4">
                    <Text className="text-center font-bold text-white">
                      Escanear nuevamente
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View className="p-6">
              <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Código de barras
              </Text>

              <TextInput
                ref={barcodeInputRef}
                value={barcode}
                onChangeText={setBarcode}
                onSubmitEditing={() => searchBarcode(barcode)}
                placeholder="Escanee o escriba el código"
                placeholderTextColor="#94a3b8"
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-lg font-bold text-slate-900"
              />

              <TouchableOpacity
                onPress={() => searchBarcode(barcode)}
                className="mt-4 rounded-2xl bg-blue-600 p-4">
                <Text className="text-center font-bold text-white">
                  Buscar producto
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* APARTADO */}
        {showReservationForm && (
          <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Text className="mb-5 text-xs font-bold uppercase tracking-wider text-slate-400">
              Datos del apartado
            </Text>

            <TextInput
              className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900"
              placeholder="Nombre del cliente"
              placeholderTextColor="#94a3b8"
              value={customerName}
              onChangeText={setCustomerName}
            />

            <TextInput
              className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900"
              placeholder="Teléfono"
              placeholderTextColor="#94a3b8"
              value={customerPhone}
              onChangeText={setCustomerPhone}
            />

            <TextInput
              className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900"
              placeholder="Días para recoger"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={daysToHold}
              onChangeText={setDaysToHold}
            />

            <TouchableOpacity
              onPress={handleApartar}
              className="rounded-2xl bg-blue-600 p-4">
              <Text className="text-center text-lg font-black text-white">
                Guardar apartado
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  </SafeAreaView>
);
}
