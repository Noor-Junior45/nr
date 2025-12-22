import React, { useState, useEffect, useRef } from 'react';

const BackToTop: React.FC = () => {
    const [shouldShow, setShouldShow] = useState(false);
    const [scrollPercent, setScrollPercent] = useState(0);
    const [isIdle, setIsIdle] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            setScrollPercent(scrolled);

            // Show button after scrolling down 300px
            if (winScroll > 300) {
                setShouldShow(true);
            } else {
                setShouldShow(false);
            }

            // Hide button after 2.5s of inactivity to keep UI clean
            setIsIdle(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setIsIdle(true);
            }, 2500);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Button is visible if user has scrolled down and is either moving or hovering
    const isVisible = shouldShow && (!isIdle || isHovered);

    // Dynamic color logic: transition from gray to medical green based on scroll progress
    // We'll use this in the inline style for more granular control if needed, 
    // but classes work well for fixed steps.
    const getIconColorClass = () => {
        if (isHovered) return 'text-medical-600';
        if (scrollPercent > 80) return 'text-medical-500';
        if (scrollPercent > 50) return 'text-medical-400';
        return 'text-gray-400';
    };

    const getGlowColorClass = () => {
        if (scrollPercent > 80) return 'bg-medical-400/20';
        if (scrollPercent > 50) return 'bg-medical-300/10';
        return 'bg-gray-400/5';
    };

    return (
        <button
            onClick={scrollToTop}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            className={`fixed bottom-48 right-11 z-[80] transition-all duration-500 ease-in-out transform border-none outline-none focus:outline-none active:scale-90 select-none
            ${isVisible ? 'translate-y-0 opacity-60 scale-100 hover:opacity-100' : 'translate-y-12 opacity-0 pointer-events-none scale-75'}`}
            aria-label="Back to Top"
            title="Go to Home"
        >
            {/* Minimalist Angle/Chevron Sign (Samsung-style) - No background box */}
            <div className="relative flex flex-col items-center justify-center">
                <i className={`fas fa-angle-up text-4xl transition-all duration-500 ${getIconColorClass()} ${isHovered ? '-translate-y-2' : ''}`}></i>
                
                {/* Subtle double angle for that premium One UI feel */}
                <i className={`fas fa-angle-up text-4xl absolute transition-all duration-500 ${isHovered ? 'text-medical-600/20 translate-y-1' : 'opacity-10 translate-y-2'}`}></i>

                {/* Optional dynamic glow that increases with scroll depth */}
                <div 
                    className={`absolute inset-[-15px] blur-2xl rounded-full -z-20 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'} ${getGlowColorClass()}`}
                ></div>
            </div>
        </button>
    );
};

export default BackToTop;