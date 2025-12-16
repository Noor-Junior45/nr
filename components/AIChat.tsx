import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse, translateText } from '../services/geminiService';
import { ChatMessage, Product } from '../types';
import { ProductCardImage } from './ProductCardImage';

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
    
    // Ref to track open state inside async functions
    const isOpenRef = useRef(isOpen);

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
    const [translatingId, setTranslatingId] = useState<string | null>(null);

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

    const handleTranslate = async (id: string, text: string) => {
        const msgIndex = messages.findIndex(m => m.id === id);
        if (msgIndex === -1) return;
        const msg = messages[msgIndex];

        if (msg.originalText) {
            setMessages(prev => prev.map(m => 
                m.id === id ? { ...m, text: m.originalText!, originalText: undefined } : m
            ));
            return;
        }

        setTranslatingId(id);
        const translatedText = await translateText(text);
        
        setMessages(prev => prev.map(m => 
            m.id === id ? { ...m, text: translatedText, originalText: text } : m
        ));
        setTranslatingId(null);
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

        const aiResponse = await getGeminiResponse(text);

        const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: aiResponse.text,
            isUser: false,
            timestamp: Date.now(),
            products: aiResponse.products
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

        const aiResponse = await getGeminiResponse(userText, userImage || undefined);

        const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: aiResponse.text,
            isUser: false,
            timestamp: Date.now(),
            products: aiResponse.products
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);

        if (!isOpenRef.current) {
            setHasUnread(true);
        }
    };

    // Helper to format text with bold markers
    const formatMessageText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="text-gray-900 font-bold">{part.slice(2, -2)}</strong>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <>
            {/* Proactive Greeting Bubble */}
            <div 
                className={`fixed bottom-24 right-6 z-[85] max-w-[240px] bg-white p-4 rounded-2xl rounded-tr-none shadow-xl border border-medical-100 transform transition-all duration-500 origin-bottom-right ${showBubble && !isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'}`}
            >
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowBubble(false); }}
                    className="absolute -top-2 -left-2 w-6 h-6 bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-full flex items-center justify-center shadow-sm transition-colors z-10"
                >
                    <i className="fas fa-times text-xs"></i>
                </button>
                <div 
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={toggleChat}
                >
                    <div className="w-10 h-10 rounded-full bg-medical-100 flex items-center justify-center flex-shrink-0 text-medical-600 border border-medical-200">
                        <i className="fas fa-user-doctor text-lg"></i>
                    </div>
                    <div>
                        <p className="text-sm text-gray-800 font-bold mb-1">Hi there! 👋</p>
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                            I'm your AI Pharmacist. Need help finding a <span className="text-medical-600">medicine</span> or <span className="text-medical-600">health tip</span>?
                        </p>
                    </div>
                </div>
                <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-b border-r border-medical-100 transform rotate-45"></div>
            </div>

            {/* FAB - Bot Type Design */}
            <button 
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 z-[90] p-0 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 group ${isOpen ? 'rotate-90' : 'animate-bounce-subtle'}`}
                aria-label="Chat with AI Pharmacist"
            >
                {hasUnread && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 z-20">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-white shadow-sm"></span>
                    </span>
                )}
                <div className={`absolute inset-0 bg-medical-400 rounded-full animate-ping opacity-20 ${isOpen ? 'hidden' : 'block'}`}></div>
                <div className="relative w-16 h-16 rounded-full bg-medical-600 flex items-center justify-center border-4 border-white shadow-md overflow-hidden z-10">
                    <i className={`fas ${isOpen ? 'fa-times' : 'fa-robot'} text-3xl text-white transition-all duration-300`}></i>
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
                    <div className="bg-medical-600 h-24 flex flex-col justify-center px-6 shadow-md relative z-20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-medical-200 shadow-sm">
                                        <i className="fas fa-robot text-medical-600 text-2xl"></i>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-xl leading-tight">AI Pharmacist</h3>
                                    <p className="text-medical-100 text-xs font-medium">Online • Hinglish Supported</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleClearHistory}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-300 ${isConfirmingClear ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-white/10 hover:bg-white/20'}`}
                                    title={isConfirmingClear ? "Confirm Clear?" : "Clear Chat"}
                                >
                                    <i className={`fas ${isConfirmingClear ? 'fa-check' : 'fa-trash-alt'} text-sm`}></i>
                                </button>
                                <button 
                                    onClick={toggleChat} 
                                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                                >
                                    <i className="fas fa-times text-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 scroll-smooth relative">
                        {messages.map((msg, index) => {
                            const showDate = index === 0 || 
                                new Date(msg.timestamp).toLocaleDateString() !== new Date(messages[index - 1].timestamp).toLocaleDateString();
                            const dateLabel = new Date(msg.timestamp).toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : new Date(msg.timestamp).toLocaleDateString();

                            // Logic to only show header for the very first message
                            const showHeader = !msg.isUser && index === 0;

                            return (
                                <React.Fragment key={msg.id}>
                                    {showDate && (
                                        <div className="flex justify-center my-6 animate-fade-in relative z-0">
                                            <span className="bg-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full border border-gray-300">
                                                {dateLabel}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex items-end gap-3 animate-slide-up relative z-0 ${msg.isUser ? 'flex-row-reverse' : ''}`}>
                                        
                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white ${msg.isUser ? 'bg-gray-800' : 'bg-medical-50'}`}>
                                            <i className={`fas ${msg.isUser ? 'fa-user text-white text-sm' : 'fa-user-md text-medical-600 text-lg'}`}></i>
                                        </div>

                                        {/* Message Bubble - Doctor Style for Bot */}
                                        <div className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                            <div className={`
                                                relative overflow-hidden text-sm leading-relaxed border transition-all duration-300
                                                ${msg.isUser 
                                                    ? 'bg-medical-600 text-white rounded-2xl rounded-tr-none border-medical-700 shadow-md p-4' 
                                                    : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border-medical-100 shadow-sm'}
                                            `}>
                                                {/* Header for Bot Messages Only - Only on first message */}
                                                {showHeader && (
                                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 bg-gray-50/50 p-3 rounded-t-xl -mt-0.5 -mx-0.5">
                                                        <i className="fas fa-robot text-medical-500 text-xs"></i>
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Lucky Pharma AI</span>
                                                    </div>
                                                )}

                                                <div className={!msg.isUser ? (showHeader ? 'px-4 pb-4' : 'p-4') : ''}>
                                                    {msg.image && (
                                                        <img 
                                                            src={msg.image} 
                                                            alt="Attachment" 
                                                            className="w-full rounded-lg mb-3 h-auto object-cover border border-gray-200 shadow-sm"
                                                        />
                                                    )}
                                                    <div className="whitespace-pre-wrap">{formatMessageText(msg.text)}</div>
                                                </div>
                                                
                                                {/* Disclaimer for Bot messages */}
                                                {!msg.isUser && (
                                                     <div className="bg-green-50/50 p-2 text-[10px] text-green-800 flex items-center gap-1.5 border-t border-green-100 rounded-b-xl">
                                                        <i className="fas fa-shield-alt text-green-600"></i>
                                                        Always consult a doctor.
                                                     </div>
                                                )}
                                            </div>
                                            
                                            {/* Products Carousel */}
                                            {msg.products && msg.products.length > 0 && (
                                                <div className="mt-3 w-full -ml-1 pl-1">
                                                    <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
                                                        {msg.products.map(product => (
                                                            <div key={product.id} className="min-w-[150px] w-[150px] bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden snap-start flex-shrink-0 flex flex-col group hover:border-medical-300 transition-colors">
                                                                <div className="h-24 bg-gray-50 relative overflow-hidden">
                                                                    <ProductCardImage src={product.image} alt={product.name} />
                                                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                                                                </div>
                                                                <div className="p-3 flex flex-col flex-grow">
                                                                    <h4 className="text-xs font-bold text-gray-800 line-clamp-1 mb-1">{product.name}</h4>
                                                                    <p className="text-[10px] text-gray-500 line-clamp-2 mb-2 flex-grow">{product.description}</p>
                                                                    <button 
                                                                        onClick={() => onViewProduct && onViewProduct(product)}
                                                                        className="w-full bg-medical-50 text-medical-700 hover:bg-medical-600 hover:text-white text-xs font-bold py-1.5 rounded-lg transition-colors border border-medical-100"
                                                                    >
                                                                        View Details
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Metadata & Actions */}
                                            <div className="flex items-center gap-2 mt-1 px-1">
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                                {!msg.isUser && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleCopy(msg.id, msg.text)} className="text-gray-400 hover:text-medical-600 transition" title="Copy">
                                                            <i className={`fas ${copiedId === msg.id ? 'fa-check text-green-500' : 'fa-copy'} text-xs`}></i>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleTranslate(msg.id, msg.text)} 
                                                            disabled={translatingId === msg.id} 
                                                            className={`${msg.originalText ? 'text-blue-600 bg-blue-50 px-2 rounded-full' : 'text-gray-400 hover:text-blue-600'} transition flex items-center gap-1`} 
                                                            title={msg.originalText ? "Revert to Original" : "Translate to Hindi"}
                                                        >
                                                            <i className={`fas ${translatingId === msg.id ? 'fa-spinner fa-spin' : (msg.originalText ? 'fa-undo' : 'fa-language')} text-xs`}></i>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                        
                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex items-end gap-3 animate-slide-up my-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-medical-50 border-2 border-white shadow-sm">
                                     <i className="fas fa-user-md text-medical-600 text-lg"></i>
                                </div>
                                <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-none shadow-sm border border-medical-100 flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-medical-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-medical-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-medical-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Analyzing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer / Input Area */}
                    <div className="p-4 bg-white border-t border-gray-200 relative z-20">
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

                        {/* Quick Suggestions */}
                        {messages.length < 3 && (
                             <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar">
                                {suggestions.map((s, i) => (
                                    <button 
                                        key={i} 
                                        onClick={(e) => handleSubmit(e, s)}
                                        className="whitespace-nowrap px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 hover:bg-medical-100 hover:border-medical-200 hover:text-medical-700 transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <form onSubmit={(e) => handleSubmit(e)} className="flex items-center gap-2">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            
                            <div className="flex gap-1">
                                <button 
                                    type="button"
                                    onClick={triggerFileInput}
                                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${selectedImage ? 'bg-medical-100 text-medical-600 ring-2 ring-medical-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'}`}
                                    title="Upload Image"
                                >
                                    <i className="fas fa-camera text-lg"></i>
                                </button>
                            </div>

                            <div className="flex-1 relative transition-all duration-300 rounded-full border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-medical-200 focus-within:border-medical-500">
                                <input 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={selectedImage ? "Add caption..." : "Ask in English or Hinglish..."}
                                    className="w-full bg-transparent border-none px-5 py-3 text-sm focus:outline-none focus:ring-0 text-gray-700 placeholder-gray-400"
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isLoading || (!inputValue.trim() && !selectedImage)}
                                className="w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-white bg-medical-600 hover:bg-medical-700"
                            >
                                <i className="fas fa-paper-plane text-lg"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIChat;