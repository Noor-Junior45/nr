import React, { useEffect, useRef, useState } from 'react';

interface AdSenseProps {
    className?: string;
    style?: React.CSSProperties;
    client?: string;
    slot: string;
    format?: string;
    responsive?: string;
}

const AdSense: React.FC<AdSenseProps> = ({ 
    className = "", 
    style = { display: 'block' }, 
    client = "ca-pub-5865716270182311", // Updated client ID
    slot, 
    format = "auto", 
    responsive = "true" 
}) => {
    const adRef = useRef<HTMLModElement>(null);
    const [isAdLoaded, setIsAdLoaded] = useState(false);

    useEffect(() => {
        // Prevent running if the slot is already filled, if executed on server, or if strict mode double-invoke happened
        if (typeof window === 'undefined') return;
        if (isAdLoaded) return;

        let intervalId: any;

        const pushAd = () => {
            try {
                // Double check if already loaded to be safe
                if (adRef.current && adRef.current.getAttribute('data-ad-status') === 'filled') {
                    setIsAdLoaded(true);
                    return;
                }

                // Safely access adsbygoogle
                const w = window as any;
                if (!w.adsbygoogle) {
                    w.adsbygoogle = [];
                }
                w.adsbygoogle.push({});
                setIsAdLoaded(true);
            } catch (e: any) {
                // Squelch errors to prevent "Script error" bubbling up from AdSense internal issues
                // "Script error." is a generic error from cross-origin scripts (like Google Ads)
                if (e?.message === 'Script error.' || e?.toString().indexOf('Script error') !== -1) {
                    return;
                }
                console.warn("AdSense push warning:", e);
            }
        };

        // Poll for element width availability
        // This fixes the "No slot size for availableWidth=0" error by waiting for layout
        let attempts = 0;
        intervalId = setInterval(() => {
            attempts++;
            // Check if element exists and has width and is connected to DOM
            if (adRef.current && adRef.current.isConnected && adRef.current.offsetWidth > 0) {
                clearInterval(intervalId);
                pushAd();
            } else if (attempts > 50) { // Give up after ~5 seconds
                clearInterval(intervalId);
                // Try pushing anyway if layout detection fails, to avoid indefinite hang
                pushAd();
            }
        }, 100);

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [slot, isAdLoaded]);

    return (
        <div className={`glass-panel p-1 rounded-2xl overflow-hidden my-8 mx-auto w-full max-w-4xl relative shadow-sm border border-white/40 ${className}`}>
             <div className="absolute top-0 right-0 bg-gray-200/60 backdrop-blur-md text-[9px] text-gray-500 px-2 py-0.5 rounded-bl-lg z-10 border-l border-b border-white/50">
                Advertisement
             </div>
             {/* Removed flex from immediate parent to avoid width calculation issues. 
                 Ensured w-full is present. */}
             <div className="bg-white/30 backdrop-blur-sm min-h-[100px] rounded-xl overflow-hidden w-full">
                 <ins className="adsbygoogle"
                     ref={adRef}
                     style={style}
                     data-ad-client={client}
                     data-ad-slot={slot}
                     data-ad-format={format}
                     data-full-width-responsive={responsive}></ins>
             </div>
        </div>
    );
};

export default AdSense;