import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import {
  getReservationDetail,
  convertReservationToSale,
} from '@/repositories/reservationRepository';
import { ReservationDetailItem } from '@/types/types';

export default function ReservationDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { reservationId } = route.params;

  const [items, setItems] = useState<ReservationDetailItem[]>([]);

  useEffect(() => {
    loadDetail();
  }, []);

  async function loadDetail() {
    const data = await getReservationDetail(reservationId);
    setItems(data);
  }

  async function handleConvert() {
    await convertReservationToSale(reservationId, 1);

    navigation.goBack();
  }

  const total = items.reduce(
    (sum, i) => sum + i.subtotal,
    0
  );

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="mb-4 text-2xl font-bold">
        Detalle del Apartado #{reservationId}
      </Text>

      <FlatList
        data={items}
        keyExtractor={(item) =>
          item.variant_id.toString()
        }
        renderItem={({ item }) => (
          <View className="mb-3 rounded-xl bg-white p-4 shadow">
            <Text className="font-bold">
              {item.product_name}
            </Text>

            <Text className="text-gray-600">
              Cantidad: {item.quantity}
            </Text>

            <Text className="text-gray-600">
              Precio: ${item.unit_price}
            </Text>

            <Text className="font-bold">
              Subtotal: ${item.subtotal}
            </Text>
          </View>
        )}
      />

      <View className="mt-4 rounded-xl bg-green-50 p-4">
        <Text className="text-lg font-bold">
          Total: ${total.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        className="mt-4 rounded-xl bg-blue-600 p-4"
        onPress={handleConvert}
      >
        <Text className="text-center font-bold text-white">
          Convertir a Venta
        </Text>
      </TouchableOpacity>
    </View>
  );
}