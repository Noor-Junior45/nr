import React, { useRef, useState, useEffect } from 'react';

// Define the content for the 3 Key Pillars (Based on original About section)
interface Feature {
    title: string;
    desc: string;
    icon: string;
    color: string;
    bg: string;
    shadow: string;
}

const features: Feature[] = [
    {
        title: "Professional Service",
        desc: "Experienced pharmacists providing the right guidance for your medication and wellness needs.",
        icon: "fas fa-user-md", 
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        shadow: "shadow-blue-500/20"
    },
    {
        title: "Authentic Products",
        desc: "We stock only genuine, certified medicines from trusted manufacturers and suppliers.",
        icon: "fas fa-shield-alt",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        shadow: "shadow-emerald-500/20"
    },
    {
        title: "Advanced Storage",
        desc: "24/7 temperature-controlled cold storage to maintain the potency of sensitive vaccines and insulin.",
        icon: "fas fa-snowflake",
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        shadow: "shadow-cyan-500/20"
    }
];

// Spotlight Card Component that tracks mouse movement
const SpotlightCard = ({ feature }: { feature: Feature }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const div = divRef.current;
        const rect = div.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 transition-all duration-500 hover:border-emerald-400/50 hover:bg-emerald-900/40 hover:-translate-y-2 hover:shadow-[0_10px_50px_-10px_rgba(52,211,153,0.4)] group cursor-default backdrop-blur-md flex flex-col justify-start"
        >
            {/* Spotlight Gradient - Greenish Glow following mouse */}
            <div
                className="pointer-events-none absolute -inset-px transition duration-300 z-0"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(52, 211, 153, 0.15), transparent 40%)`,
                }}
            />
            
            <div className="relative z-10">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${feature.bg} flex items-center justify-center ${feature.color} mb-5 border border-white/10 group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-all duration-500 shadow-xl ${feature.shadow}`}>
                    <i className={`${feature.icon} text-2xl md:text-3xl`}></i>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight group-hover:text-emerald-200 transition-colors">{feature.title}</h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed group-hover:text-white transition-colors">{feature.desc}</p>
            </div>
        </div>
    );
};

const VideoPromo: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoError, setVideoError] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);

    // Ensure video plays even if low power mode tries to stop it
    useEffect(() => {
        if (videoRef.current && !videoError) {
            videoRef.current.play().catch(error => {
                // Silently handle autoplay restrictions
            });
        }
    }, [videoError]);

    return (
        // ID "about" for navigation
        // Reduced padding further to minimize video background height ratio
        <section id="about" className="relative w-full py-8 md:py-16 overflow-hidden reveal bg-emerald-950 scroll-mt-24">
            {/* 
               BACKGROUND: Running Abstract Video (Green Theme)
            */}
            
            {/* 1. Video Layer with Error Handling */}
            {!videoError && (
                <video 
                    ref={videoRef}
                    className="absolute top-0 left-0 w-full h-full object-cover opacity-50 transition-opacity duration-1000"
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    poster="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop"
                    onCanPlay={() => setVideoLoaded(true)}
                    onError={() => setVideoError(true)}
                >
                    {/* Updated to a reliable HD source (Pixabay) to fix Format Error */}
                    <source src="https://cdn.pixabay.com/video/2020/07/04/43878-435987399_large.mp4" type="video/mp4" />
                </video>
            )}

            {/* Fallback Image Layer (Visible until video loads OR if video fails) */}
            <div 
                className={`absolute top-0 left-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${videoLoaded && !videoError ? 'opacity-0' : 'opacity-50'}`}
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop")' }}
            ></div>

            {/* 2. Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/95 via-emerald-900/80 to-emerald-950/95"></div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-4">
                
                {/* Header Section - Reduced bottom margin */}
                <div className="max-w-4xl mx-auto text-center mb-6 animate-fade-in-up">
                    <span className="inline-block py-1 px-4 rounded-full bg-emerald-500/10 backdrop-blur-md text-emerald-300 text-xs md:text-sm font-bold mb-4 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <i className="fas fa-history mr-2"></i> Since 2008
                    </span>
                    
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
                        Healthcare You <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-white">Can Trust</span>
                    </h2>
                    
                    <p className="text-gray-300 text-base md:text-lg leading-relaxed font-medium max-w-2xl mx-auto">
                        Delivering authentic medicines and professional care to the Hanwara community with uncompromised quality.
                    </p>
                </div>

                {/* Grid of 3 Key Boxes - Focused Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 perspective-1000 max-w-7xl mx-auto">
                    {features.map((feature, index) => (
                        <div key={index} className="animate-fade-in-up h-full" style={{ animationDelay: `${index * 150}ms` }}>
                            <SpotlightCard feature={feature} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default VideoPromo;