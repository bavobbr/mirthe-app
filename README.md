<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Dressed by Mirthe

An AI-powered closet and outfit generator. Keep track of your wardrobe, get weather-aware outfit suggestions, and visualize them with AI-generated illustrations.

Designed by Mirthe Bruylandt. Developed by Bavo Bruylandt.

## Core Features

- **Smart Closet**: A curated collection of clothing with auto-calculated categories, colors, and descriptions.
- **AI-Powered Input**: Upload files or capture photos directly via your camera. Gemini auto-analyzes every new item.
- **Weather-Aware Stylist**: Choose from a variety of weather conditions (Sunny, Rainy, Snowy, etc.) or go for "Random" to let the AI be creative.
- **High-Quality Illustrations**: Generate a complete outfit visualization in three distinct styles:
  - 🎨 **Hand-Drawn**: Artistic, watercolor-style sketches.
  - 📸 **Realistic**: High-end editorial studio photography.
  - 👾 **Cartoon**: Cute 3D stylized character renders.
- **Modular Design**: A clean, refactored codebase built for performance and scalability.

## How It Is Built

- **Frontend**: React + TypeScript + Vite.
- **Styling**: Tailwind CSS (Clean utility-based design with custom girl/boy themes).
- **AI Engine**: 
  - **Gemini 2.0 Flash**: For rapid clothing analysis and outfit selection.
  - **Gemini 2.5 Flash Image**: For high-fidelity outfit illustration and "AI Surprise" item generation.
- **Resilience**: Adaptive loading UI with progress messages and robust image fallback systems.

## Architecture

The project follows a modular React component architecture:
- `App.tsx`: Central state orchestrator.
- `hooks/`: Custom hooks like `useTheme` for centralized styling logic.
- `components/layout/`: Global elements like `Header`.
- `components/settings/`: User preference controls (Gender, Weather).
- `components/closet/`: High-performance grid for managing clothing items.
- `components/outfit/`: AI styling output and illustration interface.
- `components/modals/`: Specialized overlays for Camera, Details, and full-screen previews.
- `services/geminiService.ts`: Specialized AI logic layer.

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   `npm install`
2. Create `.env` with your Gemini key:
   `VITE_GEMINI_API_KEY=YOUR_KEY`
3. Start the dev server:
   `npm run dev`

## Build and Preview

- `npm run build`
- `npm run preview`

## Deploy to Vercel

1. Import the GitHub repo into Vercel and select the Vite preset.
2. Set the build command to `npm run build` and output directory to `dist`.
3. Add `VITE_GEMINI_API_KEY` in Vercel Project Settings.
4. Push to main to trigger production deploys.
