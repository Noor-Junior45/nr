import React, { useState, useEffect, useRef } from 'react';

interface NavbarProps {
    wishlistCount?: number;
    onOpenWishlist?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ wishlistCount = 0, onOpenWishlist }) => {
    const [activeLink, setActiveLink] = useState('#home');
    const scrollRef = useRef<HTMLDivElement>(null);

    const navLinks = [
        { name: 'Home', href: '#home' },
        { name: 'About', href: '#about' },
        { name: 'Products', href: '#products' },
        { name: 'Services', href: '#services' },
        { name: 'Tips', href: '#health-tips' },
        { name: 'FAQ', href: '#faq' },
        { name: 'Contact', href: '#contact' },
        { name: 'Directions', href: '#map-location', icon: 'fas fa-map-marker-alt' },
    ];

    // Scroll Spy to update active link
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 180; // Adjusted offset for taller navbar

            for (const link of navLinks) {
                const section = document.querySelector(link.href) as HTMLElement;
                if (section) {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                    
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        setActiveLink(link.href);
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-scroll the active link into view inside the horizontal menu
    useEffect(() => {
        if (scrollRef.current) {
            const activeElement = scrollRef.current.querySelector(`a[href="${activeLink}"]`) as HTMLElement;
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeLink]);

    return (
        <nav className="fixed w-full z-50 top-0 shadow-lg flex flex-col transition-all duration-300 font-sans">
            
            {/* 
              UPPER DECK: Brand & Actions 
              Style: White (Reverted to earlier color)
            */}
            <div className="bg-white/95 backdrop-blur-md text-gray-800 py-3 px-4 relative z-20 border-b border-gray-100">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Logo Section */}
                    <a href="#home" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shadow-sm group-hover:border-medical-300 transition-all">
                             <img 
                                src="https://lh3.googleusercontent.com/p/AF1QipP_obhC3R1CKSuEqrkc1BUICL9bMcMwif6flFzK=s1360-w1360-h1020-rw" 
                                alt="New Lucky Pharma" 
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                            />
                        </div>
                        <div className="flex flex-col justify-center h-10">
                            {/* Changed to font-semibold and text-medical-600 for brighter green */}
                            <span className="font-semibold text-lg leading-none tracking-tight text-medical-600 group-hover:text-medical-700 transition-colors">
                                New Lucky Pharma
                            </span>
                        </div>
                    </a>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {/* Wishlist Button */}
                        <button 
                            onClick={onOpenWishlist}
                            className="relative p-2 group"
                            aria-label="Wishlist"
                        >
                            <div className="relative">
                                {/* Heart Color: Dark Gray default, Red when active/hover */}
                                <i className={`fas fa-heart text-2xl transition-all duration-300 ${wishlistCount > 0 ? 'text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 'text-gray-400 group-hover:text-red-500'}`}></i>
                                
                                {/* Badge */}
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg border-2 border-white animate-scale-up">
                                        {wishlistCount}
                                    </span>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* 
              LOWER DECK: Horizontal Scroll Navigation 
              Style: Light Medical Green (Clean look)
            */}
            <div className="bg-medical-50 text-gray-700 shadow-inner relative border-b border-medical-100">
                {/* Fade Gradients to indicate scrolling */}
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-medical-50 to-transparent z-10 pointer-events-none md:hidden"></div>
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-medical-50 to-transparent z-10 pointer-events-none md:hidden"></div>

                <div 
                    ref={scrollRef}
                    className="container mx-auto overflow-x-auto whitespace-nowrap scrollbar-hide py-0 px-4 flex items-center gap-2 md:gap-6"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {navLinks.map((link) => (
                        <a 
                            key={link.name}
                            href={link.href} 
                            className={`
                                relative py-3 px-2 md:px-1 text-sm md:text-base font-bold transition-all duration-300 flex-shrink-0
                                flex items-center gap-2
                                ${activeLink === link.href 
                                    ? 'text-medical-700' 
                                    : 'text-gray-500 hover:text-medical-600'}
                            `}
                        >
                            {link.icon && (
                                <i className={`${link.icon} text-xs ${activeLink === link.href ? 'text-medical-600' : 'text-gray-400 group-hover:text-medical-500'}`}></i>
                            )}
                            <span className="relative z-10">{link.name}</span>
                            
                            {/* Active Indicator (Bottom Border) - Changed to Green */}
                            {activeLink === link.href && (
                                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-medical-500 rounded-t-full shadow-sm animate-scale-up"></span>
                            )}
                        </a>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;