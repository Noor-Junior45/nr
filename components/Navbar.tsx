import React, { useState, useEffect } from 'react';

interface NavbarProps {
    wishlistCount?: number;
    onOpenWishlist?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ wishlistCount = 0, onOpenWishlist }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeLink, setActiveLink] = useState('#home');

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    const navLinks = [
        { name: 'Home', href: '#home' },
        { name: 'About', href: '#about' },
        { name: 'Products', href: '#products' },
        { name: 'Services', href: '#services' },
        { name: 'Tips', href: '#health-tips' },
        { name: 'FAQ', href: '#faq' },
        { name: 'Contact', href: '#contact' },
    ];

    // Scroll Spy to update active link
    useEffect(() => {
        const handleScroll = () => {
            // Adjusted offset for smaller navbar
            const scrollPosition = window.scrollY + 140; 

            // Find current section
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
        // Initial check
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className="bg-white fixed w-full z-50 transition-all duration-300 animate-slide-down shadow-md border-b border-gray-100">
            {/* Reduced vertical padding from py-3 to py-1 */}
            <div className="container mx-auto px-4 py-2 flex flex-col">
                
                {/* ROW 1: Logo & Mobile Toggle */}
                <div className="w-full flex justify-between items-center relative mb-1">
                    <a href="#home" className="flex items-center gap-3 group py-1">
                        {/* 3D Logo Effect */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-medical-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <img 
                                src="https://lh3.googleusercontent.com/a-/ALV-UjW16NO-HcOCgjkAneSgknSZdMMp2TPGJ0qlrjqsiXALg1VuaQ0=s265-w265-h265" 
                                alt="New Lucky Pharma Logo" 
                                className="relative h-10 md:h-12 w-auto object-contain rounded group-hover:rotate-12 transition-transform duration-500 shadow-sm z-10"
                            />
                        </div>
                        {/* 3D Text Effect - Updated to Green */}
                        <span className="text-xl md:text-3xl font-extrabold tracking-tight leading-tight whitespace-nowrap drop-shadow-sm">
                            <span className="text-medical-700">New Lucky Pharma</span> <span className="text-medical-500"></span>
                        </span>
                    </a>

                    <div className="flex items-center gap-3">
                        {/* Wishlist Button (Always Visible) */}
                        <button 
                            onClick={onOpenWishlist}
                            className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors group"
                            title="View Wishlist"
                            aria-label="View Wishlist"
                        >
                            <i className="fas fa-heart text-xl text-gray-400 group-hover:text-red-500 transition-colors"></i>
                            {wishlistCount > 0 && (
                                <span className="absolute top-1 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm animate-scale-up">
                                    {wishlistCount}
                                </span>
                            )}
                        </button>

                        {/* Mobile Menu Button - Visible ONLY on small screens (< md) */}
                        <button 
                            onClick={toggleMenu}
                            className="md:hidden text-gray-700 focus:outline-none p-2 hover:bg-gray-100 rounded-xl transition shadow-sm border border-transparent hover:border-gray-200"
                            aria-label="Toggle menu"
                        >
                            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
                        </button>
                    </div>
                </div>

                {/* ROW 2: Desktop/Tablet Menu - Right Aligned */}
                {/* INCREASED TEXT SIZE HERE: text-sm md:text-base lg:text-lg */}
                <div className="hidden md:flex justify-end items-center w-full animate-fade-in border-t border-gray-100 pt-1">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 font-semibold text-gray-600">
                        {navLinks.map((link) => (
                            <a 
                                key={link.name}
                                href={link.href} 
                                className={`relative group py-2 text-sm md:text-base lg:text-lg tracking-tight transition-all duration-300 ${activeLink === link.href ? 'text-medical-700 font-bold' : 'hover:text-medical-600 hover:scale-105'}`}
                            >
                                <span className="relative z-10">{link.name}</span>
                                {/* 3D Underline Effect */}
                                <span className={`absolute bottom-1 left-0 h-1 bg-medical-500/30 rounded-full transition-all duration-300 blur-[1px] ${activeLink === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                                <span className={`absolute bottom-1 left-0 h-0.5 bg-medical-600 rounded-full transition-all duration-300 ${activeLink === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                            </a>
                        ))}
                        
                        {/* Directions - Updated to look like other links */}
                        <a 
                            href="#map-location" 
                            className={`relative group py-2 text-sm md:text-base lg:text-lg tracking-tight transition-all duration-300 hover:text-medical-600 hover:scale-105`}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <i className="fas fa-map-marker-alt"></i> 
                                <span>Directions</span>
                            </span>
                            {/* 3D Underline Effect */}
                            <span className="absolute bottom-1 left-0 h-1 bg-medical-500/30 rounded-full transition-all duration-300 blur-[1px] w-0 group-hover:w-full"></span>
                            <span className="absolute bottom-1 left-0 h-0.5 bg-medical-600 rounded-full transition-all duration-300 w-0 group-hover:w-full"></span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown - Solid Background */}
            <div 
                className={`md:hidden bg-white border-t border-gray-100 absolute w-full left-0 top-full transform transition-all duration-300 origin-top z-40 shadow-xl ${isMobileMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}
            >
                <div className="p-4 flex flex-col space-y-2">
                    {navLinks.map((link) => (
                        <a 
                            key={link.name}
                            href={link.href}
                            onClick={closeMenu}
                            className={`block py-3 px-4 rounded-xl transition font-bold text-base ${activeLink === link.href ? 'bg-medical-50 text-medical-700 shadow-inner' : 'text-gray-700 hover:bg-gray-50 hover:text-medical-600 hover:shadow-sm'}`}
                        >
                            {link.name}
                        </a>
                    ))}
                    <a 
                        href="#map-location"
                        onClick={closeMenu}
                        className="block py-3 px-4 rounded-xl transition font-bold text-base text-gray-700 hover:bg-gray-50 hover:text-medical-600 hover:shadow-sm flex items-center gap-2"
                    >
                        <i className="fas fa-map-marked-alt text-medical-600"></i> Directions
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;