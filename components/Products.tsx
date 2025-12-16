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

    // Track which product ID has just been copied/shared
    const [copiedId, setCopiedId] = useState<number | null>(null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeQuickView();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Effect to handle Deep Linked Search Queries
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const deepSearchQuery = params.get('search_query');

        if (deepSearchQuery) {
            setSearchQuery(deepSearchQuery);
            performSearch(deepSearchQuery);
            // Scroll to products section
            setTimeout(() => {
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    }, []);

    const performSearch = async (query: string) => {
        if (!query.trim()) {
            setDisplayedProducts(productList);
            setHasSearched(false);
            setIsAiResult(false);
            setIsSearching(false);
            return;
        }

        setHasSearched(true);
        setIsSearching(true);
        setIsAiResult(false);

        const lowerQuery = query.toLowerCase();
        const localResults = productList.filter(p => 
            p.name.toLowerCase().includes(lowerQuery) || 
            p.description.toLowerCase().includes(lowerQuery) ||
            p.category?.toLowerCase().includes(lowerQuery)
        );

        if (localResults.length > 0) {
            setDisplayedProducts(localResults);
            setIsSearching(false);
        } else {
            const aiResults = await searchProducts(query);
            setDisplayedProducts(aiResults);
            setIsAiResult(true);
            setIsSearching(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Blur input to hide keyboard on mobile
        const inputElement = document.getElementById('product-search-input');
        if (inputElement) inputElement.blur();
        
        // Return search bar to normal page flow
        setIsFocused(false);
        
        await performSearch(searchQuery);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setDisplayedProducts(productList);
        setHasSearched(false);
        setIsAiResult(false);
        setIsSearching(false);
        setIsFocused(false);
        
        // Clear URL param if it exists
        const url = new URL(window.location.href);
        if (url.searchParams.has('search_query')) {
            url.searchParams.delete('search_query');
            window.history.replaceState({}, '', url);
        }
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

    const handleShare = async (product: Product, e: React.MouseEvent) => {
        e.stopPropagation();
        
        // Construct Deep Link
        const origin = window.location.origin;
        // If ID < 100000, it's a static product -> Share ID (App.tsx handles opening modal)
        // If ID > 100000, it's dynamic/AI -> Share Search Query (Products.tsx handles performing search)
        const isStatic = product.id < 100000;
        const queryParam = isStatic 
            ? `product_id=${product.id}` 
            : `search_query=${encodeURIComponent(product.name)}`;
            
        const shareUrl = `${origin}/?${queryParam}`;
        
        const shareData = {
            title: `New Lucky Pharma: ${product.name}`,
            text: `Check out ${product.name} at New Lucky Pharma!\n${product.description}\n`,
            url: shareUrl
        };

        const copyToClipboard = async () => {
            try {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                setCopiedId(product.id);
                setTimeout(() => setCopiedId(null), 2000);
            } catch (err) {
                console.error('Clipboard failed', err);
            }
        };

        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                await copyToClipboard();
            }
        } catch (err) {
            await copyToClipboard();
        }
    };

    return (
        <section id="products" className="scroll-mt-32 min-h-[800px] transition-all duration-500 relative py-16 bg-gradient-to-br from-emerald-100 via-medical-100 to-medical-50" aria-label="Products Section">
            
            {/* Search Focus Backdrop - Visible ONLY when focused on MOBILE */}
            {/* Removed background color to avoid dimming effect, kept z-index to handle click-out */}
            <div 
                className={`fixed inset-0 z-[55] transition-opacity duration-300 md:hidden ${isFocused ? 'block' : 'hidden'}`}
                onClick={() => setIsFocused(false)}
                aria-hidden="true"
            ></div>

            {/* Content Container z-10 */}
            <div className="container mx-auto px-4 relative z-10">
                
                {/* Section Title - Always visible */}
                <div className="text-center mb-8 reveal">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 drop-shadow-sm">Popular Products & Medicines</h2>
                    <p className="text-gray-700 max-w-2xl mx-auto font-medium">
                        We offer a wide range of pharmaceutical products, from daily essentials to specific treatments.
                    </p>
                </div>

                {/* 
                    Search Container Architecture:
                    1. Outer Wrapper: Maintains vertical flow.
                    2. Placeholder: Hidden by default. Shown ONLY on Mobile when Focused to prevent jump.
                    3. Search Bar: 
                       - Mobile & Focused: Fixed below navbar (top-28 approx 112px).
                       - Desktop OR Not Focused: Relative/Static.
                */}
                <div className="w-full mb-8 relative z-20">
                    
                    {/* Placeholder div to prevent layout shift on mobile when search bar becomes fixed */}
                    <div className={`w-full h-[88px] md:hidden ${isFocused ? 'block' : 'hidden'}`}></div>

                    <div className={`
                        w-full transition-all duration-300
                        ${isFocused 
                            ? 'fixed top-28 left-0 right-0 p-4 bg-white shadow-xl z-[70] border-b border-gray-100 md:shadow-none md:bg-transparent md:static md:p-0 md:z-auto md:border-none' 
                            : 'relative z-20'
                        }
                    `}>
                        <div className={`
                            w-full max-w-2xl mx-auto transition-all duration-300
                            ${isFocused ? 'transform scale-100' : 'hover:scale-[1.01]'}
                        `}>
                            <form onSubmit={handleSearch} className={`relative group w-full ${isFocused ? '' : 'shadow-lg rounded-full'}`}>
                                <label htmlFor="product-search-input" className="sr-only">Search medicines, products, or symptoms</label>
                                
                                {/* Glow Effect - Removed blur-md when focused to prevent any bleeding issues */}
                                <div className={`absolute inset-0 bg-gradient-to-r from-medical-400 to-teal-400 rounded-full blur-md opacity-30 group-hover:opacity-60 transition duration-500 ${isSearching ? 'animate-pulse' : ''} ${isFocused ? 'hidden' : ''}`}></div>
                                
                                <input 
                                    id="product-search-input"
                                    type="text"
                                    enterKeyHint="search"
                                    value={searchQuery}
                                    onFocus={() => setIsFocused(true)}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search medicines, products, or symptoms..." 
                                    className={`w-full bg-white border-2 text-gray-800 text-lg rounded-full py-4 pl-6 pr-24 focus:outline-none transition-all duration-300 relative z-10 placeholder-gray-500 ${isFocused ? 'border-medical-500 shadow-none ring-2 ring-medical-100' : 'border-transparent'}`}
                                    aria-label="Search medicines, products, or symptoms"
                                />

                                {/* Clear 'X' Button */}
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearSearch();
                                        }}
                                        className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:bg-red-500 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-all z-20"
                                    >
                                        <i className="fas fa-times text-sm"></i>
                                    </button>
                                )}

                                {/* Cancel Button (Mobile Focus Only) */}
                                {isFocused && !searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setIsFocused(false)}
                                        className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-500 bg-gray-100 rounded-full px-3 py-1 text-xs font-bold md:hidden z-20"
                                    >
                                        Cancel
                                    </button>
                                )}
                                
                                <button 
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-medical-600 text-white w-11 h-11 rounded-full flex items-center justify-center hover:bg-medical-700 transition-all z-20 shadow-md group-hover:scale-105 active:scale-95"
                                    disabled={isSearching}
                                >
                                    {isSearching ? (
                                        <i className="fas fa-spinner fa-spin"></i>
                                    ) : (
                                        <i className="fas fa-search"></i>
                                    )}
                                </button>
                            </form>
                            
                            {/* AI Result Text */}
                            {isAiResult && !isSearching && (
                                <div className="flex items-center justify-center gap-2 mt-3 text-xs font-semibold text-gray-500 animate-fade-in">
                                    <i className="fab fa-google text-lg text-medical-600"></i>
                                    <span>Results generated by AI</span>
                                </div>
                            )}
                        </div>

                        {/* Back Button */}
                        {hasSearched && !isFocused && (
                            <div className="mt-6 flex justify-center animate-fade-in z-10">
                                <button 
                                    onClick={clearSearch}
                                    className="bg-white/90 backdrop-blur-sm text-gray-600 border border-gray-200 hover:bg-white hover:text-medical-600 hover:border-medical-200 px-6 py-2.5 rounded-full shadow-sm hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-semibold text-sm group transform hover:-translate-y-0.5"
                                >
                                    <i className="fas fa-arrow-left text-xs"></i> Back to All Products
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div 
                    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-700 ${isSearching ? 'opacity-50 blur-sm' : 'opacity-100 blur-0'}`}
                    role="region"
                >
                    {displayedProducts.length > 0 ? (
                        displayedProducts.map((product, index) => (
                            <div 
                                key={product.id} 
                                className={`glass-card rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 ease-out overflow-hidden flex flex-col h-full group bg-white border border-medical-100/50 transform hover:-translate-y-2 hover:scale-[1.02] animate-fade-in-up ${isAiResult ? 'border-indigo-100 ring-2 ring-indigo-50' : ''}`}
                                style={{ animationDelay: `${(index % 5) * 100}ms` }}
                            >
                                <div 
                                    className="overflow-hidden h-56 p-6 relative cursor-pointer bg-gradient-to-br from-medical-50 to-white group-hover:from-medical-100 group-hover:to-medical-50 transition-colors duration-300 flex items-center justify-center border-b border-medical-50"
                                    onClick={() => openQuickView(product)}
                                >
                                    <ProductCardImage src={product.image} alt={product.name} />
                                    
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleWishlist(product);
                                        }}
                                        className={`absolute top-3 left-3 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm active:scale-75 ${
                                            wishlist.includes(product.id) 
                                            ? 'bg-red-50 text-red-500 shadow-md shadow-red-100 border border-red-200 scale-110' 
                                            : 'bg-white/90 text-gray-300 hover:text-red-500 hover:bg-red-50 border border-medical-100 hover:scale-110'
                                        }`}
                                    >
                                        <i className={`${wishlist.includes(product.id) ? 'fas fa-heart text-red-500 animate-heartbeat-red' : 'far fa-heart'} text-lg`}></i>
                                    </button>

                                    <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                                        {isAiResult && (
                                            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 animate-scale-up">
                                                <i className="fas fa-robot"></i> AI Suggested
                                            </span>
                                        )}
                                        {product.isPrescriptionRequired && (
                                            <div className="bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md border border-red-700 flex items-center gap-1 cursor-help">
                                                <i className="fas fa-file-prescription"></i> Requires Rx
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] group-hover:backdrop-blur-[2px] transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <button className="bg-white/95 text-gray-800 px-5 py-2.5 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:bg-medical-600 hover:text-white font-bold text-sm flex items-center justify-center hover:scale-110">
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

                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={(e) => handleShare(product, e)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                                    copiedId === product.id 
                                                    ? 'bg-green-100 text-green-600' 
                                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                                }`}
                                            >
                                                <i className={`fas ${copiedId === product.id ? 'fa-check' : 'fa-share-alt'} text-sm`}></i>
                                            </button>

                                            <button 
                                                onClick={(e) => askAI(product, e)}
                                                className="w-8 h-8 rounded-full bg-medical-50 text-medical-600 flex items-center justify-center hover:bg-medical-100 transition-colors"
                                            >
                                                <i className="fas fa-robot text-sm"></i>
                                            </button>
                                        </div>
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

                {/* No Delivery Notice Banner */}
                <div className="mt-12 glass-panel border-l-4 border-l-orange-500 p-4 rounded-r-lg shadow-sm reveal flex items-start md:items-center animate-fade-in relative z-10 bg-white/60">
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