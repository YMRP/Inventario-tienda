import { View, Text, TouchableOpacity } from "react-native";
import { ProductVariantDetail } from "@/types/types";

type Props = {
  variant: ProductVariantDetail;
  onPress?: () => void;
};

export default function VariantCard({
  variant,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="mb-4 rounded-xl border border-gray-200 bg-white p-4"
    >
      <Text className="text-lg font-bold">
        {variant.color} | {variant.size}
      </Text>

      <View className="mt-3 flex-row justify-between">
        <View>
          <Text className="text-xs text-gray-500">
            Stock
          </Text>

          <Text className="font-bold text-green-700">
            {variant.available_stock}
          </Text>
        </View>

        <View>
          <Text className="text-xs text-gray-500">
            Stock mínimo
          </Text>

          <Text className="font-bold">
            {variant.minimum_stock}
          </Text>
        </View>
      </View>

      <Text className="mt-4 text-xs text-gray-500">
        Código de barras
      </Text>

      <Text className="font-bold">
        {variant.barcode}
      </Text>
    </TouchableOpacity>
  );
}