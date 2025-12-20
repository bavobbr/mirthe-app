
import React from 'react';
import { Gender } from '../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  theme?: Gender;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className, 
  theme = 'girl',
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95";
  
  const themes = {
    girl: {
      primary: "bg-rose-600 text-white hover:bg-rose-700 shadow-md hover:shadow-lg",
      secondary: "bg-pink-100 text-pink-900 hover:bg-pink-200 border border-pink-200",
      outline: "border-2 border-rose-600 text-rose-600 hover:bg-rose-50",
      ghost: "text-gray-600 hover:bg-gray-100"
    },
    boy: {
      primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg",
      secondary: "bg-sky-100 text-sky-900 hover:bg-sky-200 border border-sky-200",
      outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
      ghost: "text-gray-600 hover:bg-gray-100"
    }
  };

  return (
    <button 
      className={`${baseStyles} ${themes[theme][variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : children}
    </button>
  );
};
