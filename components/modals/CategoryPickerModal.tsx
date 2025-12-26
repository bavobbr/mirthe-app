import React from 'react';
import { Category, Gender } from '../../types';

interface CategoryPickerModalProps {
    gender: Gender;
    onSelectCategory: (category: Category) => void;
    onClose: () => void;
    t: {
        bgMain: string;
        borderMain: string;
        textMain: string;
        textSub: string;
        borderAccent: string;
        bgCardAccent: string;
        textAccent: string;
        textStrong: string;
    };
}

const CATEGORIES: { id: Category; icon: string; label: string }[] = [
    { id: 'Shirt', icon: '👕', label: 'Shirts' },
    { id: 'Sweater', icon: '🧶', label: 'Sweaters' },
    { id: 'Bottom', icon: '👖', label: 'Bottoms' },
    { id: 'Skirt', icon: '👗', label: 'Skirts' },
    { id: 'Dress', icon: '👘', label: 'Dresses' },
    { id: 'Outerwear', icon: '🧥', label: 'Outerwear' },
    { id: 'Shoes', icon: '👟', label: 'Shoes' },
    { id: 'Hat', icon: '👒', label: 'Hats' },
    { id: 'Accessory', icon: '👜', label: 'Accessories' },
];

export const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({
    gender,
    onSelectCategory,
    onClose,
    t,
}) => {
    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all"
            onClick={onClose}
        >
            <div
                className={`${t.bgMain} w-full max-w-lg rounded-[40px] p-8 sm:p-10 shadow-3xl border ${t.borderMain} animate-in fade-in zoom-in duration-300 transform-gpu`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center mb-8">
                    <h3 className={`text-3xl font-bold ${t.textMain} hand-drawn mb-2`}>Dream Designer</h3>
                    <p className={`${t.textSub} text-sm font-medium italic`}>Select a category for your AI-crafted piece</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {CATEGORIES.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelectCategory(item.id)}
                            className={`group py-4 px-2 rounded-3xl border-2 font-bold transition-all active:scale-90 ${t.borderAccent} ${t.bgCardAccent} ${t.textAccent} hover:border-rose-400 hover:bg-white hover:shadow-xl flex flex-col items-center gap-2 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-rose-200`}
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${gender === 'girl' ? 'from-rose-100/10' : 'from-blue-100/10'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                            />
                            <span className="text-3xl relative z-10 transition-transform group-hover:scale-125 duration-300 transform-gpu">
                                {item.icon}
                            </span>
                            <span className="text-[9px] uppercase tracking-[0.2em] relative z-10 font-black opacity-80">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className={`w-full mt-8 pt-6 text-xs font-black uppercase tracking-widest ${t.textSub} hover:${t.textStrong} transition-colors border-t ${t.borderAccent}`}
                >
                    Close Menu
                </button>
            </div>
        </div>
    );
};
