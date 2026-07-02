import { View, Text, TouchableOpacity } from "react-native";
import { InventoryProduct, Props } from "@/types/types";


export default function ProductCard({
  product,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm"
    >
      <Text className="text-lg font-bold">
        {product.name}
      </Text>

      <Text className="text-gray-600 mt-1">
        Marca: {product.brand}
      </Text>

      <Text className="text-gray-600">
        Categoría: {product.category}
      </Text>

      <Text className="text-blue-700 font-semibold mt-2">
        ${product.sale_price.toFixed(2)}
      </Text>

      <View className="flex-row justify-between mt-4">
        <View>
          <Text className="text-xs text-gray-500">
            Stock
          </Text>

          <Text className="font-bold text-green-700">
            {product.total_stock}
          </Text>
        </View>

        <View>
          <Text className="text-xs text-gray-500">
            Variantes
          </Text>

          <Text className="font-bold">
            {product.variants}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}