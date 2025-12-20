
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ClothingItem, Category, WeatherCondition, Gender } from "../types";

const API_KEY = process.env.API_KEY || '';

export const analyzeClothing = async (base64Image: string): Promise<{ category: Category; description: string; color: string }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Analyze this clothing item. Identify its category (Top, Bottom, Shoes, Accessory, or Outerwear), provide a short specific description, and its primary color. Return in JSON format." }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, enum: ['Top', 'Bottom', 'Shoes', 'Accessory', 'Outerwear'] },
          description: { type: Type.STRING },
          color: { type: Type.STRING }
        },
        required: ['category', 'description', 'color']
      }
    }
  });

  return JSON.parse(response.text);
};

export const selectBestOutfit = async (
  closet: ClothingItem[],
  weather: WeatherCondition,
  gender: Gender
): Promise<{ selectedIds: string[]; stylistNote: string }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const closetPrompt = closet.map(item => `ID: ${item.id}, Cat: ${item.category}, Desc: ${item.description}, Color: ${item.color}`).join('\n');
  
  const prompt = `
    You are a professional fashion stylist.
    User Info:
    - Gender: ${gender}
    - Weather: ${weather.temp}°C, ${weather.condition}
    
    My Closet Items:
    ${closetPrompt}
    
    Instructions:
    Select exactly one Top, one Bottom, and one pair of Shoes. Optionally add one Outerwear and one Accessory if it fits the weather.
    The outfit must be stylish, color-coordinated, and practical for the specified weather.
    Return the IDs of the selected items and a VERY CONCISE, punchy "stylist note" (maximum 10 words) explaining the vibe.
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

  return JSON.parse(response.text);
};

export const generateAvatarIllustration = async (
  selectedItems: ClothingItem[],
  gender: Gender,
  weather: WeatherCondition
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const outfitDesc = selectedItems.map(i => `${i.color} ${i.description}`).join(', ');
  
  // Prompt for a "drawn colored style"
  const prompt = `A charming, hand-drawn colored illustration of a cute ${gender} avatar wearing these specific clothes: ${outfitDesc}. 
  The style should be minimalist, clean, with soft watercolor-like colors and clean line art. 
  Background is simple and light. The weather is ${weather.condition}. 
  Full body portrait. High quality artistic sketch.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
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
};
