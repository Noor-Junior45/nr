import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { productList } from '../data/products';
import { ProductCardImage } from './ProductCardImage';

interface WishlistModalProps {
    isOpen: boolean;
    onClose: () => void;
    wishlistIds: number[];
    customProducts: Product[];
    onToggleWishlist: (product: Product) => void;
    onProductClick: (product: Product) => void;
}

const WishlistModal: React.FC<WishlistModalProps> = ({ isOpen, onClose, wishlistIds, customProducts, onToggleWishlist, onProductClick }) => {
    const [copyButtonText, setCopyButtonText] = useState("Copy List");

    // Handle Mobile Back Button
    useEffect(() => {
        if (isOpen) {
            window.history.pushState(null, '', window.location.href);
            const handlePopState = () => onClose();
            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Combine static and custom products
    const allProducts = [...productList, ...customProducts];
    
    // Filter based on wishlist IDs
    const wishlistItems = allProducts.filter(p => wishlistIds.includes(p.id));

    // Generate WhatsApp Message
    const generateWhatsAppLink = () => {
        const phoneNumber = "919798881368";
        
        if (wishlistItems.length === 0) {
            return `https://wa.me/${phoneNumber}`;
        }

        const intro = "Hello New Lucky Pharma, I would like to inquire about the availability of the following items from my wishlist:";
        const itemList = wishlistItems.map((item, index) => `${index + 1}. ${item.name}`).join('\n');
        
        const fullMessage = `${intro}\n\n${itemList}`;
        
        return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(fullMessage)}`;
    };

    // Copy List Functionality
    const handleCopyList = async () => {
        if (wishlistItems.length === 0) return;

        const intro = `Inquiry for New Lucky Pharma (${new Date().toLocaleDateString()}):`;
        const itemList = wishlistItems.map((item, index) => `${index + 1}. ${item.name}`).join('\n');
        const textToCopy = `${intro}\n\n${itemList}`;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopyButtonText("Copied!");
            setTimeout(() => setCopyButtonText("Copy List"), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
            <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col animate-popup-in">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <i className="fas fa-heart text-red-500"></i> My Wishlist
                    </h2>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
                    {wishlistItems.length > 0 ? (
                        <div className="space-y-4">
                            {wishlistItems.map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={() => onProductClick(item)}
                                    className="bg-white p-4 rounded-2xl shadow-sm flex gap-4 items-center border border-gray-100 hover:border-medical-200 transition-colors cursor-pointer group"
                                >
                                    <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 relative">
                                        <ProductCardImage src={item.image} alt={item.name} className="p-2 transition-transform duration-300 group-hover:scale-110" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate group-hover:text-medical-700 transition-colors">{item.name}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-1">{item.category}</p>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-green-600 font-bold">
                                            <i className="fas fa-check-circle"></i> In Stock
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onToggleWishlist(item); }}
                                            className="w-10 h-10 rounded-full border border-red-100 text-red-500 hover:bg-red-50 flex items-center justify-center transition-all duration-300 z-10 hover:scale-110 active:scale-90 hover:shadow-md hover:rotate-12"
                                            title="Remove"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                        <span className="text-xs text-gray-400 group-hover:text-medical-600 font-medium">View</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <i className="far fa-heart text-3xl"></i>
                            </div>
                            <h3 className="text-gray-900 font-bold mb-1">Your wishlist is empty</h3>
                            <p className="text-gray-500 text-sm">Save medicines you want to check later.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {wishlistItems.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-white flex gap-3 flex-col sm:flex-row">
                         <button
                            onClick={handleCopyList}
                            className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-center hover:bg-gray-200 transition flex items-center justify-center gap-2 hover:shadow-md border border-transparent hover:border-gray-200"
                        >
                            <i className={`fas ${copyButtonText === "Copied!" ? "fa-check text-green-600" : "fa-copy"}`}></i> 
                            {copyButtonText}
                        </button>
                        <a 
                            href={generateWhatsAppLink()} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-[2] bg-medical-600 text-white font-bold py-3 rounded-xl text-center hover:bg-medical-700 transition shadow-lg shadow-medical-500/30 flex items-center justify-center gap-2 btn-shine transform hover:-translate-y-0.5"
                        >
                            <i className="fab fa-whatsapp text-lg"></i> Inquire on WhatsApp
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistModal;