import React from 'react';
import { Button } from '../Button';
import { ClosetItem } from './ClosetItem';
import { ClothingItem, Gender, Category } from '../../types';

interface ClosetSectionProps {
    closet: ClothingItem[];
    totalItems: number;
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
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    activeFilter: Category | 'All';
    setActiveFilter: (filter: Category | 'All') => void;
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
        textStrong: string;
    };
}

const FILTER_CATEGORIES: (Category | 'All')[] = ['All', 'Shirt', 'Sweater', 'Bottom', 'Skirt', 'Dress', 'Outerwear', 'Shoes', 'Hat', 'Accessory'];

export const ClosetSection: React.FC<ClosetSectionProps> = ({
    closet,
    totalItems,
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
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    t,
}) => {
    const visibleClosetItems = showAllClosetItems ? closet : closet.slice(0, maxVisibleItems);

    return (
        <section className={`${t.bgMain} p-6 rounded-3xl shadow-sm border ${t.borderMain} min-h-[400px] transition-all duration-300`}>
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <h2 className={`text-xl font-bold ${t.textMain} flex items-center gap-2`}>
                        <span className={`${t.iconBgAlt} p-2 rounded-lg`}>👗</span> My Closet
                        <span className={`text-sm font-normal ${t.textSub} ml-2`}>({totalItems})</span>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            theme={gender}
                            onClick={() => setShowCategoryPicker(true)}
                            variant="secondary"
                            isLoading={isGeneratingItem}
                            className="text-[10px] py-1.5 px-3"
                        >
                            ✨ Generate
                        </Button>
                        <Button theme={gender} onClick={startCamera} variant="outline" className="text-[10px] py-1.5 px-3">
                            📷 Camera
                        </Button>
                        <Button
                            theme={gender}
                            onClick={() => fileInputRef.current?.click()}
                            variant="primary"
                            isLoading={isAnalyzing}
                            className="text-[10px] py-1.5 px-3"
                        >
                            + Upload
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-lg">🔍</span>
                        <input
                            type="text"
                            placeholder="Search color, category, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 rounded-2xl border ${t.borderMain} bg-white/50 focus:bg-white focus:outline-none focus:ring-2 ${gender === 'girl' ? 'focus:ring-rose-200' : 'focus:ring-blue-200'} transition-all text-sm font-medium`}
                        />
                    </div>
                </div>

                <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide no-scrollbar">
                    {FILTER_CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 ${activeFilter === cat
                                ? (gender === 'girl' ? 'bg-rose-500 border-rose-500 text-white shadow-md' : 'bg-blue-500 border-blue-500 text-white shadow-md')
                                : (gender === 'girl' ? 'bg-white border-rose-100 text-rose-400 hover:border-rose-200' : 'bg-white border-blue-100 text-blue-400 hover:border-blue-200')
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*"
                multiple
            />

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
            {
                closet.length > maxVisibleItems && (
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
                )
            }
        </section >
    );
};
