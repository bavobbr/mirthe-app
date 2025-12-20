
import React, { useState } from 'react';
import { Gender } from '../types';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackIcon?: string;
  theme?: Gender;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  alt, 
  className, 
  fallbackIcon = '✨',
  theme = 'girl',
  ...props 
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const themeClasses = theme === 'girl' 
    ? "bg-rose-50 text-rose-200 border-rose-100 text-rose-300" 
    : "bg-blue-50 text-blue-200 border-blue-100 text-blue-300";

  const spinnerClass = theme === 'girl' ? "border-rose-200 border-t-rose-500" : "border-blue-200 border-t-blue-500";

  // Extract filename from path for helpful error message
  // Fix: Handle case where src might be typed as string | Blob | undefined
  const fileName = typeof src === 'string' ? src.split('/').pop() || 'image' : 'image';

  if (error || !src) {
    return (
      <div className={`${className} flex flex-col items-center justify-center border-2 border-dashed ${themeClasses} p-2 text-center`}>
        <span className="text-xl mb-1">{fallbackIcon}</span>
        <span className="text-[7px] uppercase font-black tracking-widest opacity-80 leading-tight">
          Missing Asset:<br/>
          <span className="text-gray-500 lowercase font-mono">{fileName}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {loading && (
        <div className={`absolute inset-0 animate-pulse flex items-center justify-center ${theme === 'girl' ? 'bg-rose-50' : 'bg-blue-50'}`}>
          <div className={`w-4 h-4 border-2 rounded-full animate-spin ${spinnerClass}`}></div>
        </div>
      )}
      <img
        {...props}
        src={typeof src === 'string' ? src : undefined}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </div>
  );
};
