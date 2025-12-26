
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ClothingItem, Category, WeatherCondition, Gender, IllustrationStyle } from "../types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;

const getApiKey = () => {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY');
  }
  return GEMINI_API_KEY;
};

/**
 * Utility to fetch an image and convert it to base64
 */
const urlToBase64 = async (url: string): Promise<{ data: string, mimeType: string }> => {
  if (url.startsWith('data:')) {
    const [header, data] = url.split(',');
    const mimeType = header.split(':')[1].split(';')[0];
    return { data, mimeType };
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve({ data: base64String, mimeType: blob.type });
      };
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Failed to convert image to base64:", e);
    throw e;
  }
};

/**
 * Resizes and compresses an image to fit within localStorage limits (~50-100KB)
 */
export const downscaleBase64Image = async (
  base64DataUrl: string,
  maxDimension = 640,
  quality = 0.7
): Promise<string> => {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image for resize'));
    image.src = base64DataUrl;
  });

  const maxSide = Math.max(img.width, img.height);
  if (maxSide <= maxDimension) {
    return base64DataUrl;
  }

  const scale = maxDimension / maxSide;
  const targetWidth = Math.round(img.width * scale);
  const targetHeight = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) return base64DataUrl;

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  return canvas.toDataURL('image/jpeg', quality);
};

const prepareInlineImage = async (url: string): Promise<{ data: string, mimeType: string }> => {
  const { data, mimeType } = await urlToBase64(url);
  // For AI analysis, we still want the raw base64 part
  const downscaledUrl = await downscaleBase64Image(`data:${mimeType};base64,${data}`);
  const resultData = downscaledUrl.split(',')[1];
  return { data: resultData, mimeType: 'image/jpeg' };
};

/**
 * Utility to retry API calls that fail due to rate limiting (429)
 */
const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.message?.includes('429') || error?.status === 429 || error?.toString().includes('quota');
    if (retries > 0 && isRateLimit) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const analyzeClothing = async (
  base64Image: string,
  mimeType: string
): Promise<{ category: Category; description: string; color: string }> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          parts: [
            { inlineData: { mimeType, data: base64Image } },
            { text: "Analyze this clothing item. Identify its category (Bottom, Shoes, Accessory, Outerwear, Shirt, Sweater, Skirt, Dress, or Hat), provide a short specific description, and its primary color. Return in JSON format." }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ['Bottom', 'Shoes', 'Accessory', 'Outerwear', 'Shirt', 'Sweater', 'Skirt', 'Dress', 'Hat'] },
            description: { type: Type.STRING },
            color: { type: Type.STRING }
          },
          required: ['category', 'description', 'color']
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

/**
 * Generates a completely new random clothing item using AI
 */
