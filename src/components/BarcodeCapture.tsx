import React, { forwardRef, useEffect } from 'react';
import ViewShot from 'react-native-view-shot';

import BarcodeSheet from './BarcodeSheet';
import { BarcodeLabel } from '@/types/types';

interface Props {
  labels: BarcodeLabel[];
  onReady?: () => void;
}

type ViewShotRef = React.ElementRef<typeof ViewShot>;

const BarcodeCapture = forwardRef<ViewShotRef, Props>(
  ({ labels, onReady }, ref) => {

    useEffect(() => {
      const timer = setTimeout(() => {
        onReady?.();
      }, 300);

      return () => clearTimeout(timer);
    }, []);

    return (
      <ViewShot
        ref={ref}
        options={{
          format: 'png',
          quality: 1,
          result: 'base64'
        }}
      >
        <BarcodeSheet labels={labels} />
      </ViewShot>
    );
  }
);

export default BarcodeCapture;