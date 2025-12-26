import React from 'react';

interface HeaderProps {
    t: {
        textMain: string;
        textSub: string;
    };
}

export const Header: React.FC<HeaderProps> = ({ t }) => {
    return (
        <header className="py-10 text-center">
            <h1 className={`text-5xl font-bold ${t.textMain} mb-2 hand-drawn`}>Dressed by Mirthe</h1>
            <p className={`${t.textSub} text-lg font-medium`}>Your closet. Smarter outfits</p>
        </header>
    );
};
