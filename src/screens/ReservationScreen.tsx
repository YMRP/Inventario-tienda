import { useCallback,  useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAllReservations } from '@/repositories/reservationRepository';
import { RootStackParamList, ReservationProps } from '@/types/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReservationsScreen() {
  const [active, setActive] = useState<ReservationProps[]>([]);
  const [expired, setExpired] = useState<ReservationProps[]>([]);
  const [totalReserved, setTotalReserved] = useState(0);
  type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Reservations'>;

  const navigation = useNavigation<NavigationProps>();
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

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
  <SafeAreaView className="flex-1 bg-slate-50">
    <View className="flex-1 px-8 pt-8">
      {/* HEADER */}
      <View className="mb-8 flex-row items-start justify-between">
        <View>
          <View className="mb-3 flex-row items-center gap-2">
            <View className="h-3 w-3 rounded-full bg-blue-600" />
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Clientes
            </Text>
          </View>

          <Text className="text-3xl font-black text-slate-900">
            Apartados
          </Text>

          <Text className="mt-2 text-base text-slate-500">
            Consulta y administra los apartados registrados.
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
        <View className="w-[340px] gap-6">
          <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Dinero retenido
            </Text>

            <Text className="text-4xl font-black text-slate-900">
              ${totalReserved.toFixed(2)}
            </Text>

            <Text className="mt-2 text-slate-500">
              Valor total de los apartados activos.
            </Text>
          </View>

          <View className="rounded-3xl bg-slate-900 p-6 shadow-sm">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Resumen
            </Text>

            <View className="mt-6 gap-5">
              <View>
                <Text className="text-sm text-slate-500">
                  Apartados activos
                </Text>

                <Text className="text-3xl font-black text-white">
                  {active.length}
                </Text>
              </View>

              <View>
                <Text className="text-sm text-slate-500">
                  Apartados vencidos
                </Text>

                <Text
                  className={`text-3xl font-black ${
                    expired.length > 0 ? 'text-red-400' : 'text-white'
                  }`}>
                  {expired.length}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* PANEL DERECHO */}
        <View className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Text className="mb-6 text-xs font-bold uppercase tracking-wider text-slate-400">
            Apartados activos
          </Text>

          <FlatList
            data={active}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={() => <View className="h-4" />}
            contentContainerStyle={{ paddingBottom: 25 }}
            ListEmptyComponent={() => (
              <View className="items-center py-20">
                <Text className="text-lg font-semibold text-slate-500">
                  No existen apartados activos
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
                onPress={() =>
                  navigation.navigate('ReservationDetail', {
                    reservationId: item.id,
                  })
                }>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-xl font-black text-slate-900">
                      Apartado #{item.id}
                    </Text>

                    <Text className="mt-1 text-slate-500">
                      {item.customer_name}
                    </Text>
                  </View>

                  <View className="rounded-full bg-blue-50 px-3 py-1.5">
                    <Text className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      Activo
                    </Text>
                  </View>
                </View>

                <View className="mt-6 flex-row gap-4">
                  <View className="flex-1 rounded-2xl bg-white p-4">
                    <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Total
                    </Text>

                    <Text className="mt-2 text-2xl font-black text-slate-900">
                      ${item.reservation_total.toFixed(2)}
                    </Text>
                  </View>

                  <View className="flex-1 rounded-2xl bg-white p-4">
                    <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Vence
                    </Text>

                    <Text className="mt-2 text-lg font-black text-slate-900">
                      {item.expires_at}
                    </Text>
                  </View>
                </View>

                <View className="mt-6 items-end">
                  <View className="rounded-2xl bg-blue-600 px-5 py-3">
                    <Text className="font-bold text-white">
                      Ver detalle
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </View>
  </SafeAreaView>
);
}
