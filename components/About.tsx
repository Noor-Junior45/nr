import React from 'react';

const About: React.FC = () => {
    return (
        // Start: White (Matches Hero End) -> End: Emerald-100 (Matches Products Start)
        <section id="about" className="py-12 scroll-mt-24 bg-gradient-to-b from-white via-emerald-50 to-emerald-100">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="reveal glass-card p-6 rounded-2xl hover-lift-smooth text-center group transition-colors duration-300 bg-white/60">
                        <i className="fas fa-hospital-user text-4xl text-medical-600 mb-4 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 drop-shadow-sm"></i>
                        <h3 className="text-xl font-bold mb-2 text-gray-800">Professional Service</h3>
                        <p className="text-gray-600">Experienced pharmacists providing the right guidance for your medication and wellness needs.</p>
                    </div>
                    <div className="reveal reveal-delay-100 glass-card p-6 rounded-2xl hover-lift-smooth text-center group transition-colors duration-300 bg-white/60">
                        <i className="fas fa-map-marked-alt text-4xl text-medical-600 mb-4 transition-transform duration-500 group-hover:scale-110 drop-shadow-sm"></i>
                        <h3 className="text-xl font-bold mb-2 text-gray-800">Easy Location</h3>
                        <p className="text-gray-600">Located conveniently on Main Road, Hanwara (814154). Easy to reach for all local residents.</p>
                    </div>
                    <div className="reveal reveal-delay-200 glass-card p-6 rounded-2xl hover-lift-smooth text-center group transition-colors duration-300 bg-white/60">
                        <i className="fas fa-award text-4xl text-medical-600 mb-4 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 drop-shadow-sm"></i>
                        <h3 className="text-xl font-bold mb-2 text-gray-800">Authentic Products</h3>
                        <p className="text-gray-600">We stock only genuine, certified medicines from trusted manufacturers and suppliers.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;