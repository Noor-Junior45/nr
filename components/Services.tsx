import React from 'react';

const Services: React.FC = () => {
    return (
        <section id="services" className="py-16 scroll-mt-24">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2 reveal group overflow-hidden rounded-3xl animate-fade-in shadow-2xl border-4 border-white/30">
                        <img 
                            src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                            alt="Pharmacy Shelf" 
                            className="w-full object-cover h-64 md:h-96 transform transition duration-700 group-hover:scale-110"
                        />
                    </div>
                    <div className="md:w-1/2">
                        <h2 className="text-3xl font-bold mb-6 reveal drop-shadow-sm text-gray-900">Complete Healthcare Services</h2>
                        <ul className="space-y-6">
                            <li className="flex items-start reveal reveal-delay-100 hover:translate-x-2 transition-transform duration-300 cursor-default p-4 rounded-2xl hover:bg-white/40 glass-card border-none shadow-sm">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-medical-100/80 flex items-center justify-center mt-1 animate-pulse border border-medical-200">
                                    <i className="fas fa-file-medical text-medical-600"></i>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-bold text-gray-800">Prescription Fulfillment</h3>
                                    <p className="text-gray-600 leading-relaxed">Accurate and timely dispensing of medicines prescribed by your doctor.</p>
                                </div>
                            </li>
                            <li className="flex items-start reveal reveal-delay-200 hover:translate-x-2 transition-transform duration-300 cursor-default p-4 rounded-2xl hover:bg-white/40 glass-card border-none shadow-sm">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100/80 flex items-center justify-center mt-1 animate-pulse border border-blue-200" style={{ animationDelay: '0.5s' }}>
                                    <i className="fas fa-baby text-blue-600"></i>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-bold text-gray-800">Baby & Mother Care</h3>
                                    <p className="text-gray-600 leading-relaxed">Everything you need for mother and baby health, from supplements to hygiene.</p>
                                </div>
                            </li>
                            <li className="flex items-start reveal reveal-delay-300 hover:translate-x-2 transition-transform duration-300 cursor-default p-4 rounded-2xl hover:bg-white/40 glass-card border-none shadow-sm">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100/80 flex items-center justify-center mt-1 animate-pulse border border-green-200" style={{ animationDelay: '1s' }}>
                                    <i className="fas fa-leaf text-green-600"></i>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-bold text-gray-800">Homeopathic Care</h3>
                                    <p className="text-gray-600 leading-relaxed">Authorized stockist of SBL World Class Homeopathy and other trusted brands.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;