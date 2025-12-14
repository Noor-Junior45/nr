import React, { useEffect, useState } from 'react';

const WelcomeModal: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [timeLeft, setTimeLeft] = useState(3); // 3 seconds timer

    useEffect(() => {
        let interval: any;
        let closeTimer: any;

        // Delay initial showing
        const timer = setTimeout(() => {
            setShouldRender(true);
            requestAnimationFrame(() => {
                setIsVisible(true);
                
                // Start countdown after modal appears
                interval = setInterval(() => {
                    setTimeLeft((prev) => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            // Trigger close slightly after 0 to show 0
                            closeTimer = setTimeout(() => handleClose(), 500);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            });
        }, 1500);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
            clearTimeout(closeTimer);
        };
    }, []);

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
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className={`bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative transition-all duration-300 ${isVisible ? 'scale-100 animate-popup-in' : 'scale-95 opacity-0'}`}>
                <button 
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none transition bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
                >
                    <i className="fas fa-times"></i>
                </button>

                <div className="text-center pt-2">
                    <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-4 text-medical-600 animate-bounce">
                        <i className="fas fa-hand-holding-medical text-3xl"></i>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to<br />New Lucky Pharma!</h3>
                    <p className="text-gray-600 mb-6 text-sm">
                        Your trusted health partner in Hanwara. We are open 7 days a week to serve you with genuine medicines.
                    </p>

                    <div className="space-y-3">
                        <button 
                            onClick={handleClose}
                            className="btn-shine block w-full py-3 bg-medical-600 hover:bg-medical-700 text-white font-bold rounded-xl shadow-lg transition transform hover:-translate-y-1 relative overflow-hidden"
                        >
                            <span className="relative z-10">Browse Website ({timeLeft}s)</span>
                            <div 
                                className="absolute left-0 bottom-0 h-1 bg-white/30 transition-all duration-1000 ease-linear"
                                style={{ width: `${(timeLeft / 3) * 100}%` }}
                            ></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;