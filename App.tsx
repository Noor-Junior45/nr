import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
// About import removed - Merged into VideoPromo
import Products from './components/Products';
import Services from './components/Services';
import HealthTips from './components/HealthTips';
import HealthTools from './components/HealthTools';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WelcomeModal from './components/WelcomeModal';
import AIChat from './components/AIChat';
import BackToTop from './components/BackToTop';
import WishlistModal from './components/WishlistModal';
import Toast from './components/Toast';
import ProductDetailModal from './components/ProductDetailModal';
import VideoPromo from './components/VideoPromo';
import AdSense from './components/AdSense';
import { Product } from './types';
import { productList } from './data/products';

const App: React.FC = () => {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);
  
  // State for product details opened via Wishlist
  const [viewedProduct, setViewedProduct] = useState<Product | null>(null);

  // Load wishlist and custom products from local storage
  useEffect(() => {
      try {
          const savedWishlist = localStorage.getItem('lucky_pharma_wishlist');
          if (savedWishlist) {
              setWishlist(JSON.parse(savedWishlist));
          }
          
          const savedCustom = localStorage.getItem('lucky_pharma_custom_products');
          if (savedCustom) {
              setCustomProducts(JSON.parse(savedCustom));
          }
      } catch (e) {
          console.error("Failed to load local storage data", e);
      }
  }, []);

  const showToast = (message: string) => {
      setToast({ message, visible: true });
      setTimeout(() => {
          setToast(prev => prev ? { ...prev, visible: false } : null);
      }, 3000);
  };

  const toggleWishlist = (product: Product) => {
      const productId = product.id;
      const isAlreadyInWishlist = wishlist.includes(productId);

      // Show feedback immediately based on current state
      if (!isAlreadyInWishlist) {
          showToast("Added to Wishlist");
      } else {
          showToast("Removed from Wishlist");
      }

      setWishlist(prev => {
          const exists = prev.includes(productId);
          const newWishlist = exists 
              ? prev.filter(id => id !== productId)
              : [...prev, productId];
          
          localStorage.setItem('lucky_pharma_wishlist', JSON.stringify(newWishlist));
          return newWishlist;
      });

      // If it's a dynamic/AI product (not in static list), save it to customProducts
      const isStatic = productList.some(p => p.id === productId);
      if (!isStatic && !isAlreadyInWishlist) {
          setCustomProducts(prev => {
              const exists = prev.some(p => p.id === productId);
              if (!exists) {
                  const newCustom = [...prev, product];
                  localStorage.setItem('lucky_pharma_custom_products', JSON.stringify(newCustom));
                  return newCustom;
              }
              return prev;
          });
      }
  };

  useEffect(() => {
    // Reveal animation logic using Intersection Observer
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // Handle Smooth Scrolling for Anchor Links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="#"]');
      
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          const targetElement = document.querySelector(href);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
            
            // Add magic focus effect
            targetElement.classList.add('magic-focus');
            setTimeout(() => {
              targetElement.classList.remove('magic-focus');
            }, 1500);
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <Navbar 
          wishlistCount={wishlist.length} 
          onOpenWishlist={() => setIsWishlistOpen(true)} 
      />
      <main>
        <Hero />
        {/* About Component Removed - Content merged into VideoPromo */}
        <VideoPromo />
        <Products wishlist={wishlist} toggleWishlist={toggleWishlist} />
        {/* Google AdSense Banner (After Products) */}
        <AdSense slot="1234567890" />
        
        {/* New Health Tools Section (Moved above Services) */}
        <HealthTools />
        
        <Services />
        <HealthTips />
        <FAQ />
        
        {/* Google AdSense Banner (Autorelaxed - Between FAQ & Contact) */}
        <AdSense slot="7013153337" format="autorelaxed" className="my-12" />
        
        <Contact />
      </main>
      <Footer />
      <WelcomeModal />
      <BackToTop />
      {/* Updated AIChat with Handler to View Product */}
      <AIChat onViewProduct={(product) => setViewedProduct(product)} />
      
      <WishlistModal 
          isOpen={isWishlistOpen} 
          onClose={() => setIsWishlistOpen(false)} 
          wishlistIds={wishlist}
          customProducts={customProducts}
          onToggleWishlist={toggleWishlist}
          onProductClick={(product) => setViewedProduct(product)}
      />

      {/* Detail Modal triggered from Wishlist or Chat */}
      {viewedProduct && (
          <ProductDetailModal 
              product={viewedProduct}
              onClose={() => setViewedProduct(null)}
              isWishlisted={wishlist.includes(viewedProduct.id)}
              onToggleWishlist={() => toggleWishlist(viewedProduct)}
          />
      )}
      
      {toast && (
          <Toast 
              message={toast.message} 
              isVisible={toast.visible} 
              onClose={() => setToast(prev => prev ? { ...prev, visible: false } : null)}
              onViewWishlist={() => setIsWishlistOpen(true)}
          />
      )}
    </>
  );
};

export default App;