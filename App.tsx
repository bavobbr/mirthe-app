
import React, { useState, useEffect, useRef } from 'react';
import { ClothingItem, Category, WeatherCondition, Gender, GeneratedOutfit } from './types';
import { analyzeClothing, selectBestOutfit, generateAvatarIllustration } from './services/geminiService';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [closet, setCloset] = useState<ClothingItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gender, setGender] = useState<Gender>('girl');
  const [weather, setWeather] = useState<WeatherCondition>({ temp: 20, condition: 'Sunny' });
  const [generatedOutfit, setGeneratedOutfit] = useState<GeneratedOutfit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            setWeather({ temp: 22, condition: 'Sunny' });
          } catch (err) {
            console.error("Weather fetch failed", err);
          }
        },
        () => console.log("Geolocation permission denied")
      );
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsAnalyzing(true);
    setError(null);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        const base64Data = await new Promise<string>((resolve) => {
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(file);
        });

        const analysis = await analyzeClothing(base64Data);
        
        const newItem: ClothingItem = {
          id: Math.random().toString(36).substr(2, 9),
          url: `data:${file.type};base64,${base64Data}`,
          ...analysis
        };

        setCloset(prev => [...prev, newItem]);
      }
    } catch (err) {
      setError("Failed to analyze one or more items. Please try again.");
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenerateOutfit = async () => {
    if (closet.length < 3) {
      setError("Please upload at least a few items (Top, Bottom, Shoes) to your closet first!");
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const selection = await selectBestOutfit(closet, weather, gender);
      const selectedItems = closet.filter(item => selection.selectedIds.includes(item.id));
      
      const illustrationUrl = await generateAvatarIllustration(selectedItems, gender, weather);
      
      setGeneratedOutfit({
        items: selectedItems,
        stylistNote: selection.stylistNote,
        illustrationUrl
      });
    } catch (err) {
      setError("Oh no! The stylist is having a break. Please try generating again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const removeItem = (id: string) => {
    setCloset(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen pb-20 max-w-6xl mx-auto px-4 sm:px-6">
      <header className="py-10 text-center">
        <h1 className="text-5xl font-bold text-rose-950 mb-2 hand-drawn">Mirthe's closet app</h1>
        <p className="text-rose-800/70 text-lg font-medium">Your personal AI fashion boutique</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Closet & Tools */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Weather & Avatar Controls */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100">
            <h2 className="text-xl font-bold text-rose-950 mb-4 flex items-center gap-2">
              <span className="bg-rose-100 p-2 rounded-lg text-rose-700">✨</span> Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-rose-900 mb-2">I am a...</label>
                <div className="flex gap-2">
                  <Button 
                    variant={gender === 'girl' ? 'primary' : 'outline'}
                    onClick={() => setGender('girl')}
                    className="flex-1 text-sm py-2"
                  >
                    👧 Girl
                  </Button>
                  <Button 
                    variant={gender === 'boy' ? 'primary' : 'outline'}
                    onClick={() => setGender('boy')}
                    className="flex-1 text-sm py-2"
                  >
                    👦 Boy
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-rose-900 mb-2">Weather Condition</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 border-2 border-rose-50 rounded-full px-4 py-2 text-sm focus:border-rose-400 focus:outline-none bg-white text-rose-900 font-medium"
                    value={weather.condition}
                    onChange={(e) => setWeather({ ...weather, condition: e.target.value })}
                  >
                    <option>Sunny</option>
                    <option>Rainy</option>
                    <option>Snowy</option>
                    <option>Cloudy</option>
                    <option>Windy</option>
                  </select>
                  <div className="flex items-center bg-rose-50 rounded-full border-2 border-rose-100 pr-4">
                    <input 
                      type="number"
                      className="w-16 bg-transparent px-3 py-2 text-sm focus:outline-none text-rose-950 font-bold"
                      value={weather.temp}
                      onChange={(e) => setWeather({ ...weather, temp: Number(e.target.value) })}
                    />
                    <span className="font-bold text-rose-900">°C</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Closet Grid */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-rose-950 flex items-center gap-2">
                <span className="bg-pink-100 p-2 rounded-lg text-pink-700">👗</span> My Closet
                <span className="text-sm font-normal text-rose-800/50 ml-2">({closet.length} items)</span>
              </h2>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="secondary"
                isLoading={isAnalyzing}
                className="text-sm py-2 px-4"
              >
                + Add Clothes
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*" 
                multiple 
              />
            </div>

            {closet.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-rose-100 rounded-2xl bg-rose-50/30">
                <div className="text-5xl mb-4 opacity-20">👚</div>
                <p className="text-rose-800/50 italic font-medium">Your closet is empty. Upload some pictures!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {closet.map((item) => (
                  <div key={item.id} className="group relative bg-pink-50 rounded-2xl overflow-hidden aspect-square border border-pink-100 hover:border-pink-300 transition-all shadow-sm">
                    <img src={item.url} alt={item.description} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-rose-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 backdrop-blur-[2px]">
                      <p className="text-white text-[10px] uppercase font-black tracking-widest bg-rose-600/60 px-2 py-0.5 rounded w-fit mb-1">{item.category}</p>
                      <p className="text-white text-xs truncate font-medium">{item.description}</p>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="absolute top-2 right-2 bg-white/20 hover:bg-rose-500 rounded-full p-1.5 transition-colors shadow-lg"
                        title="Remove item"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {error && (
            <div className="bg-rose-100 border-2 border-rose-200 text-rose-900 p-4 rounded-2xl flex items-center gap-3 font-medium">
              <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Generation Result */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-rose-100 flex flex-col items-center text-center">
            
            {generatedOutfit ? (
              <>
                <div className="w-full aspect-square bg-rose-50 rounded-[32px] overflow-hidden mb-6 relative border-4 border-rose-50 shadow-inner group">
                  <img 
                    src={generatedOutfit.illustrationUrl} 
                    alt="Drawn Avatar Illustration" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center text-rose-950">
                      <div className="animate-bounce text-6xl mb-4">🎨</div>
                      <p className="font-bold hand-drawn text-2xl animate-pulse">Styling your avatar...</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 w-full">
                  <div className="inline-block bg-pink-100 text-pink-800 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-pink-200">
                    Boutique Pick
                  </div>
                  <h3 className="text-2xl font-bold text-rose-950 hand-drawn leading-tight italic px-2">
                    "{generatedOutfit.stylistNote}"
                  </h3>
                  
                  <div className="pt-4 flex flex-wrap justify-center gap-3">
                    {generatedOutfit.items.map(item => (
                      <div key={item.id} className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-rose-200 shadow-md">
                          <img src={item.url} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] text-rose-900 font-black mt-1 uppercase tracking-tighter">{item.category}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={handleGenerateOutfit} 
                    isLoading={isGenerating}
                    className="w-full mt-6 shadow-rose-200"
                  >
                    🔄 Create New Look
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-10 w-full">
                <div className="w-full aspect-square bg-rose-50/50 rounded-[32px] flex flex-col items-center justify-center mb-10 border-4 border-dashed border-rose-200 relative">
                  <span className="text-8xl opacity-10">🪄</span>
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center text-rose-950 z-10 rounded-[32px]">
                      <div className="animate-bounce text-6xl mb-4 text-rose-600">🪄</div>
                      <p className="font-bold hand-drawn text-2xl">Crafting your outfit...</p>
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-rose-950 hand-drawn mb-2">Ready to shine?</h3>
                <p className="text-rose-900/60 mb-8 max-w-xs font-medium">Select your preferences, and let Mirthe's AI designer sketch your perfect look.</p>
                <Button 
                  onClick={handleGenerateOutfit} 
                  isLoading={isGenerating}
                  className="w-full"
                  disabled={closet.length < 3}
                >
                  ✨ Generate Random Outfit
                </Button>
                {closet.length < 3 && (
                  <p className="text-xs text-rose-500 mt-3 font-bold uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full">Add 3+ items to start</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-20 py-8 text-center border-t border-rose-100">
        <p className="text-rose-950/30 text-sm font-bold tracking-widest uppercase">
          © 2024 Mirthe's closet app • Powered by Gemini AI
        </p>
      </footer>
    </div>
  );
};

export default App;
