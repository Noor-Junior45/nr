import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { getGeminiResponse, generateSpeech, isAIConfigured } from '../services/geminiService';
import { ChatMessage, Product } from '../types';
import { ProductCardImage } from './ProductCardImage';

// --- AUDIO UTILS FOR LIVE API ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- CONSTANTS ---
const QUICK_SUGGESTIONS = [
    { text: "Fever remedies 🤒", icon: "fa-thermometer-half" },
    { text: "Find Paracetamol 💊", icon: "fa-search" },
    { text: "Pharmacy location 📍", icon: "fa-map-marker-alt" },
    { text: "Stomach pain help 🤢", icon: "fa-dizzy" },
    { text: "Store timings ⏰", icon: "fa-clock" },
    { text: "Skin care tips ✨", icon: "fa-sparkles" }
];

const LANGUAGES = [
    { code: 'English', name: 'English', flag: '🇺🇸' },
    { code: 'Hindi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
    { code: 'Bengali', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
    { code: 'Urdu', name: 'اردو (Urdu)', flag: '🇵🇰' },
    { code: 'Arabic', name: 'العربية (Arabic)', flag: '🇸🇦' },
    { code: 'Spanish', name: 'Español (Spanish)', flag: '🇪🇸' },
    { code: 'French', name: 'Français (French)', flag: '🇫🇷' },
    { code: 'German', name: 'Deutsch (German)', flag: '🇩🇪' },
    { code: 'Japanese', name: '日本語 (Japanese)', flag: '🇯🇵' },
    { code: 'Telugu', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { code: 'Tamil', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'Marathi', name: 'मరాठी (Marathi)', flag: '🇮🇳' },
    { code: 'Gujarati', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
    { code: 'Kannada', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
    { code: 'Malayalam', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
    { code: 'Punjabi', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
    { code: 'Chinese', name: '中文 (Chinese)', flag: '🇨🇳' },
    { code: 'Russian', name: 'Русский (Russian)', flag: '🇷🇺' },
    { code: 'Portuguese', name: 'Português (Portuguese)', flag: '🇵🇹' },
    { code: 'Afrikaans', name: 'Afrikaans', flag: '🇿🇦' },
    { code: 'Albanian', name: 'Shqip (Albanian)', flag: '🇦🇱' },
    { code: 'Amharic', name: 'አማርኛ (Amharic)', flag: '🇪🇹' },
    { code: 'Armenian', name: 'Հայերեն (Armenian)', flag: '🇦🇲' },
    { code: 'Azerbaijani', name: 'Azərbaycan (Azerbaijani)', flag: '🇦🇿' },
    { code: 'Basque', name: 'Euskara (Basque)', flag: '🇪🇸' },
    { code: 'Belarusian', name: 'Беларуская (Belarusian)', flag: '🇧🇾' },
    { code: 'Bosnian', name: 'Bosanski (Bosnian)', flag: '🇧🇦' },
    { code: 'Bulgarian', name: 'Български (Bulgarian)', flag: '🇧🇬' },
    { code: 'Catalan', name: 'Català (Catalan)', flag: '🇪🇸' },
    { code: 'Croatian', name: 'Hrvatski (Croatian)', flag: '🇭🇷' },
    { code: 'Czech', name: 'Čeština (Czech)', flag: '🇨🇿' },
    { code: 'Danish', name: 'Dansk (Danish)', flag: '🇩🇰' },
    { code: 'Dutch', name: 'Nederlands (Dutch)', flag: '🇳🇱' },
    { code: 'Esperanto', name: 'Esperanto', flag: '🌍' },
    { code: 'Estonian', name: 'Eesti (Estonian)', flag: '🇪🇪' },
    { code: 'Filipino', name: 'Filipino', flag: '🇵🇭' },
    { code: 'Finnish', name: 'Suomi (Finnish)', flag: '🇫🇮' },
    { code: 'Georgian', name: 'ქართული (Georgian)', flag: '🇬🇪' },
    { code: 'Greek', name: 'Ελληνικά (Greek)', flag: '🇬🇷' },
    { code: 'Hebrew', name: 'עברית (Hebrew)', flag: '🇮🇱' },
    { code: 'Hungarian', name: 'Magyar (Hungarian)', flag: '🇭🇺' },
    { code: 'Icelandic', name: 'Íslenska (Icelandic)', flag: '🇮🇸' },
    { code: 'Indonesian', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'Irish', name: 'Gaeilge (Irish)', flag: '🇮🇪' },
    { code: 'Italian', name: 'Italiano (Italian)', flag: '🇮🇹' },
    { code: 'Kazakh', name: 'Қазақ (Kazakh)', flag: '🇰🇿' },
    { code: 'Khmer', name: 'ខ្មែر (Khmer)', flag: '🇰🇭' },
    { code: 'Korean', name: '한국어 (Korean)', flag: '🇰🇷' },
    { code: 'Latvian', name: 'Latviešu (Latvian)', flag: '🇱🇻' },
    { code: 'Lithuanian', name: 'Lietuvių (Lithuanian)', flag: '🇱🇹' },
    { code: 'Malay', name: 'Bahasa Melayu (Malay)', flag: '🇲🇾' },
    { code: 'Mongolian', name: 'Монгол (Mongolian)', flag: '🇲🇳' },
    { code: 'Nepali', name: 'नेपाली (Nepali)', flag: '🇳🇵' },
    { code: 'Norwegian', name: 'Norsk (Norwegian)', flag: '🇳🇴' },
    { code: 'Pashto', name: 'ਪښتو (Pashto)', flag: '🇦🇫' },
    { code: 'Persian', name: 'فارسی (Persian)', flag: '🇮🇷' },
    { code: 'Polish', name: 'Polski (Polish)', flag: '🇵🇱' },
    { code: 'Romanian', name: 'Română (Romanian)', flag: '🇷🇴' },
    { code: 'Serbian', name: 'Српски (Serbian)', flag: '🇷🇸' },
    { code: 'Sinhala', name: 'සිංහල (Sinhala)', flag: '🇱🇰' },
    { code: 'Slovak', name: 'Slovenčina (Slovak)', flag: '🇸🇰' },
    { code: 'Slovenian', name: 'Slovenščina (Slovenian)', flag: '🇸🇮' },
    { code: 'Swahili', name: 'Kiswahili (Swahili)', flag: '🇰🇪' },
    { code: 'Swedish', name: 'Svenska (Swedish)', flag: '🇸🇪' },
    { code: 'Thai', name: 'ไทย (Thai)', flag: '🇹🇭' },
    { code: 'Turkish', name: 'Türkçe (Turkish)', flag: '🇹🇷' },
    { code: 'Ukrainian', name: 'Українська (Ukrainian)', flag: '🇺🇦' },
    { code: 'Vietnamese', name: 'Tiếng Việt (Vietnamese)', flag: '🇻🇳' },
    { code: 'Welsh', name: 'Cymraeg (Welsh)', flag: '🏴󠁧󠁢󠁷󠁬󠁿' },
].sort((a, b) => a.name.localeCompare(b.name));

const WELCOME_MSG = "Hello! 👋 I'm your **AI Pharmacist**.\n\nAsk me about:\n💊 Medicine uses\n🤒 Common symptoms\n🌿 Home remedies\n🔍 Find specific medicines\n\n**Note:** I am an AI, not a doctor. Please consult a professional for serious advice.";

const SYSTEM_INSTRUCTION = `You are a warm, caring, and friendly AI Pharmacist assistant for 'New Lucky Pharma', located in Hanwara, Jharkhand. Your goal is to help users with their health queries in a supportive and reassuring manner. 
Keep your responses concise and focused on healthcare. End medical suggestions with "Please consult a doctor for serious advice. Stay safe! 💚"`;

interface AIChatProps {
    onViewProduct?: (product: Product) => void;
}

const AIChat: React.FC<AIChatProps> = ({ onViewProduct }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isConfirmingClear, setIsConfirmingClear] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);
    const [showBubble, setShowBubble] = useState(false);
    const [showTranslate, setShowTranslate] = useState(false);
    const [searchLang, setSearchLang] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [isOnline] = useState(isAIConfigured());
    const [showSuggestions, setShowSuggestions] = useState(true);
    
    // UI State
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const savedHistory = localStorage.getItem('chat_history');
            if (savedHistory) return JSON.parse(savedHistory);
        } catch (e) {}
        return [{ id: 'welcome', text: WELCOME_MSG, isUser: false, timestamp: Date.now() }];
    });
    const [inputValue, setInputValue] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Audio / Live State
    const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [liveStatusText, setLiveStatusText] = useState("Connecting...");
    const [currentTranscription, setCurrentTranscription] = useState("");

    // Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const liveSessionRef = useRef<any>(null);
    const liveAudioContextRef = useRef<AudioContext | null>(null);
    const liveNextStartTimeRef = useRef(0);
    const liveSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scanInputRef = useRef<HTMLInputElement>(null);

    // Sync history
    useEffect(() => {
        localStorage.setItem('chat_history', JSON.stringify(messages));
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cleanup
    useEffect(() => {
        return () => {
            stopAudio();
            stopLiveSession();
        };
    }, []);

    // GREETING LOGIC
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isOpen && messages.length <= 1) setShowBubble(true);
        }, 4000);
        return () => clearTimeout(timer);
    }, [isOpen, messages.length]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setHasUnread(false);
        // Reset suggestions visibility to true every time the chat is opened
        if (!isOpen) setShowSuggestions(true);
    };

    const stopAudio = () => {
        if (sourceRef.current) {
            try { sourceRef.current.stop(); } catch (e) {}
            sourceRef.current = null;
        }
        setPlayingMessageId(null);
        setIsAudioLoading(false);
    };

    const playAudio = async (id: string, text: string) => {
        if (playingMessageId === id) { stopAudio(); return; }
        stopAudio();
        setPlayingMessageId(id);
        setIsAudioLoading(true);
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
            }
            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') await ctx.resume();
            const base64Audio = await generateSpeech(text);
            if (!base64Audio) { setPlayingMessageId(null); setIsAudioLoading(false); return; }
            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => { setPlayingMessageId(null); sourceRef.current = null; };
            sourceRef.current = source;
            source.start();
            setIsAudioLoading(false);
        } catch (e) {
            console.error(e);
            setPlayingMessageId(null);
            setIsAudioLoading(false);
        }
    };

    const copyToClipboard = async (id: string, text: string) => {
        try {
            const cleanText = text.replace(/[*_#]/g, '');
            await navigator.clipboard.writeText(cleanText);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    // --- LIVE TALK LOGIC ---
    const startLiveSession = async () => {
        if (isLive) return;
        setIsLive(true);
        setLiveStatusText("Initializing microphone...");
        setCurrentTranscription("");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
            
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
            const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
            liveAudioContextRef.current = outputCtx;

            let liveInTranscription = "";
            let liveOutTranscription = "";

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setLiveStatusText("Listening...");
                        const source = inputCtx.createMediaStreamSource(stream);
                        const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                        scriptProcessor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputCtx.destination);
                        (window as any)._liveInputCtx = inputCtx;
                        (window as any)._liveStream = stream;
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            liveInTranscription += message.serverContent.inputTranscription.text;
                            setCurrentTranscription("You: " + liveInTranscription);
                        }
                        if (message.serverContent?.outputTranscription) {
                            liveOutTranscription += message.serverContent.outputTranscription.text;
                            setCurrentTranscription("AI: " + liveOutTranscription);
                        }
                        if (message.serverContent?.turnComplete) {
                            if (liveInTranscription || liveOutTranscription) {
                                setMessages(prev => [
                                    ...prev,
                                    { id: Date.now().toString(), text: liveInTranscription, isUser: true, timestamp: Date.now() },
                                    { id: (Date.now()+1).toString(), text: liveOutTranscription, isUser: false, timestamp: Date.now() }
                                ]);
                            }
                            liveInTranscription = "";
                            liveOutTranscription = "";
                        }
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            liveNextStartTimeRef.current = Math.max(liveNextStartTimeRef.current, outputCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            source.addEventListener('ended', () => liveSourcesRef.current.delete(source));
                            source.start(liveNextStartTimeRef.current);
                            liveNextStartTimeRef.current += audioBuffer.duration;
                            liveSourcesRef.current.add(source);
                        }
                        if (message.serverContent?.interrupted) {
                            liveSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
                            liveSourcesRef.current.clear();
                            liveNextStartTimeRef.current = 0;
                        }
                    },
                    onerror: () => { setLiveStatusText("Connection error."); stopLiveSession(); },
                    onclose: () => { setIsLive(false); }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                    systemInstruction: SYSTEM_INSTRUCTION,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {}
                }
            });

            liveSessionRef.current = await sessionPromise;
        } catch (err) {
            console.error(err);
            setIsLive(false);
        }
    };

    const stopLiveSession = () => {
        if (liveSessionRef.current) {
            liveSessionRef.current.close();
            liveSessionRef.current = null;
        }
        if ((window as any)._liveInputCtx) (window as any)._liveInputCtx.close();
        if ((window as any)._liveStream) (window as any)._liveStream.getTracks().forEach((t: any) => t.stop());
        liveSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
        liveSourcesRef.current.clear();
        setIsLive(false);
        setCurrentTranscription("");
    };

    // --- SCAN / IMAGE HELPERS ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedImage(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleCameraScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsScanning(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Data = reader.result as string;
                const prompt = "Identify the brand name of the medicine in this image. Return ONLY the name as a clean string.";
                const response = await getGeminiResponse(prompt, base64Data);
                if (response.text) setInputValue(response.text.replace(/[*_#]/g, '').trim());
                setIsScanning(false);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent | null, overrideText?: string) => {
        if (e) e.preventDefault();
        const textToSubmit = overrideText || inputValue;
        if (!textToSubmit.trim() && !selectedImage) return;
        const userText = textToSubmit.trim();
        const userImage = selectedImage;
        setMessages(prev => [...prev, { id: Date.now().toString(), text: userText, image: userImage || undefined, isUser: true, timestamp: Date.now() }]);
        setInputValue('');
        setSelectedImage(null);
        setIsLoading(true);
        const aiResponse = await getGeminiResponse(userText, userImage || undefined, selectedLanguage);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiResponse.text, isUser: false, timestamp: Date.now(), products: aiResponse.products, groundingSources: aiResponse.groundingSources }]);
        setIsLoading(false);
    };

    const formatMessageText = (text: string) => {
        const textWithBullets = text.replace(/(^|\n)\*\s/g, '$1• ');
        const parts = textWithBullets.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={index} className="text-gray-900 font-bold">{part.slice(2, -2)}</strong>;
            return <span key={index}>{part}</span>;
        });
    };

    const filteredLanguages = LANGUAGES.filter(l => 
        l.name.toLowerCase().includes(searchLang.toLowerCase()) || 
        l.code.toLowerCase().includes(searchLang.toLowerCase())
    );

    const getDateLabel = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (dayDiff === 0 && date.getDate() === now.getDate()) return 'Today';
        if (dayDiff === 1 || (dayDiff === 0 && date.getDate() !== now.getDate())) return 'Yesterday';
        return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <>
            {/* FAB */}
            <button onClick={toggleChat} className="fixed bottom-16 right-6 z-[90] w-16 h-16 rounded-full bg-white border-2 border-medical-100 shadow-xl flex items-center justify-center transition-all hover:-translate-y-1">
                <i className="fas fa-user-md text-3xl text-medical-600"></i>
                {hasUnread && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>

            {/* Modal Overlay */}
            <div className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 transition-all ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={(e) => e.target === e.currentTarget && toggleChat()}>
                <div className={`bg-white w-full sm:max-w-[450px] h-[90vh] sm:h-[650px] sm:rounded-[2rem] rounded-t-[2rem] flex flex-col transition-all overflow-hidden relative ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                    
                    {/* Header */}
                    <div className="bg-medical-600 h-20 px-6 flex items-center justify-between shadow-md text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-medical-600"><i className="fas fa-user-md text-xl"></i></div>
                            <div>
                                <h3 className="font-bold">AI Pharmacist</h3>
                                <div className="flex items-center gap-1.5 opacity-90"><span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span><span className="text-[10px] uppercase font-bold tracking-wider">{isOnline ? 'Online' : 'Offline'}</span></div>
                            </div>
                        </div>
                        <button onClick={toggleChat} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><i className="fas fa-times text-sm"></i></button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-[#ECE5DD] relative" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundBlendMode: 'soft-light' }}>
                        {isLive && (
                            <div className="absolute inset-0 bg-medical-900/90 backdrop-blur-md z-[60] flex flex-col items-center justify-center text-white p-8 text-center animate-fade-in">
                                <i className="fas fa-microphone text-4xl text-medical-200 mb-6 animate-pulse"></i>
                                <h4 className="text-2xl font-bold mb-2">Live Session</h4>
                                <p className="text-medical-200 mb-8 font-medium">{liveStatusText}</p>
                                <div className="bg-white/10 rounded-2xl p-6 w-full max-w-sm mb-8 min-h-[120px] italic text-lg">{currentTranscription || "Listening..."}</div>
                                <button onClick={stopLiveSession} className="px-10 py-4 bg-red-500 rounded-full font-bold shadow-xl flex items-center gap-3"><i className="fas fa-stop"></i> End</button>
                            </div>
                        )}
                        {messages.map((msg, idx) => {
                            const showDate = idx === 0 || getDateLabel(msg.timestamp) !== getDateLabel(messages[idx-1].timestamp);
                            return (
                                <React.Fragment key={msg.id}>
                                    {showDate && (
                                        <div className="flex justify-center my-4 sticky top-0 z-10">
                                            <span className="bg-medical-100/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-medical-800 shadow-sm uppercase tracking-wider">
                                                {getDateLabel(msg.timestamp)}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex w-full mb-2 items-end gap-2 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Logo / Avatar */}
                                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm border shadow-sm ${msg.isUser ? 'bg-gray-100 border-gray-200 text-black' : 'bg-medical-100 border-medical-200 text-medical-600'}`}>
                                            <i className={`fas ${msg.isUser ? 'fa-user' : 'fa-user-md'}`}></i>
                                        </div>

                                        <div className={`flex flex-col max-w-[75%] ${msg.isUser ? 'items-end' : 'items-start'}`}>
                                            <div className={`relative px-3 pt-2 pb-1.5 text-sm shadow-sm ${msg.isUser ? 'bg-[#d9fdd3] rounded-lg rounded-tr-none' : 'bg-white rounded-lg rounded-tl-none'}`}>
                                                {msg.image && <img src={msg.image} className="mb-2 rounded max-w-full border border-gray-100" />}
                                                <div className="inline leading-[1.4] whitespace-pre-wrap">
                                                    {formatMessageText(msg.text)}
                                                    {/* WhatsApp style inline timestamp spacer */}
                                                    <span className="inline-flex items-center justify-end ml-3 align-bottom text-[9px] opacity-40 leading-none h-[11px] min-w-[45px] select-none pointer-events-none">
                                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                            </div>
                                            {!msg.isUser && (
                                                <div className="flex items-center gap-3 mt-1 px-1">
                                                    <button onClick={() => playAudio(msg.id, msg.text)} className={`text-[10px] flex items-center gap-1.5 transition-colors ${playingMessageId === msg.id ? 'text-medical-600 font-bold' : 'text-gray-500 hover:text-medical-600'}`}>
                                                        <i className={`fas ${playingMessageId === msg.id ? 'fa-stop' : 'fa-volume-up'}`}></i> {playingMessageId === msg.id ? 'Stop' : 'Speak'}
                                                    </button>
                                                    <button onClick={() => copyToClipboard(msg.id, msg.text)} className={`text-[10px] flex items-center gap-1.5 transition-colors ${copiedId === msg.id ? 'text-medical-600 font-bold' : 'text-gray-500 hover:text-medical-600'}`}>
                                                        <i className={`fas ${copiedId === msg.id ? 'fa-check text-green-500' : 'fa-copy'}`}></i> {copiedId === msg.id ? 'Copied!' : 'Copy'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                        {isLoading && <div className="flex items-center gap-2 ml-12">
                            <div className="w-8 h-8 rounded-full bg-medical-50 border border-medical-100 flex items-center justify-center text-[10px] text-medical-600">
                                <i className="fas fa-spinner fa-spin"></i>
                            </div>
                            <div className="bg-white/80 px-3 py-1 rounded-full text-[10px] text-gray-400 shadow-sm border border-gray-100">AI is thinking...</div>
                        </div>}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-[#f0f2f5] border-t border-gray-200 relative">
                        {/* Quick Suggestions Box - NOW ALWAYS VISIBLE BY DEFAULT */}
                        {showSuggestions && (
                            <div className="mb-4 flex flex-col gap-2 animate-fade-in px-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <i className="fas fa-lightbulb text-yellow-500"></i> Suggestions
                                    </p>
                                    <button onClick={() => setShowSuggestions(false)} className="text-gray-400 hover:text-red-500 text-[10px] px-2 py-0.5 rounded-full hover:bg-gray-200">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar scrollbar-hide">
                                    {QUICK_SUGGESTIONS.map((suggestion, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => handleSubmit(null, suggestion.text.replace(/🤒|💊|📍|🤢|⏰|✨/g, '').trim())}
                                            className="whitespace-nowrap bg-white border border-medical-200 px-3 py-2 rounded-full text-xs font-semibold text-medical-700 hover:bg-medical-50 hover:border-medical-300 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                                        >
                                            <i className={`fas ${suggestion.icon} text-medical-500`}></i>
                                            {suggestion.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Selected Image Preview */}
                        {selectedImage && (
                            <div className="mb-2 flex items-center gap-2 animate-popup-in bg-white p-2 rounded-lg shadow-sm border">
                                <img src={selectedImage} className="w-12 h-12 rounded object-cover border" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-500">Image attached</p>
                                    <button onClick={() => setSelectedImage(null)} className="text-red-500 text-[10px] font-bold hover:underline">Remove</button>
                                </div>
                            </div>
                        )}
                        
                        {/* Compact Language Selector Box */}
                        {showTranslate && (
                            <div className="absolute bottom-[calc(100%+10px)] left-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[110] flex flex-col max-h-[300px] animate-popup-in">
                                <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-600">Translate</span>
                                    <button onClick={() => setShowTranslate(false)} className="text-gray-400 hover:text-red-500"><i className="fas fa-times text-[10px]"></i></button>
                                </div>
                                <div className="p-2">
                                    <div className="relative mb-2">
                                        <i className="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]"></i>
                                        <input 
                                            type="text" 
                                            placeholder="Search language..." 
                                            value={searchLang} 
                                            onChange={(e) => setSearchLang(e.target.value)} 
                                            className="w-full text-[11px] py-1.5 pl-7 pr-2 bg-gray-50 border-none rounded-lg focus:ring-1 focus:ring-medical-500"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[180px] custom-scrollbar">
                                        {filteredLanguages.map(lang => (
                                            <button 
                                                key={lang.code} 
                                                onClick={() => { setSelectedLanguage(lang.code); setShowTranslate(false); }} 
                                                className={`flex items-center gap-2 text-left text-[11px] p-2 rounded-lg transition-colors ${selectedLanguage === lang.code ? 'bg-medical-50 text-medical-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                                            >
                                                <span>{lang.flag}</span>
                                                <span className="truncate">{lang.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={(e) => handleSubmit(e)} className="flex items-center gap-1">
                            {/* Hidden inputs */}
                            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileSelect} />
                            <input type="file" ref={scanInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleCameraScan} />

                            <div className="flex items-center">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-medical-600 transition-colors" title="Upload Image"><i className="fas fa-plus"></i></button>
                                <button type="button" onClick={() => scanInputRef.current?.click()} className={`w-9 h-9 flex items-center justify-center transition-all ${isScanning ? 'text-medical-600 animate-spin' : 'text-gray-500 hover:text-medical-600'}`} title="Scan Medicine"><i className="fas fa-camera"></i></button>
                                <button type="button" onClick={() => setShowTranslate(!showTranslate)} className={`w-9 h-9 flex items-center justify-center transition-all ${selectedLanguage !== 'English' || showTranslate ? 'text-medical-600' : 'text-gray-500 hover:text-medical-600'}`} title="Translate"><i className="fas fa-language text-xl"></i></button>
                                <button type="button" onClick={startLiveSession} className="w-9 h-9 flex items-center justify-center text-medical-600 hover:scale-110 transition-transform" title="Live Talk"><i className="fas fa-microphone text-lg"></i></button>
                            </div>
                            
                            <input 
                                type="text" 
                                value={inputValue} 
                                onChange={(e) => setInputValue(e.target.value)} 
                                placeholder={isLive ? "Talking..." : `Type in ${selectedLanguage}...`} 
                                className="flex-1 bg-white border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-medical-500 shadow-inner" 
                                disabled={isLive} 
                            />
                            
                            <button 
                                type="submit" 
                                disabled={(!inputValue.trim() && !selectedImage) || isLive || isLoading} 
                                className="w-10 h-10 rounded-full bg-medical-600 text-white flex items-center justify-center shadow-lg hover:bg-medical-700 disabled:opacity-50 transition-all active:scale-90"
                            >
                                {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIChat;