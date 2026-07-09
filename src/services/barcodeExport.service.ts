import { getBarcodeLabels } from '@/repositories/barcodeRepository';

export async function exportBarcodes() {
  const labels = await getBarcodeLabels();

  if (labels.length === 0) {
    throw new Error('No existen códigos para exportar.');
  }

  console.log('Cantidad de etiquetas:', labels.length);

  console.log('Primera etiqueta:', labels[0]);

  return labels;
}

