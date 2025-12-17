import React from 'react';

const Contact: React.FC = () => {
    return (
        // Start: White (Matches FAQ End) -> Fade In: Medical-100 -> Fade Out: Medical-50/White
        <section id="contact" className="py-20 scroll-mt-24 bg-gradient-to-b from-white via-medical-100 to-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 reveal">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">Visit Us Today</h2>
                    <p className="text-lg text-gray-700 mb-6 font-medium">We are open every day to serve your healthcare needs.</p>
                    
                    <div className="inline-block bg-orange-50 px-6 py-3 rounded-full border border-orange-100 shadow-sm text-gray-600 text-sm animate-fade-in">
                        <i className="fas fa-info-circle text-orange-500 mr-2 text-lg"></i>
                        <span className="font-bold text-gray-800">Note:</span> We do not provide home delivery. Please visit our store for all purchases.
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Box 1: Contact Info */}
                    <div className="reveal bg-white/60 backdrop-blur-sm border border-white rounded-3xl p-8 hover-lift-smooth flex flex-col justify-between relative z-10 animate-fade-in-up">
                        <div>
                            <div className="bg-medical-100/80 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-medical-600 shadow-sm border border-medical-200">
                                <i className="fas fa-headset text-2xl"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Contact Us</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center group cursor-pointer">
                                    <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 transition-all duration-300 border border-gray-200 group-hover:border-medical-500 group-hover:bg-medical-100 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] group-hover:scale-110">
                                        <i className="fas fa-phone-alt text-medical-600 text-lg"></i>
                                    </span>
                                    <a href="tel:+919798881368" className="text-lg font-medium text-gray-700 hover:text-medical-600 transition">+91 97988 81368</a>
                                </li>
                                <li className="flex items-center group cursor-pointer">
                                    <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 transition-all duration-300 border border-gray-200 group-hover:border-medical-500 group-hover:bg-medical-100 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] group-hover:scale-110">
                                        <i className="fas fa-envelope text-medical-600 text-lg"></i>
                                    </span>
                                    <a href="mailto:newluckypharmacy@gmail.com" className="text-base font-medium text-gray-700 hover:text-medical-600 transition">newluckypharmacy@gmail.com</a>
                                </li>
                            </ul>
                        </div>
                        {/* Google Design Call Button (Green) */}
                        <a href="tel:+919798881368" className="mt-8 w-full py-3 bg-medical-600 hover:bg-medical-700 text-white font-medium text-lg text-center rounded-full transition shadow-lg flex items-center justify-center hover:scale-[1.03] border-none">
                            <i className="fas fa-phone-alt mr-2 text-sm"></i> Call Now
                        </a>
                    </div>

                    {/* Box 2: Opening Hours */}
                    <div className="reveal reveal-delay-100 bg-white/60 backdrop-blur-sm border border-white rounded-3xl p-8 hover-lift-smooth animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="bg-medical-100/80 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-medical-600 shadow-sm border border-medical-200">
                            <i className="far fa-clock text-2xl"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Opening Hours</h3>
                        <div className="space-y-4">
                            <div className="border-b border-gray-200 pb-3">
                                <p className="font-bold text-medical-700 mb-2 text-sm uppercase tracking-wide">Mon - Sun (Except Fri)</p>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Morning</span>
                                    <span className="font-bold text-gray-800">6:00 AM - 12:00 PM</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Evening</span>
                                    <span className="font-bold text-gray-800">1:00 PM - 9:00 PM</span>
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-medical-700 mb-2 text-sm uppercase tracking-wide">Friday</p>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Morning</span>
                                    <span className="font-bold text-gray-800">6:00 AM - 12:00 PM</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Evening</span>
                                    <span className="font-bold text-gray-800">2:00 PM - 9:00 PM</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 bg-green-100/60 border border-green-200 text-green-800 py-2 px-4 rounded-lg text-center font-semibold text-sm backdrop-blur-sm">
                            <i className="fas fa-check-circle mr-2"></i> Open 7 Days a Week
                        </div>
                    </div>

                    {/* Box 3: Feedback */}
                    <div className="reveal reveal-delay-200 bg-white/60 backdrop-blur-sm border border-white rounded-3xl p-8 hover-lift-smooth flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div>
                            <div className="bg-yellow-100/80 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-yellow-600 shadow-sm border border-yellow-200">
                                <i className="fas fa-star text-2xl"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">We Value You</h3>
                            <p className="text-gray-600 mb-6">Your feedback helps us serve the Hanwara community better. Rate your experience!</p>
                            
                            <div className="flex text-yellow-400 text-xl mb-6 space-x-1 group">
                                <i className="fas fa-star transition hover:scale-125 drop-shadow-sm"></i>
                                <i className="fas fa-star transition hover:scale-125 delay-75 drop-shadow-sm"></i>
                                <i className="fas fa-star transition hover:scale-125 delay-100 drop-shadow-sm"></i>
                                <i className="fas fa-star transition hover:scale-125 delay-150 drop-shadow-sm"></i>
                                <i className="fas fa-star transition hover:scale-125 delay-200 drop-shadow-sm"></i>
                            </div>
                        </div>

                        <a href="https://www.google.com/search?q=New+Lucky+Pharma+Hanwara+Jharkhand" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-3 bg-white text-gray-700 border border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm group hover:scale-105 duration-300">
                            <svg className="w-6 h-6 mr-2" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 12.01-2.19 15.98-5.96l-7.73-6c-2.15 1.45-4.92 2.3-8.25 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                <path fill="none" d="M0 0h48v48H0z"></path>
                            </svg>
                            Review on Google
                        </a>
                    </div>

                    {/* Box 4: Payment Modes */}
                    <div className="reveal reveal-delay-300 bg-white/60 backdrop-blur-sm border border-white rounded-3xl p-8 hover-lift-smooth flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div>
                            <div className="bg-purple-100/80 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-purple-600 shadow-sm border border-purple-200">
                                <i className="fas fa-wallet text-2xl"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Easy Payments</h3>
                            <p className="text-gray-600 mb-6">Pay securely at the store. We accept Cash and all major UPI apps.</p>
                            
                            <div className="space-y-4">
                                <div className="flex items-center p-3 bg-green-50/70 rounded-xl border border-green-100 hover:bg-green-100/80 transition duration-300 backdrop-blur-sm">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                                        <i className="fas fa-money-bill-wave"></i>
                                    </div>
                                    <span className="font-bold text-gray-700 text-sm">Cash Accepted</span>
                                </div>

                                <div className="p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 transition duration-300">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Scan & Pay via</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/512px-UPI-Logo-vector.svg.png" alt="UPI" className="h-4 object-contain" />
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" alt="GPay" className="h-4 object-contain" />
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/1200px-PhonePe_Logo.svg.png" alt="PhonePe" className="h-5 object-contain" />
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" className="h-3 object-contain" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Box 5: Store Photo (Clickable Link) - Spans 2 Cols on Large Screens */}
                    <a 
                        href="https://www.google.com/search?q=New+Lucky+Pharma+Hanwara+Jharkhand" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="reveal reveal-delay-200 block md:col-span-2 lg:col-span-2 glass-panel rounded-3xl overflow-hidden hover-lift-smooth relative group h-full min-h-[400px] cursor-pointer animate-fade-in-up border-4 border-white"
                        style={{ animationDelay: '0.4s' }}
                    >
                        <img 
                            src="https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop" 
                            alt="Pharmacy Store Front" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                        />
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 backdrop-blur-[2px]">
                            <h3 className="text-white text-xl font-bold">Our Store Front</h3>
                            <p className="text-white/80 text-sm">Main Road, Hanwara</p>
                            <div className="mt-2 inline-flex items-center text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span>View on Google</span>
                                <i className="fas fa-external-link-alt ml-2"></i>
                            </div>
                        </div>
                    </a>

                    {/* Box 6: Map - Spans 2 Cols on Large Screens */}
                    <div id="map-location" className="reveal reveal-delay-400 md:col-span-2 lg:col-span-2 h-auto min-h-[320px] rounded-3xl overflow-hidden glass-panel hover-lift-smooth relative group scroll-mt-24 animate-fade-in-up border-4 border-white" style={{ animationDelay: '0.5s' }}>
                        <iframe 
                            width="100%" 
                            height="100%" 
                            id="gmap_canvas" 
                            src="https://maps.google.com/maps?q=New%20Lucky%20Pharma%2C%20Hanwara%2C%20Jharkhand&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                            frameBorder="0" 
                            scrolling="no" 
                            marginHeight={0} 
                            marginWidth={0}
                            className="w-full h-full bg-gray-200"
                            style={{ filter: 'contrast(1.1)' }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Google Map"
                        >
                        </iframe>
                        
                        <a 
                            href="https://www.google.com/maps/dir/?api=1&destination=New+Lucky+Pharma+Hanwara+Jharkhand" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-medical-600/90 backdrop-blur-sm text-white font-bold py-2 px-6 rounded-full shadow-lg hover:bg-medical-700 transition hover:-translate-y-1 flex items-center z-10 border border-white/50 btn-shine whitespace-nowrap"
                        >
                            <i className="fas fa-directions mr-2"></i> Get Directions
                        </a>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Contact;