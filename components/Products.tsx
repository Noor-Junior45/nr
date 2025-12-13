import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { searchProducts } from '../services/geminiService';
import AdSense from './AdSense';

const productList: Product[] = [
    { 
        id: 1, 
        name: 'Paracetamol', 
        description: 'Paracetamol (Acetaminophen) is a trusted and widely used medication for effective relief from mild to moderate pain, such as headaches, toothaches, and muscle aches. It is also highly effective in reducing fever. It is gentle on the stomach compared to other painkillers.', 
        image: 'https://d1ymz67w5raq8g.cloudfront.net/Pictures/2000xAny/1/2/0/532120_paracetamolbackgroundinformationcoverimage_807319_crop.jpg',
        category: 'Pain Relief',
        usage: 'Used for treating mild to moderate pain (headache, toothache, joint pain) and lowering fever.',
        sideEffects: 'Rarely causes side effects. In high doses, it can cause liver damage.',
        precautions: ['Do not exceed the recommended dose.', 'Avoid alcohol while taking this medication.', 'Consult a doctor if pain persists for more than 3 days.'],
        isPrescriptionRequired: false
    },
    { 
        id: 2, 
        name: 'Cough Syrup', 
        description: 'Our advanced formula Cough Syrup provides rapid soothing relief for both dry and productive coughs. It helps suppress the cough reflex, relieves throat irritation, and loosens mucus/phlegm for easier breathing. Suitable for adults and children as per dosage.', 
        image: 'https://images.ctfassets.net/kytey10holgp/5FPrOzDkawr1lGCLvYYFGP/2b44fafe8505a7e413a048226a7b3ebc/thumbnail_Benedryl_201.jpg?fm=webp&w=3840', 
        delay: 'reveal-delay-100',
        category: 'Cold & Cough',
        usage: 'Relieves throat irritation, suppresses cough reflex, and loosens mucus.',
        sideEffects: 'May cause drowsiness, dizziness, or mild nausea.',
        precautions: ['Shake well before use.', 'May cause drowsiness; avoid driving.', 'Consult a doctor before giving to children under 2 years.'],
        isPrescriptionRequired: false
    },
    { 
        id: 3, 
        name: 'Horlicks', 
        description: 'Horlicks is a clinically proven health drink that supports immunity and holistic growth. Packed with 23 vital nutrients including Zinc, Vitamin C, and Vitamin D, it improves bone density, muscle mass, and healthy weight gain. A delicious way to meet daily nutritional needs.', 
        image: 'https://lh3.googleusercontent.com/fb7jMmrNPApgI4evL2h8mKB0aPrWmbmB1QSd_xhaSfQPOi4YoOqZAT_P3EegvCQW18w53Y8JZMmKYTfv=s265-w265-h265', 
        delay: 'reveal-delay-200',
        category: 'Nutrition',
        usage: 'Mix with hot or cold milk/water. Supports bone health and daily energy needs.',
        sideEffects: 'None known when consumed as directed.',
        precautions: ['Contains sugar/malt; diabetics should consult a doctor.', 'Store in a cool, dry place.'],
        isPrescriptionRequired: false
    },
    { 
        id: 4, 
        name: 'SBL Homeopathy', 
        description: 'We stock a comprehensive range of SBL World Class Homeopathic medicines, known for their purity and efficacy. From mother tinctures and dilutions to biocombinations, these natural remedies offer safe treatment for chronic and acute ailments without side effects.', 
        image: 'https://homeobasket.com/wp-content/uploads/2023/04/Belladonna-3.jpg', 
        delay: 'reveal-delay-300',
        category: 'Homeopathy',
        usage: 'Varies by specific remedy (dilution/mother tincture). Generally taken orally.',
        sideEffects: 'Generally safe with no known side effects.',
        precautions: ['Avoid strong odors (coffee, onion, perfume) while taking medication.', 'Keep a gap of 15 minutes before/after food.'],
        isPrescriptionRequired: false
    },
    { 
        id: 5, 
        name: 'Antibiotics', 
        description: 'Broad-spectrum antibiotics available for treating various bacterial infections, including respiratory tract infections, skin infections, and urinary tract infections. These powerful medications work by killing bacteria or stopping their growth. *Strictly sold on prescription.*', 
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeMj3HS5XkhB0-mS1asr7y9OoXKqUMgyfSqA&s',
        category: 'Anti-Infective',
        usage: 'Treats bacterial infections like throat infection, UTI, and skin infections.',
        sideEffects: 'Nausea, diarrhea, stomach upset.',
        precautions: ['Complete the full course as prescribed.', 'Do not skip doses.', 'Prescription mandatory.'],
        isPrescriptionRequired: true
    },
    { 
        id: 6, 
        name: 'Injections & Syringes', 
        description: 'High-quality, sterile disposable syringes and a wide range of injectable medications for critical care and immediate relief. Our stock includes pain relief injections, antibiotics, and vitamins, maintained at optimal temperatures.', 
        image: 'https://apthorprx.com/wp-content/uploads/2022/01/apthorp-rx-Ignorance-About-Injections-Why-Some-Medications-Are-In-Shot-Form.jpg', 
        delay: 'reveal-delay-100',
        category: 'Medical Supplies',
        usage: 'Administering liquid medication directly into the body.',
        sideEffects: 'Injection site pain or redness.',
        precautions: ['Single-use only.', 'Ensure proper disposal of needles.', 'To be administered by a trained professional.'],
        isPrescriptionRequired: true
    },
    { 
        id: 7, 
        name: 'First Aid Kit', 
        description: 'A comprehensive First Aid Kit containing all essentials for handling minor emergencies. Includes antiseptic liquid (Dettol/Savlon), sterilized cotton, gauze bandages, adhesive plasters, analgesic ointment, and scissors. A must-have for every home and vehicle.', 
        image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 
        delay: 'reveal-delay-200',
        category: 'Emergency Care',
        usage: 'Cleaning wounds, dressing cuts, and preventing infection.',
        sideEffects: 'Skin irritation (rare) from adhesives or antiseptics.',
        precautions: ['Keep kit accessible but out of reach of children.', 'Check expiry dates of ointments regularly.'],
        isPrescriptionRequired: false
    },
    { 
        id: 8, 
        name: 'Multivitamins', 
        description: 'Premium multivitamin supplements designed to bridge nutritional gaps in your diet. Enriched with Vitamins A, B-complex, C, D, E, and essential minerals like Zinc and Magnesium. Boosts energy levels, supports immune function, and promotes overall vitality.', 
        image: 'https://i-cf65.ch-static.com/content/dam/cf-consumer-healthcare/bp-wellness-centrum/en_US/sliced-images/global/articles/how-supplements-and-multivitamins-work-together-image.jpg?auto=format', 
        delay: 'reveal-delay-300',
        category: 'Wellness',
        usage: 'One tablet daily or as directed by a physician.',
        sideEffects: 'Mild stomach upset if taken on an empty stomach.',
        precautions: ['Do not exceed daily recommended allowance.', 'Consult doctor if pregnant or nursing.'],
        isPrescriptionRequired: false
    },
    { 
        id: 9, 
        name: 'Pain Relief Gel', 
        description: 'Fast-acting topical pain relief gel (like Volini/Moov) that penetrates deep into muscles to provide instant relief from back pain, joint pain, sprains, and strains. The cooling sensation soothes inflammation while the active ingredients relax stiff muscles.', 
        image: 'https://cdn01.pharmeasy.in/dam/products_otc/183157/volini-pain-relief-gel-tube-of-75-g-6.1-1712726723.jpg',
        category: 'Pain Relief',
        usage: 'Apply gently on the affected area 3-4 times a day.',
        sideEffects: 'Mild skin irritation or burning sensation.',
        precautions: ['Do not apply on open wounds.', 'Wash hands after application.', 'Avoid contact with eyes.'],
        isPrescriptionRequired: false
    },
    { 
        id: 10, 
        name: 'Baby Care Kit', 
        description: 'An ultra-gentle collection of baby care essentials formulated for delicate skin. Includes tear-free shampoo, moisturizing lotion, massage oil, diaper rash cream, and talc-free powder. Hypoallergenic and dermatologically tested for your baby\'s safety.', 
        image: 'https://m.media-amazon.com/images/I/51-lpxBJF+L._AC_UF894,1000_QL80_.jpg', 
        delay: 'reveal-delay-100',
        category: 'Baby Care',
        usage: 'Daily hygiene and skin protection for infants.',
        sideEffects: 'Hypoallergenic; side effects are extremely rare.',
        precautions: ['For external use only.', 'Avoid contact with baby\'s eyes.'],
        isPrescriptionRequired: false
    },
    { 
        id: 11, 
        name: 'Dabur Honey', 
        description: '100% pure and natural Dabur Honey, sourced from the finest hives. Rich in antioxidants and minerals, it serves as an excellent immunity booster, aids in weight management, and is a healthy natural sweetener alternative to sugar.', 
        image: 'https://1mg-gumlet.s3.amazonaws.com/sku_star_content_images%2F2025-01%2F1736841598_0.jpg', 
        delay: 'reveal-delay-200',
        category: 'Wellness',
        usage: 'Consume with warm water in the morning or as a sweetener.',
        sideEffects: 'None.',
        precautions: ['Do not feed to infants under 1 year.', 'Store in a dry place; do not refrigerate.'],
        isPrescriptionRequired: false
    },
    { 
        id: 12, 
        name: 'ORS (Electral)', 
        description: 'WHO-recommended Oral Rehydration Salts (ORS) formula to combat dehydration caused by diarrhea, vomiting, or excessive sweating. Restores essential electrolytes and fluids rapidly, preventing fatigue and weakness. Safe for all age groups.', 
        image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=1080/da/cms-assets/cms/product/f91b13a0-11d8-4b6f-8391-12933bbbcea7.png', 
        delay: 'reveal-delay-300',
        category: 'Wellness',
        usage: 'Dissolve contents in the specified amount of drinking water and consume.',
        sideEffects: 'Nausea if consumed too quickly.',
        precautions: ['Use within 24 hours of preparation.', 'Use boiled and cooled water.'],
        isPrescriptionRequired: false
    },
    { 
        id: 13, 
        name: 'Digital Thermometer', 
        description: 'Advanced digital thermometer for fast, accurate, and safe temperature readings. Features a flexible tip, waterproof design, fever alarm, and memory function. Mercury-free, making it safe for use with infants and children.', 
        image: 'https://media.geeksforgeeks.org/wp-content/uploads/20240514234837/Clinical-Thermometer-Diagram-copy.webp', 
        delay: 'reveal-delay-100',
        category: 'Medical Device',
        usage: 'Place under the tongue or armpit until the beep sound.',
        sideEffects: 'N/A',
        precautions: ['Clean tip with alcohol before and after use.', 'Keep away from high heat.'],
        isPrescriptionRequired: false
    },
    { 
        id: 14, 
        name: 'Vicks VapoRub', 
        description: 'The classic mentholated topical ointment for relief from cold and cough symptoms. When applied to the chest and throat, it relieves nasal congestion and eases breathing. Can also be used for temporary relief from minor muscle aches.', 
        image: 'https://m.media-amazon.com/images/S/aplus-media-library-service-media/40786a25-49fe-4993-a3b6-a3e299496ec0.__CR0,0,970,600_PT0_SX970_V1___.jpg', 
        delay: 'reveal-delay-200',
        category: 'Cold & Cough',
        usage: 'Rub on chest, throat, and back for cold relief.',
        sideEffects: 'Mild skin redness.',
        precautions: ['Do not heat.', 'Do not apply near nostrils of children under 2 years.'],
        isPrescriptionRequired: false
    },
    { 
        id: 15, 
        name: 'Dermicool Powder', 
        description: 'Dermicool Prickly Heat Powder provides double-action relief: instant cooling for burning skin and bacteriostatic protection to treat prickly heat. Its unique formula absorbs sweat, keeps skin dry, and prevents itching during hot summers.', 
        image: 'https://m.media-amazon.com/images/I/71tKRd6bsyL._AC_UF350,350_QL80_.jpg', 
        delay: 'reveal-delay-300',
        category: 'Personal Care',
        usage: 'Sprinkle over affected areas after shower.',
        sideEffects: 'None.',
        precautions: ['Avoid inhaling the powder.', 'For external use only.'],
        isPrescriptionRequired: false
    },
];

const ProductCardImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-gray-50 overflow-hidden">
            {/* Low-res / Loading Placeholder */}
            <div 
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
            >
                <div className="w-8 h-8 border-2 border-medical-200 border-t-medical-500 rounded-full animate-spin"></div>
            </div>
            
            <img 
                src={src} 
                alt={alt} 
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-full object-contain transform transition-all duration-700 ease-in-out mix-blend-multiply ${isLoaded ? 'opacity-100 scale-100 blur-0 group-hover:scale-110 group-hover:-translate-y-2' : 'opacity-0 scale-95 blur-sm'}`} 
            />
        </div>
    );
};

const Products: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [displayedProducts, setDisplayedProducts] = useState<Product[]>(productList);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [isAiResult, setIsAiResult] = useState(false);
    const [wishlist, setWishlist] = useState<number[]>([]);
    
    // New state for search focus
    const [isFocused, setIsFocused] = useState(false);
    
    // Quick View State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Derived related products
    const relatedProducts = selectedProduct 
        ? productList.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 4)
        : [];

    useEffect(() => {
        // Load wishlist from local storage
        try {
            const savedWishlist = localStorage.getItem('lucky_pharma_wishlist');
            if (savedWishlist) {
                setWishlist(JSON.parse(savedWishlist));
            }
        } catch (e) {
            console.error("Failed to load wishlist", e);
        }

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeQuickView();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const toggleWishlist = (productId: number) => {
        setWishlist(prev => {
            const newWishlist = prev.includes(productId) 
                ? prev.filter(id => id !== productId)
                : [...prev, productId];
            
            localStorage.setItem('lucky_pharma_wishlist', JSON.stringify(newWishlist));
            return newWishlist;
        });
    };

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
        closeQuickView(); // Close modal if open
    };

    return (
        <section id="products" className="scroll-mt-24 min-h-[800px] transition-all duration-500 relative py-12" aria-label="Products Section">
            
            {/* Search Focus Backdrop - Fixed Z-index (40) to be BELOW Navbar (50) */}
            <div 
                className={`fixed inset-0 bg-white/60 backdrop-blur-sm z-40 transition-all duration-500 ${isFocused ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                onClick={() => setIsFocused(false)}
                aria-hidden="true"
            ></div>

            <div className="container mx-auto px-4">
                
                {/* No Delivery Notice Banner */}
                <div className="glass-panel border-l-4 border-l-orange-500 p-4 mb-8 rounded-r-lg shadow-sm reveal flex items-start md:items-center animate-fade-in relative z-10">
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
                            
                            {/* Glow Effect */}
                            <div className={`absolute inset-0 bg-gradient-to-r from-medical-400 to-blue-400 rounded-full blur-md opacity-30 group-hover:opacity-60 transition duration-500 ${isSearching ? 'animate-pulse' : ''} ${isFocused ? 'opacity-60 blur-lg scale-105' : ''}`}></div>
                            
                            <input 
                                id="product-search-input"
                                type="text"
                                enterKeyHint="search"
                                value={searchQuery}
                                onFocus={() => setIsFocused(true)}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search medicines, products, or symptoms..." 
                                className={`w-full bg-white/80 backdrop-blur-md border-2 text-gray-800 text-lg rounded-full py-4 pl-6 pr-24 shadow-lg focus:outline-none transition-all duration-300 relative z-10 placeholder-gray-500 ${isFocused ? 'border-medical-500 shadow-xl bg-white' : 'border-white/50'}`}
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
                    {/* Fixed Z-Index: removed z-50 to z-10 so it goes behind fixed navbar on scroll */}
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
                                className={`glass-card rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 ease-out overflow-hidden flex flex-col h-full group bg-white transform hover:-translate-y-2 hover:scale-[1.02] animate-fade-in-up ${isAiResult ? 'border-2 border-indigo-200 ring-2 ring-indigo-50 shadow-indigo-100' : ''}`}
                                style={{ animationDelay: `${(index % 5) * 100}ms` }}
                            >
                                <div 
                                    className="overflow-hidden h-56 p-6 relative cursor-pointer bg-gradient-to-br from-white to-gray-50 group-hover:from-blue-50 group-hover:to-white transition-colors duration-300 flex items-center justify-center border-b border-gray-100"
                                    onClick={() => openQuickView(product)}
                                >
                                    <ProductCardImage src={product.image} alt={product.name} />
                                    
                                    {/* Wishlist Toggle Button (Top-Left) */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleWishlist(product.id);
                                        }}
                                        className={`absolute top-3 left-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm transform hover:scale-110 ${
                                            wishlist.includes(product.id) 
                                            ? 'bg-red-50 text-red-500 shadow-red-100 border border-red-100' 
                                            : 'bg-white/90 text-gray-300 hover:text-red-400 border border-gray-100'
                                        }`}
                                        title={wishlist.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                                        aria-label={wishlist.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                                    >
                                        <i className={`${wishlist.includes(product.id) ? 'fas animate-heartbeat' : 'far'} fa-heart`}></i>
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
                                <div className="p-5 flex flex-col flex-grow relative">
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
                        <div className="col-span-full text-center py-12 animate-fade-in glass-panel rounded-2xl" role="status">
                            <div className="text-gray-400 mb-4">
                                <i className="fas fa-search text-4xl" aria-hidden="true"></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-600">No products found</h3>
                            <p className="text-gray-500">Try searching for generic terms like "Pain killer" or "Cough syrup"</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick View Modal - Responsive Desktop & Mobile */}
            {selectedProduct && (
                <div 
                    className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4" 
                    role="dialog" 
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" 
                        onClick={closeQuickView}
                    ></div>
                    
                    {/* Modal Container */}
                    <div className="relative glass-panel bg-white w-full h-[93dvh] sm:h-[85vh] sm:max-w-6xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-slide-up sm:animate-popup-in">
                         
                        {/* Close Button - Floating */}
                        <button 
                            onClick={closeQuickView} 
                            className="absolute top-4 right-4 z-50 bg-white/80 backdrop-blur text-gray-500 hover:text-red-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg border border-gray-100 transition-colors hover:rotate-90 duration-300"
                            aria-label="Close modal"
                        >
                            <i className="fas fa-times text-lg"></i>
                        </button>
            
                        {/* Left: Image Panel - Desktop: 5 cols, Mobile: Top section */}
                        <div className="w-full md:w-5/12 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white relative flex items-center justify-center p-6 md:p-12 min-h-[220px] md:min-h-full border-b md:border-b-0 md:border-r border-gray-100 order-1 flex-shrink-0">
                            {/* Badges Overlay */}
                            <div className="absolute top-6 left-6 flex flex-col gap-2 z-10 items-start">
                                {selectedProduct.isPrescriptionRequired && (
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

                            <img 
                                key={selectedProduct.id} // Re-render image on change for animation
                                src={selectedProduct.image} 
                                alt={selectedProduct.name} 
                                className="w-full h-full max-h-[180px] md:max-h-[400px] object-contain drop-shadow-2xl transform transition hover:scale-105 duration-500 mix-blend-multiply animate-fade-in" 
                            />
                        </div>

                        {/* Right: Content Panel - Desktop: 7 cols, Mobile: Scrollable body */}
                        <div className="w-full md:w-7/12 flex flex-col h-full bg-white relative order-2 overflow-hidden">
                            {/* Scrollable Content */}
                            <div 
                                className="flex-1 overflow-y-auto p-5 md:p-10 pb-40 md:pb-28 custom-scrollbar overscroll-contain scroll-smooth"
                                key={selectedProduct.id} // Forces scroll reset on product change
                            >
                                <div className="flex flex-col gap-1 mb-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        {selectedProduct.category && (
                                            <span className="text-xs font-bold text-medical-600 bg-medical-50 px-2 py-1 rounded uppercase tracking-wider">
                                                {selectedProduct.category}
                                            </span>
                                        )}
                                        {/* Wishlist in Modal */}
                                        <button
                                            onClick={() => toggleWishlist(selectedProduct.id)}
                                            className={`ml-auto sm:hidden w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                wishlist.includes(selectedProduct.id) 
                                                ? 'bg-red-50 text-red-500' 
                                                : 'bg-gray-100 text-gray-400'
                                            }`}
                                        >
                                            <i className={`${wishlist.includes(selectedProduct.id) ? 'fas animate-heartbeat' : 'far'} fa-heart`}></i>
                                        </button>
                                    </div>
                                    <h2 id="modal-title" className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                                        {selectedProduct.name}
                                    </h2>
                                </div>

                                {/* Description Card */}
                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-8">
                                    <p className="text-gray-700 leading-relaxed text-base">
                                        {selectedProduct.description}
                                    </p>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                    {/* Usage */}
                                    {selectedProduct.usage && (
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <i className="fas fa-capsules text-medical-500"></i> Usage
                                            </h3>
                                            <p className="text-sm text-gray-700 font-medium bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                                {selectedProduct.usage}
                                            </p>
                                        </div>
                                    )}

                                    {/* Side Effects */}
                                    {selectedProduct.sideEffects && (
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <i className="fas fa-exclamation-triangle text-orange-500"></i> Side Effects
                                            </h3>
                                            <p className="text-sm text-gray-700 font-medium bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                                {selectedProduct.sideEffects}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Precautions */}
                                {selectedProduct.precautions && selectedProduct.precautions.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <i className="fas fa-shield-alt text-blue-500"></i> Safety Precautions
                                        </h3>
                                        <div className="grid gap-2">
                                            {selectedProduct.precautions.map((precaution, idx) => (
                                                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                                                    <i className="fas fa-check text-blue-500 mt-0.5 text-xs"></i>
                                                    <span className="text-sm text-gray-600 font-medium">{precaution}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Related Products Section */}
                                {relatedProducts.length > 0 && (
                                    <div className="mb-8 border-t border-gray-100 pt-6">
                                         <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <i className="fas fa-tags text-gray-400"></i> Related Products
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {relatedProducts.map(item => (
                                                <div 
                                                    key={item.id} 
                                                    onClick={() => openQuickView(item)}
                                                    className="group cursor-pointer bg-white border border-gray-100 rounded-xl p-2 hover:border-medical-200 hover:shadow-md transition-all flex flex-col gap-2"
                                                >
                                                   <div className="h-20 w-full bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden relative">
                                                       <img src={item.image} alt={item.name} className="h-full object-contain p-2 group-hover:scale-110 transition-transform mix-blend-multiply" />
                                                   </div>
                                                   <p className="text-xs font-bold text-gray-700 line-clamp-1 group-hover:text-medical-600 px-1">{item.name}</p>
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
                                        onClick={(e) => askAI(selectedProduct, e)}
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
            )}
        </section>
    );
};

export default Products;