import { TouchableOpacity, Text, View } from 'react-native';

type Props = {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
};

export default function QuickActionCard({
  icon,
  title,
  subtitle,
  color,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: '48%',
      }}
    >
      <View
        className="rounded-2xl p-5"
        style={{
          backgroundColor: color,
          minHeight: 140,
          elevation: 3,
        }}
      >
        <Text
          style={{
            fontSize: 30,
          }}
        >
          {icon}
        </Text>

        <Text
          className="mt-3 font-bold text-white"
          style={{
            fontSize: 20,
          }}
        >
          {title}
        </Text>

        <Text
          className="mt-2 text-white"
          style={{
            opacity: 0.9,
            fontSize: 15,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}