import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

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
  useEffect(() => {
    loadDetail();
  }, [handleCancel, handleConvert]);

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
    <SafeAreaView className="flex-1">
      <View className="flex-1 bg-gray-100 p-4">
        <Text className="mb-4 text-2xl font-bold">Detalle del Apartado #{reservationId}</Text>

        {reservation && (
          <View className="mb-4 rounded-xl bg-white p-4 shadow">
            <Text>Cliente: {reservation.customer_name}</Text>

            <Text>Teléfono: {reservation.customer_phone ?? 'Sin teléfono'}</Text>

            <Text>Estado: {reservation.status}</Text>

            <Text>Vence: {reservation.expires_at}</Text>
          </View>
        )}

        <FlatList
          data={items}
          keyExtractor={(item) => item.variant_id.toString()}
          renderItem={({ item }) => (
            <View className="mb-3 rounded-xl bg-white p-4 shadow">
              <Text className="font-bold">{item.product_name}</Text>

              <Text className="text-gray-600">Cantidad: {item.quantity}</Text>

              <Text className="text-gray-600">Precio: ${item.unit_price}</Text>

              <Text className="font-bold">Subtotal: ${item.subtotal}</Text>
            </View>
          )}
        />

        <View className="mt-4 rounded-xl bg-green-50 p-4">
          <Text className="text-lg font-bold">Total: ${total.toFixed(2)}</Text>
        </View>

        {reservation?.status === 'ACTIVE' && (
          <>
            <TouchableOpacity className="mt-4 rounded-xl bg-blue-600 p-4" onPress={handleConvert}>
              <Text className="text-center font-bold text-white">Convertir a Venta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mb-52 mt-3 rounded-xl bg-red-600 p-4"
              onPress={handleCancel}>
              <Text className="text-center font-bold text-white">Cancelar apartado</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className='className="mb-52 p-4" mt-3 rounded-xl bg-yellow-600'
              onPress={()=>{navigation.navigate('Dashboard')}}>
                <Text className='text-center font-bold text-white'>INICIO</Text>
              </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
