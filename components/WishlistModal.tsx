import React from 'react';
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
    if (!isOpen) return null;

    // Combine static and custom products
    const allProducts = [...productList, ...customProducts];
    
    // Filter based on wishlist IDs
    // Using a map to ensure unique products by ID if there's any potential overlap
    const wishlistItems = allProducts.filter(p => wishlistIds.includes(p.id));

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
                                            className="w-10 h-10 rounded-full border border-red-100 text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors z-10"
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
                    <div className="p-4 border-t border-gray-100 bg-white">
                        <a 
                            href="https://wa.me/919798881368" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block w-full bg-medical-600 text-white font-bold py-3 rounded-xl text-center hover:bg-medical-700 transition shadow-lg shadow-medical-500/30"
                        >
                            <i className="fab fa-whatsapp mr-2"></i> Inquire Availability
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistModal;