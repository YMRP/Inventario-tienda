import { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '@/types/types';
import { getVariantByBarcode } from '@/repositories/variantRepository';

type NavigationProps = NativeStackNavigationProp<
  RootStackParamList,
  'inventory'
>;

export default function BarcodeScannerScreen() {
  const navigation = useNavigation<NavigationProps>();

  const [scanned, setScanned] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    requestPermission();
  }, []);

  async function handleBarCodeScanned(result: BarcodeScanningResult) {
    if (scanned) {
      return;
    }

    setScanned(true);

    const { data } = result;

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
      Alert.alert('Error', 'Error al buscar producto');
    }
  }

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Solicitando permisos...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6">
        <Text className="mb-4 text-center">
          No hay acceso a la cámara.
        </Text>

        <Button
          title="Permitir cámara"
          onPress={requestPermission}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: [
            'code128',
            'ean13',
            'ean8',
            'upc_a',
            'upc_e',
            'qr',
          ],
        }}
        onBarcodeScanned={
          scanned ? undefined : handleBarCodeScanned
        }
      />

      {scanned && (
        <View className="absolute bottom-10 w-full px-6">
          <Button
            title="Escanear otra vez"
            onPress={() => setScanned(false)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}