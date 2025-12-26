import React from 'react';
import { Button } from '../Button';
import { ClosetItem } from './ClosetItem';
import { ClothingItem, Gender, Category } from '../../types';

interface ClosetSectionProps {
    closet: ClothingItem[];
    gender: Gender;
    isGeneratingItem: boolean;
    isAnalyzing: boolean;
    showAllClosetItems: boolean;
    setShowAllClosetItems: (show: boolean | ((prev: boolean) => boolean)) => void;
    setShowCategoryPicker: (show: boolean) => void;
    setSelectedItem: (item: ClothingItem) => void;
    removeItem: (id: string) => void;
    startCamera: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    maxVisibleItems: number;
    t: {
        bgMain: string;
        borderMain: string;
        textMain: string;
        iconBgAlt: string;
        textSub: string;
        bgCard: string;
        borderAccent: string;
        bgCardAccent: string;
        hoverBorder: string;
    };
}

export const ClosetSection: React.FC<ClosetSectionProps> = ({
    closet,
    gender,
    isGeneratingItem,
    isAnalyzing,
    showAllClosetItems,
    setShowAllClosetItems,
    setShowCategoryPicker,
    setSelectedItem,
    removeItem,
    startCamera,
    fileInputRef,
    handleFileUpload,
    maxVisibleItems,
    t,
}) => {
    const visibleClosetItems = showAllClosetItems ? closet : closet.slice(0, maxVisibleItems);

    return (
        <section className={`${t.bgMain} p-6 rounded-3xl shadow-sm border ${t.borderMain} min-h-[400px] transition-all duration-300`}>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className={`text-xl font-bold ${t.textMain} flex items-center gap-2`}>
                    <span className={`${t.iconBgAlt} p-2 rounded-lg`}>👗</span> My Closet
                    <span className={`text-sm font-normal ${t.textSub} ml-2`}>({closet.length})</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                    <Button
                        theme={gender}
                        onClick={() => setShowCategoryPicker(true)}
                        variant="secondary"
                        isLoading={isGeneratingItem}
                        className="text-xs py-2 px-3"
                    >
                        ✨ Generate
                    </Button>
                    <Button theme={gender} onClick={startCamera} variant="outline" className="text-xs py-2 px-3">
                        📷 Camera
                    </Button>
                    <Button
                        theme={gender}
                        onClick={() => fileInputRef.current?.click()}
                        variant="primary"
                        isLoading={isAnalyzing}
                        className="text-xs py-2 px-3"
                    >
                        + Upload
                    </Button>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*"
                    multiple
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {isGeneratingItem && (
                    <div className={`aspect-square rounded-2xl border-4 border-dashed animate-pulse flex flex-col items-center justify-center ${t.bgCard} ${t.borderAccent}`}>
                        <span className="text-2xl mb-1">🧶</span>
                        <span className="text-[8px] font-black uppercase opacity-50 tracking-widest">Weaving...</span>
                    </div>
                )}
                {visibleClosetItems.map((item) => (
                    <ClosetItem
                        key={item.id}
                        item={item}
                        gender={gender}
                        onSelect={setSelectedItem}
                        onRemove={removeItem}
                        t={t}
                    />
                ))}
            </div>
            {closet.length > maxVisibleItems && (
                <div className="flex justify-center mt-6">
                    <Button
                        theme={gender}
                        variant="outline"
                        onClick={() => setShowAllClosetItems((prev) => !prev)}
                        className="text-xs py-2 px-4"
                    >
                        {showAllClosetItems ? 'Show less' : 'Show more'}
                    </Button>
                </div>
            )}
        </section>
    );
};
