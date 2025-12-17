import React, { useState, useEffect, useRef } from 'react';
import { getGeminiResponse } from '../services/geminiService';

// Reminder Type
interface Reminder {
    id: number;
    name: string;
    time: string;
}

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

    // Medicine Reminder State
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [medName, setMedName] = useState('');
    const [medTime, setMedTime] = useState('');
    
    // Time Picker Mode State
    const [timeMode, setTimeMode] = useState<'digital' | 'analog'>('digital');
    
    // Analog Clock State
    const [analogHour, setAnalogHour] = useState(12);
    const [analogMinute, setAnalogMinute] = useState(0);
    const [analogAmPm, setAnalogAmPm] = useState<'AM' | 'PM'>('AM');
    const [clockView, setClockView] = useState<'hours' | 'minutes'>('hours');

    // Camera Scan State
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Breathing Tool State
    const [isBreathing, setIsBreathing] = useState(false);
    const [breathText, setBreathText] = useState("Ready");
    const [breathScale, setBreathScale] = useState(1); // 1 = normal
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'ready'>('ready');

    // Load Reminders & Request Permission
    useEffect(() => {
        const saved = localStorage.getItem('lucky_pharma_reminders');
        if (saved) setReminders(JSON.parse(saved));

        // Request notification permission
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }

        // Check for reminders every minute
        const interval = setInterval(checkReminders, 60000);
        return () => clearInterval(interval);
    }, []);

    // Breathing Logic Effect
    useEffect(() => {
        if (!isBreathing) {
            setBreathText("Ready");
            setBreathScale(1);
            setBreathPhase('ready');
            return;
        }

        let step = 0;
        const cycle = () => {
            // Box Breathing Variant (Simplified): 4s Inhale, 4s Hold, 4s Exhale
            const mode = step % 3;
            if (mode === 0) {
                setBreathText("Inhale");
                setBreathScale(1.5); // Expand
                setBreathPhase('inhale');
            } else if (mode === 1) {
                setBreathText("Hold");
                setBreathScale(1.5); // Maintain
                setBreathPhase('hold');
            } else {
                setBreathText("Exhale");
                setBreathScale(1); // Contract
                setBreathPhase('exhale');
            }
            step++;
        };

        cycle(); // Start immediately
        const interval = setInterval(cycle, 4000); // 4 seconds per phase

        return () => clearInterval(interval);
    }, [isBreathing]);

    // Sync Analog State to medTime string when in Analog mode
    useEffect(() => {
        if (timeMode === 'analog') {
            let h = analogHour;
            if (analogAmPm === 'PM' && h !== 12) h += 12;
            if (analogAmPm === 'AM' && h === 12) h = 0;
            const timeString = `${h.toString().padStart(2, '0')}:${analogMinute.toString().padStart(2, '0')}`;
            setMedTime(timeString);
        }
    }, [analogHour, analogMinute, analogAmPm, timeMode]);

    // Initialize Analog state when switching to Analog mode
    useEffect(() => {
        if (timeMode === 'analog' && medTime) {
            const [hStr, mStr] = medTime.split(':');
            let h = parseInt(hStr);
            const m = parseInt(mStr);
            
            let ampm: 'AM' | 'PM' = 'AM';
            if (h >= 12) {
                ampm = 'PM';
                if (h > 12) h -= 12;
            }
            if (h === 0) h = 12;

            setAnalogHour(h);
            setAnalogMinute(m);
            setAnalogAmPm(ampm);
        }
    }, [timeMode]);

    const checkReminders = () => {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        
        const saved = localStorage.getItem('lucky_pharma_reminders');
        if (!saved) return;
        const currentList: Reminder[] = JSON.parse(saved);

        currentList.forEach(r => {
            if (r.time === currentTime) {
                // Send Notification
                if (Notification.permission === 'granted') {
                    new Notification("Medicine Time! 💊", {
                        body: `It's time to take ${r.name}`,
                        icon: '/favicon.ico' // Assuming standard favicon
                    });
                } else {
                    alert(`💊 Time to take your medicine: ${r.name}`);
                }
            }
        });
    };

    const addReminder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!medName || !medTime) return;

        // Create display friendly time for the list (optional, but keeping 24h for simplicity of logic)
        const newReminder = { id: Date.now(), name: medName, time: medTime };
        const updated = [...reminders, newReminder];
        setReminders(updated);
        localStorage.setItem('lucky_pharma_reminders', JSON.stringify(updated));
        setMedName('');
        // Don't clear time immediately in analog mode so they can add another easily
        if (timeMode === 'digital') setMedTime('');
    };

    const deleteReminder = (id: number) => {
        const updated = reminders.filter(r => r.id !== id);
        setReminders(updated);
        localStorage.setItem('lucky_pharma_reminders', JSON.stringify(updated));
    };

    // Camera Scan Functions
    const triggerCamera = () => {
        fileInputRef.current?.click();
    };

    const handleImageScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Data = reader.result as string;
                
                // Prompt Gemini to extract ONLY the name
                const prompt = "Identify the brand name or generic name of the medicine in this image. Return ONLY the name as a clean string. Do not add any conversational text or punctuation.";
                
                const response = await getGeminiResponse(prompt, base64Data);
                
                if (response.text) {
                    // Clean text (remove any markdown like bolding)
                    const extractedName = response.text.replace(/[*_#]/g, '').trim();
                    setMedName(extractedName);
                }
                setIsScanning(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Scan failed", error);
            setIsScanning(false);
        }
        
        // Reset input so same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

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

    // Helper for Analog Clock positioning
    const getClockNumberPosition = (index: number, total: number, radius: number) => {
        // -90deg offset to start at top (12 o'clock)
        const angle = (index * (360 / total)) - 90;
        const radian = (angle * Math.PI) / 180;
        // 50% is center
        const x = 50 + radius * Math.cos(radian);
        const y = 50 + radius * Math.sin(radian);
        return { left: `${x}%`, top: `${y}%` };
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    
                    {/* BMI Calculator Card */}
                    <div className="p-8 rounded-[2.5rem] relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-blue-100 bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 shadow-xl shadow-blue-100/50 reveal ring-1 ring-blue-50">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-16 h-16 rounded-3xl bg-blue-50 shadow-inner text-blue-600 flex items-center justify-center text-3xl border border-blue-100 group-hover:rotate-12 transition-transform duration-500 ring-2 ring-white">
                                <i className="fas fa-weight-scale"></i>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">BMI Calculator</h3>
                                <p className="text-xs text-blue-500/80 font-bold tracking-wide uppercase">Body Mass Index</p>
                            </div>
                        </div>

                        <form onSubmit={calculateBMI} className="space-y-4">
                             {/* ... (Existing BMI Form Logic) ... */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Weight</label>
                                    <div className="flex bg-blue-100/50 rounded-lg p-0.5 gap-0.5">
                                        <button type="button" onClick={() => setWeightUnit('kg')} className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${weightUnit === 'kg' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400 hover:text-blue-500'}`}>KG</button>
                                        <button type="button" onClick={() => setWeightUnit('lbs')} className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${weightUnit === 'lbs' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400 hover:text-blue-500'}`}>LBS</button>
                                    </div>
                                </div>
                                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 font-bold text-gray-800" placeholder={weightUnit} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Height</label>
                                    <div className="flex bg-blue-100/50 rounded-lg p-0.5 gap-0.5">
                                        <button type="button" onClick={() => setHeightUnit('cm')} className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${heightUnit === 'cm' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400 hover:text-blue-500'}`}>CM</button>
                                        <button type="button" onClick={() => setHeightUnit('ft')} className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${heightUnit === 'ft' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400 hover:text-blue-500'}`}>FT</button>
                                    </div>
                                </div>
                                {heightUnit === 'cm' ? (
                                    <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 font-bold text-gray-800" placeholder="cm" />
                                ) : (
                                    <div className="flex gap-2">
                                        <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-white border border-blue-100 rounded-xl px-3 py-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-200 font-bold text-gray-800" placeholder="Ft" />
                                        <input type="number" value={heightInches} onChange={(e) => setHeightInches(e.target.value)} className="w-full bg-white border border-blue-100 rounded-xl px-3 py-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-200 font-bold text-gray-800" placeholder="In" />
                                    </div>
                                )}
                            </div>

                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all">
                                Calculate
                            </button>
                        </form>

                        {/* Result Display */}
                        {bmi !== null && (
                            <div className="mt-6 pt-6 border-t border-blue-100 animate-slide-up">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <span className="text-gray-500 font-medium text-xs uppercase">BMI Score</span>
                                        <div className="text-3xl font-extrabold text-blue-600">{bmi}</div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-xs font-bold ${bmiCategory === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {bmiCategory}
                                    </div>
                                </div>
                                
                                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-green-400 to-red-400 opacity-80"></div>
                                    <div className="absolute top-0 bottom-0 w-1.5 bg-white border border-gray-500 rounded-full z-10 transition-all duration-1000" style={{ left: `${getBmiPosition()}%` }}></div>
                                </div>

                                <button onClick={askAIAboutHealth} className="w-full bg-medical-50 text-medical-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 border border-medical-100 hover:bg-medical-100 transition">
                                    <i className="fas fa-robot"></i> Ask AI Advice
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Hydration Tracker Card */}
                    <div className="p-8 rounded-[2.5rem] relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/40 to-cyan-100/20 shadow-xl shadow-cyan-100/50 reveal reveal-delay-200 ring-1 ring-cyan-50">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-16 h-16 rounded-3xl bg-cyan-50 shadow-inner text-cyan-500 flex items-center justify-center text-3xl border border-cyan-100 group-hover:scale-110 transition-transform duration-500 ring-2 ring-white">
                                <i className="fas fa-tint"></i>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Hydration</h3>
                                <p className="text-xs text-cyan-500/80 font-bold tracking-wide uppercase">Daily Water Goal</p>
                            </div>
                        </div>

                        <form onSubmit={calculateWater} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider ml-1">Body Weight (kg)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={waterWeight}
                                        onChange={(e) => setWaterWeight(e.target.value)}
                                        className="w-full bg-white border border-cyan-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-200 font-bold text-gray-800"
                                        placeholder="Enter weight..."
                                    />
                                    <button className="absolute right-1 top-1 bottom-1 bg-cyan-500 hover:bg-cyan-600 text-white px-4 rounded-lg font-bold text-sm transition-all">
                                        Check
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Result Display */}
                        {waterNeed !== null ? (
                            <div className="mt-8 animate-slide-up relative overflow-hidden rounded-3xl border border-cyan-200 shadow-lg min-h-[140px] flex items-center justify-center group/water bg-white">
                                <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-cyan-500 to-cyan-300 transition-all duration-[1500ms] ease-out z-0 flex items-start justify-center overflow-hidden ${showWaterAnim ? 'h-full' : 'h-0'}`}>
                                    <div className="absolute -top-10 -left-[50%] w-[200%] h-20 bg-white/30 rounded-[40%] animate-wave"></div>
                                </div>
                                <div className="relative z-10 text-white text-center">
                                    <p className="text-4xl font-extrabold mb-1 drop-shadow-md">{waterNeed}L</p>
                                    <p className="text-xs font-bold opacity-90">Daily Target</p>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-8 p-6 bg-white/60 rounded-3xl border border-dashed border-cyan-200 text-center flex flex-col items-center justify-center min-h-[140px]">
                                <i className="fas fa-glass-water text-3xl text-cyan-200 mb-3"></i>
                                <p className="text-xs text-gray-500 font-medium">Drink ~33ml per kg of body weight.</p>
                            </div>
                        )}
                    </div>

                    {/* MEDICINE REMINDER CARD */}
                    <div className="p-8 rounded-[2.5rem] relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-purple-100 bg-gradient-to-br from-white via-purple-50/40 to-purple-100/20 shadow-xl shadow-purple-100/50 reveal reveal-delay-300 ring-1 ring-purple-50">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-3xl bg-purple-50 shadow-inner text-purple-600 flex items-center justify-center text-3xl border border-purple-100 group-hover:scale-110 transition-transform duration-500 ring-2 ring-white">
                                    <i className="fas fa-bell"></i>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Pill Reminder</h3>
                                    <p className="text-xs text-purple-500/80 font-bold tracking-wide uppercase">Never Miss a Dose</p>
                                </div>
                            </div>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex bg-purple-100/50 p-1 rounded-xl mb-4 relative z-20">
                            <button 
                                onClick={() => setTimeMode('digital')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${timeMode === 'digital' ? 'bg-white text-purple-600 shadow-sm' : 'text-purple-400 hover:text-purple-600'}`}
                            >
                                <i className="fas fa-keyboard mr-1"></i> Digital
                            </button>
                            <button 
                                onClick={() => setTimeMode('analog')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${timeMode === 'analog' ? 'bg-white text-purple-600 shadow-sm' : 'text-purple-400 hover:text-purple-600'}`}
                            >
                                <i className="far fa-clock mr-1"></i> Analog
                            </button>
                        </div>

                        <form onSubmit={addReminder} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-purple-400 uppercase tracking-wider ml-1">Medicine Name</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={medName}
                                        onChange={(e) => setMedName(e.target.value)}
                                        className="w-full bg-white border border-purple-100 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-200 font-bold text-gray-800"
                                        placeholder="Ex: Paracetamol"
                                    />
                                    {/* Camera Scan Button */}
                                    <button 
                                        type="button"
                                        onClick={triggerCamera}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-purple-500 hover:text-white hover:bg-purple-500 rounded-full transition-all"
                                        title="Scan medicine name"
                                        disabled={isScanning}
                                    >
                                        {isScanning ? (
                                            <i className="fas fa-spinner fa-spin"></i>
                                        ) : (
                                            <i className="fas fa-camera"></i>
                                        )}
                                    </button>
                                    {/* Hidden File Input */}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={handleImageScan}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-purple-400 uppercase tracking-wider ml-1">Set Time</label>
                                
                                {timeMode === 'digital' ? (
                                    <div className="flex gap-2">
                                        <input 
                                            type="time" 
                                            value={medTime}
                                            onChange={(e) => setMedTime(e.target.value)}
                                            className="flex-1 bg-white border border-purple-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-200 font-bold text-gray-800"
                                        />
                                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-xl font-bold transition-all shadow-md active:scale-95">
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
                                ) : (
                                    // ANALOG CLOCK INTERFACE
                                    <div className="bg-white border border-purple-100 rounded-2xl p-4 flex flex-col items-center animate-fade-in">
                                        {/* Display */}
                                        <div className="flex items-end gap-2 mb-4">
                                            <button 
                                                type="button" 
                                                onClick={() => setClockView('hours')}
                                                className={`text-2xl font-bold p-1 rounded transition-colors ${clockView === 'hours' ? 'text-purple-600 bg-purple-50' : 'text-gray-400'}`}
                                            >
                                                {analogHour.toString().padStart(2, '0')}
                                            </button>
                                            <span className="text-2xl font-bold text-gray-300 mb-1">:</span>
                                            <button 
                                                type="button" 
                                                onClick={() => setClockView('minutes')}
                                                className={`text-2xl font-bold p-1 rounded transition-colors ${clockView === 'minutes' ? 'text-purple-600 bg-purple-50' : 'text-gray-400'}`}
                                            >
                                                {analogMinute.toString().padStart(2, '0')}
                                            </button>
                                            <div className="flex flex-col ml-2 border border-purple-100 rounded-lg overflow-hidden">
                                                <button 
                                                    type="button"
                                                    onClick={() => setAnalogAmPm('AM')} 
                                                    className={`px-2 py-0.5 text-[10px] font-bold ${analogAmPm === 'AM' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:bg-purple-50'}`}
                                                >AM</button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setAnalogAmPm('PM')} 
                                                    className={`px-2 py-0.5 text-[10px] font-bold ${analogAmPm === 'PM' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:bg-purple-50'}`}
                                                >PM</button>
                                            </div>
                                        </div>

                                        {/* Clock Face */}
                                        <div className="w-48 h-48 rounded-full bg-purple-50 relative shadow-inner border border-purple-100 mx-auto">
                                            {/* Center Dot */}
                                            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"></div>
                                            
                                            {/* Numbers */}
                                            {clockView === 'hours' ? (
                                                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                                                    const pos = getClockNumberPosition(num, 12, 40);
                                                    return (
                                                        <button
                                                            key={num}
                                                            type="button"
                                                            onClick={() => { setAnalogHour(num); setClockView('minutes'); }}
                                                            className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                                                                analogHour === num 
                                                                ? 'bg-purple-500 text-white scale-110 shadow-md' 
                                                                : 'text-gray-500 hover:bg-purple-200 hover:text-purple-700'
                                                            }`}
                                                            style={pos}
                                                        >
                                                            {num}
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((num, i) => {
                                                    const pos = getClockNumberPosition(i * 5, 60, 40);
                                                    return (
                                                        <button
                                                            key={num}
                                                            type="button"
                                                            onClick={() => setAnalogMinute(num)}
                                                            className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                                                                analogMinute === num 
                                                                ? 'bg-purple-500 text-white scale-110 shadow-md' 
                                                                : 'text-gray-500 hover:bg-purple-200 hover:text-purple-700'
                                                            }`}
                                                            style={pos}
                                                        >
                                                            {num.toString().padStart(2, '0')}
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                        
                                        <button 
                                            className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                            onClick={addReminder} // triggers form submit logic
                                        >
                                            <i className="fas fa-plus"></i> Add Reminder
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>

                        {/* Reminder List */}
                        <div className="mt-6 space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                            {reminders.length > 0 ? reminders.map(reminder => (
                                <div key={reminder.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-purple-50 shadow-sm animate-fade-in">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-xs">
                                            <i className="fas fa-pills"></i>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{reminder.name}</p>
                                            <p className="text-xs text-purple-400 font-bold">{reminder.time}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => deleteReminder(reminder.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors px-2"
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            )) : (
                                <div className="text-center py-6 text-gray-400 text-sm">
                                    No active reminders.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* STRESS RELIEF BREATHING TOOL - FIXED DESIGN */}
                    <div className="relative p-8 rounded-[2.5rem] overflow-hidden border border-emerald-100 bg-white shadow-xl shadow-emerald-100/50 flex flex-col justify-between min-h-[420px] group transition-all duration-500 hover:shadow-2xl">
                        
                        {/* Dynamic Background */}
                        <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isBreathing ? 'bg-emerald-50 opacity-100' : 'bg-gradient-to-br from-white via-emerald-50/20 to-emerald-100/10 opacity-100'}`}></div>
                        
                        {/* Decorative Blobs */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className={`absolute -top-24 -right-24 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl transition-all duration-1000 ${isBreathing ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}></div>
                            <div className={`absolute -bottom-24 -left-24 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl transition-all duration-1000 ${isBreathing ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}></div>
                        </div>

                        {/* Header */}
                        <div className="relative z-10 flex items-center gap-5 mb-6">
                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-sm transition-all duration-500 border ${isBreathing ? 'bg-white text-emerald-500 border-emerald-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                <i className="fas fa-lungs"></i>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Stress Relief</h3>
                                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Breathing Exercise</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
                            {/* Breathing Orb Container */}
                            <div className="relative w-64 h-64 flex items-center justify-center">
                                 
                                 {/* Rings */}
                                 {[1, 2, 3].map((i) => (
                                     <div 
                                        key={i}
                                        className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
                                        style={{
                                            transform: isBreathing ? `scale(${breathScale + (i * 0.2)})` : 'scale(1)',
                                            opacity: isBreathing ? Math.max(0, 0.4 - (i * 0.1)) : 0,
                                            transition: 'transform 4s ease-in-out, opacity 4s ease-in-out'
                                        }}
                                     />
                                 ))}

                                {/* Core Orb */}
                                <div 
                                    className="w-32 h-32 rounded-full relative flex items-center justify-center shadow-lg z-20"
                                    style={{ 
                                        transform: isBreathing ? `scale(${breathScale})` : 'scale(1)',
                                        background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                                        boxShadow: isBreathing ? '0 0 40px rgba(52, 211, 153, 0.6)' : '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
                                        transition: 'transform 4s ease-in-out, box-shadow 4s ease-in-out'
                                    }}
                                >
                                    {/* Shine effect */}
                                    <div className="absolute top-3 left-4 w-8 h-4 bg-white/30 rounded-full blur-[2px] -rotate-45"></div>
                                    
                                    {/* Text */}
                                    <span className="text-white font-bold text-xl tracking-widest uppercase drop-shadow-md animate-fade-in">
                                        {breathText}
                                    </span>
                                </div>
                                
                                {/* Orbiting Particles (Only when breathing) */}
                                 <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isBreathing ? 'opacity-100 animate-spin-slow' : 'opacity-0'}`}>
                                    <div className="absolute top-0 left-1/2 w-3 h-3 bg-emerald-300 rounded-full blur-[1px] shadow-lg transform -translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-teal-300 rounded-full blur-[1px] shadow-lg transform -translate-x-1/2 translate-y-1/2"></div>
                                </div>
                            </div>

                            <p className={`mt-6 text-sm font-semibold text-center transition-colors duration-500 ${isBreathing ? 'text-emerald-700' : 'text-gray-500'}`}>
                                 {isBreathing ? "Follow the rhythm..." : "4s Inhale • 4s Hold • 4s Exhale"}
                            </p>
                        </div>

                        {/* Footer Button */}
                        <div className="relative z-10 mt-6">
                            <button 
                                onClick={() => setIsBreathing(!isBreathing)}
                                className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                                    isBreathing 
                                    ? 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50' 
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-500/30'
                                }`}
                            >
                                {isBreathing ? (
                                    <><i className="fas fa-stop circle"></i> Stop Session</>
                                ) : (
                                    <><i className="fas fa-play"></i> Start Breathing</>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HealthTools;