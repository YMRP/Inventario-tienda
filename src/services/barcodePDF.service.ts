import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function generateBarcodePdf(imageBase64: string) {
  console.log('Base64 recibido:', imageBase64.substring(0, 100));
  try {
    const imageSource = imageBase64.startsWith('data:image')
      ? imageBase64
      : `data:image/png;base64,${imageBase64}`;

    const html = `
<html>
  <body
    style="
      margin:0;
      padding:0;
    "
  >
    <img
      src="${imageSource}"
      style="
        width:100%;
        height:auto;
      "
    />
  </body>
</html>
`;

    const { uri } = await Print.printToFileAsync({
      html,
    });

    console.log('PDF generado:', uri);

    const canShare = await Sharing.isAvailableAsync();

    if (canShare) {
      await Sharing.shareAsync(uri);
    }

    return uri;
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
}
