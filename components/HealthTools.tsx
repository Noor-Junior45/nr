import React, { useState } from 'react';

const HealthTools: React.FC = () => {
    // BMI State
    const [weight, setWeight] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const [heightInches, setHeightInches] = useState<string>('');
    
    // Unit States
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
    const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');

    const [bmi, setBmi] = useState<number | null>(null);
    const [bmiCategory, setBmiCategory] = useState<string>('');

    // Water State
    const [waterWeight, setWaterWeight] = useState<string>('');
    const [waterNeed, setWaterNeed] = useState<number | null>(null);
    const [showWaterAnim, setShowWaterAnim] = useState(false);

    const calculateBMI = (e: React.FormEvent) => {
        e.preventDefault();
        let w = parseFloat(weight);
        let h = parseFloat(height);
        let h_in = parseFloat(heightInches || '0');
        
        if (w > 0 && h > 0) {
            // Convert Weight to kg if lbs
            let weightInKg = w;
            if (weightUnit === 'lbs') {
                weightInKg = w * 0.453592;
            }

            // Convert Height to meters
            let heightInMeters = 0;
            if (heightUnit === 'cm') {
                heightInMeters = h / 100;
            } else {
                // Feet to Inches then to Meters
                // 1 ft = 12 inches
                // 1 inch = 0.0254 meters
                const totalInches = (h * 12) + h_in;
                heightInMeters = totalInches * 0.0254;
            }

            if (heightInMeters > 0) {
                const calculatedBmi = weightInKg / (heightInMeters * heightInMeters);
                setBmi(parseFloat(calculatedBmi.toFixed(1)));

                if (calculatedBmi < 18.5) setBmiCategory('Underweight');
                else if (calculatedBmi < 24.9) setBmiCategory('Healthy');
                else if (calculatedBmi < 29.9) setBmiCategory('Overweight');
                else setBmiCategory('Obese');
            }
        }
    };

    const calculateWater = (e: React.FormEvent) => {
        e.preventDefault();
        const w = parseFloat(waterWeight);
        if (w > 0) {
            // Standard recommendation: ~33ml per kg
            const liters = (w * 0.033).toFixed(1);
            setWaterNeed(parseFloat(liters));
            setShowWaterAnim(true);
        }
    };

    // Helper to position the BMI indicator on the bar
    const getBmiPosition = () => {
        if (!bmi) return 0;
        // Map BMI 15-35 to 0-100%
        const min = 15;
        const max = 35;
        const pos = ((bmi - min) / (max - min)) * 100;
        return Math.min(Math.max(pos, 0), 100);
    };

    // AI Consultation Function
    const askAIAboutHealth = () => {
        if (!bmi || !weight || !height) return;

        const heightDisplay = heightUnit === 'ft' ? `${height}ft ${heightInches}in` : `${height}cm`;
        const weightDisplay = `${weight}${weightUnit}`;

        const query = `I just calculated my BMI using your health tool. 
        My Stats:
        - Weight: ${weightDisplay}
        - Height: ${heightDisplay}
        - BMI: ${bmi} (${bmiCategory})
        
        Can you provide a personalized health plan to help me maintain or improve my weight? Please include dietary tips and simple exercises.`;

        // Dispatch Custom Event for AIChat
        const event = new CustomEvent('ask-ai', { 
            detail: { customQuery: query } 
        });
        window.dispatchEvent(event);
    };

    return (
        <section id="tools" className="py-20 scroll-mt-24 bg-gradient-to-b from-gray-50 via-blue-50/30 to-white relative overflow-hidden">
             
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-[-100px] w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute bottom-10 right-[-100px] w-64 h-64 bg-medical-200/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 reveal">
                    <span className="inline-block py-1.5 px-4 rounded-full bg-white border border-medical-200 text-medical-700 text-sm font-bold shadow-sm mb-5 backdrop-blur-md">
                        <i className="fas fa-chart-line mr-2 text-medical-500"></i> Smart Health Dashboard
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Check Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-600 to-blue-500">Health Stats</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Use our interactive tools to monitor your BMI and hydration levels. Get instant AI-powered advice to stay on top of your wellness goals.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                    
                    {/* BMI Calculator Card */}
                    <div className="p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-blue-100 bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 shadow-xl shadow-blue-100/50 reveal ring-1 ring-blue-50">
                        {/* Decorative Background - Enhanced */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-700 opacity-60"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-50 to-transparent rounded-tr-full -z-10 opacity-40"></div>
                        
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-16 h-16 rounded-3xl bg-blue-50 shadow-inner text-blue-600 flex items-center justify-center text-3xl border border-blue-100 group-hover:rotate-12 transition-transform duration-500 ring-2 ring-white">
                                <i className="fas fa-weight-scale"></i>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">BMI Calculator</h3>
                                <p className="text-sm text-blue-500/80 font-bold tracking-wide uppercase">Body Mass Index</p>
                            </div>
                        </div>

                        <form onSubmit={calculateBMI} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Weight Input */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Weight</label>
                                        <div className="flex bg-blue-100/50 rounded-lg p-0.5 gap-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setWeightUnit('kg')}
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${weightUnit === 'kg' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400 hover:text-blue-500'}`}
                                            >
                                                KG
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setWeightUnit('lbs')}
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${weightUnit === 'lbs' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400 hover:text-blue-500'}`}
                                            >
                                                LBS
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative group/input">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg pointer-events-none group-focus-within/input:text-blue-400 transition-colors">
                                            <i className="fas fa-weight"></i>
                                        </div>
                                        <input 
                                            type="number" 
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            className="w-full bg-white border border-blue-100 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-300 font-bold text-gray-800 text-lg transition-all shadow-sm group-hover/input:border-blue-200"
                                            placeholder={weightUnit === 'kg' ? "0" : "0"}
                                        />
                                    </div>
                                </div>

                                {/* Height Input */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Height</label>
                                        <div className="flex bg-blue-100/50 rounded-lg p-0.5 gap-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setHeightUnit('cm')}
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${heightUnit === 'cm' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400 hover:text-blue-500'}`}
                                            >
                                                CM
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setHeightUnit('ft')}
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${heightUnit === 'ft' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400 hover:text-blue-500'}`}
                                            >
                                                FT
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {heightUnit === 'cm' ? (
                                        <div className="relative group/input">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg pointer-events-none group-focus-within/input:text-blue-400 transition-colors">
                                                <i className="fas fa-ruler-vertical"></i>
                                            </div>
                                            <input 
                                                type="number" 
                                                value={height}
                                                onChange={(e) => setHeight(e.target.value)}
                                                className="w-full bg-white border border-blue-100 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-300 font-bold text-gray-800 text-lg transition-all shadow-sm group-hover/input:border-blue-200"
                                                placeholder="0"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <div className="relative group/input flex-1">
                                                <input 
                                                    type="number" 
                                                    value={height}
                                                    onChange={(e) => setHeight(e.target.value)}
                                                    className="w-full bg-white border border-blue-100 rounded-2xl px-3 py-4 text-center focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-300 font-bold text-gray-800 text-lg transition-all shadow-sm group-hover/input:border-blue-200"
                                                    placeholder="Ft"
                                                />
                                            </div>
                                            <div className="relative group/input flex-1">
                                                <input 
                                                    type="number" 
                                                    value={heightInches}
                                                    onChange={(e) => setHeightInches(e.target.value)}
                                                    className="w-full bg-white border border-blue-100 rounded-2xl px-3 py-4 text-center focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-300 font-bold text-gray-800 text-lg transition-all shadow-sm group-hover/input:border-blue-200"
                                                    placeholder="In"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 border border-blue-400/20">
                                <i className="fas fa-calculator"></i> Calculate BMI
                            </button>
                        </form>

                        {/* Result Display */}
                        {bmi !== null && (
                            <div className="mt-8 pt-8 border-t border-blue-100 animate-slide-up">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <span className="text-gray-500 font-medium text-sm uppercase tracking-wide">Your Result</span>
                                        <div className="text-4xl font-extrabold text-blue-600 mt-1">{bmi}</div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                                        bmiCategory === 'Healthy' ? 'bg-green-100 text-green-700 border border-green-200' :
                                        bmiCategory === 'Underweight' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                        'bg-red-100 text-red-700 border border-red-200'
                                    }`}>
                                        {bmiCategory}
                                    </div>
                                </div>
                                
                                <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-6 shadow-inner ring-1 ring-black/5">
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 opacity-90"></div>
                                    <div 
                                        className="absolute top-0 bottom-0 w-1.5 bg-white border-2 border-gray-800 rounded-full z-10 transition-all duration-1000 ease-out shadow-lg"
                                        style={{ left: `${getBmiPosition()}%` }}
                                    ></div>
                                </div>

                                {/* Ask AI Button - Changed to Medical Green */}
                                <button 
                                    onClick={askAIAboutHealth}
                                    className="w-full bg-white hover:bg-medical-50 text-medical-700 font-bold py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 border border-medical-200 group/btn shadow-sm hover:shadow-md"
                                >
                                    <div className="w-8 h-8 rounded-full bg-medical-100 flex items-center justify-center text-medical-700 group-hover/btn:scale-110 transition-transform">
                                        <i className="fas fa-robot"></i>
                                    </div>
                                    <span>Ask AI for Health Advice</span>
                                    <i className="fas fa-arrow-right text-sm opacity-60 group-hover/btn:translate-x-1 transition-transform"></i>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Hydration Tracker Card */}
                    <div className="p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/40 to-cyan-100/20 shadow-xl shadow-cyan-100/50 reveal reveal-delay-200 ring-1 ring-cyan-50">
                        {/* Decorative Background - Enhanced */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-100 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-700 opacity-60"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-50 to-transparent rounded-tr-full -z-10 opacity-40"></div>

                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-16 h-16 rounded-3xl bg-cyan-50 shadow-inner text-cyan-500 flex items-center justify-center text-3xl border border-cyan-100 group-hover:scale-110 transition-transform duration-500 ring-2 ring-white">
                                <i className="fas fa-tint"></i>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">Hydration Needs</h3>
                                <p className="text-sm text-cyan-500/80 font-bold tracking-wide uppercase">Daily Water Intake</p>
                            </div>
                        </div>

                        <form onSubmit={calculateWater} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider ml-1">Body Weight (kg)</label>
                                <div className="relative group/input">
                                    <input 
                                        type="number" 
                                        value={waterWeight}
                                        onChange={(e) => setWaterWeight(e.target.value)}
                                        className="w-full bg-white border border-cyan-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-cyan-100/50 focus:border-cyan-400 font-bold text-gray-800 text-lg transition-all shadow-sm group-hover/input:border-cyan-200"
                                        placeholder="Enter weight..."
                                    />
                                    <button className="absolute right-3 top-2 bottom-2 bg-cyan-500 hover:bg-cyan-600 text-white px-6 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 border-b-2 border-cyan-700 active:border-b-0 active:translate-y-[2px]">
                                        Check
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Result Display with Water Animation */}
                        {waterNeed !== null ? (
                            <div className="mt-8 animate-slide-up relative overflow-hidden rounded-3xl border border-cyan-200 shadow-lg shadow-cyan-200/40 min-h-[160px] flex items-center justify-center group/water bg-white">
                                
                                {/* Animated Water Background */}
                                <div 
                                    className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-cyan-500 to-cyan-300 transition-all duration-[1500ms] ease-out z-0 flex items-start justify-center overflow-hidden ${showWaterAnim ? 'h-full' : 'h-0'}`}
                                >
                                    {/* Wave Effect */}
                                    <div className="absolute -top-10 -left-[50%] w-[200%] h-20 bg-white/30 rounded-[40%] animate-wave"></div>
                                    <div className="absolute -top-10 -left-[50%] w-[200%] h-20 bg-white/20 rounded-[45%] animate-wave" style={{ animationDelay: '-2s', animationDuration: '7s' }}></div>

                                    {/* Rising Bubbles */}
                                    <div className="absolute w-2 h-2 bg-white/40 rounded-full left-[10%] bottom-0 animate-rise" style={{ animationDelay: '0s' }}></div>
                                    <div className="absolute w-3 h-3 bg-white/30 rounded-full left-[25%] bottom-0 animate-rise" style={{ animationDelay: '1s', animationDuration: '6s' }}></div>
                                    <div className="absolute w-4 h-4 bg-white/20 rounded-full left-[60%] bottom-0 animate-rise" style={{ animationDelay: '2s', animationDuration: '8s' }}></div>
                                    <div className="absolute w-2 h-2 bg-white/40 rounded-full left-[85%] bottom-0 animate-rise" style={{ animationDelay: '3s', animationDuration: '5s' }}></div>
                                </div>

                                {/* Content Layer */}
                                <div className="relative z-10 flex items-center justify-between w-full px-8 py-6 text-white">
                                    <div className="text-left">
                                        <p className="text-cyan-100 text-xs font-bold uppercase tracking-wider mb-1 drop-shadow-md">Daily Target</p>
                                        <p className="text-5xl font-extrabold mb-1 drop-shadow-md">{waterNeed} <span className="text-2xl opacity-90">L</span></p>
                                        <div className="flex items-center gap-2 mt-2 bg-white/20 backdrop-blur-md py-1.5 px-3 rounded-lg w-fit border border-white/30 shadow-sm">
                                            <i className="fas fa-glass-water"></i>
                                            <p className="text-xs font-bold">≈ {Math.round(waterNeed * 4)} Glasses</p>
                                        </div>
                                    </div>
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-3xl shadow-lg border border-white/40 animate-bounce-subtle">
                                         <i className="fas fa-check"></i>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-8 p-6 bg-white/60 rounded-3xl border border-dashed border-cyan-200 text-center flex flex-col items-center justify-center min-h-[140px] group-hover:bg-white/80 transition-colors">
                                <i className="fas fa-glass-water text-3xl text-cyan-200 mb-3 group-hover:scale-110 transition-transform"></i>
                                <p className="text-sm text-gray-500 italic font-medium">"Staying hydrated boosts energy and immunity!"</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HealthTools;