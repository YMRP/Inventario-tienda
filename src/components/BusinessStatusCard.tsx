import { View, Text } from 'react-native';

type Props = {
  icon: string;
  title: string;
  message: string;
  color: string;
};

export default function BusinessStatusCard({
  icon,
  title,
  message,
  color,
}: Props) {
  return (
    <View
      className="rounded-2xl p-5"
      style={{
        backgroundColor: color,
      }}
    >
      <Text
        style={{
          fontSize: 32,
        }}
      >
        {icon}
      </Text>

      <Text
        className="mt-2 font-bold text-white"
        style={{
          fontSize: 22,
        }}
      >
        {title}
      </Text>

      <Text
        className="mt-2 text-white"
        style={{
          fontSize: 16,
          lineHeight: 24,
        }}
      >
        {message}
      </Text>
    </View>
  );
}