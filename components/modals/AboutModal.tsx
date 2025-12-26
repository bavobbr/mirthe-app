import React from 'react';
import { Gender } from '../../types';

interface AboutModalProps {
    gender: Gender;
    onClose: () => void;
    t: {
        bgMain: string;
        borderMain: string;
        textMain: string;
        textSub: string;
        textStrong: string;
        textAccent: string;
        borderAccent: string;
    };
}

export const AboutModal: React.FC<AboutModalProps> = ({ gender, onClose, t }) => {
    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] flex items-center justify-center p-4 transition-all"
            onClick={onClose}
        >
            <div
                className={`${t.bgMain} w-full max-w-md rounded-[40px] p-8 sm:p-10 shadow-3xl border ${t.borderMain} animate-in fade-in zoom-in duration-300 transform-gpu`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center mb-8">
                    <h3 className={`text-3xl font-bold ${t.textMain} hand-drawn mb-4`}>About Dressed by Mirthe</h3>
                    <p className={`${t.textAccent} text-sm font-medium leading-relaxed italic`}>
                        An AI-powered closet and outfit generator. Keep track of your wardrobe, get weather-aware outfit suggestions, and visualize them with AI-generated illustrations.
                    </p>
                </div>

                <div className="space-y-6 mb-10">
                    <div className="flex flex-col items-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Designer</p>
                        <a
                            href="https://www.instagram.com/mirthebruylandt/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-lg font-bold flex items-center gap-2 transition-transform hover:scale-105 ${gender === 'girl' ? 'text-rose-500' : 'text-blue-500'}`}
                        >
                            📸 Mirthe Bruylandt
                        </a>
                    </div>

                    <div className="flex flex-col items-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Developer</p>
                        <a
                            href="https://www.linkedin.com/in/bavobruylandt/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-lg font-bold flex items-center gap-2 transition-transform hover:scale-105 ${gender === 'girl' ? 'text-rose-500' : 'text-blue-500'}`}
                        >
                            👔 Bavo Bruylandt
                        </a>
                    </div>

                    <div className="flex flex-col items-center pt-4 border-t border-dashed border-gray-200">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Open Source</p>
                        <a
                            href="https://github.com/bavobbr/mirthe-app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm font-medium flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity ${t.textStrong}`}
                        >
                            💻 View Code on GitHub
                        </a>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className={`w-full py-4 rounded-3xl border-2 font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${gender === 'girl' ? 'bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100' : 'bg-blue-50 border-blue-100 text-blue-500 hover:bg-blue-100'}`}
                >
                    Close
                </button>
            </div>
        </div>
    );
};
