import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAllReservations } from '@/repositories/reservationRepository';
import { ReservationDetailItem, RootStackParamList, ReservationProps } from '@/types/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReservationsScreen() {
  const [active, setActive] = useState<ReservationProps[]>([]);
  const [expired, setExpired] = useState<ReservationProps[]>([]);
  const [totalReserved, setTotalReserved] = useState(0);
  type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Reservations'>;

  const navigation = useNavigation<NavigationProps>();
  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getAllReservations();

    const activeData = data.filter((r) => r.status === 'ACTIVE');
    const expiredData = data.filter((r) => r.status === 'EXPIRED');

    const total = activeData.reduce((sum, r) => sum + r.reservation_total, 0);

    setActive(activeData);
    setExpired(expiredData);
    setTotalReserved(total);
  }

  return (
    <SafeAreaView className='flex-1'>
      <View className="flex-1 bg-gray-100 p-4">
        <Text className="mb-4 text-2xl font-bold">Apartados</Text>

        {/* RESUMEN */}
        <View className="mb-4 rounded-xl bg-white p-4 shadow">
          <Text className="text-gray-500">Dinero en apartados activos</Text>

          <Text className="text-3xl font-bold text-green-600">${totalReserved.toFixed(2)}</Text>
        </View>

        <View className="mb-4 flex-row justify-between">
          <View className="w-[48%] rounded-xl bg-blue-50 p-4">
            <Text className="text-blue-700">Activos</Text>

            <Text className="text-2xl font-bold text-blue-700">{active.length}</Text>
          </View>

          <View className="w-[48%] rounded-xl bg-red-50 p-4">
            <Text className="text-red-700">Vencidos</Text>

            <Text className="text-2xl font-bold text-red-700">{expired.length}</Text>
          </View>
        </View>

        {/* LISTA ACTIVOS */}
        <Text className="mb-2 font-bold">Activos</Text>

        <FlatList
          data={active}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="mb-3 rounded-xl bg-white p-4 shadow"
              onPress={() =>
                navigation.navigate('ReservationDetail', {
                  reservationId: item.id,
                })
              }>
              <Text className="text-lg font-bold">Apartado #{item.id}</Text>

              <Text>Cliente: {item.customer_name}</Text>

              <Text>Total: ${item.reservation_total.toFixed(2)}</Text>

              <Text className="text-blue-600">Vence: {item.expires_at}</Text>

              <Text className="mt-2 text-right text-sm text-blue-600">Ver detalle →</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
