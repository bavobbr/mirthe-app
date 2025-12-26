<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Mirthe's Closet App

An AI-powered closet and outfit generator. Upload items (or use the default closet), choose a weather condition and style, and generate a full outfit plus an AI illustration.

Designed by Mirthe Bruylandt. Developed by Bavo Bruylandt.

## What It Does

- Shows a curated closet of clothing items with categories, colors, and descriptions.
- Lets you upload new items (file upload or camera) and auto-analyzes them.
- Generates a styled outfit and a matching illustration from the closet.
- Supports hand-drawn, studio (realistic), and cartoon illustration styles.

## How It Is Built

- Frontend: React + TypeScript + Vite.
- AI: Google Gemini for clothing analysis, outfit selection, and illustration generation.
- Styling: Tailwind utility classes in JSX (loaded via CDN).
- Analytics: Vercel Analytics for usage insights.
- Hosting: Vercel (GitHub-connected deployments).

## Architecture

- `App.tsx`: UI, state management, and user flows (upload, camera, generate).
- `services/geminiService.ts`: AI calls for analysis, styling, and illustration generation.
- `components/ImageWithFallback.tsx`: resilient image rendering with fallback UI.
- `public/clothes/`: default closet images.
- `scripts/generate-closet.mjs`: optional script to regenerate closet metadata from images.

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
2. Set the build command to `npm run build` and the output directory to `dist`.
3. Add the environment variable `VITE_GEMINI_API_KEY` in Vercel Project Settings.
4. Push to the default branch to trigger production deploys; PRs create preview deployments.
