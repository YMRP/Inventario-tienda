import { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';

import { BarCodeScanner } from 'expo-barcode-scanner';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '@/types/types';

import { getVariantByBarcode } from '@/repositories/variantRepository';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'inventory'>;

export default function BarcodeScannerScreen() {
  const navigation = useNavigation<NavigationProps>();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    requestPermission();
  }, []);

  async function requestPermission() {
    const { status } = await BarCodeScanner.requestPermissionsAsync();

    setHasPermission(status === 'granted');
  }

  async function handleBarCodeScanned({ data }: any) {
    setScanned(true);

    try {
      const variant = await getVariantByBarcode(data);

      if (!variant) {
        Alert.alert('No encontrado', 'No existe este producto');
        return;
      }

      navigation.navigate('ScanResult', {
        productId: variant.product_id,
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Error al buscar producto');
    }
  }

  if (hasPermission === null) {
    return (
      <View>
        <Text>Solicitando permisos...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View>
        <Text>No hay acceso a cámara</Text>
        <Button title="Permitir cámara" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
         className='flex-1'
      />

      {scanned && (
        <View className="absolute bottom-10 w-full">
          <Button title="Escanear otra vez" onPress={() => setScanned(false)} />
        </View>
      )}
    </SafeAreaView>
  );
}
