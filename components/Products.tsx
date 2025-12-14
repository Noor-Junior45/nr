import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { searchProducts } from '../services/geminiService';
import { productList } from '../data/products';
import { ProductCardImage } from './ProductCardImage';
import ProductDetailModal from './ProductDetailModal';

interface ProductsProps {
    wishlist: number[];
    toggleWishlist: (product: Product) => void;
}

const Products: React.FC<ProductsProps> = ({ wishlist, toggleWishlist }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [displayedProducts, setDisplayedProducts] = useState<Product[]>(productList);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [isAiResult, setIsAiResult] = useState(false);
    
    // New state for search focus
    const [isFocused, setIsFocused] = useState(false);
    
    // Quick View State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeQuickView();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // CRITICAL FIX: Explicitly blur the input to close mobile keyboard and prevent 
        // focus events from re-triggering the overlay immediately.
        const inputElement = document.getElementById('product-search-input');
        if (inputElement) inputElement.blur();
        
        setIsFocused(false);
        
        if (!searchQuery.trim()) {
            setDisplayedProducts(productList);
            setHasSearched(false);
            setIsAiResult(false);
            return;
        }

        setHasSearched(true);
        setIsSearching(true);
        setIsAiResult(false);

        const lowerQuery = searchQuery.toLowerCase();
        const localResults = productList.filter(p => 
            p.name.toLowerCase().includes(lowerQuery) || 
            p.description.toLowerCase().includes(lowerQuery) ||
            p.category?.toLowerCase().includes(lowerQuery)
        );

        if (localResults.length > 0) {
            setDisplayedProducts(localResults);
            setIsSearching(false);
        } else {
            const aiResults = await searchProducts(searchQuery);
            setDisplayedProducts(aiResults);
            setIsAiResult(true);
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setDisplayedProducts(productList);
        setHasSearched(false);
        setIsAiResult(false);
        setIsSearching(false);
        setIsFocused(false);
    };

    // Quick View Handlers
    const openQuickView = (product: Product) => {
        setSelectedProduct(product);
        document.body.style.overflow = 'hidden';
    };

    const closeQuickView = () => {
        setSelectedProduct(null);
        document.body.style.overflow = 'unset';
    };

    const askAI = (product: Product, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening quick view if clicked from card overlay
        // Dispatch custom event for AIChat component
        const event = new CustomEvent('ask-ai', { 
            detail: { productName: product.name, description: product.description } 
        });
        window.dispatchEvent(event);
    };

    return (
        // Reverted to Medical Green Theme (Emerald/Teal) to match "Old Green Color" request
        // Start: Emerald-100 (Matches About End) -> Via: Medical-100 -> End: Medical-50
        <section id="products" className="scroll-mt-24 min-h-[800px] transition-all duration-500 relative py-16 bg-gradient-to-br from-emerald-100 via-medical-100 to-medical-50" aria-label="Products Section">
            
            {/* Search Focus Backdrop - Fixed Z-index (40) to be BELOW Navbar (50) */}
            <div 
                className={`fixed inset-0 bg-white/60 backdrop-blur-sm z-40 transition-all duration-500 ${isFocused ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                onClick={() => setIsFocused(false)}
                aria-hidden="true"
            ></div>

            <div className="container mx-auto px-4">
                
                {/* No Delivery Notice Banner */}
                <div className="glass-panel border-l-4 border-l-orange-500 p-4 mb-8 rounded-r-lg shadow-sm reveal flex items-start md:items-center animate-fade-in relative z-10 bg-white/60">
                    <div className="flex-shrink-0 text-orange-500">
                        <i className="fas fa-store-slash text-2xl"></i>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-bold text-orange-800">Store Pickup Only</h3>
                        <p className="text-orange-700 text-sm">
                            We currently <span className="font-bold">do not offer home delivery</span>. Please visit our store in Hanwara to purchase medicines. 
                            You can check availability via WhatsApp before visiting.
                        </p>
                    </div>
                </div>

                {/* Search Container */}
                <div className={`transition-all duration-700 ease-in-out flex flex-col items-center relative z-41 ${hasSearched ? 'mt-0 mb-8' : 'mt-6 mb-16'}`}>
                    <div className="text-center mb-8 reveal">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4 drop-shadow-sm">Popular Products & Medicines</h2>
                        <p className={`text-gray-700 max-w-2xl mx-auto transition-opacity duration-500 font-medium ${hasSearched ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                            We offer a wide range of pharmaceutical products, from daily essentials to specific treatments.
                        </p>
                    </div>

                    <div className={`
                        w-full max-w-2xl transition-all duration-500 ease-out origin-top
                        ${isFocused
                            ? 'fixed top-0 left-0 right-0 w-full p-4 md:p-0 z-[60] md:relative md:top-auto md:left-auto md:transform md:scale-110' 
                            : 'relative hover:scale-[1.01]'}
                    `}>
                        <form onSubmit={handleSearch} className={`relative group w-full transition-all duration-300 ${isFocused ? 'shadow-2xl rounded-full' : ''}`} role="search">
                            <label htmlFor="product-search-input" className="sr-only">Search medicines, products, or symptoms</label>
                            
                            {/* Glow Effect - Green/Teal */}
                            <div className={`absolute inset-0 bg-gradient-to-r from-medical-400 to-teal-400 rounded-full blur-md opacity-30 group-hover:opacity-60 transition duration-500 ${isSearching ? 'animate-pulse' : ''} ${isFocused ? 'opacity-60 blur-lg scale-105' : ''}`}></div>
                            
                            <input 
                                id="product-search-input"
                                type="text"
                                enterKeyHint="search"
                                value={searchQuery}
                                onFocus={() => setIsFocused(true)}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search medicines, products, or symptoms..." 
                                className={`w-full bg-white/90 backdrop-blur-md border-2 text-gray-800 text-lg rounded-full py-4 pl-6 pr-24 shadow-lg focus:outline-none transition-all duration-300 relative z-10 placeholder-gray-500 ${isFocused ? 'border-medical-400 shadow-xl bg-white' : 'border-white/50'}`}
                                aria-label="Search medicines, products, or symptoms"
                            />

                            {/* Visible Cross Button inside Search Bar */}
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:bg-red-500 bg-gray-100/80 rounded-full w-8 h-8 flex items-center justify-center transition-all z-20 backdrop-blur-sm"
                                    aria-label="Clear search"
                                >
                                    <i className="fas fa-times text-sm"></i>
                                </button>
                            )}
                            
                            <button 
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-medical-600 text-white w-11 h-11 rounded-full flex items-center justify-center hover:bg-medical-700 transition-all z-20 shadow-md group-hover:scale-105 active:scale-95"
                                aria-label={isSearching ? "Searching..." : "Search"}
                                disabled={isSearching}
                            >
                                {isSearching ? (
                                    <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                                ) : (
                                    <i className="fas fa-search" aria-hidden="true"></i>
                                )}
                            </button>
                        </form>
                        
                        {isAiResult && !isSearching && (
                            <div className="text-center mt-2 text-xs text-gray-600 flex items-center justify-center gap-1 animate-slide-up font-medium" role="status">
                                <i className="fab fa-google text-medical-600" aria-hidden="true"></i>
                                <span>Results found via Google AI</span>
                            </div>
                        )}
                        
                        {isFocused && (
                            <button 
                                onClick={() => setIsFocused(false)}
                                className="md:hidden absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-gray-600 text-sm font-medium bg-white/90 px-4 py-1 rounded-full shadow-sm animate-fade-in-up"
                                aria-label="Close search mode"
                            >
                                <i className="fas fa-times-circle mr-1" aria-hidden="true"></i> Close
                            </button>
                        )}
                    </div>
                    
                    {/* Independent Clear Button shown below search bar when results are filtered */}
                    {hasSearched && (
                        <div className="mt-6 flex justify-center animate-fade-in z-10 relative">
                            <button 
                                onClick={clearSearch}
                                className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-bold text-sm transform hover:-translate-y-1"
                            >
                                <i className="fas fa-arrow-left"></i> Clear Search & Back to Products
                            </button>
                        </div>
                    )}
                </div>

                <div 
                    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-700 ${isSearching ? 'opacity-50 blur-sm' : 'opacity-100 blur-0'}`}
                    role="region"
                    aria-label="Search Results"
                    aria-live="polite"
                >
                    {displayedProducts.length > 0 ? (
                        displayedProducts.map((product, index) => (
                            <div 
                                key={product.id} 
                                className={`glass-card rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 ease-out overflow-hidden flex flex-col h-full group bg-white border border-medical-100/50 transform hover:-translate-y-2 hover:scale-[1.02] animate-fade-in-up ${isAiResult ? 'border-2 border-indigo-200 ring-2 ring-indigo-50 shadow-indigo-100' : ''}`}
                                style={{ animationDelay: `${(index % 5) * 100}ms` }}
                            >
                                <div 
                                    className="overflow-hidden h-56 p-6 relative cursor-pointer bg-gradient-to-br from-medical-50 to-white group-hover:from-medical-100 group-hover:to-medical-50 transition-colors duration-300 flex items-center justify-center border-b border-medical-50"
                                    onClick={() => openQuickView(product)}
                                >
                                    <ProductCardImage src={product.image} alt={product.name} />
                                    
                                    {/* Wishlist Toggle Button (Top-Left) */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleWishlist(product);
                                        }}
                                        className={`absolute top-3 left-3 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm transform hover:scale-110 active:scale-75 ${
                                            wishlist.includes(product.id) 
                                            ? 'bg-red-50 text-red-500 shadow-md shadow-red-100 border border-red-200' 
                                            : 'bg-white/90 text-gray-300 hover:text-red-500 hover:bg-red-50 border border-medical-100'
                                        }`}
                                        title={wishlist.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                                        aria-label={wishlist.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                                    >
                                        <i className={`${wishlist.includes(product.id) ? 'fas fa-heart text-red-500' : 'far fa-heart'} text-lg transition-transform duration-300 ${wishlist.includes(product.id) ? 'scale-110' : 'scale-100'}`}></i>
                                    </button>

                                    {/* Badges Overlay */}
                                    <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                                        {isAiResult && (
                                            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 animate-scale-up">
                                                <i className="fas fa-robot"></i> AI Suggested
                                            </span>
                                        )}
                                        {product.isPrescriptionRequired && (
                                            <div className="relative group/rx">
                                                <div className="bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md border border-red-700 flex items-center gap-1 cursor-help hover:bg-red-700 transition-colors">
                                                    <i className="fas fa-file-prescription"></i>
                                                    <span>Requires Rx</span>
                                                </div>
                                                
                                                {/* Tooltip */}
                                                <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-gray-900/95 backdrop-blur text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover/rx:opacity-100 group-hover/rx:visible transition-all duration-300 transform translate-y-2 group-hover/rx:translate-y-0 text-center border border-gray-700 z-50">
                                                    <div className="font-bold text-red-400 mb-1 flex items-center justify-center gap-1">
                                                        <i className="fas fa-exclamation-circle"></i> Attention
                                                    </div>
                                                    A valid doctor's prescription is required to purchase this medicine.
                                                    {/* Arrow tip */}
                                                    <div className="absolute -top-1.5 right-4 w-3 h-3 bg-gray-900/95 border-l border-t border-gray-700 transform rotate-45"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Hover Overlay with Buttons */}
                                    <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] group-hover:backdrop-blur-[2px] transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <button className="bg-white/95 text-gray-800 px-5 py-2.5 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:bg-medical-600 hover:text-white font-bold text-sm flex items-center justify-center hover:scale-110 hover:shadow-medical-500/50">
                                            <i className="fas fa-eye mr-2"></i> Quick View
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col flex-grow relative bg-white">
                                    <div className="mb-2">
                                        {product.category && (
                                            <p className="text-xs font-semibold text-medical-600 mb-1 uppercase tracking-wider">{product.category}</p>
                                        )}
                                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-medical-700 transition-colors leading-tight">{product.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed flex-grow">{product.description}</p>
                                    
                                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <button 
                                            onClick={() => openQuickView(product)}
                                            className="text-medical-700 font-bold text-xs hover:underline flex items-center"
                                        >
                                            View Details <i className="fas fa-arrow-right ml-1"></i>
                                        </button>
                                        <button 
                                            onClick={(e) => askAI(product, e)}
                                            className="w-8 h-8 rounded-full bg-medical-50 text-medical-600 flex items-center justify-center hover:bg-medical-100 transition-colors"
                                            title="Ask AI Pharmacist"
                                        >
                                            <i className="fas fa-robot text-sm"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 animate-fade-in glass-panel rounded-2xl bg-white/50" role="status">
                            <div className="text-gray-400 mb-4">
                                <i className="fas fa-search text-4xl" aria-hidden="true"></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-600">No products found</h3>
                            <p className="text-gray-500">Try searching for generic terms like "Pain killer" or "Cough syrup"</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick View Modal */}
            {selectedProduct && (
                <ProductDetailModal 
                    product={selectedProduct} 
                    onClose={closeQuickView} 
                    isWishlisted={wishlist.includes(selectedProduct.id)}
                    onToggleWishlist={() => toggleWishlist(selectedProduct)}
                />
            )}
        </section>
    );
};

export default Products;