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

    // AI Insight State
    const [activeFocus, setActiveFocus] = useState<string | null>(null);
    const [smartTip, setSmartTip] = useState<string>('');
    const [aiBmiAdvice, setAiBmiAdvice] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [adviceCopied, setAdviceCopied] = useState(false);

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
    const [isMuted, setIsMuted] = useState(false);
    const [breathText, setBreathText] = useState("Ready");
    const [breathScale, setBreathScale] = useState(1); 
    const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'ready'>('ready');
    const [breathingSeconds, setBreathingSeconds] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Load Reminders & Request Permission
    useEffect(() => {
        const saved = localStorage.getItem('lucky_pharma_reminders');
        if (saved) setReminders(JSON.parse(saved));

        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }

        const interval = setInterval(checkReminders, 60000);
        return () => clearInterval(interval);
    }, []);

    // Smart Tip Logic
    useEffect(() => {
        if (!activeFocus) {
            setSmartTip('');
            return;
        }

        let tip = "";
        const w = parseFloat(weight);
        const h = parseFloat(height);

        if (activeFocus === 'weight') {
            if (w > 0) {
                if (weightUnit === 'kg' && w > 90) tip = "💡 Consistent cardio exercises like walking can help manage weight effectively.";
                else if (weightUnit === 'kg' && w < 50) tip = "💡 Increasing protein intake is great for healthy muscle gain.";
                else tip = "💡 Tracking your weight weekly is a good habit for health maintenance.";
            } else {
                 tip = "✨ Enter your weight to get personalized health insights.";
            }
        } else if (activeFocus === 'height') {
            if (h > 0) {
                 tip = "💡 Height is a key factor in calculating your Body Mass Index (BMI).";
            } else {
                 tip = "✨ Accurate height measurement ensures a precise BMI score.";
            }
        }
        
        setSmartTip(tip);
    }, [activeFocus, weight, height, weightUnit]);

    // Audio Cue Functions
    const playChime = () => {
        if (isMuted) return;
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // High soft tone
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio chime failed", e);
        }
    };

    const speakPhase = (text: string) => {
        if (isMuted) return;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop current speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9; // Slightly slower for calm
            utterance.pitch = 1.1; 
            utterance.volume = 0.5;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Breathing Logic Effect
    useEffect(() => {
        if (!isBreathing) {
            setBreathText("Ready");
            setBreathScale(1);
            setBreathPhase('ready');
            setBreathingSeconds(0);
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            return;
        }

        const timerInterval = setInterval(() => {
            setBreathingSeconds(prev => prev + 1);
        }, 1000);

        let step = 0;
        const cycle = () => {
            const mode = step % 3;
            let currentText = "";
            
            if (mode === 0) {
                currentText = "Inhale";
                setBreathScale(1.5);
                setBreathPhase('inhale');
            } else if (mode === 1) {
                currentText = "Hold";
                setBreathScale(1.5);
                setBreathPhase('hold');
            } else {
                currentText = "Exhale";
                setBreathScale(1);
                setBreathPhase('exhale');
            }
            
            setBreathText(currentText);
            playChime();
            speakPhase(currentText);
            step++;
        };

        cycle();
        const cycleInterval = setInterval(cycle, 4000);

        return () => {
            clearInterval(timerInterval);
            clearInterval(cycleInterval);
        };
    }, [isBreathing, isMuted]);

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Sync Analog State
    useEffect(() => {
        if (timeMode === 'analog') {
            let h = analogHour;
            if (analogAmPm === 'PM' && h !== 12) h += 12;
            if (analogAmPm === 'AM' && h === 12) h = 0;
            const timeString = `${h.toString().padStart(2, '0')}:${analogMinute.toString().padStart(2, '0')}`;
            setMedTime(timeString);
        }
    }, [analogHour, analogMinute, analogAmPm, timeMode]);

    // Initialize Analog state
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
                if (Notification.permission === 'granted') {
                    new Notification("Medicine Time! 💊", {
                        body: `It's time to take ${r.name}`,
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

        const newReminder = { id: Date.now(), name: medName, time: medTime };
        const updated = [...reminders, newReminder];
        setReminders(updated);
        localStorage.setItem('lucky_pharma_reminders', JSON.stringify(updated));
        setMedName('');
        if (timeMode === 'digital') setMedTime('');
    };

    const deleteReminder = (id: number) => {
        const updated = reminders.filter(r => r.id !== id);
        setReminders(updated);
        localStorage.setItem('lucky_pharma_reminders', JSON.stringify(updated));
    };

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
                const prompt = "Identify the brand name of the medicine in this image. Return ONLY the name as a clean string.";
                const response = await getGeminiResponse(prompt, base64Data);
                if (response.text) {
                    setMedName(response.text.replace(/[*_#]/g, '').trim());
                }
                setIsScanning(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Scan failed", error);
            setIsScanning(false);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const calculateBMI = (e: React.FormEvent) => {
        e.preventDefault();
        let w = parseFloat(weight);
        let h = parseFloat(height);
        let h_in = parseFloat(heightInches || '0');
        
        if (w > 0 && h > 0) {
            let weightInKg = w;
            if (weightUnit === 'lbs') {
                weightInKg = w * 0.453592;
            }

            let heightInMeters = 0;
            if (heightUnit === 'cm') {
                heightInMeters = h / 100;
            } else {
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
                
                setAiBmiAdvice(null);
                setAdviceCopied(false);
            }
        }
    };

    const calculateWater = (e: React.FormEvent) => {
        e.preventDefault();
        const w = parseFloat(waterWeight);
        if (w > 0) {
            const liters = (w * 0.033).toFixed(1);
            setWaterNeed(parseFloat(liters));
            setShowWaterAnim(true);
        }
    };

    const getBmiPosition = () => {
        if (!bmi) return 0;
        const min = 15;
        const max = 35;
        const pos = ((bmi - min) / (max - min)) * 100;
        return Math.min(Math.max(pos, 0), 100);
    };

    const getClockNumberPosition = (index: number, total: number, radius: number) => {
        const angle = (index * (360 / total)) - 90;
        const radian = (angle * Math.PI) / 180;
        const x = 50 + radius * Math.cos(radian);
        const y = 50 + radius * Math.sin(radian);
        return { left: `${x}%`, top: `${y}%` };
    };

    const askAIAboutHealth = async () => {
        if (!bmi || !weight || !height) return;
        
        setIsAiLoading(true);
        setAiBmiAdvice(null);
        setAdviceCopied(false);

        const heightDisplay = heightUnit === 'ft' ? `${height}ft ${heightInches}in` : `${height}cm`;
        const weightDisplay = `${weight}${weightUnit}`;
        const query = `I just used your BMI tool. Weight: ${weightDisplay}, Height: ${heightDisplay}, BMI: ${bmi} (${bmiCategory}). Give me 3 bullet points of quick, professional advice for my health category. Keep it brief and friendly.`;
        
        try {
            const response = await getGeminiResponse(query);
            if (response.text) {
                setAiBmiAdvice(response.text);
            }
        } catch (error) {
            console.error("AI Advice Error:", error);
        } finally {
            setIsAiLoading(false);
        }
    };

    const renderFormattedAdvice = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="text-indigo-900 font-bold">{part.slice(2, -2)}</strong>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    const copyAdvice = async () => {
        if (!aiBmiAdvice) return;
        const cleanText = aiBmiAdvice.replace(/\*\*/g, '');
        try {
            await navigator.clipboard.writeText(cleanText);
            setAdviceCopied(true);
            setTimeout(() => setAdviceCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    return (
        <section id="tools" className="py-20 scroll-mt-24 bg-gradient-to-b from-gray-50 via-blue-50/30 to-white relative overflow-hidden">
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
                    
                    {/* BMI Calculator */}
                    <div className="hover-lift-smooth p-8 rounded-[2.5rem] relative overflow-visible group border border-blue-100 bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 shadow-xl shadow-blue-100/50 reveal-scale ring-1 ring-blue-50">
                        {activeFocus && smartTip && (
                            <div className="absolute -top-10 right-8 z-30 animate-popup-in">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 max-w-[250px] relative">
                                    <i className="fas fa-magic animate-pulse"></i>
                                    <span>{smartTip}</span>
                                    <div className="absolute -bottom-2 right-10 w-4 h-4 bg-purple-500 transform rotate-45"></div>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-5 mb-8 animate-fade-in-up">
                            <div className="w-16 h-16 rounded-3xl bg-blue-50 shadow-inner text-blue-600 flex items-center justify-center text-3xl border border-blue-100 group-hover:animate-spring-bounce transition-all duration-500 ring-2 ring-white">
                                <i className="fas fa-weight-scale"></i>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">BMI Calculator</h3>
                                <p className="text-xs text-blue-500/80 font-bold tracking-wide uppercase">Body Mass Index</p>
                            </div>
                        </div>
                        <form onSubmit={calculateBMI} className="space-y-4">
                            <div className="space-y-2 relative animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Weight</label>
                                    <div className="flex bg-blue-100/50 rounded-lg p-0.5 gap-0.5">
                                        <button type="button" onClick={() => setWeightUnit('kg')} className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${weightUnit === 'kg' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400 hover:text-blue-500'}`}>KG</button>
                                        <button type="button" onClick={() => setWeightUnit('lbs')} className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${weightUnit === 'lbs' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400 hover:text-blue-500'}`}>LBS</button>
                                    </div>
                                </div>
                                <input 
                                    type="number" 
                                    value={weight} 
                                    onFocus={() => setActiveFocus('weight')}
                                    onBlur={() => setActiveFocus(null)}
                                    onChange={(e) => setWeight(e.target.value)} 
                                    className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 font-bold text-gray-800 transition-all hover:border-blue-300" 
                                    placeholder={weightUnit} 
                                />
                            </div>
                            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Height</label>
                                    <div className="flex bg-blue-100/50 rounded-lg p-0.5 gap-0.5">
                                        <button type="button" onClick={() => setHeightUnit('cm')} className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${heightUnit === 'cm' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400 hover:text-blue-500'}`}>CM</button>
                                        <button type="button" onClick={() => setHeightUnit('ft')} className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${heightUnit === 'ft' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400 hover:text-blue-500'}`}>FT</button>
                                    </div>
                                </div>
                                {heightUnit === 'cm' ? (
                                    <input 
                                        type="number" 
                                        value={height} 
                                        onFocus={() => setActiveFocus('height')}
                                        onBlur={() => setActiveFocus(null)}
                                        onChange={(e) => setHeight(e.target.value)} 
                                        className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 font-bold text-gray-800 transition-all hover:border-blue-300" 
                                        placeholder="cm" 
                                    />
                                ) : (
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" 
                                            value={height} 
                                            onFocus={() => setActiveFocus('height')}
                                            onBlur={() => setActiveFocus(null)}
                                            onChange={(e) => setHeight(e.target.value)} 
                                            className="w-full bg-white border border-blue-100 rounded-xl px-3 py-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-200 font-bold text-gray-800 transition-all hover:border-blue-300" 
                                            placeholder="Ft" 
                                        />
                                        <input 
                                            type="number" 
                                            value={heightInches} 
                                            onFocus={() => setActiveFocus('height')}
                                            onBlur={() => setActiveFocus(null)}
                                            onChange={(e) => setHeightInches(e.target.value)} 
                                            className="w-full bg-white border border-blue-100 rounded-xl px-3 py-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-200 font-bold text-gray-800 transition-all hover:border-blue-300" 
                                            placeholder="In" 
                                        />
                                    </div>
                                )}
                            </div>
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>Calculate</button>
                        </form>
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
                                
                                {aiBmiAdvice ? (
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100 shadow-sm animate-popup-in relative group/advice">
                                        <div className="absolute top-3 right-3 flex items-center gap-2">
                                            <button 
                                                onClick={copyAdvice}
                                                className={`transition-colors p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 ${adviceCopied ? 'bg-green-100 text-green-600' : 'bg-white/50 text-indigo-400 hover:text-indigo-600'}`}
                                                title="Copy health tips"
                                            >
                                                <i className={`fas ${adviceCopied ? 'fa-check' : 'fa-copy'}`}></i>
                                                {adviceCopied ? 'Copied' : 'Copy'}
                                            </button>
                                            <button 
                                                onClick={() => setAiBmiAdvice(null)}
                                                className="bg-white/50 text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded-lg"
                                            >
                                                <i className="fas fa-times text-[10px]"></i>
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                                                <i className="fas fa-robot text-xs"></i>
                                            </div>
                                            <h4 className="font-bold text-indigo-900 text-sm">AI Pharmacist Insight</h4>
                                        </div>
                                        <div className="text-xs text-indigo-800 leading-relaxed whitespace-pre-wrap font-medium">
                                            {renderFormattedAdvice(aiBmiAdvice)}
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={askAIAboutHealth} 
                                        disabled={isAiLoading}
                                        className="w-full bg-medical-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:bg-medical-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                                    >
                                        {isAiLoading ? (
                                            <i className="fas fa-spinner fa-spin text-lg"></i>
                                        ) : (
                                            <i className="fas fa-robot text-lg"></i> 
                                        )}
                                        <span>{isAiLoading ? 'Analyzing...' : 'Get Personalized AI Health Tips'}</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Hydration Tracker */}
                    <div className="hover-lift-smooth p-8 rounded-[2.5rem] relative overflow-hidden group border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/40 to-cyan-100/20 shadow-xl shadow-cyan-100/50 reveal-scale reveal-delay-200 ring-1 ring-cyan-50">
                        <div className="flex items-center gap-5 mb-8 animate-fade-in-up">
                            <div className="w-16 h-16 rounded-3xl bg-cyan-50 shadow-inner text-cyan-500 flex items-center justify-center text-3xl border border-cyan-100 group-hover:scale-110 transition-transform duration-500 ring-2 ring-white">
                                <i className="fas fa-tint"></i>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Hydration</h3>
                                <p className="text-xs text-cyan-500/80 font-bold tracking-wide uppercase">Daily Water Goal</p>
                            </div>
                        </div>
                        <form onSubmit={calculateWater} className="space-y-4">
                            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider ml-1">Body Weight (kg)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={waterWeight}
                                        onChange={(e) => setWaterWeight(e.target.value)}
                                        className="w-full bg-white border border-cyan-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-200 font-bold text-gray-800 transition-all hover:border-cyan-300"
                                        placeholder="Enter weight..."
                                    />
                                    <button className="absolute right-1 top-1 bottom-1 bg-cyan-500 hover:bg-cyan-600 text-white px-4 rounded-lg font-bold text-sm transition-all active:scale-95">Check</button>
                                </div>
                            </div>
                        </form>
                        {waterNeed !== null ? (
                            <div className="mt-8 animate-slide-up relative overflow-hidden rounded-3xl border border-cyan-200 shadow-lg min-h-[160px] flex items-center justify-center group/water bg-white">
                                <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-cyan-500 to-cyan-300 transition-all duration-[1500ms] ease-out z-0 flex items-start justify-center overflow-hidden ${showWaterAnim ? 'h-full' : 'h-0'}`}>
                                    <div className="absolute -top-10 -left-[50%] w-[200%] h-20 bg-white/20 rounded-[40%] animate-wave-flow"></div>
                                    
                                    {showWaterAnim && (
                                        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10">
                                            <div className="absolute top-[20%] text-white/50 text-2xl animate-swim" style={{ animationDuration: '10s' }}>
                                                <i className="fas fa-fish"></i>
                                            </div>
                                            <div className="absolute top-[50%] text-white/30 text-sm animate-swim" style={{ animationDuration: '15s', animationDelay: '-4s' }}>
                                                <i className="fas fa-fish"></i>
                                            </div>
                                            <div className="absolute top-[75%] text-white/40 text-lg animate-swim" style={{ animationDuration: '12s', animationDelay: '-7s' }}>
                                                <i className="fas fa-fish"></i>
                                            </div>
                                            {[...Array(10)].map((_, i) => (
                                                <div 
                                                    key={i}
                                                    className="absolute bottom-[-10px] w-1.5 h-1.5 bg-white/40 rounded-full animate-bubble-rise"
                                                    style={{ 
                                                        left: `${10 + (i * 10) + (Math.random() * 5)}%`, 
                                                        animationDelay: `${i * 0.4}s`,
                                                        animationDuration: `${3 + Math.random() * 2}s` 
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="relative z-20 text-white text-center">
                                    <p className="text-4xl font-extrabold mb-1 drop-shadow-md">{waterNeed}L</p>
                                    <p className="text-xs font-bold opacity-90 tracking-widest uppercase">Daily Target</p>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-8 p-6 bg-white/60 rounded-3xl border border-dashed border-cyan-200 text-center flex flex-col items-center justify-center min-h-[160px] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                <i className="fas fa-glass-water text-4xl text-cyan-200 mb-3 animate-bounce-subtle"></i>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Calculate hydration needs</p>
                            </div>
                        )}
                    </div>

                    {/* Pill Reminder */}
                    <div className="hover-lift-smooth p-8 rounded-[2.5rem] relative overflow-hidden group border border-purple-100 bg-gradient-to-br from-white via-purple-50/40 to-purple-100/20 shadow-xl shadow-purple-100/50 reveal reveal-delay-300 ring-1 ring-purple-50">
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
                        <div className="flex bg-purple-100/50 p-1 rounded-xl mb-4 relative z-20">
                            <button onClick={() => setTimeMode('digital')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${timeMode === 'digital' ? 'bg-white text-purple-600 shadow-sm' : 'text-purple-400 hover:text-purple-600'}`}>Digital</button>
                            <button onClick={() => setTimeMode('analog')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${timeMode === 'analog' ? 'bg-white text-purple-600 shadow-sm' : 'text-purple-400 hover:text-purple-600'}`}>Analog</button>
                        </div>
                        <form onSubmit={addReminder} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-purple-400 uppercase tracking-wider ml-1">Medicine Name</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text" 
                                            value={medName}
                                            onChange={(e) => setMedName(e.target.value)}
                                            className="w-full bg-white border border-purple-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-200 font-bold text-gray-800"
                                            placeholder="Ex: Paracetamol"
                                        />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={triggerCamera}
                                        className="w-12 h-12 flex items-center justify-center bg-white border border-purple-200 text-purple-600 rounded-xl hover:bg-purple-50 transition-all shadow-sm group/scan"
                                        title="Scan medicine package"
                                        disabled={isScanning}
                                    >
                                        {isScanning ? (
                                            <i className="fas fa-spinner fa-spin"></i>
                                        ) : (
                                            <i className="fas fa-camera text-xl group-hover/scan:scale-110 transition-transform"></i>
                                        )}
                                    </button>
                                    <input type="file" ref={fileInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleImageScan} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-purple-400 uppercase tracking-wider ml-1">Set Time</label>
                                {timeMode === 'digital' ? (
                                    <div className="flex gap-2">
                                        <input type="time" value={medTime} onChange={(e) => setMedTime(e.target.value)} className="flex-1 bg-white border border-purple-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-200 font-bold text-gray-800" />
                                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-xl font-bold transition-all shadow-md active:scale-95"><i className="fas fa-plus"></i></button>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-purple-100 rounded-2xl p-4 flex flex-col items-center animate-fade-in">
                                        <div className="flex items-end gap-2 mb-4">
                                            <button type="button" onClick={() => setClockView('hours')} className={`text-2xl font-bold p-1 rounded transition-colors ${clockView === 'hours' ? 'text-purple-600 bg-purple-50' : 'text-gray-400'}`}>{analogHour.toString().padStart(2, '0')}</button>
                                            <span className="text-2xl font-bold text-gray-300 mb-1">:</span>
                                            <button type="button" onClick={() => setClockView('minutes')} className={`text-2xl font-bold p-1 rounded transition-colors ${clockView === 'minutes' ? 'text-purple-600 bg-purple-50' : 'text-gray-400'}`}>{analogMinute.toString().padStart(2, '0')}</button>
                                            <div className="flex flex-col ml-2 border border-purple-100 rounded-lg overflow-hidden">
                                                <button type="button" onClick={() => setAnalogAmPm('AM')} className={`px-2 py-0.5 text-[10px] font-bold ${analogAmPm === 'AM' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:bg-purple-50'}`}>AM</button>
                                                <button type="button" onClick={() => setAnalogAmPm('PM')} className={`px-2 py-0.5 text-[10px] font-bold ${analogAmPm === 'PM' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:bg-purple-50'}`}>PM</button>
                                            </div>
                                        </div>
                                        <div className="w-48 h-48 rounded-full bg-purple-50 relative shadow-inner border border-purple-100 mx-auto">
                                            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"></div>
                                            {clockView === 'hours' ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                                                <button key={num} type="button" onClick={() => { setAnalogHour(num); setClockView('minutes'); }} className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transform -translate-x-1/2 -translate-y-1/2 transition-all ${analogHour === num ? 'bg-purple-500 text-white scale-110 shadow-md' : 'text-gray-500 hover:bg-purple-200 hover:text-purple-700'}`} style={getClockNumberPosition(num, 12, 40)}>{num}</button>
                                            )) : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((num, i) => (
                                                <button key={num} type="button" onClick={() => setAnalogMinute(num)} className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transform -translate-x-1/2 -translate-y-1/2 transition-all ${analogMinute === num ? 'bg-purple-500 text-white scale-110 shadow-md' : 'text-gray-500 hover:bg-purple-200 hover:text-purple-700'}`} style={getClockNumberPosition(i * 5, 60, 40)}>{num.toString().padStart(2, '0')}</button>
                                            ))}
                                        </div>
                                        <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2" onClick={addReminder}><i className="fas fa-plus"></i> Add Reminder</button>
                                    </div>
                                )}
                            </div>
                        </form>
                        <div className="mt-6 space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                            {reminders.length > 0 ? reminders.map(reminder => (
                                <div key={reminder.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-purple-50 shadow-sm animate-fade-in">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-xs"><i className="fas fa-pills"></i></div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{reminder.name}</p>
                                            <p className="text-xs text-purple-400 font-bold">{reminder.time}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteReminder(reminder.id)} className="text-gray-300 hover:text-red-500 transition-colors px-2"><i className="fas fa-trash-alt"></i></button>
                                </div>
                            )) : <div className="text-center py-6 text-gray-400 text-sm">No active reminders.</div>}
                        </div>
                    </div>

                    {/* Stress Relief Breathing Tool */}
                    <div className="hover-lift-smooth relative p-8 rounded-[2.5rem] overflow-hidden border border-emerald-100 bg-white shadow-xl shadow-emerald-100/50 flex flex-col justify-between min-h-[420px] group reveal reveal-delay-400">
                        <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isBreathing ? 'bg-emerald-50 opacity-100' : 'bg-gradient-to-br from-white via-emerald-50/20 to-emerald-100/10 opacity-100'}`}></div>
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className={`absolute -top-24 -right-24 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl transition-all duration-1000 ${isBreathing ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}></div>
                            <div className={`absolute -bottom-24 -left-24 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl transition-all duration-1000 ${isBreathing ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}></div>
                        </div>
                        <div className="relative z-10 flex items-center justify-between mb-6">
                            <div className="flex items-center gap-5">
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-sm transition-all duration-500 border ${isBreathing ? 'bg-white text-emerald-500 border-emerald-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}><i className="fas fa-lungs"></i></div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Stress Relief</h3>
                                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Breathing Exercise</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <button 
                                    onClick={() => setIsMuted(!isMuted)} 
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm border ${isMuted ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200 animate-pulse'}`}
                                    title={isMuted ? "Unmute guidance" : "Mute guidance"}
                                >
                                    <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
                                </button>
                                {isBreathing && (
                                    <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 px-4 py-2 rounded-2xl shadow-sm animate-fade-in flex flex-col items-center">
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none mb-1">Time</span>
                                        <span className="text-lg font-mono font-bold text-gray-800 leading-none">{formatTimer(breathingSeconds)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
                            <div className="relative w-64 h-64 flex items-center justify-center">
                                 {[1, 2, 3].map((i) => (
                                     <div key={i} className="absolute inset-0 rounded-full border-2 border-emerald-400/30" style={{ transform: isBreathing ? `scale(${breathScale + (i * 0.2)})` : 'scale(1)', opacity: isBreathing ? Math.max(0, 0.4 - (i * 0.1)) : 0, transition: 'transform 4s ease-in-out, opacity 4s ease-in-out' }} />
                                 ))}
                                <div className="w-32 h-32 rounded-full relative flex items-center justify-center shadow-lg z-20" style={{ transform: isBreathing ? `scale(${breathScale})` : 'scale(1)', background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', boxShadow: isBreathing ? '0 0 40px rgba(52, 211, 153, 0.6)' : '0 10px 25px -5px rgba(16, 185, 129, 0.3)', transition: 'transform 4s ease-in-out, box-shadow 4s ease-in-out' }}>
                                    <div className="absolute top-3 left-4 w-8 h-4 bg-white/30 rounded-full blur-[2px] -rotate-45"></div>
                                    <span className="text-white font-bold text-xl tracking-widest uppercase drop-shadow-md animate-fade-in">{breathText}</span>
                                </div>
                                 <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isBreathing ? 'opacity-100 animate-spin-slow' : 'opacity-0'}`}>
                                    <div className="absolute top-0 left-1/2 w-3 h-3 bg-emerald-300 rounded-full blur-[1px] shadow-lg transform -translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-teal-300 rounded-full blur-[1px] shadow-lg transform -translate-x-1/2 translate-y-1/2"></div>
                                </div>
                            </div>
                            <p className={`mt-6 text-sm font-semibold text-center transition-colors duration-500 ${isBreathing ? 'text-emerald-700' : 'text-gray-500'}`}>{isBreathing ? "Follow the rhythm..." : "4s Inhale • 4s Hold • 4s Exhale"}</p>
                        </div>
                        <div className="relative z-10 mt-6">
                            <button onClick={() => setIsBreathing(!isBreathing)} className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${isBreathing ? 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-500/30'}`}>{isBreathing ? <><i className="fas fa-stop"></i> Stop Session</> : <><i className="fas fa-play"></i> Start Breathing</>}</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HealthTools;