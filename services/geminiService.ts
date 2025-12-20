
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ClothingItem, Category, WeatherCondition, Gender, IllustrationStyle } from "../types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;

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

const downscaleBase64Image = async (
  base64Data: string,
  mimeType: string,
  maxDimension = 640,
  quality = 0.75
): Promise<{ data: string, mimeType: string }> => {
  const dataUrl = `data:${mimeType};base64,${base64Data}`;
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image for resize'));
    image.src = dataUrl;
  });

  const maxSide = Math.max(img.width, img.height);
  if (maxSide <= maxDimension) {
    return { data: base64Data, mimeType };
  }

  const scale = maxDimension / maxSide;
  const targetWidth = Math.round(img.width * scale);
  const targetHeight = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { data: base64Data, mimeType };
  }
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const outputMimeType = 'image/jpeg';
  const resizedDataUrl = canvas.toDataURL(outputMimeType, quality);
  const resizedData = resizedDataUrl.split(',')[1] || base64Data;
  return { data: resizedData, mimeType: outputMimeType };
};

const prepareInlineImage = async (url: string): Promise<{ data: string, mimeType: string }> => {
  const { data, mimeType } = await urlToBase64(url);
  return downscaleBase64Image(data, mimeType);
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

export const analyzeClothing = async (base64Image: string): Promise<{ category: Category; description: string; color: string }> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: "Analyze this clothing item. Identify its category (Top, Bottom, Shoes, Accessory, Outerwear, Shirt, Sweater, Skirt, or Dress), provide a short specific description, and its primary color. Return in JSON format." }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ['Top', 'Bottom', 'Shoes', 'Accessory', 'Outerwear', 'Shirt', 'Sweater', 'Skirt', 'Dress'] },
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
export const generateNewClothingItem = async (gender: Gender): Promise<Omit<ClothingItem, 'id'>> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    // Step 1: Brainstorm the item details
    const ideaResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Dream up a unique, high-fashion clothing item for a ${gender}. 
      Pick a random category from: Shirt, Sweater, Bottom, Skirt, Dress, Shoes, or Accessory.
      Provide a creative description and a specific color. 
      Also provide a detailed visual prompt for an image generator to create this item on a clean white background. 
      The item should look realistic and trendy.`,
      config: {
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
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const shuffledCloset = [...closet].sort(() => Math.random() - 0.5);
    const closetPrompt = shuffledCloset.map(item => `ID: ${item.id}, Cat: ${item.category}, Desc: ${item.description}, Color: ${item.color}`).join('\n');
    
    const prompt = `
      You are a professional fashion stylist.
      User Info: Gender: ${gender}, Weather: ${weather.condition}
      Closet:
      ${closetPrompt}
      
      Instructions:
      1. Assemble a complete outfit.
      2. If 'Dress' is selected, no Top/Bottom/Skirt. Otherwise, 1 Top (Top, Shirt, Sweater) and 1 Bottom (Bottom, Skirt).
      3. Exactly 1 pair of Shoes.
      4. Avoid IDs: ${previousIds.join(', ')}
      
      Return IDs and a punchy note (max 10 words).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
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
      Generate a cute ${gender} avatar in ${weather.condition} weather.
      Style: ${stylePrompt}
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
      config: { imageConfig: { aspectRatio: "1:1" } }
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
