import React, { useState } from 'react';

export const ProductCardImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className = "" }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Brand fallback logo
    const fallbackSrc = "https://lh3.googleusercontent.com/a-/ALV-UjW16NO-HcOCgjkAneSgknSZdMMp2TPGJ0qlrjqsiXALg1VuaQ0=s265-w265-h265";

    return (
        <div className={`relative w-full h-full flex items-center justify-center bg-gray-50 overflow-hidden ${className}`}>
            {/* Low-res / Loading Placeholder */}
            <div 
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
            >
                <div className="w-8 h-8 border-2 border-medical-200 border-t-medical-500 rounded-full animate-spin"></div>
            </div>
            
            <img 
                src={hasError ? fallbackSrc : src} 
                alt={alt} 
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                onError={() => {
                    setHasError(true);
                    setIsLoaded(true);
                }}
                className={`w-full h-full object-contain transform transition-all duration-700 ease-in-out mix-blend-multiply ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-sm'} ${hasError ? 'p-6 opacity-90' : ''}`} 
            />
        </div>
    );
};