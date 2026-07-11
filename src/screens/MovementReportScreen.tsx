import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { getInventoryMovementsReport } from '@/repositories/reportRepository';
import { InventoryMovementReport } from '@/types/types';
import { getCurrentDate } from '@/utils/date';
export default function MovementReportScreen() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [movements, setMovements] = useState<InventoryMovementReport[]>([]);
  const [onlyToday, setOnlyToday] = useState(false);
  const [filter, setFilter] = useState<
    'ALL' | 'ENTRY' | 'SALE' | 'RESERVATION' | 'RESERVATION_CANCEL' | 'ADJUSTMENT'
  >('ALL');

  useEffect(() => {
    loadMovements();
  }, [onlyToday]);

  async function loadMovements() {
    try {
      setLoading(true);

      const result = await getInventoryMovementsReport(onlyToday ? getCurrentDate() : undefined);

      setMovements(result);
    } finally {
      setLoading(false);
    }
  }

  const filteredMovements = movements.filter((movement) => {
    const matchesFilter = filter === 'ALL' || movement.movement_type === filter;

    const matchesSearch = movement.product_name.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  function getMovementName(type: string) {
    switch (type) {
      case 'ENTRY':
        return 'Entrada';

      case 'SALE':
        return 'Venta';

      case 'RESERVATION':
        return 'Apartado';

      case 'RESERVATION_CANCEL':
        return 'Cancelación';

      case 'ADJUSTMENT':
        return 'Ajuste';

      default:
        return type;
    }
  }

  function getMovementColor(type: string) {
    switch (type) {
      case 'ENTRY':
        return '#16A34A';

      case 'SALE':
        return '#2563EB';

      case 'RESERVATION':
        return '#F59E0B';

      case 'RESERVATION_CANCEL':
        return '#DC2626';

      case 'ADJUSTMENT':
        return '#7C3AED';

      default:
        return '#6B7280';
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />

        <Text className="mt-4">Cargando movimientos...</Text>
      </SafeAreaView>
    );
  }

 return (
  <SafeAreaView className="flex-1 bg-slate-50">
    <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
      <View className="px-8 pb-8 pt-8">
        {/* HEADER */}
        <View className="mb-8 flex-row items-start justify-between">
          <View>
            <View className="mb-3 flex-row items-center gap-2">
              <View className="h-3 w-3 rounded-full bg-blue-600" />

              <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Reportes
              </Text>
            </View>

            <Text className="text-3xl font-black text-slate-900">
              Movimientos de inventario
            </Text>

            <Text className="mt-2 text-base text-slate-500">
              Consulta todas las entradas, ventas, apartados y ajustes realizados.
            </Text>
          </View>
        </View>

        <View className="flex-row gap-6">
          {/* PANEL IZQUIERDO */}
          <View className="w-[360px] gap-6">
            <View className="rounded-3xl bg-slate-900 p-6 shadow-sm">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resumen
              </Text>

              <View className="mt-5 gap-5">
                <View>
                  <Text className="text-sm text-slate-500">
                    Movimientos
                  </Text>

                  <Text className="text-4xl font-black text-white">
                    {filteredMovements.length}
                  </Text>
                </View>

                <View>
                  <Text className="text-sm text-slate-500">
                    Filtro
                  </Text>

                  <Text className="text-xl font-black text-white">
                    {filter === 'ALL'
                      ? 'Todos'
                      : getMovementName(filter)}
                  </Text>
                </View>

                <View>
                  <Text className="text-sm text-slate-500">
                    Periodo
                  </Text>

                  <Text className="text-xl font-black text-white">
                    {onlyToday ? 'Solo hoy' : 'Histórico'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setOnlyToday(!onlyToday)}
                className="mt-8 rounded-2xl bg-blue-600 p-5">
                <Text className="text-center text-lg font-black text-white">
                  {onlyToday ? 'Mostrando solo hoy' : 'Mostrar solo hoy'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Buscar producto
              </Text>

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Nombre del producto..."
                placeholderTextColor="#94a3b8"
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-lg font-bold text-slate-900"
              />
            </View>
          </View>

          {/* PANEL DERECHO */}
          <View className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Text className="mb-6 text-xs font-bold uppercase tracking-wider text-slate-400">
              Filtros
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingRight: 10 }}>
              {[
                ['ALL', 'Todos'],
                ['ENTRY', 'Entradas'],
                ['SALE', 'Ventas'],
                ['RESERVATION', 'Apartados'],
                ['RESERVATION_CANCEL', 'Cancelados'],
               
              ].map(([value, label]) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setFilter(value as any)}
                  className={`rounded-full border px-5 py-2.5 ${
                    filter === value
                      ? 'border-slate-900 bg-slate-900'
                      : 'border-slate-200 bg-white'
                  }`}>
                  <Text
                    className={`text-sm font-semibold ${
                      filter === value
                        ? 'text-white'
                        : 'text-slate-700'
                    }`}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="mt-8 gap-4">
              {filteredMovements.length === 0 && (
                <View className="items-center rounded-3xl border border-slate-200 bg-slate-50 py-16">
                  <Text className="text-lg font-semibold text-slate-500">
                    No existen movimientos registrados.
                  </Text>
                </View>
              )}

              {filteredMovements.map((movement) => (
                <View
                  key={movement.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <View className="flex-row items-start justify-between">
                    <View>
                      <Text className="text-2xl font-black text-slate-900">
                        {movement.product_name}
                      </Text>

                      <Text className="mt-1 text-slate-500">
                        {movement.color} · {movement.size}
                      </Text>
                    </View>

                    <View
                      className="rounded-full px-4 py-2"
                      style={{
                        backgroundColor: getMovementColor(
                          movement.movement_type
                        ),
                      }}>
                      <Text className="text-xs font-bold uppercase tracking-wider text-white">
                        {getMovementName(movement.movement_type)}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-6 flex-row flex-wrap gap-4">
                    <View className="min-w-[180px] flex-1 rounded-2xl bg-white p-4">
                      <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Cantidad
                      </Text>

                      <Text className="mt-2 text-2xl font-black text-slate-900">
                        {movement.quantity}
                      </Text>
                    </View>

                    <View className="min-w-[220px] flex-1 rounded-2xl bg-white p-4">
                      <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Usuario
                      </Text>

                      <Text className="mt-2 text-lg font-bold text-slate-900">
                        {movement.user_name ?? '-'}
                      </Text>
                    </View>

                    <View className="min-w-[240px] flex-1 rounded-2xl bg-white p-4">
                      <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Fecha
                      </Text>

                      <Text className="mt-2 text-lg font-bold text-slate-900">
                        {movement.created_at}
                      </Text>
                    </View>
                  </View>

                  {movement.notes && (
                    <View className="mt-4 rounded-2xl bg-white p-4">
                      <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Observaciones
                      </Text>

                      <Text className="mt-2 text-slate-700">
                        {movement.notes}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
);
}
