import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse, generateSpeech } from '../services/geminiService';
import { ChatMessage, Product } from '../types';
import { ProductCardImage } from './ProductCardImage';

// Audio Encoding Helpers
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
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

// Comprehensive Language List
const LANGUAGES = [
    { code: 'Afrikaans', name: 'Afrikaans' },
    { code: 'Albanian', name: 'Albanian' },
    { code: 'Amharic', name: 'Amharic' },
    { code: 'Arabic', name: 'Arabic' },
    { code: 'Armenian', name: 'Armenian' },
    { code: 'Azerbaijani', name: 'Azerbaijani' },
    { code: 'Basque', name: 'Basque' },
    { code: 'Belarusian', name: 'Belarusian' },
    { code: 'Bengali', name: 'Bengali' },
    { code: 'Bosnian', name: 'Bosnian' },
    { code: 'Bulgarian', name: 'Bulgarian' },
    { code: 'Catalan', name: 'Catalan' },
    { code: 'Cebuano', name: 'Cebuano' },
    { code: 'Chichewa', name: 'Chichewa' },
    { code: 'Chinese (Simplified)', name: 'Chinese (Simplified)' },
    { code: 'Chinese (Traditional)', name: 'Chinese (Traditional)' },
    { code: 'Corsican', name: 'Corsican' },
    { code: 'Croatian', name: 'Croatian' },
    { code: 'Czech', name: 'Czech' },
    { code: 'Danish', name: 'Danish' },
    { code: 'Dutch', name: 'Dutch' },
    { code: 'English', name: 'English' },
    { code: 'Esperanto', name: 'Esperanto' },
    { code: 'Estonian', name: 'Estonian' },
    { code: 'Filipino', name: 'Filipino' },
    { code: 'Finnish', name: 'Finnish' },
    { code: 'French', name: 'French' },
    { code: 'Frisian', name: 'Frisian' },
    { code: 'Galician', name: 'Galician' },
    { code: 'Georgian', name: 'Georgian' },
    { code: 'German', name: 'German' },
    { code: 'Greek', name: 'Greek' },
    { code: 'Gujarati', name: 'Gujarati' },
    { code: 'Haitian Creole', name: 'Haitian Creole' },
    { code: 'Hausa', name: 'Hausa' },
    { code: 'Hawaiian', name: 'Hawaiian' },
    { code: 'Hebrew', name: 'Hebrew' },
    { code: 'Hindi', name: 'Hindi' },
    { code: 'Hmong', name: 'Hmong' },
    { code: 'Hungarian', name: 'Hungarian' },
    { code: 'Icelandic', name: 'Icelandic' },
    { code: 'Igbo', name: 'Igbo' },
    { code: 'Indonesian', name: 'Indonesian' },
    { code: 'Irish', name: 'Irish' },
    { code: 'Italian', name: 'Italian' },
    { code: 'Japanese', name: 'Japanese' },
    { code: 'Javanese', name: 'Javanese' },
    { code: 'Kannada', name: 'Kannada' },
    { code: 'Kazakh', name: 'Kazakh' },
    { code: 'Khmer', name: 'Khmer' },
    { code: 'Kinyarwanda', name: 'Kinyarwanda' },
    { code: 'Korean', name: 'Korean' },
    { code: 'Kurdish (Kurmanji)', name: 'Kurdish (Kurmanji)' },
    { code: 'Kyrgyz', name: 'Kyrgyz' },
    { code: 'Lao', name: 'Lao' },
    { code: 'Latin', name: 'Latin' },
    { code: 'Latvian', name: 'Latvian' },
    { code: 'Lithuanian', name: 'Lithuanian' },
    { code: 'Luxembourgish', name: 'Luxembourgish' },
    { code: 'Macedonian', name: 'Macedonian' },
    { code: 'Malagasy', name: 'Malagasy' },
    { code: 'Malay', name: 'Malay' },
    { code: 'Malayalam', name: 'Malayalam' },
    { code: 'Maltese', name: 'Maltese' },
    { code: 'Maori', name: 'Maori' },
    { code: 'Marathi', name: 'Marathi' },
    { code: 'Mongolian', name: 'Mongolian' },
    { code: 'Myanmar (Burmese)', name: 'Myanmar (Burmese)' },
    { code: 'Nepali', name: 'Nepali' },
    { code: 'Norwegian', name: 'Norwegian' },
    { code: 'Odia (Oriya)', name: 'Odia (Oriya)' },
    { code: 'Pashto', name: 'Pashto' },
    { code: 'Persian', name: 'Persian' },
    { code: 'Polish', name: 'Polish' },
    { code: 'Portuguese', name: 'Portuguese' },
    { code: 'Punjabi', name: 'Punjabi' },
    { code: 'Romanian', name: 'Romanian' },
    { code: 'Russian', name: 'Russian' },
    { code: 'Samoan', name: 'Samoan' },
    { code: 'Scots Gaelic', name: 'Scots Gaelic' },
    { code: 'Serbian', name: 'Serbian' },
    { code: 'Sesotho', name: 'Sesotho' },
    { code: 'Shona', name: 'Shona' },
    { code: 'Sindhi', name: 'Sindhi' },
    { code: 'Sinhala', name: 'Sinhala' },
    { code: 'Slovak', name: 'Slovak' },
    { code: 'Slovenian', name: 'Slovenian' },
    { code: 'Somali', name: 'Somali' },
    { code: 'Spanish', name: 'Spanish' },
    { code: 'Sundanese', name: 'Sundanese' },
    { code: 'Swahili', name: 'Swahili' },
    { code: 'Swedish', name: 'Swedish' },
    { code: 'Tajik', name: 'Tajik' },
    { code: 'Tamil', name: 'Tamil' },
    { code: 'Tatar', name: 'Tatar' },
    { code: 'Telugu', name: 'Telugu' },
    { code: 'Thai', name: 'Thai' },
    { code: 'Turkish', name: 'Turkish' },
    { code: 'Turkmen', name: 'Turkmen' },
    { code: 'Ukrainian', name: 'Ukrainian' },
    { code: 'Urdu', name: 'Urdu' },
    { code: 'Uyghur', name: 'Uyghur' },
    { code: 'Uzbek', name: 'Uzbek' },
    { code: 'Vietnamese', name: 'Vietnamese' },
    { code: 'Welsh', name: 'Welsh' },
    { code: 'Xhosa', name: 'Xhosa' },
    { code: 'Yiddish', name: 'Yiddish' },
    { code: 'Yoruba', name: 'Yoruba' },
    { code: 'Zulu', name: 'Zulu' }
];

