import { View, Text } from 'react-native';

type Props = {
  icon: string;
  title: string;
  value: string | number;
  description: string;
  color: string;
};

export default function DashboardCard({
  icon,
  title,
  value,
  description,
  color,
}: Props) {
  return (
    <View
      className="rounded-2xl bg-white p-5"
      style={{
        width: '48%',
        minHeight: 170,
        borderLeftWidth: 6,
        borderLeftColor: color,
        elevation: 4,
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
        className="mt-3 font-bold text-gray-800"
        style={{
          fontSize: 18,
        }}
      >
        {title}
      </Text>

      <Text
        className="mt-3 font-bold"
        style={{
          fontSize: 34,
          color,
        }}
      >
        {value}
      </Text>

      <Text
        className="mt-2 text-gray-500"
        style={{
          fontSize: 14,
          lineHeight: 20,
        }}
      >
        {description}
      </Text>
    </View>
  );
}