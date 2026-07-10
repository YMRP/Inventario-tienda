import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BarcodeLabel } from '@/types/types';
import BarcodeSvg from './BarcodeSvg';

interface Props {
  labels: BarcodeLabel[];
}

const BarcodeSheet = forwardRef<View, Props>(({ labels }, ref) => {
  return (
    <View ref={ref} style={styles.sheet}>
      {labels.map((label, index) => (
        <View key={index} style={styles.label}>
          <Text style={styles.productName}>{label.product_name}</Text>

          <Text style={styles.info}>
            {label.color} - {label.size}
          </Text>

          <BarcodeSvg value={label.barcode} />

          <Text style={styles.code}>{label.barcode}</Text>
        </View>
      ))}
    </View>
  );
});

export default BarcodeSheet;

const styles = StyleSheet.create({
  sheet: {
    width: 816,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
  },

  label: {
  width: 240,
  height: 140,
  borderWidth: 1,
  borderColor: '#000',
  margin: 8,
  paddingHorizontal: 10,
  paddingVertical: 8,
  justifyContent: 'space-between',
  alignItems: 'center',
},

  productName: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  info: {
    fontSize: 11,
    marginTop: 4,
  },

  code: {
    fontSize: 19,
  },
});
