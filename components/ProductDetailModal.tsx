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

    const askAI = (e: React.MouseEvent) => {
        e.stopPropagation();
        const event = new CustomEvent('ask-ai', { 
            detail: { productName: product.name, description: product.description } 
        });
        window.dispatchEvent(event);
        onClose();
    };

    const isAiResult = product.id > 100000; // Heuristic for AI items

    // Updated WhatsApp Link Logic
    const getWhatsAppLink = () => {
        const phoneNumber = "919798881368";
        // Pre-fill text with medicine name as requested
        const message = `Hello New Lucky Pharma, I want to check the availability of: ${product.name}`;
        return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    };

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
                <div className="w-full md:w-5/12 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white relative flex items-center justify-center p-6 md:p-12 min-h-[300px] md:h-full">
                     {/* Background Blob */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white rounded-full mix-blend-overlay blur-3xl opacity-50"></div>
                     
                     <div className="relative z-10 w-full max-w-[300px] aspect-square drop-shadow-2xl transform transition-transform duration-500 hover:scale-105">
                        <ProductCardImage src={product.image} alt={product.name} className="rounded-2xl" />
                     </div>

                     {/* AI Badge on Image */}
                     {isAiResult && (
                        <div className="absolute top-6 left-6 bg-indigo-600/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 border border-white/20">
                            <i className="fas fa-robot animate-pulse"></i>
                            <span>AI Generated Result</span>
                        </div>
                     )}
                </div>

                {/* Right: Details Panel */}
                <div className="w-full md:w-7/12 bg-white flex flex-col h-full overflow-hidden">
                    
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                        
                        {/* Badges Row */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            {product.category && (
                                <span className="px-3 py-1 rounded-full bg-medical-50 text-medical-700 text-xs font-bold uppercase tracking-wider border border-medical-100">
                                    {product.category}
                                </span>
                            )}
                            {product.isPrescriptionRequired ? (
                                <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider border border-red-100 flex items-center gap-1">
                                    <i className="fas fa-file-prescription"></i> Prescription Required
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold uppercase tracking-wider border border-green-100 flex items-center gap-1">
                                    <i className="fas fa-check-circle"></i> OTC Product
                                </span>
                            )}
                        </div>

                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{product.name}</h2>
                        
                        <p className="text-gray-600 text-lg leading-relaxed mb-8 border-l-4 border-medical-200 pl-4">
                            {product.description}
                        </p>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 gap-6 mb-8">
                            {/* Composition Block - Only shows if data exists */}
                            {product.composition && (
                                <div className="bg-teal-50/50 rounded-2xl p-5 border border-teal-100">
                                    <div className="flex items-center gap-3 mb-2 text-teal-700 font-bold">
                                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                                            <i className="fas fa-flask text-sm"></i>
                                        </div>
                                        Composition
                                    </div>
                                    <p className="text-gray-700 text-sm ml-11 font-medium">{product.composition}</p>
                                </div>
                            )}

                            {product.usage && (
                                <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                                    <div className="flex items-center gap-3 mb-2 text-blue-700 font-bold">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <i className="fas fa-pills text-sm"></i>
                                        </div>
                                        Usage
                                    </div>
                                    <p className="text-gray-700 text-sm ml-11">{product.usage}</p>
                                </div>
                            )}

                            {product.sideEffects && (
                                <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100">
                                    <div className="flex items-center gap-3 mb-2 text-orange-700 font-bold">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                            <i className="fas fa-exclamation-triangle text-sm"></i>
                                        </div>
                                        Side Effects
                                    </div>
                                    <p className="text-gray-700 text-sm ml-11">{product.sideEffects}</p>
                                </div>
                            )}

                            {product.precautions && product.precautions.length > 0 && (
                                <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100">
                                    <div className="flex items-center gap-3 mb-2 text-red-700 font-bold">
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                            <i className="fas fa-shield-alt text-sm"></i>
                                        </div>
                                        Precautions
                                    </div>
                                    <ul className="text-gray-700 text-sm ml-11 list-disc list-outside pl-4 space-y-1">
                                        {product.precautions.map((p, i) => (
                                            <li key={i}>{p}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Medical Disclaimer - Beige & Dark Brown with Reduced Density (Opacity) */}
                        <div className="mt-8 p-5 bg-[#fff8e1]/40 backdrop-blur-md rounded-2xl border border-[#ffe0b2]/60 text-base font-medium text-[#5d4037] leading-relaxed shadow-sm">
                            <p className="font-bold text-[#3e2723] mb-2 flex items-center gap-2 text-lg">
                                <i className="fas fa-exclamation-circle text-[#8d6e63]"></i> Medical Disclaimer:
                            </p>
                            The information provided is for educational purposes only and does not constitute medical advice. 
                            Always consult a qualified healthcare professional before starting any medication or treatment. 
                            New Lucky Pharma is not responsible for any side effects or misuse of products.
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 md:p-6 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] z-20 flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={onToggleWishlist}
                            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 group ${isWishlisted ? 'bg-red-50 text-red-500 border border-red-200 shadow-inner' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                        >
                            <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart text-xl transition-transform ${isAnimating ? 'animate-heartbeat' : 'group-hover:scale-110'}`}></i>
                            <span>{isWishlisted ? 'Saved' : 'Save'}</span>
                        </button>

                        <button 
                            onClick={askAI}
                            className="flex-1 py-4 px-6 rounded-xl font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            <i className="fas fa-robot text-xl group-hover:rotate-12 transition-transform"></i>
                            <span>Ask AI</span>
                        </button>

                        <a 
                            href={getWhatsAppLink()} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-[2] py-4 px-6 rounded-xl font-bold bg-medical-600 text-white hover:bg-medical-700 transition-all duration-300 shadow-lg shadow-medical-500/30 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 btn-shine"
                        >
                            <i className="fab fa-whatsapp text-2xl"></i>
                            <span>Check Availability</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;