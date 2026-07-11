import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';

import {
  getReservationDetail,
  convertReservationToSale,
  cancelReservation,
  getReservationById,
} from '@/repositories/reservationRepository';
import { ReservationDetailItem, ReservationProps } from '@/types/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReservationDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { reservationId } = route.params;

  const [items, setItems] = useState<ReservationDetailItem[]>([]);
  const [reservation, setReservation] = useState<ReservationProps | null>(null);
  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [handleCancel, handleConvert])
  );

  async function loadDetail() {
    const [detail, header] = await Promise.all([
      getReservationDetail(reservationId),
      getReservationById(reservationId),
    ]);

    setItems(detail);
    setReservation(header);
  }

  async function handleConvert() {
    try {
      await convertReservationToSale(reservationId, 1);

      navigation.goBack();
    } catch (error: any) {
      console.log('Error ReservationDetailScreen, HandleConvert: ', error);
    }
  }

  async function handleCancel() {
    try {
      Alert.alert(
        'Cancelar apartado',
        '¿Deseas cancelar este apartado? El stock regresará al inventario.',
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Sí',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('Cancelando apartado:', reservationId);

                await cancelReservation(reservationId);

                console.log('Apartado cancelado');

                Alert.alert('Éxito', 'El apartado fue cancelado.');

                navigation.goBack();
              } catch (error) {
                console.log('Error cancelReservation:', error);

                Alert.alert('Error', 'No fue posible cancelar el apartado.');
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.log('Error ReservationDetailScreen, handleCancel: ', error);
    }
  }

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className='flex-1'>
        <View className="flex-1 px-8 pt-8">
          {/* HEADER */}
          <View className="mb-8 flex-row items-start justify-between">
            <View>
              <View className="mb-3 flex-row items-center gap-2">
                <View className="h-3 w-3 rounded-full bg-blue-600" />

                <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Apartados
                </Text>
              </View>

              <Text className="text-3xl font-black text-slate-900">Apartado #{reservationId}</Text>

              <Text className="mt-2 text-base text-slate-500">
                Consulta la información y administra este apartado.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3">
              <Text className="font-bold text-slate-700">← Volver</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 flex-row gap-6">
            {/* PANEL IZQUIERDO */}
            <View className="w-[360px] gap-6">
              {reservation && (
                <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Información
                  </Text>

                  <View className="gap-5">
                    <View>
                      <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Cliente
                      </Text>

                      <Text className="mt-1 text-xl font-black text-slate-900">
                        {reservation.customer_name}
                      </Text>
                    </View>

                    <View>
                      <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Teléfono
                      </Text>

                      <Text className="mt-1 text-lg font-semibold text-slate-700">
                        {reservation.customer_phone ?? 'Sin teléfono'}
                      </Text>
                    </View>

                    <View>
                      <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Estado
                      </Text>

                      <View className="mt-2 self-start rounded-full bg-blue-50 px-3 py-1">
                        <Text className="text-xs font-bold uppercase tracking-wider text-blue-700">
                          {reservation.status}
                        </Text>
                      </View>
                    </View>

                    <View>
                      <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Vencimiento
                      </Text>

                      <Text className="mt-1 text-lg font-semibold text-slate-700">
                        {reservation.expires_at}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View className="rounded-3xl bg-slate-900 p-6 shadow-sm">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Resumen
                </Text>

                <View className="mt-5 gap-5">
                  <View>
                    <Text className="text-sm text-slate-500">Productos</Text>

                    <Text className="text-3xl font-black text-white">{items.length}</Text>
                  </View>

                  <View>
                    <Text className="text-sm text-slate-500">Total</Text>

                    <Text className="text-4xl font-black text-white">${total.toFixed(2)}</Text>
                  </View>
                </View>

                {reservation?.status === 'ACTIVE' && (
                  <View className="mt-8 gap-3">
                    <TouchableOpacity
                      className="rounded-2xl bg-blue-600 p-4"
                      onPress={handleConvert}>
                      <Text className="text-center text-lg font-bold text-white">
                        Convertir a venta
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="rounded-2xl border border-red-200 bg-red-50 p-4"
                      onPress={handleCancel}>
                      <Text className="text-center font-bold text-red-700">Cancelar apartado</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                      onPress={() => navigation.navigate('Dashboard')}>
                      <Text className="text-center font-bold text-slate-700">Ir al inicio</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* PANEL DERECHO */}
            <View className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Text className="mb-6 text-xs font-bold uppercase tracking-wider text-slate-400">
                Productos del apartado
              </Text>

              {items.length === 0 ? (
                <View className="items-center py-20">
                  <Text className="text-lg font-semibold text-slate-500">
                    No hay productos registrados
                  </Text>
                </View>
              ) : (
                <View className="gap-4 pb-6">
                  {items.map((item) => (
                    <View
                      key={item.variant_id}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <Text className="text-xl font-black text-slate-900">{item.product_name}</Text>

                      <Text className="mt-1 text-slate-500">
                        {item.color} · Talla {item.size}
                      </Text>

                      <View className="mt-6 flex-row gap-4">
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
                            Precio
                          </Text>

                          <Text className="mt-2 text-2xl font-black text-slate-900">
                            ${item.unit_price.toFixed(2)}
                          </Text>
                        </View>

                        <View className="flex-1 rounded-2xl bg-white p-4">
                          <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Subtotal
                          </Text>

                          <Text className="mt-2 text-2xl font-black text-slate-900">
                            ${item.subtotal.toFixed(2)}
                          </Text>
                        </View>
                      </View>
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
