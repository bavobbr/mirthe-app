import React from 'react';

interface HeaderProps {
    onOpenAbout: () => void;
    t: {
        textMain: string;
        textSub: string;
    };
}

export const Header: React.FC<HeaderProps> = ({ t, onOpenAbout }) => {
    return (
        <header className="py-6 sm:py-10 text-center relative flex flex-col items-center">
            <h1 className={`text-3xl sm:text-5xl font-bold ${t.textMain} mb-2 hand-drawn`}>Dressed by Mirthe</h1>
            <div className="flex items-center gap-2">
                <p className={`${t.textSub} text-sm sm:text-lg font-medium`}>Your closet. Smarter outfits</p>
                <button
                    onClick={onOpenAbout}
                    className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full border border-current text-[10px] sm:text-xs font-black ${t.textSub} hover:opacity-100 opacity-30 transition-all hover:bg-white/50 cursor-pointer`}
                    title="About this app"
                >
                    i
                </button>
            </div>
        </header>
    );
};
