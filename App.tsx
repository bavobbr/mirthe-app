
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ClothingItem, Category, WeatherCondition, Gender, GeneratedOutfit, IllustrationStyle } from './types';
import { analyzeClothing, selectBestOutfit, generateAvatarIllustration, generateNewClothingItem } from './services/geminiService';
import { Button } from './components/Button';
import { ImageWithFallback } from './components/ImageWithFallback';

const DEFAULT_CLOSET: ClothingItem[] = [
  // TOPS (1-8)
  { id: 'top-1', url: 'clothes/top1.png', category: 'Shirt', description: 'Classic red and white horizontal striped short-sleeve t-shirt', color: 'Red' },
  { id: 'top-2', url: 'clothes/top2.png', category: 'Shirt', description: 'Grey and black plaid long-sleeve flannel button-up shirt', color: 'Grey' },
  { id: 'top-3', url: 'clothes/top3.png', category: 'Shirt', description: 'White graphic tee with a red rose and "GIRL POWER" text', color: 'White' },
  { id: 'top-4', url: 'clothes/top4.png', category: 'Shirt', description: 'White graphic tee with red lips and "WOMEN POWER" text', color: 'White' },
  { id: 'top-5', url: 'clothes/top5.png', category: 'Shirt', description: 'Pink t-shirt with a cute unicorn and "Lieke" name print', color: 'Pink' },
  { id: 'top-6', url: 'clothes/top6.png', category: 'Sweater', description: 'Warm chocolate brown cable-knit wool sweater', color: 'Brown' },
  { id: 'top-7', url: 'clothes/top7.png', category: 'Sweater', description: 'Beige knit sweater with a pink cat face embroidery', color: 'Beige' },
  { id: 'top-8', url: 'clothes/top8.png', category: 'Sweater', description: 'Vibrant chunky rainbow horizontal striped turtleneck', color: 'Multi' },
  
  // BOTTOMS (1-5)
  { id: 'bt-1', url: 'clothes/bottom1.png', category: 'Bottom', description: 'Tan high-waisted pleated wide-leg trousers', color: 'Tan' },
  { id: 'bt-2', url: 'clothes/bottom2.png', category: 'Bottom', description: 'Classic mid-wash blue denim straight-leg jeans', color: 'Blue' },
  { id: 'bt-3', url: 'clothes/bottom3.png', category: 'Bottom', description: 'Dark grey denim jeans with colorful flower patches', color: 'Grey' },
  { id: 'bt-4', url: 'clothes/bottom4.png', category: 'Bottom', description: 'Light blue denim jeans with floral embroidery details', color: 'Light Blue' },
  { id: 'bt-5', url: 'clothes/bottom5.png', category: 'Bottom', description: 'Vertical rainbow striped slim-fit leggings', color: 'Multi' },
  
  // SKIRTS (1-3)
  { id: 'sk-1', url: 'clothes/skirt1.png', category: 'Skirt', description: 'Black midi skirt with large white polka dots', color: 'Black' },
  { id: 'sk-2', url: 'clothes/skirt2.png', category: 'Skirt', description: 'Red and black checkered pleated school-style skirt', color: 'Red' },
  { id: 'sk-3', url: 'clothes/skirt3.png', category: 'Skirt', description: 'Navy blue pleated athletic tennis skirt', color: 'Navy' },
  
  // DRESSES (1-2)
  { id: 'dr-1', url: 'clothes/dress1.png', category: 'Dress', description: 'Forest green floral midi dress with puff sleeves', color: 'Green' },
  { id: 'dr-2', url: 'clothes/dress2.png', category: 'Dress', description: 'Light blue eyelet lace cotton summer dress', color: 'Blue' },
  
  // SHOES (1-6)
  { id: 'sh-1', url: 'clothes/shoes1.png', category: 'Shoes', description: 'Glossy burgundy patent leather ankle boots', color: 'Burgundy' },
  { id: 'sh-2', url: 'clothes/shoes2.png', category: 'Shoes', description: 'Chunky white platform fashion sneakers', color: 'White' },
  { id: 'sh-3', url: 'clothes/shoes3.png', category: 'Shoes', description: 'Black mesh high heels with ankle strap', color: 'Black' },
  { id: 'sh-4', url: 'clothes/shoes4.png', category: 'Shoes', description: 'Black mesh slip-on athletic sneakers', color: 'Black' },
  { id: 'sh-5', url: 'clothes/shoes5.png', category: 'Shoes', description: 'Bright pink and grey athletic running shoes', color: 'Pink' },
  { id: 'sh-6', url: 'clothes/shoes6.png', category: 'Shoes', description: 'Classic pink canvas high-top sneakers', color: 'Pink' },
  
  // ACCESSORIES (1-3)
  { id: 'ac-1', url: 'clothes/acc1.png', category: 'Accessory', description: 'Beige straw sun hat with pink flower accent', color: 'Beige' },
  { id: 'ac-2', url: 'clothes/acc2.png', category: 'Accessory', description: 'Wide-brimmed white summer straw hat', color: 'White' },
  { id: 'ac-3', url: 'clothes/acc3.png', category: 'Accessory', description: 'Black vintage cloche hat with rhinestone trim', color: 'Black' }
];

