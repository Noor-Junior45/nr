import React, { useState } from 'react';

const FAQ: React.FC = () => {
    const [openIndices, setOpenIndices] = useState<number[]>([]);

    const faqs = [
        {
            question: "Do I need a prescription to buy medicines?",
            answer: "Yes, for Schedule H and H1 drugs (like antibiotics, sleeping pills, etc.), a valid prescription from a registered medical practitioner is mandatory. However, general OTC (Over-the-Counter) products like vitamins, pain balms, and supplements can be purchased without one."
        },
        {
            question: "What are your store timings?",
            answer: "We are open 7 days a week from 6:00 AM to 9:00 PM. On Fridays, we observe a break from 12:00 PM to 2:00 PM for prayers. We remain open on most public holidays to serve emergency needs."
        },
        {
            question: "Do you offer home delivery?",
            answer: "Currently, we do not offer home delivery services. We request our customers to visit the store personally for their requirements. You can, however, call or WhatsApp us to confirm product availability before your visit."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept Cash and all major UPI apps including PhonePe, Google Pay, and Paytm. We are currently working on enabling credit/debit card swipe machines for your convenience."
        },
        {
            question: "Can I return medicines if I don't need them?",
            answer: "No, generally medicines are not returnable. Only some specific unopened items may be returned. Please ask about the return policy while purchasing."
        },
        {
            question: "Are your medicines authentic?",
            answer: "Absolutely. We source all our medicines directly from authorized stockists and manufacturers. We guarantee 100% genuine and high-quality pharmaceutical products."
        },
        {
            question: "Do you have a pharmacist available for consultation?",
            answer: "Yes, we have experienced pharmacists available at the store during working hours to guide you on dosage, side effects, and general health advice."
        },
        {
            question: "Can I place a bulk order for my clinic?",
            answer: "Yes, we accept bulk orders for clinics and nursing homes. Please contact us directly via phone or WhatsApp to discuss pricing and availability."
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndices(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index) 
                : [...prev, index]
        );
    };

    return (
        // Start: White -> Via: Medical-100/50 (Increased depth) -> End: White
        <section id="faq" className="py-16 scroll-mt-24 bg-gradient-to-b from-white via-medical-100/50 to-white">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12 reveal">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/60 backdrop-blur-md text-medical-800 text-sm font-semibold mb-3 shadow-sm border border-white/50">
                        <i className="fas fa-question-circle mr-1"></i> Help Center
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">Frequently Asked Questions</h2>
                    <p className="text-gray-700 font-medium">Find answers to common questions about our services, timings, and policies.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndices.includes(index);
                        return (
                            <div 
                                key={index} 
                                className={`glass-card rounded-2xl transition-all duration-300 ${isOpen ? 'shadow-lg ring-1 ring-medical-200/50 bg-white' : 'shadow-sm hover:shadow-md bg-white/60'}`}
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none cursor-pointer select-none group"
                                    aria-expanded={isOpen}
                                >
                                    <span className={`font-bold text-lg transition-colors duration-300 ${isOpen ? 'text-medical-700' : 'text-gray-800 group-hover:text-medical-600'}`}>
                                        {faq.question}
                                    </span>
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-medical-100 text-medical-600 rotate-180' : 'bg-white text-gray-400 group-hover:bg-medical-50'}`}>
                                        <i className="fas fa-chevron-down text-sm"></i>
                                    </div>
                                </button>
                                
                                {isOpen && (
                                    <div className="animate-fade-in">
                                        <div className="p-5 pt-0 text-gray-700 border-t border-gray-100 leading-relaxed font-medium">
                                            {faq.answer}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FAQ;