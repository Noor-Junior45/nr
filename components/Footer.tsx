import React from 'react';

const Footer: React.FC = () => {
    const openCookieSettings = (e: React.MouseEvent) => {
        e.preventDefault();
        // Dispatch custom event to open the modal
        window.dispatchEvent(new Event('openConsentModal'));
    };

    return (
        <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800 animate-fade-in">
            <div className="container mx-auto px-4 text-center">
                <p className="mb-2">&copy; {new Date().getFullYear()} New Lucky Pharma. All rights reserved.</p>
                <p className="text-sm mb-4">Serving the Hanwara community with pride.</p>
                
                <div className="text-xs text-gray-600 flex justify-center gap-4">
                    <button 
                        onClick={openCookieSettings}
                        className="hover:text-medical-400 transition-colors underline decoration-dotted"
                    >
                        Cookie Preferences
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;