import React from 'react';

const Hero: React.FC = () => {
    return (
        // Adjusted padding: pt-20 (mobile), md:pt-36 (tablet/desktop) for larger navbar
        <section id="home" className="pt-24 pb-12 md:pt-40 md:pb-24 overflow-visible scroll-mt-24 relative z-0">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-12 md:mb-0 text-center md:text-left z-10">
                    <div className="animate-fade-in-up">
                        <span className="inline-block py-2 px-5 rounded-full bg-white/80 backdrop-blur-md border border-medical-200 text-medical-800 text-sm font-bold mb-6 shadow-sm hover:scale-105 transition-transform duration-300 ring-4 ring-medical-50/50">
                            <i className="fas fa-check-circle mr-2 text-medical-500"></i> Hanwara's Trusted Chemist
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 drop-shadow-sm tracking-tight">
                            Your Health is Our <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-600 via-green-500 to-teal-500 drop-shadow-sm">Top Priority</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto md:mx-0 font-medium leading-relaxed">
                            Providing authentic medicines, healthcare products, and professional guidance to the Hanwara community. <span className="text-medical-700 font-bold">Open 7 days a week.</span>
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <a href="tel:+919798881368" className="group relative overflow-hidden bg-medical-600 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-medical-500/30 flex items-center justify-center w-full sm:w-auto transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-medical-600/40">
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine"></div>
                            <i className="fas fa-phone-alt mr-3 text-lg group-hover:rotate-12 transition-transform"></i> 
                            <span className="text-lg">Call Now</span>
                        </a>
                        <a href="https://www.google.com/search?q=New+Lucky+Pharma+Hanwara+Jharkhand" target="_blank" rel="noopener noreferrer" className="bg-white/70 backdrop-blur-sm border-2 border-medical-600 text-medical-700 hover:bg-medical-50 hover:text-medical-800 font-bold py-4 px-8 rounded-2xl transition flex items-center justify-center w-full sm:w-auto transform hover:-translate-y-1 shadow-lg hover:shadow-xl text-lg">
                            <i className="fas fa-store mr-3"></i> Visit Store
                        </a>
                    </div>
                </div>
                
                <div className="md:w-1/2 flex justify-center w-full reveal reveal-delay-200 perspective-1000">
                    <div className="relative animate-float transform-style-3d hover:rotate-y-6 transition-transform duration-700">
                        {/* Decorative background blobs */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-medical-200/40 to-blue-200/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
                        
                        {/* 3D Glassmorphism Card */}
                        <div className="glass-panel p-8 rounded-3xl relative z-10 max-w-sm w-full border border-white/60 shadow-2xl shadow-medical-900/10">
                            {/* Floating Badge */}
                            <div className="absolute -top-6 -right-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-all duration-300 z-20 border-4 border-white">
                                <span className="font-bold text-xl">100%</span>
                                <span className="text-[10px] uppercase font-bold tracking-wider">Genuine</span>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center space-x-5 p-4 rounded-2xl bg-white/40 hover:bg-white/70 transition-all duration-300 cursor-default group border border-transparent hover:border-white hover:shadow-lg transform hover:-translate-y-1">
                                    <div className="bg-gradient-to-br from-medical-100 to-medical-200 p-4 rounded-2xl group-hover:rotate-6 transition-transform duration-300 shadow-sm text-medical-600">
                                        <i className="fas fa-heartbeat text-2xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-800">Health Checkup</h3>
                                        <p className="text-sm text-gray-600 font-medium">Regular monitoring</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-5 p-4 rounded-2xl bg-white/40 hover:bg-white/70 transition-all duration-300 cursor-default group border border-transparent hover:border-white hover:shadow-lg transform hover:-translate-y-1">
                                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl group-hover:rotate-6 transition-transform duration-300 shadow-sm text-blue-600">
                                        <i className="fas fa-prescription-bottle-alt text-2xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-800">Genuine Medicines</h3>
                                        <p className="text-sm text-gray-600 font-medium">100% Authentic</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-5 p-4 rounded-2xl bg-white/40 hover:bg-white/70 transition-all duration-300 cursor-default group border border-transparent hover:border-white hover:shadow-lg transform hover:-translate-y-1">
                                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-2xl group-hover:rotate-6 transition-transform duration-300 shadow-sm text-orange-600">
                                        <i className="fas fa-user-nurse text-2xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-800">Expert Advice</h3>
                                        <p className="text-sm text-gray-600 font-medium">Qualified Pharmacists</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;