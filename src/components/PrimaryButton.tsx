import { TouchableOpacity, Text } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  color?: string;
};

export default function PrimaryButton({
  title,
  onPress,
  color = "bg-blue-700",
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${color} rounded-xl p-4 mb-3`}
    >
      <Text className="text-center text-white font-bold">
        {title}
      </Text>
    </TouchableOpacity>
  );
}