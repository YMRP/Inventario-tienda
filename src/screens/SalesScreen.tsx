import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
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

  useEffect(() => {
    
  }, []);

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
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <Text className="mb-4 text-2xl font-bold">Historial de ventas</Text>

      {/* CALENDARIO */}
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

      {/* RESUMEN DEL DÍA */}
      <View className="mt-3 rounded-xl bg-green-50 p-4">
        <Text className="text-sm text-green-700">Total vendido en el dia</Text>

        <Text className="mt-1 text-lg font-bold text-green-800">${dayStats.total.toFixed(2)}</Text>

        <Text className="text-green-700">{dayStats.count} ventas</Text>
      </View>

      <View className="mt-4 rounded-xl bg-white p-4 shadow">
        <Text className="mb-2 font-bold">Productos más vendidos del día</Text>

        {topProducts.length === 0 ? (
          <Text className="text-gray-500">No hay ventas en este día</Text>
        ) : (
          topProducts.map((item) => (
            <View key={item.id} className="flex-row justify-between py-1">
              <Text>{item.name}</Text>

              <Text className="font-bold">{item.total_sold} unidades</Text>
            </View>
          ))
        )}
      </View>

      {/* BOTÓN VER TODAS */}
      <TouchableOpacity
        className="mt-3 rounded-lg bg-gray-300 p-3"
        onPress={() => {
          const today = getCurrentDate();
          setSelectedDate(today);
          loadSales(today);
        }}>
        <Text className="text-center font-bold">Ver ventas de hoy</Text>
      </TouchableOpacity>

      {/* LISTA DE VENTAS */}
      <FlatList
        className="mt-4"
        data={sales}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mb-3 rounded-xl bg-white p-4 shadow"
            onPress={() =>
              navigation.navigate('SaleDetail', {
                saleId: item.id,
              })
            }>
            <Text className="font-bold">Venta #{item.id}</Text>

            <Text className="text-gray-600">Usuario: {item.user_name ?? 'N/A'}</Text>

            <Text className="text-gray-600">Fecha: {item.created_at}</Text>

            <Text className="mt-2 text-lg font-bold">${Number(item.total).toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