// Moved outside component to prevent recreation and scope issues
const WELCOME_MSG = "Hello! 👋 I'm your **AI Pharmacist**.\n\nAsk me about:\n💊 Medicine uses\n🤒 Common symptoms\n🌿 Home remedies\n🔍 Find specific medicines\n\n**Note:** I am an AI, not a doctor. Please consult a professional for serious advice.";

interface AIChatProps {
    onViewProduct?: (product: Product) => void;
}

const AIChat: React.FC<AIChatProps> = ({ onViewProduct }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isConfirmingClear, setIsConfirmingClear] = useState(false);
    
    // Unread state for notification dot (Initially true for visibility)
    const [hasUnread, setHasUnread] = useState(true);
    
    // Greeting Bubble State
    const [showBubble, setShowBubble] = useState(false);
    
    // Translate Widget State
    const [showTranslate, setShowTranslate] = useState(false);
    const [searchLang, setSearchLang] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    
    // Audio State
    const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    
    // Refs
    const isOpenRef = useRef(isOpen);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    // Lazy initialization for persistence
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const savedHistory = localStorage.getItem('chat_history');
            if (savedHistory) {
                return JSON.parse(savedHistory);
            }
        } catch (e) {
            console.error("Failed to parse chat history", e);
        }
        return [{
            id: 'welcome',
            text: WELCOME_MSG,
            isUser: false,
            timestamp: Date.now()
        }];
    });

    const [inputValue, setInputValue] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // UI States for actions
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Quick suggestions
    const suggestions = ["Medicine for headache", "Price of Dolo?", "Pet dard upay", "Find cough syrup"];

    // Sync ref and handle unread state
    useEffect(() => {
        isOpenRef.current = isOpen;
        if (isOpen) {
            setHasUnread(false);
            setShowBubble(false); // Hide bubble when chat opens
        }
    }, [isOpen]);

    // Show greeting bubble after a delay on first load
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only show if chat hasn't been opened and no conversation started
            if (!isOpen && messages.length <= 1) { 
                setShowBubble(true);
            }
        }, 4000); // 4 seconds delay
        return () => clearTimeout(timer);
    }, [isOpen, messages.length]);

    // Handle Mobile Back Button / Gesture
    useEffect(() => {
        if (isOpen) {
            // Push a state to history so the back button catches this state instead of using previous route
            window.history.pushState(null, '', window.location.href);

            const handlePopState = () => {
                // If user presses back, close the chat
                setIsOpen(false);
            };

            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [isOpen]);

    // Save history to local storage whenever messages change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (sourceRef.current) {
                sourceRef.current.stop();
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Listen for 'ask-ai' custom events from other components
    useEffect(() => {
        const handleAskAI = (e: any) => {
            const { productName, description, customQuery } = e.detail;
            
            let query = "";
            if (customQuery) {
                query = customQuery;
            } else if (productName) {
                query = `Can you explain what ${productName} is used for and provide some health tips? \n\nDescription context: ${description}`;
            } else {
                return; // Invalid event data
            }
            
            setIsOpen(true);
            
            // Trigger the AI request
            handleExternalQuery(query);
        };

        window.addEventListener('ask-ai', handleAskAI);
        return () => window.removeEventListener('ask-ai', handleAskAI);
    }, []);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleClearHistory = () => {
        if (isConfirmingClear) {
            // User confirmed, perform clear
            const defaultMessage: ChatMessage = {
                id: 'welcome',
                text: WELCOME_MSG,
                isUser: false,
                timestamp: Date.now()
            };
            setMessages([defaultMessage]);
            setIsConfirmingClear(false);
        } else {
            // First click - ask for confirmation
            setIsConfirmingClear(true);
            // Auto-reset confirmation state after 3 seconds
            setTimeout(() => setIsConfirmingClear(false), 3000);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const removeImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCopy = async (id: string, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    // AUDIO HANDLERS
    const stopAudio = () => {
        if (sourceRef.current) {
            try {
                sourceRef.current.stop();
            } catch (e) {
                // Ignore error if already stopped
            }
            sourceRef.current = null;
        }
        setPlayingMessageId(null);
        setIsAudioLoading(false);
    };

    const playAudio = async (id: string, text: string) => {
        // If already playing this message, stop it
        if (playingMessageId === id) {
            stopAudio();
            return;
        }

        // Stop any currently playing audio
        stopAudio();

        setPlayingMessageId(id);
        setIsAudioLoading(true);

        try {
            // Initialize AudioContext on user gesture
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
            }
            
            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }

            // Generate Speech using Gemini 2.5 TTS Model
            const base64Audio = await generateSpeech(text);
            
            if (!base64Audio) {
                console.error("No audio data returned");
                setPlayingMessageId(null);
                setIsAudioLoading(false);
                return;
            }

            // Decode and Play
            const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
            
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            
            source.onended = () => {
                setPlayingMessageId(null);
                sourceRef.current = null;
            };
            
            sourceRef.current = source;
            source.start();
            setIsAudioLoading(false);

        } catch (e) {
            console.error("Audio playback failed", e);
            setPlayingMessageId(null);
            setIsAudioLoading(false);
        }
    };

    const handleExternalQuery = async (text: string) => {
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            text: text,
            isUser: true,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, newMessage]);
        setIsLoading(true);

        const aiResponse = await getGeminiResponse(text, undefined, selectedLanguage);

        const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: aiResponse.text,
            isUser: false,
            timestamp: Date.now(),
            products: aiResponse.products,
            groundingSources: aiResponse.groundingSources
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);

        if (!isOpenRef.current) {
            setHasUnread(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent, overrideText?: string) => {
        if (e) e.preventDefault();
        
        const textToSubmit = overrideText || inputValue;

        if (!textToSubmit.trim() && !selectedImage) return;

        const userText = textToSubmit.trim();
        const userImage = selectedImage;
        
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            text: userText,
            image: userImage || undefined,
            isUser: true,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsLoading(true);

        // Pass selectedLanguage to getGeminiResponse
        const aiResponse = await getGeminiResponse(userText, userImage || undefined, selectedLanguage);

        const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: aiResponse.text,
            isUser: false,
            timestamp: Date.now(),
            products: aiResponse.products,
            groundingSources: aiResponse.groundingSources
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);

        if (!isOpenRef.current) {
            setHasUnread(true);
        }
    };

    // Helper to format text with bold markers and replace asterisks with bullets
    const formatMessageText = (text: string) => {
        // Replace asterisk bullet points with styled bullet
        const textWithBullets = text.replace(/(^|\n)\*\s/g, '$1• ');
        
        const parts = textWithBullets.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="text-gray-900 font-bold">{part.slice(2, -2)}</strong>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    // Custom Language Handling
    const filteredLanguages = LANGUAGES.filter(l => 
        l.name.toLowerCase().includes(searchLang.toLowerCase())
    );

    const handleLanguageSelect = (langCode: string) => {
        setSelectedLanguage(langCode);
        setShowTranslate(false);
    };

    return (
        <>
            {/* Proactive Greeting Bubble */}
            <div 
                className={`fixed bottom-24 right-6 z-[85] max-w-[280px] transform transition-all duration-500 origin-bottom-right ${showBubble && !isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'}`}
            >
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-medical-50 relative">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowBubble(false); }}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                    >
                        <i className="fas fa-times text-xs"></i>
                    </button>
                    <div className="flex gap-3 items-start">
                        <div className="w-10 h-10 rounded-full bg-medical-50 flex items-center justify-center flex-shrink-0 border border-medical-100 text-medical-600">
                             <i className="fas fa-user-md"></i>
                        </div>
                        <div className="pr-4">
                            <p className="font-bold text-gray-900 text-sm mb-1">Hi there! 👋</p>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                I'm your AI Pharmacist. Need help finding a <span className="font-bold text-medical-600">medicine</span> or <span className="font-bold text-medical-600">health tip</span>?
                            </p>
                        </div>
                    </div>
                    <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-b border-r border-medical-50 transform rotate-45"></div>
                </div>
            </div>

            {/* FAB - 3D Green Ball Design */}
            <button 
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 z-[90] group flex items-center justify-center outline-none focus:outline-none`}
                aria-label="Chat with AI Pharmacist"
            >
                <span className="absolute inline-flex h-full w-full rounded-full bg-medical-400 opacity-20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                <span className="absolute inline-flex h-[85%] w-[85%] rounded-full bg-medical-500 opacity-40 blur-md animate-pulse"></span>
                
                <div className={`
                    relative w-16 h-16 rounded-full 
                    bg-white
                    flex items-center justify-center 
                    border-2 border-medical-100
                    shadow-[0_4px_20px_rgba(22,163,74,0.15)]
                    transition-all duration-300
                    transform
                    hover:-translate-y-1 hover:shadow-medical-200
                `}>
                    <i className="fas fa-user-md text-3xl text-medical-600 drop-shadow-sm relative z-10 transition-transform duration-300"></i>
                    {hasUnread && (
                        <span className="absolute top-0 right-0 flex h-4 w-4 z-20">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white shadow-sm"></span>
                        </span>
                    )}
                </div>
            </button>

            {/* Modal Overlay */}
            <div 
                className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-0 sm:px-4 bg-black/50 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                onClick={(e) => e.target === e.currentTarget && toggleChat()}
            >
                {/* Chat Container */}
                <div 
                    className={`bg-white w-full sm:max-w-[450px] h-[90vh] sm:h-[650px] sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) relative overflow-hidden ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-full sm:translate-y-10 scale-95'}`}
                >
                    {/* Header */}
                    <div className="bg-medical-600 h-20 flex flex-col justify-center px-6 shadow-md relative z-20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-medical-200 shadow-sm overflow-hidden text-medical-600">
                                        <i className="fas fa-user-md text-xl"></i>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-white font-bold text-lg leading-tight">AI Pharmacist</h3>
                                    <div className="flex items-center gap-1.5 opacity-90">
                                        <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                                        <span className="text-[10px] text-white font-medium">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleClearHistory}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-300 ${isConfirmingClear ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-white/10 hover:bg-white/20'}`}
                                    title={isConfirmingClear ? "Confirm Clear?" : "Clear Chat"}
                                >
                                    <i className={`fas ${isConfirmingClear ? 'fa-check' : 'fa-trash-alt'} text-xs`}></i>
                                </button>
                                <button 
                                    onClick={toggleChat} 
                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                                >
                                    <i className="fas fa-times text-sm"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-[#ECE5DD] scroll-smooth relative" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundBlendMode: 'soft-light', backgroundSize: '400px' }}>
                        {messages.map((msg, index) => {
                            const showDate = index === 0 || 
                                new Date(msg.timestamp).toLocaleDateString() !== new Date(messages[index - 1].timestamp).toLocaleDateString();
                            const dateLabel = new Date(msg.timestamp).toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : new Date(msg.timestamp).toLocaleDateString();
                            
                            const isPlayingThis = playingMessageId === msg.id;

                            return (
                                <React.Fragment key={msg.id}>
                                    {showDate && (
                                        <div className="flex justify-center my-4 relative z-0">
                                            <span className="bg-[#dcf8c6] text-gray-600 text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded-lg shadow-sm opacity-80">
                                                {dateLabel}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex w-full mb-1 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                        
                                        {!msg.isUser && (
                                            <div className="flex-shrink-0 mr-2 mt-1 self-start">
                                                 <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 text-medical-600">
                                                     <i className="fas fa-user-md text-sm"></i>
                                                 </div>
                                            </div>
                                        )}

                                        <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.isUser ? 'items-end' : 'items-start'}`}>
                                            
                                            <div className={`
                                                relative px-3 py-2 text-sm shadow-[0_1px_0.5px_rgba(0,0,0,0.13)]
                                                ${msg.isUser 
                                                    ? 'bg-[#d9fdd3] text-gray-900 rounded-lg rounded-tr-none' // User Green
                                                    : 'bg-white text-gray-900 rounded-lg rounded-tl-none'} // Bot White
                                            `}>
                                                {msg.image && (
                                                    <div className="mb-2 rounded-lg overflow-hidden border border-black/5">
                                                        <img src={msg.image} alt="Upload" className="max-w-full h-auto" />
                                                    </div>
                                                )}

                                                {/* Text content with improved spacer for timestamp overlap prevention */}
                                                <div className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words notranslate relative z-10">
                                                    {formatMessageText(msg.text)}
                                                    {/* Wider spacer (w-28 = 7rem ~ 112px) to prevent overlap with timestamp */}
                                                    <span className="inline-block w-28 h-4 align-bottom"></span> 
                                                </div>
                                                
                                                {/* Grounding Sources (Map Links) */}
                                                {msg.groundingSources && msg.groundingSources.length > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-gray-100 relative z-10">
                                                        <p className="text-[10px] font-bold text-gray-500 mb-1">Sources:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {msg.groundingSources.map((source, idx) => (
                                                                <a 
                                                                    key={idx} 
                                                                    href={source.url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-[10px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                                                >
                                                                    <i className={`fas ${source.title.toLowerCase().includes('maps') ? 'fa-map-marker-alt' : 'fa-link'}`}></i>
                                                                    <span className="truncate max-w-[120px]">{source.title}</span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Timestamp - Absolute Positioned */}
                                                <div className="absolute bottom-1 right-2 flex items-center gap-1 opacity-60 select-none z-20">
                                                     <span className="text-[10px] min-w-fit">
                                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true}).toLowerCase()}
                                                     </span>
                                                     {msg.isUser && (
                                                        <i className="fas fa-check-double text-[10px] text-[#53bdeb]"></i>
                                                     )}
                                                </div>
                                            </div>

                                            {/* Products Carousel */}
                                            {msg.products && msg.products.length > 0 && (
                                                <div className="mt-2 w-full max-w-full -ml-1">
                                                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x">
                                                        {msg.products.map(product => (
                                                            <div key={product.id} className="min-w-[140px] w-[140px] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden snap-start flex-shrink-0 flex flex-col group">
                                                                <div className="h-20 bg-gray-50 relative overflow-hidden">
                                                                    <ProductCardImage src={product.image} alt={product.name} />
                                                                </div>
                                                                <div className="p-2 flex flex-col flex-grow">
                                                                    <h4 className="text-xs font-bold text-gray-800 line-clamp-1 mb-1">{product.name}</h4>
                                                                    <button 
                                                                        onClick={() => onViewProduct && onViewProduct(product)}
                                                                        className="w-full bg-medical-600 text-white hover:bg-medical-700 text-[10px] font-bold py-1.5 rounded-full transition-colors shadow-sm"
                                                                    >
                                                                        View
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions (Copy & Speak) */}
                                            {!msg.isUser && (
                                                <div className="flex items-center gap-3 mt-1 ml-1 opacity-70">
                                                    <button onClick={() => handleCopy(msg.id, msg.text)} className="text-gray-500 hover:text-gray-700 text-[10px] transition flex items-center gap-1" title="Copy">
                                                        <i className={`fas ${copiedId === msg.id ? 'fa-check text-green-500' : 'fa-copy'}`}></i> Copy
                                                    </button>
                                                    
                                                    {/* Speak Button */}
                                                    <button 
                                                        onClick={() => playAudio(msg.id, msg.text)} 
                                                        className={`text-[10px] transition flex items-center gap-1 ${isPlayingThis ? 'text-medical-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`} 
                                                        title={isPlayingThis ? "Stop" : "Read Aloud"}
                                                    >
                                                        {isPlayingThis ? (
                                                            <>
                                                                <i className="fas fa-stop"></i> Stop
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-volume-up"></i> Speak
                                                            </>
                                                        )}
                                                        {isPlayingThis && isAudioLoading && <i className="fas fa-spinner fa-spin ml-1"></i>}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                        
                        {/* Typing Indicator */}
                        {isLoading && (
                            <div className="flex w-full justify-start mb-2 animate-fade-in">
                                 <div className="flex-shrink-0 mr-2 mt-1">
                                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 text-medical-600">
                                         <i className="fas fa-user-md text-sm"></i>
                                     </div>
                                 </div>
                                 <div className="bg-white rounded-lg rounded-tl-none shadow-sm px-4 py-3 flex items-center gap-1.5 border border-gray-100">
                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                                 </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer / Input Area */}
                    <div className="p-3 bg-[#f0f2f5] border-t border-gray-200 relative z-20">
                        {/* Image Preview */}
                        {selectedImage && (
                            <div className="absolute bottom-full left-4 mb-2 bg-white p-2 rounded-xl shadow-xl border border-gray-200 animate-popup-in">
                                <div className="relative group">
                                    <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
                                    <button 
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:scale-110 transition"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Custom Language Selector Popup */}
                        {showTranslate && (
                            <div className="absolute bottom-full left-4 mb-2 bg-white border border-gray-200 p-0 rounded-xl shadow-2xl z-50 animate-popup-in w-64 overflow-hidden flex flex-col max-h-72">
                                <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-600">Reply Language</span>
                                    <button onClick={() => setShowTranslate(false)} className="text-gray-400 hover:text-red-500">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                
                                {/* Search Bar */}
                                <div className="p-2 border-b border-gray-100">
                                    <div className="relative">
                                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                        <input 
                                            type="text" 
                                            placeholder="Search language..." 
                                            value={searchLang}
                                            onChange={(e) => setSearchLang(e.target.value)}
                                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-medical-400 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Language List */}
                                <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
                                    {filteredLanguages.length > 0 ? (
                                        filteredLanguages.map(lang => (
                                            <button
                                                key={lang.code}
                                                onClick={() => handleLanguageSelect(lang.code)}
                                                className={`w-full text-left px-3 py-2 hover:bg-medical-50 hover:text-medical-700 text-sm rounded-lg transition-colors flex items-center gap-2 group ${selectedLanguage === lang.code ? 'bg-medical-50 text-medical-700 font-bold' : ''}`}
                                            >
                                                <span className={`w-1 h-1 rounded-full ${selectedLanguage === lang.code ? 'bg-medical-500' : 'bg-gray-300 group-hover:bg-medical-500'}`}></span>
                                                {lang.name}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-xs text-gray-400">
                                            No language found
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quick Suggestions */}
                        {messages.length < 3 && !showTranslate && (
                             <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar">
                                {suggestions.map((s, i) => (
                                    <button 
                                        key={i} 
                                        onClick={(e) => handleSubmit(e, s)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <form onSubmit={(e) => handleSubmit(e)} className="flex items-end gap-2">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            
                            {/* Upload Image Button */}
                            <button 
                                type="button"
                                onClick={triggerFileInput}
                                className={`mb-1 p-2 rounded-full transition-all text-gray-500 hover:bg-gray-200 ${selectedImage ? 'text-medical-600' : ''}`}
                                title="Upload Image"
                            >
                                <i className="fas fa-plus text-lg"></i>
                            </button>

                            {/* Translate Button - Triggers Custom Popup */}
                            <button 
                                type="button"
                                onClick={() => setShowTranslate(!showTranslate)}
                                className={`mb-1 p-2 rounded-full transition-all ${showTranslate || selectedLanguage !== 'English' ? 'text-blue-600 bg-blue-100' : 'text-gray-500 hover:bg-gray-200'}`}
                                title="Choose Reply Language"
                            >
                                <i className="fas fa-language text-lg"></i>
                            </button>

                            <div className="flex-1 relative bg-white rounded-2xl border border-white focus-within:border-white shadow-sm px-4 py-2">
                                <textarea 
                                    rows={1}
                                    value={inputValue}
                                    onChange={(e) => {
                                        setInputValue(e.target.value);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e as any);
                                        }
                                    }}
                                    placeholder={selectedImage ? "Add caption..." : `Type in ${selectedLanguage}...`}
                                    className="w-full bg-transparent border-none text-sm focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-500 resize-none max-h-24 pt-1"
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isLoading || (!inputValue.trim() && !selectedImage)}
                                className={`mb-1 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                                    (!inputValue.trim() && !selectedImage) 
                                    ? 'bg-gray-200 text-gray-400 cursor-default' 
                                    : 'bg-medical-600 text-white hover:bg-medical-700 active:scale-95'
                                }`}
                            >
                                <i className="fas fa-paper-plane text-sm"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIChat;