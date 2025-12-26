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
        <header className="py-10 text-center relative">
            <button
                onClick={onOpenAbout}
                className={`absolute top-10 right-0 px-4 py-2 rounded-full border border-current text-[10px] uppercase font-black tracking-widest ${t.textSub} hover:opacity-100 opacity-40 transition-all hover:bg-white/50`}
            >
                About
            </button>
            <h1 className={`text-5xl font-bold ${t.textMain} mb-2 hand-drawn`}>Dressed by Mirthe</h1>
            <p className={`${t.textSub} text-lg font-medium`}>Your closet. Smarter outfits</p>
        </header>
    );
};
