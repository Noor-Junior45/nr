import React, { useRef, useEffect, useState } from 'react';

const HealthTips: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoError, setVideoError] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);

    // Ensure video plays automatically
    useEffect(() => {
        if (videoRef.current && !videoError) {
            videoRef.current.play().catch(error => {
                 // Silently handle autoplay restrictions
            });
        }
    }, [videoError]);

    const tips = [
        {
            icon: "fa-tint",
            title: "Stay Hydrated",
            description: "Drink at least 8 glasses of water a day. Proper hydration boosts energy, improves skin health, and aids digestion.",
            color: "text-blue-500 bg-blue-50"
        },
        {
            icon: "fa-bed",
            title: "Quality Sleep",
            description: "Aim for 7-8 hours of sleep nightly. A well-rested body repairs itself and fights infections more effectively.",
            color: "text-indigo-500 bg-indigo-50"
        },
        {
            icon: "fa-carrot",
            title: "Balanced Diet",
            description: "Include seasonal fruits, green vegetables, and fiber in your diet. Nutrition is the foundation of immunity.",
            color: "text-orange-500 bg-orange-50"
        },
        {
            icon: "fa-person-running",
            title: "Active Lifestyle",
            description: "Just 30 minutes of daily activity, like brisk walking, keeps your heart healthy and reduces stress.",
            color: "text-green-500 bg-green-50"
        }
    ];

    return (
        <section id="health-tips" className="relative py-16 scroll-mt-24 overflow-hidden">
            
            {/* Background Video Layer */}
            {!videoError && (
                <video 
                    ref={videoRef}
                    className="absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-1000"
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    poster="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop"
                    onCanPlay={() => setVideoLoaded(true)}
                    onError={() => setVideoError(true)}
                >
                    {/* Updated to a reliable HD source (Pixabay) to fix Format Error */}
                    <source src="https://cdn.pixabay.com/video/2022/10/05/133649-757657754_large.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )}

            {/* Fallback Background if video fails or is loading */}
            <div 
                className={`absolute inset-0 bg-cover bg-center z-0 transition-opacity duration-1000 ${videoLoaded && !videoError ? 'opacity-0' : 'opacity-100'}`}
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop")' }}
            ></div>

            {/* White Overlay to ensure text readability over the video */}
            <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] z-0"></div>

            {/* Content Container - z-10 puts it above the video/overlay */}
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12 reveal">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/60 backdrop-blur-md text-medical-700 text-sm font-bold shadow-sm mb-4 border border-medical-100">
                        <i className="fas fa-heartbeat mr-2"></i>Wellness Corner
                    </span>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 drop-shadow-sm">Daily Health Tips</h2>
                    <p className="text-gray-700 max-w-2xl mx-auto font-medium">Simple, effective habits for a healthier you, recommended by our pharmacists and AI experts.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tips.map((tip, index) => (
                        <div key={index} className={`reveal reveal-delay-${(index + 1) * 100} bg-white/90 backdrop-blur-md border border-white/60 p-6 rounded-3xl hover-lift-smooth group transition-all duration-300 relative overflow-hidden hover:bg-white hover:border-medical-200 hover:shadow-xl shadow-sm`}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${tip.color} group-hover:scale-110 transition-transform duration-300 shadow-sm relative z-10 border border-white/40`}>
                                <i className={`fas ${tip.icon} text-2xl`}></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-medical-600 transition-colors relative z-10">{tip.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed relative z-10">{tip.description}</p>
                            
                            {/* Watermark Logo */}
                            <div className="absolute -bottom-6 -right-6 opacity-5 transform -rotate-12 pointer-events-none group-hover:scale-125 transition-transform duration-500">
                                <i className={`fas ${tip.icon} text-9xl text-gray-800`}></i>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-10 text-center reveal reveal-delay-400">
                    <div className="inline-flex items-center gap-2 p-4 bg-yellow-50/90 backdrop-blur-sm rounded-2xl border border-yellow-100 text-yellow-800 text-sm font-medium shadow-sm hover:shadow-md transition-shadow">
                        <i className="fas fa-lightbulb text-yellow-500 text-lg"></i>
                        <span>Ask our <strong>AI Pharmacist</strong> for personalized health tips!</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HealthTips;