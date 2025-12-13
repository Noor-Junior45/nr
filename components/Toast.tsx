import React from 'react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    onViewWishlist?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, onViewWishlist }) => {
    return (
        <div 
            className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[110] transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}
        >
            <div className="bg-gray-900/95 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-gray-700">
                <i className="fas fa-check-circle text-green-400"></i>
                <span className="font-medium text-sm">{message}</span>
                {onViewWishlist && (
                    <button 
                        onClick={onViewWishlist}
                        className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors ml-2"
                    >
                        View
                    </button>
                )}
            </div>
        </div>
    );
};

export default Toast;