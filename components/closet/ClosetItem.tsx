import React from 'react';
import { ClothingItem, Gender } from '../../types';
import { ImageWithFallback } from '../ImageWithFallback';

interface ClosetItemProps {
    item: ClothingItem;
    gender: Gender;
    onSelect: (item: ClothingItem) => void;
    onRemove: (id: string) => void;
    t: {
        bgCardAccent: string;
        borderAccent: string;
        hoverBorder: string;
        bgBadgeStrong?: string; // Some themes might use different badges
    };
}

export const ClosetItem: React.FC<ClosetItemProps> = ({
    item,
    gender,
    onSelect,
    onRemove,
    t,
}) => {
    const isGirl = gender === 'girl';

    return (
        <div
            onClick={() => onSelect(item)}
            className={`group relative ${t.bgCardAccent} rounded-2xl overflow-hidden aspect-square border ${t.borderAccent} ${t.hoverBorder} transition-all shadow-sm cursor-pointer active:scale-95`}
        >
            <ImageWithFallback
                theme={gender}
                src={item.url}
                alt={item.description}
                className="w-full h-full object-contain bg-white"
            />
            <div className={`absolute inset-0 ${isGirl ? 'bg-rose-950/50' : 'bg-blue-950/50'} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 backdrop-blur-[2px]`}>
                <p className={`text-white text-[10px] uppercase font-black tracking-widest ${isGirl ? 'bg-rose-600/60' : 'bg-blue-600/60'} px-2 py-0.5 rounded w-fit mb-1`}>
                    {item.category}
                </p>
                <p className="text-white text-[10px] truncate font-medium">{item.description}</p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(item.id);
                    }}
                    className="absolute top-2 right-2 bg-white/20 hover:bg-red-500 rounded-full p-1.5 transition-colors shadow-lg z-10"
                >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
