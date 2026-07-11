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

export default function MovementReportScreen() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [movements, setMovements] = useState<InventoryMovementReport[]>([]);

  const [filter, setFilter] = useState<
    'ALL' | 'ENTRY' | 'SALE' | 'RESERVATION' | 'RESERVATION_CANCEL' | 'ADJUSTMENT'
  >('ALL');

  useEffect(() => {
    loadMovements();
  }, []);

  async function loadMovements() {
    try {
      const result = await getInventoryMovementsReport();

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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}>
        <Text className="text-3xl font-bold">Movimientos de Inventario</Text>

        <Text className="mb-4 mt-2 text-gray-500">
          Total de movimientos: {filteredMovements.length}
        </Text>

        {/* FILTROS */}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {[
            ['ALL', 'Todos'],
            ['ENTRY', 'Entradas'],
            ['SALE', 'Ventas'],
            ['RESERVATION', 'Apartados'],
            ['RESERVATION_CANCEL', 'Cancelados'],
            ['ADJUSTMENT', 'Ajustes'],
          ].map(([value, label]) => (
            <TouchableOpacity
              key={value}
              onPress={() => setFilter(value as any)}
              style={{
                backgroundColor: filter === value ? '#2563EB' : '#E5E7EB',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                marginRight: 10,
              }}>
              <Text
                style={{
                  color: filter === value ? '#FFFFFF' : '#111827',
                  fontWeight: 'bold',
                }}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar producto..."
          style={{
            borderWidth: 1,
            borderColor: '#D1D5DB',
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginBottom: 20,
            backgroundColor: '#FFFFFF',
          }}
        />
        {filteredMovements.length === 0 && <Text>No existen movimientos registrados.</Text>}

        {filteredMovements.map((movement) => (
          <View key={movement.id} className="mb-4 rounded-xl border border-gray-300 bg-white p-4">
            {/* Producto */}

            <Text className="text-lg font-bold">{movement.product_name}</Text>

            <Text className="text-gray-600">
              {movement.color} - {movement.size}
            </Text>

            {/* Movimiento */}

            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: getMovementColor(movement.movement_type),
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 5,
                marginTop: 10,
              }}>
              <Text
                style={{
                  color: '#FFF',
                  fontWeight: 'bold',
                }}>
                {getMovementName(movement.movement_type)}
              </Text>
            </View>

            {/* Datos */}

            <View className="mt-3">
              <Text>
                <Text className="font-bold">Cantidad: </Text>

                {movement.quantity}
              </Text>

              <Text>
                <Text className="font-bold">Usuario: </Text>

                {movement.user_name ?? '-'}
              </Text>

              <Text>
                <Text className="font-bold">Fecha: </Text>

                {movement.created_at}
              </Text>

              {movement.notes && (
                <Text className="mt-2">
                  <Text className="font-bold">Nota: </Text>

                  {movement.notes}
                </Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
