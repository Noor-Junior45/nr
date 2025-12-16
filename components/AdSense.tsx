import React, { useEffect, useRef, useState } from 'react';

interface AdSenseProps {
    className?: string;
    style?: React.CSSProperties;
    client?: string;
    slot: string;
    format?: string;
    responsive?: string;
    layoutKey?: string;
}

const AdSense: React.FC<AdSenseProps> = ({ 
    className = "", 
    style = { display: 'block' }, 
    client = "ca-pub-5865716270182311", 
    slot, 
    format = "auto", 
    responsive = "true",
    layoutKey
}) => {
    const adRef = useRef<HTMLModElement>(null);
    const [isAdLoaded, setIsAdLoaded] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        // If state says loaded, do nothing
        if (isAdLoaded) return;

        // Check if the DOM element actually thinks it's filled (handling StrictMode remounts)
        if (adRef.current && adRef.current.innerHTML.length > 0) {
             setIsAdLoaded(true);
             return;
        }

        let intervalId: any;

        const pushAd = () => {
            try {
                if (adRef.current && adRef.current.getAttribute('data-ad-status') === 'filled') {
                    setIsAdLoaded(true);
                    return;
                }

                const w = window as any;
                if (!w.adsbygoogle) {
                    w.adsbygoogle = [];
                }
                w.adsbygoogle.push({});
                setIsAdLoaded(true);
            } catch (e: any) {
                if (e?.message === 'Script error.' || e?.toString().indexOf('Script error') !== -1) return;
                console.warn("AdSense push warning:", e);
            }
        };

        let attempts = 0;
        intervalId = setInterval(() => {
            attempts++;
            // Check visibility and width. 
            // Matched Content ads require a non-zero width container to calculate layout.
            if (adRef.current && adRef.current.isConnected && adRef.current.offsetWidth > 0) {
                clearInterval(intervalId);
                pushAd();
            } else if (attempts > 50) { 
                // Timeout after 5s. 
                clearInterval(intervalId);
                // CRITICAL FIX: If width is still 0, we DO NOT push.
                // Forcing push on 0 width causes "Invalid responsive width" error.
                // We simply abort loading this specific ad slot until next refresh.
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
             {/* Ensure container is not zero width */}
             <div className="bg-white/30 backdrop-blur-sm min-h-[100px] rounded-xl overflow-hidden w-full">
                 <ins className="adsbygoogle"
                     ref={adRef}
                     // Force block and 100% width to assist layout calculation
                     style={{ display: 'block', width: '100%', ...style }}
                     data-ad-client={client}
                     data-ad-slot={slot}
                     data-ad-format={format}
                     data-full-width-responsive={responsive}
                     data-ad-layout-key={layoutKey}
                ></ins>
             </div>
        </div>
    );
};

export default AdSense;