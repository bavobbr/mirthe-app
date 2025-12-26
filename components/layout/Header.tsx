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
            <h1 className={`text-5xl font-bold ${t.textMain} mb-2 hand-drawn`}>Mirthe's closet app</h1>
            <p className={`${t.textSub} text-lg font-medium`}>Your personal safe fashion boutique</p>
        </header>
    );
};
