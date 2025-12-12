import React, { useState, useEffect } from 'react';

const BackToTop: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button when page is scrolled down 300px
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg border border-medical-100 text-medical-600 transition-all duration-500 ease-in-out transform flex items-center justify-center hover:bg-medical-50 hover:shadow-xl hover:scale-110 hover:-translate-y-1 group ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll to top"
            title="Back to Top"
        >
            <i className="fas fa-arrow-up text-lg transition-transform duration-300 group-hover:-translate-y-0.5"></i>
        </button>
    );
};

export default BackToTop;