const App: React.FC = () => {
  const [closet, setCloset] = useState<ClothingItem[]>(DEFAULT_CLOSET);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingItem, setIsGeneratingItem] = useState(false);
  
  const [gender, setGender] = useState<Gender>('girl');
  const [weather, setWeather] = useState<WeatherCondition>({ condition: 'Sunny' });
  const [illustrationStyle, setIllustrationStyle] = useState<IllustrationStyle>('hand-drawn');
  const [generatedOutfit, setGeneratedOutfit] = useState<GeneratedOutfit | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.body.style.backgroundColor = gender === 'girl' ? '#fffafb' : '#f0f7ff';
  }, [gender]);

  const t = useMemo(() => {
    const isGirl = gender === 'girl';
    return {
      textMain: isGirl ? 'text-rose-950' : 'text-blue-950',
      textSub: isGirl ? 'text-rose-800/70' : 'text-blue-800/70',
      textAccent: isGirl ? 'text-rose-900' : 'text-blue-900',
      textStrong: isGirl ? 'text-rose-600' : 'text-blue-600',
      bgMain: isGirl ? 'bg-white' : 'bg-slate-50',
      bgCard: isGirl ? 'bg-rose-50' : 'bg-blue-50',
      bgCardAccent: isGirl ? 'bg-pink-50' : 'bg-sky-50',
      bgBadge: isGirl ? 'bg-pink-100' : 'bg-sky-100',
      bgBadgeDark: isGirl ? 'bg-rose-100' : 'bg-blue-100',
      borderMain: isGirl ? 'border-rose-100' : 'border-blue-100',
      borderAccent: isGirl ? 'border-pink-100' : 'border-sky-100',
      borderStrong: isGirl ? 'border-rose-500' : 'border-blue-500',
      iconBg: isGirl ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700',
      iconBgAlt: isGirl ? 'bg-pink-100 text-pink-700' : 'bg-sky-100 text-sky-700',
      shadowColor: isGirl ? 'shadow-rose-200' : 'shadow-blue-200',
      loader: isGirl ? 'border-rose-100 border-t-rose-500' : 'border-blue-100 border-t-blue-500',
      errorBg: isGirl ? 'bg-rose-100 border-rose-200 text-rose-900' : 'bg-blue-100 border-blue-200 text-blue-900',
      progressBar: isGirl ? 'bg-rose-500' : 'bg-blue-500',
      hoverBorder: isGirl ? 'hover:border-pink-300' : 'hover:border-sky-300',
      btnHover: isGirl ? 'hover:border-pink-200' : 'hover:border-sky-200',
    };
  }, [gender]);

  const processImage = async (base64Data: string, mimeType: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeClothing(base64Data);
      const newItem: ClothingItem = {
        id: Math.random().toString(36).substr(2, 9),
        url: `data:${mimeType};base64,${base64Data}`,
        ...analysis
      };
      setCloset(prev => [newItem, ...prev]);
    } catch (err: any) {
      setError("Failed to analyze the item. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAISurprise = async () => {
    setIsGeneratingItem(true);
    setError(null);
    try {
      const newItem = await generateNewClothingItem(gender);
      const itemWithId: ClothingItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...newItem
      };
      setCloset(prev => [itemWithId, ...prev]);
    } catch (err: any) {
      setError("The AI fashion factory is temporarily closed. Try again in a moment!");
    } finally {
      setIsGeneratingItem(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      await processImage(base64Data, file.type);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraOpen(true);
    } catch (err) {
      setError("Could not access camera.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      stopCamera();
      await processImage(dataUrl.split(',')[1], 'image/jpeg');
    }
  };

  const handleGenerateOutfit = async (targetStyle: IllustrationStyle = illustrationStyle, forceNewSelection: boolean = false) => {
    if (closet.length < 3) {
      setError("Please upload at least a few items to your closet first!");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const previousIds = generatedOutfit?.items.map(item => item.id) || [];
      let selectedItems;
      let stylistNote;
      if (forceNewSelection || !generatedOutfit) {
        const selection = await selectBestOutfit(closet, weather, gender, previousIds);
        selectedItems = closet.filter(item => selection.selectedIds.includes(item.id));
        stylistNote = selection.stylistNote;
      } else {
        selectedItems = generatedOutfit.items;
        stylistNote = generatedOutfit.stylistNote;
      }
      const illustrationUrl = await generateAvatarIllustration(selectedItems, gender, weather, targetStyle);
      setGeneratedOutfit({ items: selectedItems, stylistNote, illustrationUrl, style: targetStyle });
      setIllustrationStyle(targetStyle);
    } catch (err: any) {
      setError("Styling error. Ensure your image files are named correctly in the /clothes folder.");
    } finally {
      setIsGenerating(false);
    }
  };

  const removeItem = (id: string) => {
    setCloset(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className={`min-h-screen pb-20 max-w-6xl mx-auto px-4 sm:px-6 relative transition-colors duration-500`}>
      <header className="py-10 text-center">
        <h1 className={`text-5xl font-bold ${t.textMain} mb-2 hand-drawn`}>Mirthe's closet app</h1>
        <p className={`${t.textSub} text-lg font-medium`}>Your personal safe fashion boutique</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <section className={`${t.bgMain} p-6 rounded-3xl shadow-sm border ${t.borderMain} transition-all duration-300`}>
            <h2 className={`text-xl font-bold ${t.textMain} mb-4 flex items-center gap-2`}>
              <span className={`${t.iconBg} p-2 rounded-lg`}>✨</span> Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-bold ${t.textAccent} mb-2`}>I am a...</label>
                <div className="flex gap-2">
                  <Button theme={gender} variant={gender === 'girl' ? 'primary' : 'outline'} onClick={() => setGender('girl')} className="flex-1 text-sm py-2">👧 Girl</Button>
                  <Button theme={gender} variant={gender === 'boy' ? 'primary' : 'outline'} onClick={() => setGender('boy')} className="flex-1 text-sm py-2">👦 Boy</Button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-bold ${t.textAccent} mb-2`}>Weather Condition</label>
                <select 
                  className={`w-full border-2 ${gender === 'girl' ? 'border-rose-50' : 'border-blue-50'} rounded-full px-4 py-2 text-sm focus:outline-none bg-white ${t.textAccent} font-medium transition-colors`}
                  value={weather.condition}
                  onChange={(e) => setWeather({ condition: e.target.value })}
                >
                  <option>Sunny</option><option>Rainy</option><option>Snowy</option><option>Cloudy</option><option>Windy</option>
                </select>
              </div>
            </div>
          </section>

          <section className={`${t.bgMain} p-6 rounded-3xl shadow-sm border ${t.borderMain} min-h-[400px] transition-all duration-300`}>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <h2 className={`text-xl font-bold ${t.textMain} flex items-center gap-2`}>
                <span className={`${t.iconBgAlt} p-2 rounded-lg`}>👗</span> My Closet
                <span className={`text-sm font-normal ${t.textSub} ml-2`}>({closet.length})</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button theme={gender} onClick={handleAISurprise} variant="secondary" isLoading={isGeneratingItem} className="text-xs py-2 px-3">✨ AI Surprise</Button>
                <Button theme={gender} onClick={startCamera} variant="outline" className="text-xs py-2 px-3">📷 Camera</Button>
                <Button theme={gender} onClick={() => fileInputRef.current?.click()} variant="primary" isLoading={isAnalyzing} className="text-xs py-2 px-3">+ Upload</Button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" multiple />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {isGeneratingItem && (
                <div className={`aspect-square rounded-2xl border-4 border-dashed animate-pulse flex flex-col items-center justify-center ${t.bgCard} ${t.borderAccent}`}>
                  <span className="text-2xl mb-1">🧶</span>
                  <span className="text-[8px] font-black uppercase opacity-50 tracking-widest">Weaving...</span>
                </div>
              )}
              {closet.map((item) => (
                <div key={item.id} className={`group relative ${t.bgCardAccent} rounded-2xl overflow-hidden aspect-square border ${t.borderAccent} ${t.hoverBorder} transition-all shadow-sm`}>
                  <ImageWithFallback theme={gender} src={item.url} alt={item.description} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 ${gender === 'girl' ? 'bg-rose-950/50' : 'bg-blue-950/50'} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 backdrop-blur-[2px]`}>
                    <p className={`text-white text-[10px] uppercase font-black tracking-widest ${gender === 'girl' ? 'bg-rose-600/60' : 'bg-blue-600/60'} px-2 py-0.5 rounded w-fit mb-1`}>{item.category}</p>
                    <p className="text-white text-[10px] truncate font-medium">{item.description}</p>
                    <button onClick={() => removeItem(item.id)} className={`absolute top-2 right-2 bg-white/20 hover:bg-red-500 rounded-full p-1.5 transition-colors shadow-lg z-10`}>
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {error && (
            <div className={`${t.errorBg} p-4 rounded-2xl flex items-center gap-3 font-medium animate-pulse border-2`}>
              <svg className={`w-6 h-6 ${t.textStrong}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 sticky top-6">
          <div className={`${t.bgMain} p-8 rounded-[40px] shadow-2xl border ${t.borderMain} flex flex-col items-center text-center transition-all duration-300`}>
            {generatedOutfit ? (
              <>
                <div className={`w-full aspect-square ${t.bgCard} rounded-[32px] overflow-hidden mb-6 relative border-4 ${t.borderMain} shadow-inner group`}>
                  <ImageWithFallback theme={gender} src={generatedOutfit.illustrationUrl} alt="Avatar Illustration" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" fallbackIcon="👗" />
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
                      <div className={`animate-bounce text-6xl mb-4 ${t.textStrong}`}>🎨</div>
                      <p className="font-bold hand-drawn text-2xl animate-pulse">Sketching your look...</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mb-6 w-full justify-center">
                  {(['hand-drawn', 'realistic', 'cartoon'] as IllustrationStyle[]).map((style) => (
                    <Button key={style} theme={gender} variant={illustrationStyle === style ? 'secondary' : 'ghost'} onClick={() => handleGenerateOutfit(style, false)} className="flex-1 text-[10px] py-2">
                      {style === 'hand-drawn' ? 'Sketch' : style === 'realistic' ? 'Studio' : 'Toon'}
                    </Button>
                  ))}
                </div>
                <div className="space-y-4 w-full">
                  <h3 className={`text-2xl font-bold ${t.textMain} hand-drawn leading-tight italic`}>"{generatedOutfit.stylistNote}"</h3>
                  <div className="pt-4 flex flex-wrap justify-center gap-3">
                    {generatedOutfit.items.map(item => (
                      <div key={item.id} className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                        <ImageWithFallback theme={gender} src={item.url} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <Button theme={gender} onClick={() => handleGenerateOutfit(illustrationStyle, true)} isLoading={isGenerating} className="w-full mt-6">🔄 New Combination</Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-10 w-full">
                <div className={`w-full aspect-square ${t.bgCard} rounded-[32px] flex flex-col items-center justify-center mb-10 border-4 border-dashed ${t.borderAccent}`}>
                  <span className="text-8xl opacity-10">🪄</span>
                </div>
                <h3 className={`text-2xl font-bold ${t.textMain} hand-drawn mb-2`}>Ready to shine?</h3>
                <p className={`${t.textSub} mb-8 max-w-xs font-medium`}>Select preferences and let Mirthe's AI designer sketch your look.</p>
                <Button theme={gender} onClick={() => handleGenerateOutfit()} isLoading={isGenerating} className="w-full">✨ Generate Outfit</Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md aspect-[3/4] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
              <button onClick={stopCamera} className="bg-white/20 p-4 rounded-full text-white"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 active:scale-90 transition-transform" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
