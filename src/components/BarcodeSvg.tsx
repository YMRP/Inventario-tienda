import React from 'react';
import Barcode from 'react-native-barcode-svg';

interface Props {
  value: string;
}

export default function BarcodeSvg({ value }: Props) {
  return (
    <Barcode
      value={value}
      format="CODE128"
      singleBarWidth={1.3}
      height={32}
      lineColor="#000000"
      backgroundColor="#FFFFFF"
    />
  );
}