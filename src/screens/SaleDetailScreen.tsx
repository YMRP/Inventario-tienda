import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getSaleDetail } from '@/repositories/SalesRepository';
import { useRoute } from '@react-navigation/native';

export default function SaleDetailScreen() {
  const route = useRoute<any>();
  const { saleId } = route.params;

  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getSaleDetail(saleId);
    setItems(data);
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="mb-4 text-2xl font-bold">
        Detalle de venta #{saleId}
      </Text>

      <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className="mb-3 rounded-xl border p-3">
            <Text className="font-bold">
              {item.product_name}
            </Text>

            <Text>
              {item.color} - {item.size}
            </Text>

            <Text>
              Cantidad: {item.quantity}
            </Text>

            <Text>
              Subtotal: ${item.subtotal}
            </Text>
          </View>
        )}
      />
    </View>
  );
}