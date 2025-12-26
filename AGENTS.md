# AGENTS.md - Mirthe's Closet App

## Overview
Mirthe's Closet App is a React + TypeScript single-page app built with Vite. It lets users browse a default closet of items, upload or capture new items, and use Gemini AI to analyze items, select an outfit based on weather and gender, and generate a matching illustration in multiple styles.

Core flows:
- Closet browsing: shows a curated set of items stored in `public/clothes/` and defined in `App.tsx`.
- Upload or camera capture: users add new items via file input or live camera capture, which are analyzed by Gemini and appended to the closet.
- Outfit generation: Gemini selects a coherent outfit from the closet and writes a stylist note, then another Gemini model generates a full avatar illustration.
- AI surprise item: Gemini creates a brand-new clothing item and its product image.

## Structure
- `App.tsx`: Main UI, state management, and user flows (gender, weather, closet, uploads, camera, outfit generation, illustration style selection).
- `index.tsx`: React bootstrap and Vercel Analytics mount point.
- `index.html`: Tailwind CDN load, font setup (Inter + Handlee), and base document layout.
- `components/Button.tsx`: Themed button variants for girl/boy themes and loading UI.
- `components/ImageWithFallback.tsx`: Resilient image component with loading and missing-asset fallback.
- `services/geminiService.ts`: Gemini API calls for item analysis, outfit selection, AI item creation, and illustration generation.
- `types.ts`: Shared TypeScript types for clothing items and app state.
- `public/clothes/`: Default closet images referenced by `DEFAULT_CLOSET` in `App.tsx`.
- `scripts/generate-closet.mjs`: Optional Node script to analyze closet images with Gemini and generate metadata files.
- `scripts/closet.generated.ts` and `scripts/closet.generated.json`: Optional outputs from the generator script.

## Google services and usage
This app uses Google services in two distinct ways:

1) Google Gemini API (AI generation)
- Library: `@google/genai` (client SDK).
- Where: `services/geminiService.ts` and `scripts/generate-closet.mjs`.
- When it is used:
  - Item analysis on upload/camera capture (`analyzeClothing`): sends the item image and returns category, description, and color as JSON.
  - Outfit selection (`selectBestOutfit`): sends a text prompt describing the closet and constraints; returns selected item IDs and a short stylist note.
  - Avatar illustration (`generateAvatarIllustration`): sends selected item images plus a text prompt; returns a generated image.
  - AI surprise item (`generateNewClothingItem`): generates a new item description and image prompt, then generates a product-style image.
  - Closet metadata generation script (`scripts/generate-closet.mjs`): analyzes all images under `public/clothes/` and emits metadata.
- API key usage: read from `VITE_GEMINI_API_KEY` (front-end) or from `.env` for the script.
- Models: `gemini-3-flash-preview` for text/JSON tasks, `gemini-2.5-flash-image` for image generation.

2) Google Fonts (typography)
- Where: `index.html` includes a Google Fonts stylesheet.
- When it is used: on every app load, the fonts (Inter and Handlee) are loaded from Google Fonts CDN.

## Vercel + GitHub deployment
- The app is synced to Vercel via GitHub. Vercel pulls from the GitHub repo and deploys on push.
- Runtime analytics are provided via `@vercel/analytics` and rendered in `index.tsx`.

## Deploying on Vercel
Recommended setup for a GitHub-connected Vercel project:
- Import the GitHub repo into Vercel and select the Vite framework preset.
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables (Project Settings -> Environment Variables):
  - `VITE_GEMINI_API_KEY` for Gemini API access in the browser.
- Push to the default branch to trigger a production deployment; pull requests create preview deployments by default.

## Styling approach
- Tailwind CSS is loaded via CDN in `index.html` (no local Tailwind config file).
- Styling is done with Tailwind utility classes directly in JSX.
- Two theme palettes (girl/boy) are switched in `App.tsx` and `components/Button.tsx` via conditional class names.
- Fonts: Inter for body text, Handlee for hand-drawn accents (see `.hand-drawn` class in `index.html`).
- UI patterns: large rounded cards, soft pastel backgrounds, and lightweight hover/active states.

## Styleguide
When adding or modifying UI, follow these conventions:

Typography
- Use Inter for default text (`body` in `index.html`).
- Use the `.hand-drawn` class for playful headings or stylist notes.
- Prefer `text-sm` or `text-xs` for secondary labels and UI chrome.

Color and themes
- Follow the existing two-theme system: girl (rose/pink) and boy (blue/sky).
- Centralize theme classes in the `t` object in `App.tsx` when adding new theme-aware styles.
- Use gentle pastel backgrounds and maintain high contrast for primary actions.

Layout and spacing
- Main container uses `max-w-6xl` and `mx-auto` with `px-4 sm:px-6`.
- Use rounded corners (`rounded-2xl` to `rounded-[40px]`) and subtle shadows (`shadow-sm`, `shadow-2xl`).
- Grids are responsive: 2 columns on small screens, 4-5 columns on larger screens.

Components
- Buttons: use `components/Button.tsx` instead of raw `<button>` unless a custom shape is required.
- Images: use `components/ImageWithFallback.tsx` to preserve the missing-asset UX.
- Icons are often emoji-based for a lightweight, playful feel.

State and UX
- Use loading flags (`isGenerating`, `isAnalyzing`, etc.) to show animated placeholders.
- Keep error messages short and friendly (see `App.tsx` error banner styles).
- Use `useMemo` for theme tokens and `useEffect` for UI sync (e.g., camera, background color).

## Environment variables
- `VITE_GEMINI_API_KEY`: required for Gemini calls in the browser.
- `GEMINI_API_KEY`: accepted by `scripts/generate-closet.mjs` when running locally.

## Development scripts
- `npm run dev`: start Vite dev server.
- `npm run build`: build for production.
- `npm run preview`: preview the production build locally.

## Known limitations
- Client-side Gemini calls require the API key to be exposed to the browser (`VITE_GEMINI_API_KEY`), so treat it as a public key with appropriate usage limits.
- The camera capture flow depends on browser permissions and HTTPS; it may fail on unsupported devices or insecure contexts.
- `metadata.json` requests geolocation permission, but the current UI does not use geolocation data.
