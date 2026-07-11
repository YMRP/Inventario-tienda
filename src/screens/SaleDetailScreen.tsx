import { useCallback,  useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { getSaleDetail } from '@/repositories/SalesRepository';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SaleDetailScreen() {
  const route = useRoute<any>();
  const { saleId } = route.params;

  const [items, setItems] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    const data = await getSaleDetail(saleId);
    setItems(data);
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
                Historial de ventas
              </Text>
            </View>

            <Text className="text-3xl font-black text-slate-900">Detalle de venta #{saleId}</Text>

            <Text className="mt-2 text-base text-slate-500">
              Consulta los productos incluidos en esta venta.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.back()}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3">
            <Text className="font-bold text-slate-700">← Volver</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 flex-row gap-6">
          {/* PANEL IZQUIERDO */}
          <View className="w-[340px] gap-6">
            <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Venta
              </Text>

              <Text className="text-5xl font-black text-slate-900">#{saleId}</Text>

              <Text className="mt-3 text-slate-500">Productos registrados en la venta.</Text>
            </View>

            <View className="rounded-3xl bg-slate-900 p-6 shadow-sm">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resumen
              </Text>

              <View className="mt-5 gap-5">
                <View>
                  <Text className="text-sm text-slate-500">Productos distintos</Text>

                  <Text className="text-3xl font-black text-white">{items.length}</Text>
                </View>

                <View>
                  <Text className="text-sm text-slate-500">Piezas vendidas</Text>

                  <Text className="text-3xl font-black text-white">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </Text>
                </View>

                <View>
                  <Text className="text-sm text-slate-500">Total vendido</Text>

                  <Text className="text-3xl font-black text-white">
                    ${items.reduce((sum, item) => sum + Number(item.subtotal), 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* PANEL DERECHO */}
          <View className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Text className="mb-6 text-xs font-bold uppercase tracking-wider text-slate-400">
              Productos vendidos
            </Text>

            <FlatList
              data={items}
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={{ paddingBottom: 30 }}
              ItemSeparatorComponent={() => <View className="h-4" />}
              ListEmptyComponent={() => (
                <View className="items-center py-20">
                  <Text className="text-lg font-semibold text-slate-500">
                    No hay productos registrados
                  </Text>
                </View>
              )}
              renderItem={({ item }) => (
                <View className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-xl font-black text-slate-900">{item.product_name}</Text>

                      <Text className="mt-1 text-slate-500">
                        {item.color} · Talla {item.size}
                      </Text>
                    </View>

                    <View className="rounded-full bg-blue-50 px-3 py-1.5">
                      <Text className="text-xs font-bold uppercase tracking-wider text-blue-700">
                        Vendido
                      </Text>
                    </View>
                  </View>

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
                        Subtotal
                      </Text>

                      <Text className="mt-2 text-2xl font-black text-slate-900">
                        ${Number(item.subtotal).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
