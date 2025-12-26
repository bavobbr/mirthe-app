import React from 'react';
import { ClothingItem, Gender } from '../../types';
import { ImageWithFallback } from '../ImageWithFallback';

interface ItemDetailModalProps {
    item: ClothingItem;
    gender: Gender;
    onClose: () => void;
    onRemove: (id: string) => void;
    t: {
        bgMain: string;
        borderMain: string;
        textMain: string;
        bgBadge: string;
        textStrong: string;
        textAccent: string;
        textSub: string;
        borderAccent: string;
    };
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
    item,
    gender,
    onClose,
    onRemove,
    t,
}) => {
    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all"
            onClick={onClose}
        >
            <div
                className={`${t.bgMain} w-full max-w-2xl rounded-[40px] overflow-hidden shadow-3xl border ${t.borderMain} animate-in fade-in zoom-in duration-300 transform-gpu flex flex-col md:flex-row`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-full md:w-1/2 aspect-square bg-white flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-rose-50">
                    <ImageWithFallback
                        theme={gender}
                        src={item.url}
                        alt={item.description}
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
                <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-between">
                    <div>
                        <span className={`${t.bgBadge} ${t.textStrong} text-[10px] uppercase font-black tracking-[0.2em] px-3 py-1 rounded-full mb-4 inline-block`}>
                            {item.category}
                        </span>
                        <h3 className={`text-3xl font-bold ${t.textMain} hand-drawn mb-6 leading-tight`}>Item Details</h3>
                        <p className={`${t.textAccent} text-lg font-medium leading-relaxed italic`}>
                            "{item.description}"
                        </p>
                        {item.color && (
                            <div className="mt-6 flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full border border-black/10"
                                    style={{ backgroundColor: item.color.toLowerCase() }}
                                />
                                <span className={`${t.textSub} text-sm font-bold uppercase tracking-widest`}>{item.color}</span>
                            </div>
                        )}
                    </div>

                    <div className={`mt-10 pt-6 border-t ${t.borderAccent} flex flex-col gap-2`}>
                        <button
                            onClick={() => {
                                onRemove(item.id);
                                onClose();
                            }}
                            className="w-full py-4 text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                        >
                            Remove from Closet
                        </button>
                        <button
                            onClick={onClose}
                            className={`w-full py-4 text-xs font-black uppercase tracking-widest ${t.textStrong} hover:opacity-70 transition-opacity`}
                        >
                            Back to Closet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
