import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoPromo from './components/VideoPromo';
import Products from './components/Products';
import AIChat from './components/AIChat';
import BackToTop from './components/BackToTop';
import WelcomeModal from './components/WelcomeModal';
import WishlistModal from './components/WishlistModal';
import Toast from './components/Toast';
import ProductDetailModal from './components/ProductDetailModal';
import HealthTools from './components/HealthTools';
import Services from './components/Services';
import HealthTips from './components/HealthTips';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdSense from './components/AdSense';
import { Product } from './types';
import { productList } from './data/products';

const App: React.FC = () => {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);
  
  const [viewedProduct, setViewedProduct] = useState<Product | null>(null);
  const [isDeepLinkOpen, setIsDeepLinkOpen] = useState(false);

  useEffect(() => {
      try {
          const savedWishlist = localStorage.getItem('lucky_pharma_wishlist');
          if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
          
          const savedCustom = localStorage.getItem('lucky_pharma_custom_products');
          if (savedCustom) setCustomProducts(JSON.parse(savedCustom));
      } catch (e) {
          console.error("Failed to load local storage data", e);
      }
  }, []);

  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const productIdParam = params.get('product_id');

      if (productIdParam) {
          const id = Number(productIdParam);
          const foundProduct = productList.find(p => p.id === id);

          if (foundProduct) {
              window.history.replaceState(null, '', window.location.pathname);
              window.history.pushState(null, '', window.location.href);

              setTimeout(() => {
                  setIsDeepLinkOpen(true);
                  setViewedProduct(foundProduct);
              }, 100);
          }
      }
  }, []);

  const closeProductModal = () => {
      setViewedProduct(null);
      setIsDeepLinkOpen(false);
  };

  const showToast = (message: string) => {
      setToast({ message, visible: true });
      setTimeout(() => {
          setToast(prev => prev ? { ...prev, visible: false } : null);
      }, 3000);
  };

  const toggleWishlist = (product: Product) => {
      const productId = product.id;
      const isAlreadyInWishlist = wishlist.includes(productId);

      if (!isAlreadyInWishlist) showToast("Added to Wishlist");
      else showToast("Removed from Wishlist");

      setWishlist(prev => {
          const exists = prev.includes(productId);
          const newWishlist = exists 
              ? prev.filter(id => id !== productId)
              : [...prev, productId];
          
          localStorage.setItem('lucky_pharma_wishlist', JSON.stringify(newWishlist));
          return newWishlist;
      });

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
    // Proactive Pre-rendering: Large rootMargin (1000px) ensures background loading
    const observerOptions = { root: null, rootMargin: '0px 0px 1000px 0px', threshold: 0.01 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .reveal-scale');
    revealElements.forEach(el => observer.observe(el));

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
            targetElement.classList.add('magic-focus');
            setTimeout(() => targetElement.classList.remove('magic-focus'), 1500);
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
        <VideoPromo />
        <Products wishlist={wishlist} toggleWishlist={toggleWishlist} />
        
        <AdSense slot="1234567890" />
        <HealthTools />
        <Services />
        <HealthTips />
        <FAQ />
        <AdSense slot="7013153337" format="autorelaxed" className="my-12" />
        <Contact />
        <Footer />
      </main>
      
      <WelcomeModal />
      <BackToTop />
      <AIChat onViewProduct={(product) => setViewedProduct(product)} />
      
      <WishlistModal 
          isOpen={isWishlistOpen} 
          onClose={() => setIsWishlistOpen(false)} 
          wishlistIds={wishlist}
          customProducts={customProducts}
          onToggleWishlist={toggleWishlist}
          onProductClick={(product) => setViewedProduct(product)}
      />

      {viewedProduct && (
          <ProductDetailModal 
              product={viewedProduct}
              onClose={closeProductModal}
              isWishlisted={wishlist.includes(viewedProduct.id)}
              onToggleWishlist={() => toggleWishlist(viewedProduct)}
              preventHistoryPush={isDeepLinkOpen}
              onSwitchProduct={(p) => setViewedProduct(p)}
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