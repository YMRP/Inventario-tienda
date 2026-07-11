import { useCallback,  useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '@/types/types';
import {
  getSalesHistory,
  getSalesTotalByDate,
  getTopProductsByDate,
} from '@/repositories/SalesRepository';
import { getCurrentDate } from '@/utils/date';
import { SafeAreaView } from 'react-native-safe-area-context';

type SalesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Sales'>;

export default function SalesScreen() {
  const navigation = useNavigation<SalesNavigationProp>();
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dayStats, setDayStats] = useState({
    total: 0,
    count: 0,
  });



  useFocusEffect(
    useCallback(() => {
      const today = getCurrentDate();
      setSelectedDate(today);
      loadSales(today);
    }, [])
  );

  async function loadSales(date?: string) {
    const [salesData, totalData, topData] = await Promise.all([
      getSalesHistory(date),
      getSalesTotalByDate(date),
      getTopProductsByDate(date),
    ]);

    setSales(salesData);

    setDayStats({
      total: totalData?.total ?? 0,
      count: totalData?.count ?? 0,
    });

    setTopProducts(topData);
  }

return (
  <SafeAreaView className="flex-1 bg-slate-50">
    <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
      {/* HEADER */}
      <View className="flex-row items-start justify-between px-8 pb-6 pt-8">
        <View>
          <View className="mb-3 flex-row items-center gap-2">
            <View className="h-3 w-3 rounded-full bg-blue-600" />
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ventas
            </Text>
          </View>

          <Text className="text-3xl font-black text-slate-900">
            Historial de ventas
          </Text>

          <Text className="mt-2 text-base text-slate-500">
            Consulta las ventas realizadas por fecha.
          </Text>
        </View>

        <TouchableOpacity
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3"
          onPress={() => navigation.goBack()}>
          <Text className="font-bold text-slate-700">← Volver</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO */}
      <View className="flex-row gap-6 px-8">
        {/* PANEL IZQUIERDO */}
        <View className="w-[380px] gap-6">

          {/* CALENDARIO */}
          <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Fecha
            </Text>

            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                loadSales(day.dateString);
              }}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: '#2563eb',
                },
              }}
              theme={{
                selectedDayBackgroundColor: '#2563eb',
                todayTextColor: '#ef4444',
                arrowColor: '#2563eb',
              }}
            />
          </View>

          {/* PRODUCTOS TOP */}
          <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Productos más vendidos
            </Text>

            {topProducts.length === 0 ? (
              <Text className="text-slate-500">
                No hubo ventas este día.
              </Text>
            ) : (
              topProducts.map((item) => (
                <View
                  key={item.id}
                  className="mb-3 flex-row items-center justify-between rounded-2xl bg-slate-50 p-4">

                  <Text className="font-semibold text-slate-900">
                    {item.name}
                  </Text>

                  <View className="rounded-full bg-blue-50 px-3 py-1">
                    <Text className="font-bold text-blue-700">
                      {item.total_sold}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* PANEL DERECHO */}
        <View className="flex-1 gap-6">

          {/* RESUMEN */}
          <View className="rounded-3xl bg-slate-900 p-6 shadow-sm">

            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Resumen
            </Text>

            <View className="mt-6 flex-row gap-10">

              <View>
                <Text className="text-sm text-slate-500">
                  Total vendido
                </Text>

                <Text className="text-4xl font-black text-white">
                  ${dayStats.total.toFixed(2)}
                </Text>
              </View>

              <View>
                <Text className="text-sm text-slate-500">
                  Ventas realizadas
                </Text>

                <Text className="text-4xl font-black text-white">
                  {dayStats.count}
                </Text>
              </View>

            </View>

            <TouchableOpacity
              className="mt-8 rounded-2xl bg-blue-600 p-5"
              onPress={() => {
                const today = getCurrentDate();
                setSelectedDate(today);
                loadSales(today);
              }}>

              <Text className="text-center text-lg font-black text-white">
                Ver ventas de hoy
              </Text>

            </TouchableOpacity>

          </View>

          {/* LISTA */}
          <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <Text className="mb-5 text-xs font-bold uppercase tracking-wider text-slate-400">
              Ventas registradas
            </Text>

            <FlatList
              data={sales}
              scrollEnabled={false}
              keyExtractor={(item) => item.id.toString()}
              ItemSeparatorComponent={() => (
                <View className="h-4" />
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  onPress={() =>
                    navigation.navigate('SaleDetail', {
                      saleId: item.id,
                    })
                  }>

                  <View className="flex-row items-center justify-between">

                    <View>

                      <Text className="text-lg font-bold text-slate-900">
                        Venta #{item.id}
                      </Text>

                      <Text className="mt-1 text-slate-500">
                        {item.user_name ?? 'Sin usuario'}
                      </Text>

                      <Text className="text-slate-500">
                        {item.created_at}
                      </Text>

                    </View>

                    <Text className="text-2xl font-black text-slate-900">
                      ${Number(item.total).toFixed(2)}
                    </Text>

                  </View>

                </TouchableOpacity>
              )}
            />

          </View>

        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
);
}
