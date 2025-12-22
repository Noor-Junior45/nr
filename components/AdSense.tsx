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
    const containerRef = useRef<HTMLDivElement>(null);
    const [isAdLoaded, setIsAdLoaded] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (isAdLoaded) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                initializeAd();
                observer.disconnect();
            }
        }, { rootMargin: '200px' });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        const initializeAd = () => {
            try {
                const w = window as any;
                if (!w.adsbygoogle) w.adsbygoogle = [];
                w.adsbygoogle.push({});
                setIsAdLoaded(true);
            } catch (e: any) {
                console.warn("AdSense push warning:", e);
            }
        };

        return () => observer.disconnect();
    }, [isAdLoaded]);

    return (
        <div 
            ref={containerRef}
            className={`glass-panel p-1 rounded-2xl overflow-hidden my-8 mx-auto w-full max-w-4xl relative shadow-sm border border-white/40 ${className}`}
        >
             <div className="absolute top-0 right-0 bg-gray-200/60 backdrop-blur-md text-[9px] text-gray-500 px-2 py-0.5 rounded-bl-lg z-10 border-l border-b border-white/50">
                Advertisement
             </div>
             <div className="bg-white/30 backdrop-blur-sm min-h-[100px] rounded-xl overflow-hidden w-full flex items-center justify-center">
                 {!isAdLoaded && (
                     <div className="text-[10px] text-gray-400 font-medium">Loading Ad...</div>
                 )}
                 <ins className="adsbygoogle"
                     ref={adRef}
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