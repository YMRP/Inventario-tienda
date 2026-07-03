import { Text } from 'react-native';

type Props = {
  title: string;
};

export default function SectionTitle({ title }: Props) {
  return (
    <Text
      className="mt-6 mb-4 font-bold text-gray-800"
      style={{
        fontSize: 24,
      }}
    >
      {title}
    </Text>
  );
}