import fs from 'node:fs/promises';
import path from 'node:path';
import { GoogleGenAI, Type } from "@google/genai";

const ROOT = process.cwd();
const CLOTHES_DIR = path.join(ROOT, 'public', 'clothes');
const ENV_PATH = path.join(ROOT, '.env');
const OUTPUT_TS = path.join(ROOT, 'scripts', 'closet.generated.ts');
const OUTPUT_JSON = path.join(ROOT, 'scripts', 'closet.generated.json');

const loadEnvFile = async () => {
  try {
    const raw = await fs.readFile(ENV_PATH, 'utf8');
    const entries = raw.split(/\r?\n/);
    const env = {};
    for (const line of entries) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      env[key] = value;
    }
    return env;
  } catch {
    return {};
  }
};

const mimeFromFile = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.avif') return 'image/avif';
  return 'application/octet-stream';
};

const toId = (filename) => {
  const base = path.basename(filename, path.extname(filename));
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const sanitize = (value) => {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, ' ')
    .replace(/'/g, "\\'")
    .trim();
};

const withRetry = async (fn, retries = 3, delayMs = 2000) => {
  try {
    return await fn();
  } catch (error) {
    const message = error?.message || String(error);
    const isRateLimit = message.includes('429') || message.toLowerCase().includes('quota');
    if (retries > 0 && isRateLimit) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return withRetry(fn, retries - 1, delayMs * 2);
    }
    throw error;
  }
};

const analyzeImage = async (ai, base64Data, mimeType) => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            {
              text: 'Analyze this clothing item. Identify its category (Top, Bottom, Shoes, Accessory, Outerwear, Shirt, Sweater, Skirt, or Dress), provide a short specific description, and its primary color. Return JSON.'
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: ['Top', 'Bottom', 'Shoes', 'Accessory', 'Outerwear', 'Shirt', 'Sweater', 'Skirt', 'Dress']
            },
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

const main = async () => {
  const env = await loadEnvFile();
  const apiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY in .env');
  }

  const ai = new GoogleGenAI({ apiKey });
  const entries = await fs.readdir(CLOTHES_DIR);
  const files = entries.filter((file) => /\.(png|jpe?g|webp|avif)$/i.test(file)).sort();

  if (!files.length) {
    throw new Error('No images found in public/clothes');
  }

  const items = [];
  const skipped = [];

  for (const file of files) {
    const filePath = path.join(CLOTHES_DIR, file);
    const base64Data = await fs.readFile(filePath, { encoding: 'base64' });
    const mimeType = mimeFromFile(file);
    if (mimeType === 'image/avif') {
      skipped.push(file);
      console.log(`Skipping ${file}: Gemini does not support AVIF inlineData.`);
      continue;
    }

    process.stdout.write(`Analyzing ${file}... `);
    const metadata = await analyzeImage(ai, base64Data, mimeType);
    process.stdout.write('done\n');

    items.push({
      id: toId(file),
      file,
      category: metadata.category,
      description: metadata.description,
      color: metadata.color
    });
  }

  const tsLines = items.map((item) => {
    const category = sanitize(item.category);
    const description = sanitize(item.description);
    const color = sanitize(item.color);
    return `  { id: '${item.id}', url: \`\${CLOTHES_BASE_URL}${item.file}\`, category: '${category}', description: '${description}', color: '${color}' },`;
  });

  const tsOutput = `const DEFAULT_CLOSET: ClothingItem[] = [\n${tsLines.join('\n')}\n];\n`;

  await fs.writeFile(OUTPUT_TS, tsOutput, 'utf8');
  await fs.writeFile(OUTPUT_JSON, JSON.stringify(items, null, 2), 'utf8');

  console.log(`Wrote ${OUTPUT_TS}`);
  console.log(`Wrote ${OUTPUT_JSON}`);
  if (skipped.length) {
    console.log(`Skipped files: ${skipped.join(', ')}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
