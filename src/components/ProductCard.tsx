// components/ProductCard.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { Props } from '@/types/types';

export default function ProductCard({ product, onPress }: Props) {
  const stock = product.total_stock ?? 0;
  

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="mb-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header: categoría + badge stock */}
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {product.category}
        </Text>
        
      </View>

      {/* Nombre */}
      <Text className="text-lg font-black text-slate-900" numberOfLines={2}>
        {product.name}
      </Text>
      <Text className="mt-0.5 text-sm text-slate-500">{product.brand}</Text>

      {/* Precio destacado */}
      <Text className="mt-4 text-2xl font-black text-blue-700">
        ${product.sale_price.toFixed(2)}
      </Text>

      {/* Footer stats en grid */}
      <View className="mt-4 flex-row rounded-2xl bg-slate-50 p-3">
        <View className="flex-1 border-r border-slate-200">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Stock
          </Text>
          <Text className="text-lg font-black text-slate-900">{stock}</Text>
        </View>
        <View className="flex-1 pl-3">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Variantes
          </Text>
          <Text className="text-lg font-black text-slate-900">{product.variants}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
