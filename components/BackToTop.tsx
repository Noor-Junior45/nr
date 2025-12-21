import React, { useState, useEffect, useRef } from 'react';

const BackToTop: React.FC = () => {
    const [shouldShow, setShouldShow] = useState(false);
    const [isIdle, setIsIdle] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            
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

    return (
        <button
            onClick={scrollToTop}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            className={`fixed bottom-48 right-11 z-[80] transition-all duration-500 ease-in-out transform border-none outline-none focus:outline-none active:scale-90 select-none
            ${isVisible ? 'translate-y-0 opacity-40 scale-100 hover:opacity-100' : 'translate-y-12 opacity-0 pointer-events-none scale-75'}`}
            aria-label="Back to Top"
            title="Go to Home"
        >
            {/* Minimalist Angle/Chevron Sign (Samsung-style) - No background box */}
            <div className="relative flex flex-col items-center justify-center">
                <i className={`fas fa-angle-up text-4xl transition-all duration-300 ${isHovered ? 'text-gray-800 -translate-y-2' : 'text-gray-500'}`}></i>
                
                {/* Subtle double angle for that premium One UI feel */}
                <i className={`fas fa-angle-up text-4xl absolute transition-all duration-300 ${isHovered ? 'text-gray-800/20 translate-y-1' : 'text-gray-500/10 translate-y-2'}`}></i>

                {/* Optional subtle glow on hover */}
                {isHovered && <div className="absolute inset-[-10px] bg-gray-400/5 blur-xl rounded-full -z-20"></div>}
            </div>
        </button>
    );
};

export default BackToTop;