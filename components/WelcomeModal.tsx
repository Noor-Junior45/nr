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
            <div className={`bg-white rounded-2xl shadow-2xl max-w-[320px] w-full p-5 relative transition-all duration-300 ${isVisible ? 'scale-100 animate-popup-in' : 'scale-95 opacity-0'}`}>
                {/* Compact Content */}

                <div className="text-center">
                    <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-3 text-medical-600 animate-bounce">
                        <i className="fas fa-cookie-bite text-xl"></i>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">Welcome to<br />New Lucky Pharma!</h3>
                    
                    <div className="text-left mb-4 border border-gray-100 bg-gray-50 p-3 rounded-lg">
                        <p className="text-[11px] text-gray-600 mb-2 leading-relaxed">
                            We use cookies to improve your experience. By accepting, you agree to:
                        </p>
                        <ul className="text-[10px] text-gray-500 space-y-1">
                            <li className="flex items-center gap-1.5">
                                <i className="fas fa-check-circle text-medical-500 text-[10px]"></i>
                                <span>Personalized offers & suggestions</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                                <i className="fas fa-check-circle text-medical-500 text-[10px]"></i>
                                <span>Better site performance</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={handleDecline}
                            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-sm transition"
                        >
                            Reject
                        </button>
                        <button 
                            onClick={handleAccept}
                            className="btn-shine flex-1 py-2.5 bg-medical-600 hover:bg-medical-700 text-white font-bold rounded-xl shadow-md text-sm transition transform hover:-translate-y-0.5 relative overflow-hidden"
                        >
                            Accept
                        </button>
                    </div>

                    <p className="mt-3 text-[9px] text-gray-400">
                        Secure & Private. No data sold.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;