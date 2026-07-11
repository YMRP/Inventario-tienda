import { View, Text, TouchableOpacity } from 'react-native';
import { ProductVariantDetail } from '@/types/types';

type Props = {
  variant: ProductVariantDetail;
  onPress?: () => void;
};

export default function VariantCard({ variant, onPress }: Props) {

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="flex-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-900">
          {variant.color} · {variant.size}
        </Text>
        
      </View>

      <View className="mt-4 flex-row gap-3">
        <View className="flex-1 rounded-xl bg-green-50 p-3">
          <Text className="text-xs text-green-700">Disponible</Text>
          <Text className="text-2xl font-extrabold text-green-700">
            {variant.available_stock}
          </Text>
        </View>
        <View className="flex-1 rounded-xl bg-gray-50 p-3">
          <Text className="text-xs text-gray-500">Mínimo</Text>
          <Text className="text-2xl font-extrabold text-gray-800">
            {variant.minimum_stock}
          </Text>
        </View>
      </View>

      <View className="mt-4 border-t border-gray-100 pt-3">
        <Text className="text-xs text-gray-500">Código de barras</Text>
        <Text className="font-mono text-sm font-semibold text-gray-800">
          {variant.barcode}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
