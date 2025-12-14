import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { ProductCardImage } from './ProductCardImage';

interface ProductDetailModalProps {
    product: Product;
    onClose: () => void;
    isWishlisted: boolean;
    onToggleWishlist: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, isWishlisted, onToggleWishlist }) => {
    
    const [isAnimating, setIsAnimating] = useState(false);

    // Handle Mobile Back Button
    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => onClose();
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [onClose]);

    // Trigger animation when added to wishlist
    useEffect(() => {
        if (isWishlisted) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isWishlisted]);

    // Derived related products (simple logic for now, or passed as prop if needed context)
    // For this isolated component, we might skip related products or strictly pass them. 
    // To keep it simple and reusable, I'll omit the related products section inside the modal 
    // or handle it if passed. For now, let's keep the core details which are most important.

    const askAI = (e: React.MouseEvent) => {
        e.stopPropagation();
        const event = new CustomEvent('ask-ai', { 
            detail: { productName: product.name, description: product.description } 
        });
        window.dispatchEvent(event);
        onClose();
    };

    const isAiResult = product.id > 100000; // Heuristic for AI items based on ID generation in geminiService

    return (
        <div 
            className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4" 
            role="dialog" 
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" 
                onClick={onClose}
            ></div>
            
            {/* Modal Container */}
            <div className="relative glass-panel bg-white w-full h-[93dvh] sm:h-[85vh] sm:max-w-6xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-slide-up sm:animate-popup-in">
                    
                {/* Close Button - Floating */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-50 bg-white/80 backdrop-blur text-gray-500 hover:text-red-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg border border-gray-100 transition-colors hover:rotate-90 duration-300"
                    aria-label="Close modal"
                >
                    <i className="fas fa-times text-lg"></i>
                </button>
    
                {/* Left: Image Panel */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white relative flex items-center justify-center p-6 md:p-12 min-h-[220px] md:min-h-full border-b md:border-b-0 md:border-r border-gray-100 order-1 flex-shrink-0">
                    {/* Badges Overlay */}
                    <div className="absolute top-6 left-6 flex flex-col gap-2 z-10 items-start">
                        {product.isPrescriptionRequired && (
                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                                <i className="fas fa-file-prescription"></i> Prescription Required
                            </span>
                        )}
                        {isAiResult ? (
                            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                                <i className="fas fa-robot"></i> AI Suggested
                            </span>
                        ) : (
                            <span className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                                <i className="fas fa-check-circle"></i> In Stock
                            </span>
                        )}
                    </div>

                    <ProductCardImage src={product.image} alt={product.name} className="w-full h-full max-h-[180px] md:max-h-[400px]" />
                </div>

                {/* Right: Content Panel */}
                <div className="w-full md:w-7/12 flex flex-col h-full bg-white relative order-2 overflow-hidden">
                    {/* Scrollable Content */}
                    <div 
                        className="flex-1 overflow-y-auto p-5 md:p-10 pb-40 md:pb-28 custom-scrollbar overscroll-contain scroll-smooth"
                    >
                        <div className="flex flex-col gap-1 mb-6">
                            <div className="flex items-center gap-2 mb-1">
                                {product.category && (
                                    <span className="text-xs font-bold text-medical-600 bg-medical-50 px-2 py-1 rounded uppercase tracking-wider">
                                        {product.category}
                                    </span>
                                )}
                                {/* Wishlist in Modal */}
                                <button
                                    onClick={onToggleWishlist}
                                    className={`ml-auto w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 shadow-sm group ${
                                        isWishlisted
                                        ? 'bg-red-50 text-red-500 border border-red-200' 
                                        : 'bg-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50'
                                    }`}
                                    title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                                >
                                    <i className={`${isWishlisted ? 'fas fa-heart text-red-500' : 'far fa-heart'} text-lg transition-transform duration-300 ${isAnimating ? 'scale-150' : (isWishlisted ? 'scale-125 drop-shadow-sm' : 'scale-100 group-hover:scale-110')}`}></i>
                                </button>
                            </div>
                            <h2 id="modal-title" className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                                {product.name}
                            </h2>
                        </div>

                        {/* Description Card */}
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-8">
                            <p className="text-gray-700 leading-relaxed text-base">
                                {product.description}
                            </p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            {/* Usage */}
                            {product.usage && (
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <i className="fas fa-capsules text-medical-500"></i> Usage
                                    </h3>
                                    <p className="text-sm text-gray-700 font-medium bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                        {product.usage}
                                    </p>
                                </div>
                            )}

                            {/* Side Effects */}
                            {product.sideEffects && (
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <i className="fas fa-exclamation-triangle text-orange-500"></i> Side Effects
                                    </h3>
                                    <p className="text-sm text-gray-700 font-medium bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                        {product.sideEffects}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Precautions */}
                        {product.precautions && product.precautions.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <i className="fas fa-shield-alt text-blue-500"></i> Safety Precautions
                                </h3>
                                <div className="grid gap-2">
                                    {product.precautions.map((precaution, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                                            <i className="fas fa-check text-blue-500 mt-0.5 text-xs"></i>
                                            <span className="text-sm text-gray-600 font-medium">{precaution}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Disclaimer */}
                        <div className="mt-4 bg-yellow-50/70 p-4 rounded-xl border border-yellow-100/50 text-yellow-800 text-xs backdrop-blur-sm flex gap-3 items-start">
                            <i className="fas fa-info-circle mt-0.5 text-lg"></i>
                            <div>
                                <p className="font-bold mb-1">Medical Disclaimer</p>
                                <p>The information provided is for educational purposes. Please consult our pharmacist or your doctor before using this medication.</p>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Footer Action Bar */}
                    <div className="border-t border-gray-100 p-4 md:p-6 bg-white/95 backdrop-blur absolute bottom-0 w-full z-20 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button 
                                onClick={askAI}
                                className="flex-1 sm:flex-none text-xs font-bold text-medical-600 bg-medical-50 hover:bg-medical-100 px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 border border-medical-100 group"
                            >
                                <i className="fas fa-robot text-lg group-hover:rotate-12 transition-transform"></i> 
                                <span>Ask AI Pharmacist</span>
                            </button>
                        </div>

                        <div className="flex gap-3 w-full sm:w-auto">
                            <a 
                                href="https://wa.me/919798881368" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex-1 sm:flex-none bg-[#25D366] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#20bd5a] transition shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2 active:scale-95 transform hover:-translate-y-0.5"
                            >
                                <i className="fab fa-whatsapp text-xl"></i> 
                                <span>Check Availability</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;