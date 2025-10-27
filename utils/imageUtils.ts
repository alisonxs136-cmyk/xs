
/**
 * Fetches an image from a URL and converts it to a base64 encoded string.
 * Strips the "data:image/jpeg;base64," prefix.
 * @param imageUrl The URL of the image to convert.
 * @returns A promise that resolves to the base64 string of the image.
 */
export async function urlToBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // The API expects just the base64 data, not the full data URL
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      } else {
        reject(new Error('Failed to read blob as a base64 string.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
