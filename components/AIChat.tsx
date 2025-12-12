import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse, translateText } from '../services/geminiService';
import { ChatMessage } from '../types';

// Moved outside component to prevent recreation and scope issues
const WELCOME_MSG = "Hello! 👋 I'm your AI Pharmacist assistant. \n\nAsk me about: \n💊 Medicine uses \n🤒 Common symptoms \n🌿 Home remedies \n📷 Upload a photo of a medicine or prescription for help! \n\nNote: I am an AI, not a doctor. Please consult a professional for serious advice.";

const AIChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isConfirmingClear, setIsConfirmingClear] = useState(false);

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
    const suggestions = ["Medicine for headache", "Fever dosage?", "Pet dard upay", "Sardi khaasi"];

    // Save history to local storage whenever messages change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    // Listen for 'ask-ai' custom events from other components
    useEffect(() => {
        const handleAskAI = (e: any) => {
            const { productName, description } = e.detail;
            const query = `Can you explain what ${productName} is used for and provide some health tips? \n\nDescription context: ${description}`;
            
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
            // We rely on useEffect to update localStorage, but explicit removal is safe too
            // localStorage.removeItem('chat_history'); 
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
        // Find the message
        const msgIndex = messages.findIndex(m => m.id === id);
        if (msgIndex === -1) return;
        const msg = messages[msgIndex];

        // If currently displaying translated text (originalText exists), revert to original
        if (msg.originalText) {
            setMessages(prev => prev.map(m => 
                m.id === id ? { ...m, text: m.originalText!, originalText: undefined } : m
            ));
            return;
        }

        // Else, translate
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

        const aiResponseText = await getGeminiResponse(text);

        const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: aiResponseText,
            isUser: false,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
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

        const aiResponseText = await getGeminiResponse(userText, userImage || undefined);

        const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: aiResponseText,
            isUser: false,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };

    return (
        <>
            {/* FAB - Bot Type Design */}
            <button 
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 z-[90] p-0 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 group ${isOpen ? 'rotate-90' : 'animate-bounce-subtle'}`}
                aria-label="Chat with AI Pharmacist"
            >
                {/* Pulse Animation */}
                <div className={`absolute inset-0 bg-medical-400 rounded-full animate-ping opacity-20 ${isOpen ? 'hidden' : 'block'}`}></div>

                {/* Main Button */}
                <div className="relative w-16 h-16 rounded-full bg-medical-600 flex items-center justify-center border-4 border-white shadow-md overflow-hidden z-10">
                    <i className={`fas ${isOpen ? 'fa-times' : 'fa-robot'} text-3xl text-white transition-all duration-300`}></i>
                </div>
            </button>

            {/* Modal Overlay - Solid Background */}
            <div 
                className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-0 sm:px-4 bg-black/50 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                onClick={(e) => e.target === e.currentTarget && toggleChat()}
            >
                {/* Chat Container - Solid White */}
                <div 
                    className={`bg-white w-full sm:max-w-[450px] h-[90vh] sm:h-[650px] sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) relative overflow-hidden ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-full sm:translate-y-10 scale-95'}`}
                >
                    {/* Header - Solid Color */}
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

                    {/* Chat Area - Solid Background */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50 scroll-smooth relative">
                        {messages.map((msg, index) => {
                            const showDate = index === 0 || 
                                new Date(msg.timestamp).toLocaleDateString() !== new Date(messages[index - 1].timestamp).toLocaleDateString();
                            const dateLabel = new Date(msg.timestamp).toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : new Date(msg.timestamp).toLocaleDateString();

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
                                        
                                        {/* Avatar - Increased Size */}
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-md border-2 border-white ${msg.isUser ? 'bg-gray-800' : 'bg-white'}`}>
                                            <i className={`fas ${msg.isUser ? 'fa-user text-white text-xl' : 'fa-robot text-medical-600 text-2xl'}`}></i>
                                        </div>

                                        {/* Message Bubble - Solid Colors */}
                                        <div className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                            <div className={`
                                                p-4 rounded-2xl shadow-sm text-sm leading-relaxed relative border
                                                ${msg.isUser 
                                                    ? 'bg-medical-600 text-white rounded-br-none border-medical-700' 
                                                    : 'bg-white text-gray-800 rounded-bl-none border-gray-200'}
                                            `}>
                                                {msg.image && (
                                                    <img 
                                                        src={msg.image} 
                                                        alt="Attachment" 
                                                        className="w-full rounded-lg mb-3 h-auto object-cover border border-gray-200 shadow-sm"
                                                    />
                                                )}
                                                <div className="whitespace-pre-wrap">{msg.text}</div>
                                            </div>
                                            
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
                                                            {msg.originalText && <span className="text-[10px] font-bold">Undo</span>}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                        {isLoading && (
                            <div className="flex items-end gap-3 animate-slide-up">
                                <div className="w-11 h-11 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <i className="fas fa-robot text-medical-600 text-2xl"></i>
                                </div>
                                <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-200 flex gap-1 items-center h-12">
                                    <div className="w-2 h-2 bg-medical-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-medical-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-medical-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer / Input Area - Solid Background */}
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
                            
                            {/* Tools Menu */}
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

                            {/* Main Input */}
                            <div className="flex-1 relative transition-all duration-300 rounded-full border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-medical-200 focus-within:border-medical-500">
                                <input 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={selectedImage ? "Add caption..." : "Ask in English or Hinglish..."}
                                    className="w-full bg-transparent border-none px-5 py-3 text-sm focus:outline-none focus:ring-0 text-gray-700 placeholder-gray-400"
                                />
                            </div>
                            
                            {/* Send Button */}
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