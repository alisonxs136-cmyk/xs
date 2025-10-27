
import { GoogleGenAI } from "@google/genai";

const POLLING_INTERVAL_MS = 10000; // 10 seconds

// A simplified type for the video generation operation
interface VideoOperation {
  name: string;
  done: boolean;
  response?: {
    generatedVideos?: Array<{
      video?: {
        uri: string;
      };
    }>;
  };
}

/**
 * Generates a video from a base64 image and a text prompt using the Gemini API.
 * @param imageBase64 The base64 encoded string of the source image.
 * @param prompt The text prompt to guide the video generation.
 * @returns A promise that resolves to a local blob URL for the generated video.
 */
export async function generateVideo(imageBase64: string, prompt: string): Promise<string> {
  // Create a new instance for each call to ensure the latest API key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let operation: VideoOperation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: imageBase64,
      mimeType: 'image/jpeg',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '9:16',
    },
  });

  // Poll for the result
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!downloadLink) {
    throw new Error('Video generation finished, but no download link was provided.');
  }

  // Fetch the video file using the download link and the API key
  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);

  if (!videoResponse.ok) {
    throw new Error(`Failed to download the generated video. Status: ${videoResponse.statusText}`);
  }

  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
}
