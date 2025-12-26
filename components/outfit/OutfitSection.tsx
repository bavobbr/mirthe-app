import React from 'react';
import { Button } from '../Button';
import { ImageWithFallback } from '../ImageWithFallback';
import { GeneratedOutfit, Gender, IllustrationStyle } from '../../types';

interface OutfitSectionProps {
    generatedOutfit: GeneratedOutfit | null;
    gender: Gender;
    isGenerating: boolean;
    illustrationStyle: IllustrationStyle;
    loadingMessage: string;
    timer: number;
    handleGenerateOutfit: (style?: IllustrationStyle, forceNewSelection?: boolean) => void;
    setShowOutfitModal: (show: boolean) => void;
    t: {
        bgMain: string;
        borderMain: string;
        textMain: string;
        bgCard: string;
        textStrong: string;
        textSub: string;
        borderAccent: string;
    };
}

export const OutfitSection: React.FC<OutfitSectionProps> = ({
    generatedOutfit,
    gender,
    isGenerating,
    illustrationStyle,
    loadingMessage,
    timer,
    handleGenerateOutfit,
    setShowOutfitModal,
    t,
}) => {
    return (
        <div className="lg:col-span-4 sticky top-6">
            <div className={`${t.bgMain} p-8 rounded-[40px] shadow-2xl border ${t.borderMain} flex flex-col items-center text-center transition-all duration-300`}>
                {generatedOutfit ? (
                    <>
                        <div
                            className={`w-full aspect-square ${t.bgCard} rounded-[32px] overflow-hidden mb-6 relative border-4 ${t.borderMain} shadow-inner group cursor-pointer active:scale-95 transition-transform`}
                            onClick={() => !isGenerating && setShowOutfitModal(true)}
                        >
                            <ImageWithFallback
                                theme={gender}
                                src={generatedOutfit.illustrationUrl}
                                alt="Avatar Illustration"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                fallbackIcon="👗"
                            />
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="bg-white/90 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-slate-900 shadow-lg">
                                    View Full Screen
                                </span>
                            </div>
                            {isGenerating && (
                                <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6">
                                    <div className={`animate-bounce text-6xl mb-6 ${t.textStrong}`}>🎨</div>
                                    <p className={`font-bold hand-drawn text-2xl ${t.textMain} text-center mb-4 transition-all duration-500`}>
                                        {loadingMessage}
                                    </p>
                                    <div className={`text-sm font-black ${t.textSub} font-mono bg-white px-3 py-1 rounded-full border shadow-sm`}>
                                        {timer}s
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 mb-6 w-full justify-center">
                            {(['hand-drawn', 'realistic', 'cartoon'] as IllustrationStyle[]).map((style) => (
                                <Button
                                    key={style}
                                    theme={gender}
                                    variant={illustrationStyle === style ? 'secondary' : 'ghost'}
                                    onClick={() => handleGenerateOutfit(style, false)}
                                    className="flex-1 text-[10px] py-2"
                                >
                                    {style === 'hand-drawn' ? 'Sketch' : style === 'realistic' ? 'Studio' : 'Toon'}
                                </Button>
                            ))}
                        </div>
                        <div className="space-y-4 w-full">
                            <h3 className={`text-2xl font-bold ${t.textMain} hand-drawn leading-tight italic`}>
                                "{generatedOutfit.stylistNote}"
                            </h3>
                            <div className="pt-4 flex flex-wrap justify-center gap-3">
                                {generatedOutfit.items.map((item) => (
                                    <div key={item.id} className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                                        <ImageWithFallback theme={gender} src={item.url} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <Button
                                theme={gender}
                                onClick={() => handleGenerateOutfit(illustrationStyle, true)}
                                isLoading={isGenerating}
                                className="w-full mt-6 flex items-center justify-center gap-2"
                            >
                                <svg className={`w-4 h-4 transition-transform duration-500 ${isGenerating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                New Combination
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center py-10 w-full">
                        <div className={`w-full aspect-square ${t.bgCard} rounded-[32px] flex flex-col items-center justify-center mb-10 border-4 border-dashed ${t.borderAccent}`}>
                            <span className="text-8xl opacity-10">🪄</span>
                        </div>
                        <h3 className={`text-2xl font-bold ${t.textMain} hand-drawn mb-2`}>Ready to shine?</h3>
                        <p className={`${t.textSub} mb-8 max-w-xs font-medium`}>
                            Select preferences and let Mirthe's AI designer sketch your look.
                        </p>
                        <Button
                            theme={gender}
                            onClick={() => handleGenerateOutfit()}
                            isLoading={isGenerating}
                            className="w-full"
                        >
                            ✨ Suggest Outfit
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
