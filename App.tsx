import React, { useState, useEffect, useRef } from 'react';
import { ClothingItem, Category, WeatherCondition, Gender, GeneratedOutfit, IllustrationStyle } from './types';
import { analyzeClothing, selectBestOutfit, generateAvatarIllustration, generateNewClothingItem, downscaleBase64Image } from './services/geminiService';
import { useTheme } from './hooks/useTheme';

// Layout & Sections
import { Header } from './components/layout/Header';
import { SettingsSection } from './components/settings/SettingsSection';
import { ClosetSection } from './components/closet/ClosetSection';
import { OutfitSection } from './components/outfit/OutfitSection';

// Modals
import { CameraModal } from './components/modals/CameraModal';
import { CategoryPickerModal } from './components/modals/CategoryPickerModal';
import { ItemDetailModal } from './components/modals/ItemDetailModal';
import { OutfitDetailModal } from './components/modals/OutfitDetailModal';
import { AboutModal } from './components/modals/AboutModal';

const CLOTHES_BASE_URL = `${import.meta.env.BASE_URL}clothes/`;

const DEFAULT_CLOSET: ClothingItem[] = [
  { id: 'ahlens-women-s-cigarette-trousers', url: `${CLOTHES_BASE_URL}ahlens-women-s-cigarette-trousers.jpg`, category: 'Bottom', description: 'Vintage high-waisted pleated trousers with a tapered leg, crafted from a velvet-like fabric.', color: 'Burgundy' },
  { id: 'another-woman-women-s-skirt', url: `${CLOTHES_BASE_URL}another-woman-women-s-skirt.jpg`, category: 'Skirt', description: 'A short pleated skirt featuring a brown and grey plaid pattern with a dark denim belted waistband.', color: 'Brown' },
  { id: 'bally-women-s-crossbody-bag', url: `${CLOTHES_BASE_URL}bally-women-s-crossbody-bag.jpg`, category: 'Accessory', description: 'a small red rectangular crossbody purse with a long thin strap', color: 'red' },
  { id: 'camera-women-s-dress', url: `${CLOTHES_BASE_URL}camera-women-s-dress.jpg`, category: 'Dress', description: 'A sleeveless, midi slip dress with thin spaghetti straps and a straight neckline, featuring a slightly sheer fabric layer.', color: 'Dark purple' },
  { id: 'chelsea-theodore-women-s-dress', url: `${CLOTHES_BASE_URL}chelsea-theodore-women-s-dress.jpg`, category: 'Dress', description: 'sleeveless high-neck dress with textured details on the chest', color: 'dark brown' },
  { id: 'clock-house-women-s-shorts', url: `${CLOTHES_BASE_URL}clock-house-women-s-shorts.webp`, category: 'Bottom', description: 'High-waisted belted shorts featuring a light green and cream plaid pattern with front pleats.', color: 'Green' },
  { id: 'deerberg-women-s-wool-cardigan', url: `${CLOTHES_BASE_URL}deerberg-women-s-wool-cardigan.jpg`, category: 'Sweater', description: 'A long-sleeved button-up knit cardigan featuring an intricate blue and white geometric pattern with brown and light blue striped accents at the cuffs and hem.', color: 'blue and white' },
  { id: 'dockers-men-s-pleated-trousers', url: `${CLOTHES_BASE_URL}dockers-men-s-pleated-trousers.jpg`, category: 'Bottom', description: 'A pair of black pleated trousers with a straight-leg cut and belt loops.', color: 'black' },
  { id: 'dolce-gabbana-women-s-knitted-vest', url: `${CLOTHES_BASE_URL}dolce-gabbana-women-s-knitted-vest.jpg`, category: 'Sweater', description: 'A dark olive green knitted sweater vest featuring a V-neck and contrasting ochre-colored fuzzy trim at the collar, armholes, and hem.', color: 'dark olive green' },
  { id: 'dr-martens-men-s-real-leather-flats', url: `${CLOTHES_BASE_URL}dr-martens-men-s-real-leather-flats.jpg`, category: 'Shoes', description: 'black lace-up leather oxford shoe with a thick sole', color: 'black' },
  { id: 'edgar-vos-women-s-straight-trousers', url: `${CLOTHES_BASE_URL}edgar-vos-women-s-straight-trousers.jpg`, category: 'Bottom', description: 'High-waisted wide-leg trousers featuring a subtle pinstripe pattern, a decorative buttoned flap pocket, and pink button closures.', color: 'Mauve' },
  { id: 'gaby-mersmann-women-s-wool-tailored-trousers', url: `${CLOTHES_BASE_URL}gaby-mersmann-women-s-wool-tailored-trousers.jpg`, category: 'Bottom', description: 'High-waisted pleated wide-leg trousers featuring a buttoned waistband and a front crease.', color: 'dark grey' },
  { id: 'hugo-boss-men-s-wool-crew-neck-sweater', url: `${CLOTHES_BASE_URL}hugo-boss-men-s-wool-crew-neck-sweater.jpg`, category: 'Sweater', description: 'An olive green textured knit sweater with a crew neck and ribbed cuffs and hem.', color: 'Olive green' },
  { id: 'ok-sport-women-s-dress', url: `${CLOTHES_BASE_URL}ok-sport-women-s-dress.jpg`, category: 'Dress', description: 'A pale yellow corduroy sleeveless overall dress with metal buckles on the shoulder straps and two front patch pockets.', color: 'Pale Yellow' },
  { id: 'screen-stars-women-s-t-shirt', url: `${CLOTHES_BASE_URL}screen-stars-women-s-t-shirt.jpg`, category: 'Shirt', description: 'A red short-sleeved t-shirt featuring a large graphic print of a Coca-Cola bottle and the iconic brand logo.', color: 'red' },
  { id: 'studio-men-s-cashmere-roll-neck-sweater', url: `${CLOTHES_BASE_URL}studio-men-s-cashmere-roll-neck-sweater.jpg`, category: 'Sweater', description: 'a long-sleeved purple turtleneck sweater with ribbed cuffs and hem', color: 'purple' },
  { id: 'tiger-of-sweden-women-s-skirt', url: `${CLOTHES_BASE_URL}tiger-of-sweden-women-s-skirt.jpg`, category: 'Skirt', description: 'A black mini skirt featuring thin vertical tan pinstripes, a waistband with belt loops, and a front button closure.', color: 'Black' },
  { id: 'vintage-men-s-cashmere-roll-neck-sweater', url: `${CLOTHES_BASE_URL}vintage-men-s-cashmere-roll-neck-sweater.webp`, category: 'Sweater', description: 'A camel-colored long-sleeved turtleneck sweater with ribbed cuffs and hem.', color: 'camel' },
  { id: 'vintage-women-s-clutch-bag', url: `${CLOTHES_BASE_URL}vintage-women-s-clutch-bag.webp`, category: 'Accessory', description: 'A vintage-style black leather clutch featuring a crocodile-patterned flap and a gold-toned U-shaped buckle detail.', color: 'Black' },
  { id: 'vintage-women-s-crossbody-bag', url: `${CLOTHES_BASE_URL}vintage-women-s-crossbody-bag.webp`, category: 'Accessory', description: 'A small navy blue crossbody bag with a gold diagonal pinstripe and star pattern, featuring a gold-tone hexagonal clasp and a long, thin gold chain strap.', color: 'Navy Blue' },
];