export const generateNewClothingItem = async (gender: Gender, category: Category, weather: WeatherCondition, existingItems: ClothingItem[] = []): Promise<Omit<ClothingItem, 'id'>> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const weatherContext = weather.condition === 'Random'
      ? "a random seasonal context (pick one among: crisp autumn, hot summer, cold winter, or fresh spring)"
      : `${weather.condition} weather`;

    const existingContext = existingItems.length > 0
      ? `Existing items in this closet: ${existingItems.slice(-10).map(i => `${i.color} ${i.description}`).join(', ')}. Avoid creating anything too similar to these.`
      : '';

    // Step 1: Brainstorm the item details
    const ideaResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Dream up a unique, high-fashion ${category} specifically designed for a ${gender === 'girl' ? 'young woman' : 'young man'} in ${weatherContext}.
      Ensure the style, material, and type of the ${category} are traditionally representative and stylistically appropriate for a ${gender === 'girl' ? 'female' : 'male'} wardrobe.
      The item must be functional and fashionable for ${weatherContext}.
      ${existingContext}

      (e.g., if Shoes & Winter: suggest boots; if Shirt & Summer: suggest a breezy tee; if Bottom & Rainy: suggest durable trousers).

      Provide a very concise professional fashion description (maximum 15 words) and a specific color.
      Also provide a detailed visual prompt for an image generator to create this ${category} on a clean white background.
      The item should look realistic, sophisticated, and trendy.`,
      config: {
        temperature: 1.0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            color: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }
          },
          required: ['category', 'description', 'color', 'imagePrompt']
        }
      }
    });

    const idea = JSON.parse(ideaResponse.text || '{}');

    // Step 2: Generate the image for the idea
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: `A professional product photography of: ${idea.imagePrompt}. High resolution, studio lighting, isolated on a solid white background, centered.`,
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    let imageUrl = '';
    for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) throw new Error("Failed to generate item image");

    return {
      category: idea.category as Category,
      description: idea.description,
      color: idea.color,
      url: imageUrl
    };
  });
};

export const selectBestOutfit = async (
  closet: ClothingItem[],
  weather: WeatherCondition,
  gender: Gender,
  previousIds: string[] = []
): Promise<{ selectedIds: string[]; stylistNote: string }> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const shuffledCloset = [...closet].sort(() => Math.random() - 0.5);
    const closetPrompt = shuffledCloset.map(item => `ID: ${item.id}, Cat: ${item.category}, Desc: ${item.description}, Color: ${item.color}`).join('\n');

    const weatherInfo = weather.condition === 'Random'
      ? 'any weather/season (be creative!)'
      : weather.condition;

    const prompt = `
      You are a professional fashion stylist.
      User Info: Gender: ${gender}, Weather: ${weatherInfo}
      Closet:
      ${closetPrompt}
      
      Instructions:
      1. Assemble a complete outfit that is stylistically appropriate for a ${gender === 'girl' ? 'woman' : 'man'}.
      2. If 'Dress' is selected, no Upper Body (Shirt, Sweater) or Bottom (Skirt, Bottom). Otherwise, 1 Upper Body (Shirt or Sweater) and 1 Bottom (Skirt, or Bottom).
      3. Exactly 1 pair of Shoes.
      4. Avoid IDs: ${previousIds.join(', ')}
      
      Return IDs and a punchy note (max 10 words).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            selectedIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            stylistNote: { type: Type.STRING }
          },
          required: ['selectedIds', 'stylistNote']
        }
      }
    });

    return JSON.parse(response.text || '{}');
  });
};

export const generateAvatarIllustration = async (
  selectedItems: ClothingItem[],
  gender: Gender,
  weather: WeatherCondition,
  style: IllustrationStyle
): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const itemParts = await Promise.all(
      selectedItems.map(async (item) => {
        try {
          const { data, mimeType } = await prepareInlineImage(item.url);
          return { inlineData: { data, mimeType } };
        } catch (e) {
          return null;
        }
      })
    );

    const validItemParts = itemParts.filter(p => p !== null);

    let stylePrompt = '';
    if (style === 'hand-drawn') {
      stylePrompt = 'A charming, hand-drawn colored illustration, minimalist, clean, with soft watercolor-like colors and clean line art. artistic sketch.';
    } else if (style === 'realistic') {
      stylePrompt = 'A high-end editorial fashion studio photograph, professional studio lighting, editorial fashion aesthetic.';
    } else if (style === 'cartoon') {
      stylePrompt = 'A cute 3D stylized character render, Pixar/Disney animation style.';
    }

    const textPrompt = `
      Generate a professional fashion avatar illustration of a ${gender === 'girl' ? 'young adult woman' : 'young adult man'} in ${weather.condition} weather.
      Style: ${stylePrompt}
      Characters are focused on high-fashion editorial aesthetics.
      Wear these exact items:
      ${selectedItems.map(i => `- ${i.category}: ${i.color} ${i.description}`).join('\n')}
      Be faithful to the reference images provided.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          ...validItemParts as any[],
          { text: textPrompt }
        ]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) throw new Error("Failed to generate image");
    return imageUrl;
  });
};
