import React from 'react';
import { Button } from '../Button';
import { GeneratedOutfit, Gender, IllustrationStyle } from '../../types';

interface OutfitDetailModalProps {
    generatedOutfit: GeneratedOutfit;
    gender: Gender;
    isGenerating: boolean;
    illustrationStyle: IllustrationStyle;
    onClose: () => void;
    onRerender: (style: IllustrationStyle, forceNewSelection: boolean) => void;
    setError: (error: string | null) => void;
}

export const OutfitDetailModal: React.FC<OutfitDetailModalProps> = ({
    generatedOutfit,
    gender,
    isGenerating,
    illustrationStyle,
    onClose,
    onRerender,
    setError,
}) => {
    const handleDownload = async () => {
        try {
            const response = await fetch(generatedOutfit.illustrationUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mirthe-outfit-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            setError('Failed to download image.');
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60] flex items-center justify-center p-4 transition-all"
            onClick={onClose}
        >
            <div
                className="w-full max-w-3xl flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`w-full aspect-square rounded-[40px] overflow-hidden border-4 border-white shadow-2xl relative bg-white`}>
                    <img src={generatedOutfit.illustrationUrl} alt="Full scale outfit" className="w-full h-full object-contain" />
                    {isGenerating && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                            <div
                                className={`animate-spin rounded-full h-12 w-12 border-4 ${gender === 'girl' ? 'border-rose-500' : 'border-blue-500'
                                    } border-t-transparent`}
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 justify-center w-full">
                    <Button theme={gender} variant="primary" onClick={handleDownload} className="px-8">
                        📥 Download
                    </Button>
                    <Button
                        theme={gender}
                        variant="secondary"
                        onClick={() => onRerender(illustrationStyle, false)}
                        isLoading={isGenerating}
                        className="px-8"
                    >
                        🔄 Rerender
                    </Button>
                    <Button
                        theme={gender}
                        variant="outline"
                        onClick={onClose}
                        className="px-8 bg-white/10 text-white border-white/20 hover:bg-white/20"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};
