import React, { useState, useEffect, useRef } from 'react';

const BackToTop: React.FC = () => {
    const [shouldShow, setShouldShow] = useState(false);
    const [isIdle, setIsIdle] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            // Show button when page is scrolled down 300px
            if (window.scrollY > 300) {
                setShouldShow(true);
            } else {
                setShouldShow(false);
            }

            // User is active (scrolling), so not idle
            setIsIdle(false);
            
            // Clear existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Set new timeout to hide button after 2.5 seconds of inactivity
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

    const scrollToPreviousSection = () => {
        // Define key sections in reverse order (bottom to top)
        const sectionIds = ['map-location', 'contact', 'faq', 'health-tips', 'services', 'tools', 'products', 'about', 'home'];
        
        const currentScroll = window.scrollY;
        
        // Buffer to ensure we find the section strictly above the current view area
        const buffer = 50; 

        // Get all elements that exist on the page
        const targets = sectionIds
            .map(id => document.getElementById(id))
            .filter(el => el !== null) as HTMLElement[];
            
        // Filter for sections that are physically above the current scroll position
        const sectionsAbove = targets.filter(el => el.offsetTop < currentScroll - buffer);
        
        // Sort them by offsetTop descending so the first element is the one closest to us (immediately above)
        sectionsAbove.sort((a, b) => b.offsetTop - a.offsetTop);
        
        if (sectionsAbove.length > 0) {
            // Scroll to the nearest section above
            sectionsAbove[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Determine visibility:
    // 1. Must be scrolled down past threshold (shouldShow)
    // 2. AND (Must be active/scrolling OR Mouse is hovering the button)
    const isVisible = shouldShow && (!isIdle || isHovered);

    return (
        <button
            onClick={scrollToPreviousSection}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            // Alignment: right-8 (32px) centers it relative to chatbot
            // Position: bottom-28 (above chatbot)
            // Design: 3D Ball effect using gradients and shadows
            // Faded effect: opacity-60 by default, hover:opacity-100
            className={`fixed bottom-28 right-8 z-40 w-14 h-14 rounded-full 
            bg-gradient-to-br from-white via-gray-50 to-gray-200
            shadow-[0_8px_20px_rgba(0,0,0,0.25),inset_0_-3px_8px_rgba(0,0,0,0.1),inset_0_3px_8px_rgba(255,255,255,0.8)] 
            border border-white/50
            text-medical-600 transition-all duration-500 ease-in-out transform flex items-center justify-center 
            hover:scale-110 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(22,163,74,0.3),inset_0_-3px_8px_rgba(0,0,0,0.1)]
            active:scale-95
            ${isVisible ? 'translate-y-0 opacity-60 hover:opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}
            aria-label="Go to previous section"
            title="Go Up One Section"
        >
            <i className="fas fa-arrow-up text-xl drop-shadow-sm font-bold"></i>
        </button>
    );
};

export default BackToTop;