import { useMemo } from 'react';
import { Gender } from '../types';

export const useTheme = (gender: Gender) => {
    const t = useMemo(() => {
        const isGirl = gender === 'girl';
        return {
            textMain: isGirl ? 'text-rose-950' : 'text-blue-950',
            textSub: isGirl ? 'text-rose-800/70' : 'text-blue-800/70',
            textAccent: isGirl ? 'text-rose-900' : 'text-blue-900',
            textStrong: isGirl ? 'text-rose-600' : 'text-blue-600',
            bgMain: isGirl ? 'bg-white' : 'bg-slate-50',
            bgCard: isGirl ? 'bg-rose-50' : 'bg-blue-50',
            bgCardAccent: isGirl ? 'bg-pink-50' : 'bg-sky-50',
            bgBadge: isGirl ? 'bg-pink-100' : 'bg-sky-100',
            bgBadgeDark: isGirl ? 'bg-rose-100' : 'bg-blue-100',
            borderMain: isGirl ? 'border-rose-100' : 'border-blue-100',
            borderAccent: isGirl ? 'border-pink-100' : 'border-sky-100',
            borderStrong: isGirl ? 'border-rose-500' : 'border-blue-500',
            iconBg: isGirl ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700',
            iconBgAlt: isGirl ? 'bg-pink-100 text-pink-700' : 'bg-sky-100 text-sky-700',
            shadowColor: isGirl ? 'shadow-rose-200' : 'shadow-blue-200',
            loader: isGirl ? 'border-rose-100 border-t-rose-500' : 'border-blue-100 border-t-blue-500',
            errorBg: isGirl ? 'bg-rose-100 border-rose-200 text-rose-900' : 'bg-blue-100 border-blue-200 text-blue-900',
            progressBar: isGirl ? 'bg-rose-500' : 'bg-blue-500',
            hoverBorder: isGirl ? 'hover:border-pink-300' : 'hover:border-sky-300',
            btnHover: isGirl ? 'hover:border-pink-200' : 'hover:border-sky-200',
        };
    }, [gender]);

    return t;
};