const App: React.FC = () => {
  const [closet, setCloset] = useState<ClothingItem[]>(() => {
    try {
      const saved = localStorage.getItem('mirthe_closet');
      return saved ? JSON.parse(saved) : DEFAULT_CLOSET;
    } catch (e) {
      console.error("Failed to load closet from localStorage:", e);
      return DEFAULT_CLOSET;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mirthe_closet', JSON.stringify(closet));
    } catch (e: any) {
      // Handle the QuotaExceededError when localStorage is full (usually 5MB)
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        setError("Your closet is full! Please remove some items to make room for new ones.");
      } else {
        console.error("Failed to save closet to localStorage:", e);
      }
    }
  }, [closet]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingItem, setIsGeneratingItem] = useState(false);

  const [gender, setGender] = useState<Gender>('girl');
  const [weather, setWeather] = useState<WeatherCondition>({ condition: 'Random' });
  const [illustrationStyle, setIllustrationStyle] = useState<IllustrationStyle>('hand-drawn');
  const [generatedOutfit, setGeneratedOutfit] = useState<GeneratedOutfit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllClosetItems, setShowAllClosetItems] = useState(false);
  const [gridColumns, setGridColumns] = useState(2);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [showOutfitModal, setShowOutfitModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Category | 'All'>('All');

  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Loading state
  const [loadingMessage, setLoadingMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const loadingMessages = [
    "Analyzing your style...",
    "Checking the weather...",
    "Finding matching items...",
    "Sketching the outfit...",
    "Adding final touches...",
    "Nearly there...",
    "Making it fabulous..."
  ];

  const t = useTheme(gender);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isGenerating) {
      setTimer(0);
      setLoadingMessage(loadingMessages[0]);
      let msgIndex = 0;
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
        if (msgIndex < loadingMessages.length - 1) {
          msgIndex++;
          setLoadingMessage(loadingMessages[msgIndex]);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.body.style.backgroundColor = gender === 'girl' ? '#fffafb' : '#f0f7ff';
  }, [gender]);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      const nextColumns = width >= 1024 ? 5 : width >= 768 ? 4 : width >= 640 ? 3 : 2;
      setGridColumns(nextColumns);
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  useEffect(() => {
    const migrateCloset = async () => {
      let changed = false;
      const migratedCloset = await Promise.all(closet.map(async (item: any) => {
        let newItem = { ...item };

        // 1. Category migration (Top -> Shirt)
        if (newItem.category === 'Top') {
          newItem.category = 'Shirt';
          changed = true;
        }

        // 2. Image compression migration (if > 300KB)
        if (newItem.url.startsWith('data:') && newItem.url.length > 300000) {
          try {
            newItem.url = await downscaleBase64Image(newItem.url);
            changed = true;
          } catch (e) {
            console.error("Migration compression failed", e);
          }
        }

        return newItem;
      }));

      if (changed) {
        setCloset(migratedCloset);
      }
    };
    migrateCloset();
  }, [closet.length]); // Re-run if closet length changes, or just once on mount

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const newItems: ClothingItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const downscaledUrl = await downscaleBase64Image(base64);
        const [header, data] = downscaledUrl.split(',');
        const mimeType = header.split(':')[1].split(';')[0];

        const analyzed = await analyzeClothing(data, mimeType);
        newItems.push({
          id: Math.random().toString(36).substr(2, 9),
          url: downscaledUrl,
          ...analyzed
        });
      }
      setCloset(prev => [...newItems, ...prev]);
    } catch (err) {
      setError("Failed to analyze one or more items. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setIsCameraOpen(true);
    } catch (err) {
      setError("Camera access denied. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setIsCameraOpen(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL('image/jpeg');
    stopCamera();

    setIsAnalyzing(true);
    setError(null);
    try {
      const downscaledUrl = await downscaleBase64Image(base64);
      const [header, data] = downscaledUrl.split(',');
      const mimeType = header.split(':')[1].split(';')[0];

      const analyzed = await analyzeClothing(data, mimeType);
      setCloset(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        url: downscaledUrl,
        ...analyzed
      }, ...prev]);
    } catch (err) {
      setError("Failed to analyze photo. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeItem = (id: string) => {
    setCloset(prev => prev.filter(item => item.id !== id));
  };

  const handleGenerateOutfit = async (style: IllustrationStyle = illustrationStyle, forceNewSelection = true) => {
    if (closet.length === 0) {
      setError("Add some clothes to your closet first!");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setIllustrationStyle(style);

    try {
      let currentOutfit = generatedOutfit;

      if (forceNewSelection || !generatedOutfit) {
        // Phase 1: Rapid selection (AI picks IDs)
        const selection = await selectBestOutfit(closet, weather, gender);
        const selectedItems = (selection?.selectedIds || [])
          .map(id => closet.find(item => item.id === id))
          .filter((item): item is ClothingItem => !!item);

        currentOutfit = {
          items: selectedItems,
          stylistNote: selection.stylistNote,
          style: style
        };
        setGeneratedOutfit(currentOutfit);
      } else if (currentOutfit) {
        // Just updating the style, reuse items
        currentOutfit = { ...currentOutfit, style: style };
        setGeneratedOutfit(currentOutfit);
      }

      if (!currentOutfit) return;

      // Phase 2: High quality illustration
      const illustrationUrl = await generateAvatarIllustration(currentOutfit.items, gender, weather, style);
      setGeneratedOutfit({ ...currentOutfit, illustrationUrl });
    } catch (err) {
      console.error("Stylist error:", err);
      setError("Something went wrong with the AI stylist. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAISurprise = async (category: Category) => {
    setIsGeneratingItem(true);
    setError(null);
    setShowCategoryPicker(false);
    try {
      const newItem = await generateNewClothingItem(gender, category, weather, closet);
      const compressedUrl = await downscaleBase64Image(newItem.url);

      const itemWithId: ClothingItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...newItem,
        url: compressedUrl
      };
      setCloset(prev => [itemWithId, ...prev]);
    } catch (err) {
      setError("Failed to dream up a new item. Please check your internet.");
    } finally {
      setIsGeneratingItem(false);
    }
  };

  const maxVisibleItems = gridColumns * 2;

  const filteredCloset = closet.filter(item => {
    const matchesCategory = activeFilter === 'All' || item.category === activeFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = item.description.toLowerCase().includes(searchLower) ||
      item.color?.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-20 max-w-7xl mx-auto px-4 sm:px-6 relative transition-colors duration-500">
      <Header t={t} onOpenAbout={() => setShowAboutModal(true)} />

      <main className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <SettingsSection
              gender={gender}
              setGender={setGender}
              weather={weather}
              setWeather={setWeather}
              t={t}
            />

            <ClosetSection
              closet={filteredCloset}
              totalItems={closet.length}
              gender={gender}
              isGeneratingItem={isGeneratingItem}
              isAnalyzing={isAnalyzing}
              showAllClosetItems={showAllClosetItems}
              setShowAllClosetItems={setShowAllClosetItems}
              setShowCategoryPicker={setShowCategoryPicker}
              setSelectedItem={setSelectedItem}
              removeItem={removeItem}
              startCamera={startCamera}
              fileInputRef={fileInputRef}
              handleFileUpload={handleFileUpload}
              maxVisibleItems={maxVisibleItems}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              t={t}
            />

            {error && (
              <div className={`${t.errorBg} p-4 rounded-2xl flex items-center gap-3 font-medium animate-pulse border-2`}>
                <svg className={`w-6 h-6 ${t.textStrong}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
          </div>

          <OutfitSection
            generatedOutfit={generatedOutfit}
            gender={gender}
            isGenerating={isGenerating}
            illustrationStyle={illustrationStyle}
            loadingMessage={loadingMessage}
            timer={timer}
            handleGenerateOutfit={handleGenerateOutfit}
            setShowOutfitModal={setShowOutfitModal}
            t={t}
          />
        </div>
      </main>

      {/* Modals */}
      {isCameraOpen && (
        <CameraModal
          videoRef={videoRef}
          canvasRef={canvasRef}
          stopCamera={stopCamera}
          capturePhoto={capturePhoto}
        />
      )}

      {showCategoryPicker && (
        <CategoryPickerModal
          gender={gender}
          onSelectCategory={handleAISurprise}
          onClose={() => setShowCategoryPicker(false)}
          t={t}
        />
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          gender={gender}
          onClose={() => setSelectedItem(null)}
          onRemove={removeItem}
          t={t}
        />
      )}

      {showOutfitModal && generatedOutfit && (
        <OutfitDetailModal
          generatedOutfit={generatedOutfit}
          gender={gender}
          isGenerating={isGenerating}
          illustrationStyle={illustrationStyle}
          onClose={() => setShowOutfitModal(false)}
          onRerender={handleGenerateOutfit}
          setError={setError}
        />
      )}
      {showAboutModal && (
        <AboutModal
          gender={gender}
          t={t}
          onClose={() => setShowAboutModal(false)}
        />
      )}
    </div>
  );
};

export default App;
