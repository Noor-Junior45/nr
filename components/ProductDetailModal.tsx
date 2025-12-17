import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { ProductCardImage } from './ProductCardImage';
import { productList } from '../data/products';

interface ProductDetailModalProps {
    product: Product;
    onClose: () => void;
    isWishlisted: boolean;
    onToggleWishlist: () => void;
    preventHistoryPush?: boolean;
    onSwitchProduct?: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
    product, 
    onClose, 
    isWishlisted, 
    onToggleWishlist,
    preventHistoryPush = false,
    onSwitchProduct
}) => {
    
    const [isAnimating, setIsAnimating] = useState(false);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

    // Handle Mobile Back Button
    useEffect(() => {
        // If opened via deep link (preventHistoryPush=true), App.tsx has already set the history stack correctly.
        // We only push a new state if opened via in-app click.
        if (!preventHistoryPush) {
            window.history.pushState(null, '', window.location.href);
        }

        const handlePopState = () => onClose();
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [onClose, preventHistoryPush]);

    // Trigger animation when added to wishlist
    useEffect(() => {
        if (isWishlisted) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isWishlisted]);

    // Calculate Similar Products
    useEffect(() => {
        if (product.category) {
            const similar = productList
                .filter(p => p.category === product.category && p.id !== product.id)
                .slice(0, 3);
            setSimilarProducts(similar);
        } else {
            setSimilarProducts([]);
        }
    }, [product]);

    const askAI = (e: React.MouseEvent) => {
        e.stopPropagation();
        const event = new CustomEvent('ask-ai', { 
            detail: { productName: product.name, description: product.description } 
        });
        window.dispatchEvent(event);
        onClose();
    };

    const handleSwitch = (newProduct: Product) => {
        if (onSwitchProduct) {
            onSwitchProduct(newProduct);
            // Scroll detail pane to top
            const detailPane = document.getElementById('product-detail-pane');
            if (detailPane) detailPane.scrollTop = 0;
        }
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
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4" 
            role="dialog" 
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" 
                onClick={onClose}
            ></div>
            
            {/* Modal Container */}
            {/* Mobile: h-[75dvh] (Bottom Sheet Style) */}
            {/* Desktop: h-[70vh] (Centered Card), sm:translate-y-12 pushes it down slightly for visual balance */}
            <div className="relative glass-panel bg-white w-full h-[75dvh] sm:h-[70vh] sm:max-w-5xl rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up sm:animate-popup-in transform transition-all sm:translate-y-12">
                
                {/* Fixed Header Layer for Buttons (Always on top) */}
                <div className="absolute top-0 left-0 w-full z-50 p-4 sm:p-6 flex justify-between pointer-events-none">
                    {/* Floating Wishlist Heart Button (Upper Left) */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist();
                        }}
                        className={`pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg border transition-all duration-300 ${
                            isWishlisted 
                            ? 'bg-red-50 text-red-500 border-red-200' 
                            : 'bg-white/90 backdrop-blur text-gray-500 hover:text-red-500 border-gray-200 hover:bg-red-50'
                        }`}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                        <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart text-xl sm:text-2xl transition-transform ${isAnimating ? 'animate-heartbeat' : ''}`}></i>
                    </button>

                    {/* Close Button - Floating (Upper Right) */}
                    <button 
                        onClick={onClose} 
                        className="pointer-events-auto bg-white/90 backdrop-blur text-gray-500 hover:text-red-500 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg border border-gray-200 transition-colors hover:rotate-90 duration-300"
                        aria-label="Close modal"
                    >
                        <i className="fas fa-times text-lg sm:text-xl"></i>
                    </button>
                </div>

                {/* Main Scrollable Layout Wrapper */}
                {/* Mobile: Vertical scroll with everything. Desktop: Row with separate scroll for details */}
                <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden custom-scrollbar">
                    
                    {/* Left: Image Panel - Reduced height on mobile to show more content */}
                    <div className="w-full md:w-5/12 shrink-0 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white relative flex flex-col items-center justify-center p-6 md:p-12 min-h-[250px] md:h-full gap-4">
                        {/* Background Blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white rounded-full mix-blend-overlay blur-3xl opacity-50"></div>
                        
                        <div className="relative z-10 w-full max-w-[180px] sm:max-w-[240px] md:max-w-[260px] aspect-square drop-shadow-2xl transform transition-transform duration-500 hover:scale-105">
                            <ProductCardImage src={product.image} alt={product.name} className="rounded-2xl" />
                        </div>

                        {/* AI Badge - Improved Mobile Positioning */}
                        {isAiResult && (
                            <div className="relative md:absolute md:bottom-6 md:left-6 z-20 w-auto">
                                <span className="bg-indigo-600/95 backdrop-blur text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center justify-center gap-2 border border-white/20 animate-fade-in-up">
                                    <i className="fas fa-robot animate-pulse text-indigo-200"></i>
                                    <span>AI Generated Result</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Right: Details Panel */}
                    <div className="w-full md:w-7/12 bg-white flex flex-col md:h-full md:overflow-hidden">
                        
                        {/* Scrollable Content (Desktop Only for internal scroll, Mobile scrolls parent) */}
                        <div id="product-detail-pane" className="flex-1 p-6 md:p-8 md:overflow-y-auto custom-scrollbar">
                            
                            {/* Badges Row */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                {product.category && (
                                    <span className="px-3 py-1 rounded-full bg-medical-50 text-medical-700 text-[10px] md:text-xs font-bold uppercase tracking-wider border border-medical-100">
                                        {product.category}
                                    </span>
                                )}
                                {product.isPrescriptionRequired ? (
                                    <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] md:text-xs font-bold uppercase tracking-wider border border-red-100 flex items-center gap-1">
                                        <i className="fas fa-file-prescription"></i> Prescription Required
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] md:text-xs font-bold uppercase tracking-wider border border-green-100 flex items-center gap-1">
                                        <i className="fas fa-check-circle"></i> OTC Product
                                    </span>
                                )}
                            </div>

                            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 leading-tight">{product.name}</h2>
                            
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 border-l-4 border-medical-200 pl-4">
                                {product.description}
                            </p>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 gap-4 mb-6">
                                {/* Composition Block */}
                                {product.composition && (
                                    <div className="bg-teal-50/50 rounded-2xl p-4 border border-teal-100">
                                        <div className="flex items-center gap-3 mb-1 text-teal-700 font-bold">
                                            <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center">
                                                <i className="fas fa-flask text-xs"></i>
                                            </div>
                                            <span className="text-sm">Composition</span>
                                        </div>
                                        <p className="text-gray-700 text-xs md:text-sm ml-10 font-medium">{product.composition}</p>
                                    </div>
                                )}

                                {product.usage && (
                                    <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                                        <div className="flex items-center gap-3 mb-1 text-blue-700 font-bold">
                                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                                                <i className="fas fa-pills text-xs"></i>
                                            </div>
                                            <span className="text-sm">Usage</span>
                                        </div>
                                        <p className="text-gray-700 text-xs md:text-sm ml-10">{product.usage}</p>
                                    </div>
                                )}

                                {product.sideEffects && (
                                    <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100">
                                        <div className="flex items-center gap-3 mb-1 text-orange-700 font-bold">
                                            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
                                                <i className="fas fa-exclamation-triangle text-xs"></i>
                                            </div>
                                            <span className="text-sm">Side Effects</span>
                                        </div>
                                        <p className="text-gray-700 text-xs md:text-sm ml-10">{product.sideEffects}</p>
                                    </div>
                                )}

                                {product.precautions && product.precautions.length > 0 && (
                                    <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100">
                                        <div className="flex items-center gap-3 mb-1 text-red-700 font-bold">
                                            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                                                <i className="fas fa-shield-alt text-xs"></i>
                                            </div>
                                            <span className="text-sm">Precautions</span>
                                        </div>
                                        <ul className="text-gray-700 text-xs md:text-sm ml-10 list-disc list-outside pl-4 space-y-1">
                                            {product.precautions.map((p, i) => (
                                                <li key={i}>{p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Similar Products Section */}
                            {similarProducts.length > 0 && (
                                <div className="mb-6 border-t border-gray-100 pt-6 animate-fade-in">
                                    <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-medical-100 text-medical-600 flex items-center justify-center text-xs">
                                            <i className="fas fa-tags"></i>
                                        </div>
                                        Similar Products
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {similarProducts.map(p => (
                                            <div 
                                                key={p.id}
                                                onClick={() => handleSwitch(p)}
                                                className="border border-gray-100 rounded-xl p-2 flex gap-3 sm:flex-col sm:items-center sm:text-center hover:border-medical-300 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group bg-gray-50/30 hover:bg-white"
                                            >
                                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
                                                     <ProductCardImage src={p.image} alt={p.name} className="p-1" />
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center sm:block w-full">
                                                    <h4 className="text-xs font-bold text-gray-800 truncate group-hover:text-medical-700 transition-colors w-full">{p.name}</h4>
                                                    <p className="text-[10px] text-gray-500 truncate mt-0.5">{p.category}</p>
                                                </div>
                                                <div className="sm:hidden flex items-center justify-center text-gray-300">
                                                    <i className="fas fa-chevron-right text-xs"></i>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Medical Disclaimer */}
                            <div className="mt-6 p-4 bg-[#fff8e1]/40 backdrop-blur-md rounded-2xl border border-[#ffe0b2]/60 text-sm font-medium text-[#5d4037] leading-relaxed shadow-sm">
                                <p className="font-bold text-[#3e2723] mb-1 flex items-center gap-2 text-base">
                                    <i className="fas fa-exclamation-circle text-[#8d6e63]"></i> Medical Disclaimer:
                                </p>
                                The information provided is for educational purposes only. Always consult a qualified healthcare professional before starting any treatment.
                            </div>
                        </div>

                        {/* Footer Actions - Scrollable on Mobile, Fixed at bottom of pane on Desktop */}
                        <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] z-20 flex flex-col sm:flex-row gap-3">
                            <button 
                                onClick={askAI}
                                className="flex-1 py-3.5 px-6 rounded-xl font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-all duration-300 flex items-center justify-center gap-2 group text-sm md:text-base"
                            >
                                <i className="fas fa-robot text-lg group-hover:rotate-12 transition-transform"></i>
                                <span>Ask AI</span>
                            </button>

                            <a 
                                href={getWhatsAppLink()} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 py-3.5 px-6 rounded-xl font-bold bg-medical-600 text-white hover:bg-medical-700 transition-all duration-300 shadow-lg shadow-medical-500/30 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 btn-shine text-sm md:text-base"
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