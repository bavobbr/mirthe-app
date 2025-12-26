# AGENTS.md - Dressed by Mirthe

## Overview
Dressed by Mirthe is a modular React + TypeScript application. It uses Google Gemini AI to transform personal wardrobes into a creative, weather-aware styling experience. Users can manage their closet, capture new items via camera, and generate full outfit illustrations in multiple artistic styles.

Core flows:
- **Closet Management**: Users interact with a grid of items, view details, and remove garments.
- **AI Analysis**: Gemini 2.0 Flash analyzes uploaded/captured images to extract category, color, and descriptions.
- **Weather-Aware Styling**: The stylist selects outfits based on precise weather conditions (Sunny, Rainy, Cold, etc.) or a flexible "Random" context.
- **Multi-Style Illustration**: Gemini 2.5 Flash Image generates high-fidelity avatars wearing the selected items in Hand-Drawn, Realistic, or Cartoon styles.
- **AI Dreams**: "Generate" feature creates brand-new trendy items and their product photography.

## Project Structure
The app has been refactored for modularity and high performance:

- `App.tsx`: Central state orchestrator and event hub.
- `hooks/useTheme.ts`: Centralized theme engine for gender-based styling.
- `components/layout/`: Global UI components (e.g., `Header`).
- `components/settings/`: Control center for user preferences (Gender, Weather).
- `components/closet/`: 
  - `ClosetSection.tsx`: Orchestrates the item grid and action buttons.
  - `ClosetItem.tsx`: Individual item card with hover states and removal logic.
- `components/outfit/`: 
  - `OutfitSection.tsx`: Displays stylist notes and manages the illustration generation lifecycle.
- `components/modals/`:
  - `CameraModal.tsx`: Direct camera integration.
  - `CategoryPickerModal.tsx`: Interactive menu for AI item generation.
  - `ItemDetailModal.tsx`: Visual inspection of closet items.
  - `OutfitDetailModal.tsx`: Full-screen visualization with download/re-render controls.
- `services/geminiService.ts`: Specialized layer for all `@google/genai` interactions.
- `types.ts`: Global domain models.

## AI Engine & Models
This app leverages the latest Gemini models for specialized tasks:

1. **Gemini 2.0 Flash** (Text/JSON)
   - **Clothing Analysis**: Extracts structured metadata from images.
   - **Outfit Selection**: Intelligent stylistic reasoning across the entire closet.
   - **Item Brainstorming**: Creative ideation for the "Generate" feature.

2. **Gemini 2.5 Flash Image** (Image Generation)
   - **Avatar Illustration**: Vision-to-vision generation based on selected closet items.
   - **AI Item Generation**: Professional product photography for "AI Dreams".

## Styling & UX Principles
- **Design System**: A two-theme architecture (Rose/Pink for Girl, Sky/Blue for Boy) managed via the `useTheme` hook.
- **Utility CSS**: Clean Tailwind utility classes for all styling.
- **Micro-Animations**: Uses transitions for theme switching and interactive hover states on all cards.
- **Typography**: Inter for clarity, Handlee for artistic personality.
- **Performance**: Heavy image processing (downscaling) is handled client-side before sending to AI to minimize latency and token usage.

## Styleguide for Future Updates
1. **Component Modularity**: Keep logic in hooks and UI in small, focused components.
2. **Prop Drilling**: Avoid deep drill where possible; consider context if the app grows, but for now, explicit props keep the data flow visible.
3. **AI Defaults**: Always use `withRetry` utility for API calls to handle rate limits gracefully.
4. **Theme Awareness**: Pass the `t` theme object to new components rather than hardcoding colors.

## Environment & Scripts
- `VITE_GEMINI_API_KEY`: Required for browser-side AI features.
- `npm run dev`: Development server.
- `npm run build`: Production optimization.
