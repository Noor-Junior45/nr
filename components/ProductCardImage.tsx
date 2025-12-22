import React, { useState, useEffect } from 'react';

export const ProductCardImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className = "" }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [triedAi, setTriedAi] = useState(false);

    // Update state if prop changes
    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
        setTriedAi(false);
        setIsLoaded(false);
    }, [src]);

    const handleError = () => {
        if (!triedAi) {
            // First failure: Try generating an AI image for the product
            const cleanName = encodeURIComponent(alt.trim());
            // Using Pollinations AI for dynamic generation without API key
            const aiUrl = `https://image.pollinations.ai/prompt/medicine%20${cleanName}%20product%20packaging%20white%20background%20high%20quality?width=400&height=400&nologo=true`;
            setImgSrc(aiUrl);
            setTriedAi(true);
            setIsLoaded(false); // Reset load state to show spinner while AI image loads
        } else {
            // Second failure (AI image failed): Show generic fallback
            setHasError(true);
            setIsLoaded(true); // Stop loading spinner
        }
    };

    // Generic fallback placeholder
    const fallbackSrc = "https://lh3.googleusercontent.com/a-/ALV-UjW16NO-HcOCgjkAneSgknSZdMMp2TPGJ0qlrjqsiXALg1VuaQ0=s265-w265-h265";

    return (
        <div className={`relative w-full h-full flex items-center justify-center bg-gray-50 overflow-hidden ${className}`}>
            {/* Loading Spinner */}
            <div 
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
            >
                <div className="w-8 h-8 border-2 border-medical-200 border-t-medical-500 rounded-full animate-spin"></div>
            </div>
            
            <img 
                src={hasError ? fallbackSrc : imgSrc} 
                alt={alt} 
                loading="lazy"
                decoding="async"
                onLoad={() => setIsLoaded(true)}
                onError={handleError}
                className={`w-full h-full object-contain transform transition-all duration-700 ease-in-out mix-blend-multiply ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-sm'} ${hasError ? 'p-6 opacity-90' : ''}`} 
            />
        </div>
    );
};