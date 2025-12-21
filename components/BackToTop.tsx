import React, { useState, useEffect, useRef } from 'react';

const BackToTop: React.FC = () => {
    const [shouldShow, setShouldShow] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isIdle, setIsIdle] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            setScrollProgress(scrolled);

            if (winScroll > 300) {
                setShouldShow(true);
            } else {
                setShouldShow(false);
            }

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

    const scrollToPreviousSection = () => {
        const sectionIds = ['map-location', 'contact', 'faq', 'health-tips', 'services', 'tools', 'products', 'about', 'home'];
        const currentScroll = window.scrollY;
        const buffer = 50; 

        const targets = sectionIds
            .map(id => document.getElementById(id))
            .filter(el => el !== null) as HTMLElement[];
            
        const sectionsAbove = targets.filter(el => el.offsetTop < currentScroll - buffer);
        sectionsAbove.sort((a, b) => b.offsetTop - a.offsetTop);
        
        if (sectionsAbove.length > 0) {
            sectionsAbove[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const isVisible = shouldShow && (!isIdle || isHovered);

    return (
        <button
            onClick={scrollToPreviousSection}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`fixed bottom-36 right-8 z-40 w-12 h-12 flex items-center justify-center transition-all duration-500 ease-in-out transform border-none outline-none focus:outline-none focus:ring-0 active:scale-90
            ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 pointer-events-none scale-75'}`}
            aria-label="Go up"
            title="Go to previous section"
        >
            {/* Minimalist filling arrow */}
            <div className="relative w-10 h-10 flex items-center justify-center overflow-visible">
                {/* Background (Grey) Arrow - Always Visible */}
                <i className="fas fa-arrow-up text-3xl text-gray-300 absolute transition-colors duration-300 group-hover:text-gray-400"></i>
                
                {/* Filling (Green) Arrow using clip-path */}
                <div 
                    className="absolute inset-0 flex items-center justify-center overflow-hidden transition-all duration-300 ease-out pointer-events-none"
                    style={{ 
                        clipPath: `inset(${100 - scrollProgress}% 0 0 0)`,
                    }}
                >
                    <i className="fas fa-arrow-up text-3xl text-medical-600 drop-shadow-[0_0_5px_rgba(22,163,74,0.3)]"></i>
                </div>

                {/* Subtle Hover Pulse Glow */}
                <div className={`absolute inset-[-15px] rounded-full bg-medical-500/10 blur-xl transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
            </div>
        </button>
    );
};

export default BackToTop;