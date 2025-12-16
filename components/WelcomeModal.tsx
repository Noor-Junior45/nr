import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const WelcomeModal: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    const showModal = () => {
        setShouldRender(true);
        setTimeout(() => setIsVisible(true), 100);
    };

    useEffect(() => {
        // 1. Initial Check
        const consent = localStorage.getItem('cookie_consent');
        
        if (consent) {
            // Re-apply existing choice
            const adState = consent === 'granted' ? 'granted' : 'denied';
            if (typeof window.gtag === 'function') {
                window.gtag('consent', 'update', {
                    'ad_storage': adState,
                    'ad_user_data': adState,
                    'ad_personalization': adState,
                    'analytics_storage': 'granted'
                });
            }
        } else {
            // No consent yet, show modal
            showModal();
        }

        // 2. Listener for Re-opening (e.g. from Footer)
        const handleOpenEvent = () => showModal();
        window.addEventListener('openConsentModal', handleOpenEvent);

        return () => window.removeEventListener('openConsentModal', handleOpenEvent);
    }, []);

    const updateConsent = (granted: boolean) => {
        const adState = granted ? 'granted' : 'denied';
        
        localStorage.setItem('cookie_consent', adState);
        
        if (typeof window.gtag === 'function') {
            window.gtag('consent', 'update', {
                'ad_storage': adState,
                'ad_user_data': adState,
                'ad_personalization': adState,
                'analytics_storage': 'granted'
            });
        }
    };

    const handleAccept = () => {
        updateConsent(true);
        handleClose();
    };

    const handleDecline = () => {
        updateConsent(false);
        handleClose();
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => setShouldRender(false), 300);
    };

    // Handle Mobile Back Button
    useEffect(() => {
        if (isVisible) {
            window.history.pushState(null, '', window.location.href);
            const handlePopState = () => handleClose();
            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }
    }, [isVisible]);

    if (!shouldRender) return null;

    return (
        <div 
            className={`fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-sm bg-black/60 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div className={`bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative transition-all duration-300 ${isVisible ? 'scale-100 animate-popup-in' : 'scale-95 opacity-0'}`}>
                {/* Close button acts as 'Reject' or just dismiss */}
                <button 
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none transition bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
                    aria-label="Dismiss"
                >
                    <i className="fas fa-times"></i>
                </button>

                <div className="text-center pt-2">
                    <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-4 text-medical-600 animate-bounce">
                        <i className="fas fa-cookie-bite text-3xl"></i>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to<br />New Lucky Pharma!</h3>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                        We use cookies to deliver personalized advertisements.
                    </p>

                    <div className="space-y-3">
                        <button 
                            onClick={handleAccept}
                            className="btn-shine block w-full py-3 bg-medical-600 hover:bg-medical-700 text-white font-bold rounded-xl shadow-lg transition transform hover:-translate-y-1 relative overflow-hidden"
                        >
                            Accept Ads & Continue
                        </button>
                        <button 
                            onClick={handleDecline}
                            className="block w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition"
                        >
                            Reject Ads
                        </button>
                    </div>

                    <p className="mt-4 text-[10px] text-gray-400">
                        Your data is safe with us. We respect your privacy.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;