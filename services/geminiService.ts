import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Initialize safely - relies on Vite's define plugin to replace process.env.API_KEY at build time
const getAIClient = () => {
    // In Vite production builds, process.env.API_KEY is replaced by the actual string.
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        console.warn("API Key is missing. Please set API_KEY in your environment variables.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `You are a warm, caring, and friendly AI Pharmacist assistant for 'New Lucky Pharma', located in Hanwara, Jharkhand. Your goal is to help users with their health queries in a supportive and reassuring manner.

CORE LANGUAGE RULES (STRICT):
1. Match the User's Language: 
   - If the user writes in English, you MUST reply in English.
   - If the user writes in Hinglish (Hindi in English script) or Hindi, you MUST reply in Hinglish (a friendly mix of Hindi and English).
   - Do not force Hinglish if the user asks in proper English.
   - Do not use Hinglish if user not using Hinglish.

GUIDELINES:
1. GREETING:
   - If user ask questions then give answer remove greeeting.
   - If the user starts with a simple greeting (e.g., "Hi", "Hello", "How are you?"), reply briefly with a friendly, single-sentence greeting and ask how you can help (e.g., "Hello! How can I assist you with your health questions today?").
   - For all other queries (i.e., medical questions, product questions), reply directly and immediately to the user's query. Do not add any extra conversational text.
   - Always start with a friendly greeting.
2. TONE:
   - Be empathetic, polite, and respectful. Use emojis (💊, 🌿, 😊, 🙏) to make the conversation warm.
3. MEDICAL QUERIES:
   - Provide clear, point-wise advice.
   - Format:
     1. [Medicine Name/Remedy]
     2. [Usage Instructions]
     3. [Dietary Tip]
     4. [Warning]
   - Keep it concise but helpful.
   - Keep Answer short and clean, aiming for less lines maximum.
4. IMAGE ANALYSIS:
   - Identify medicines or visible symptoms.
   - Explain uses/remedies clearly.
5. MANDATORY DISCLAIMER: End *every* medical suggestion with: "Please consult a doctor for serious advice. Stay safe! 💚"
6. If User ask about location and Time then give this result: 
     - LOCATION: New Lucky Pharma, Main Road, Hanwara, Godda, Jharkhand (814154).
     - TIME: Open 7 days a week, MON-SUN: 6:00 am to 12:00 pm & 1:00 pm to 9:00 pm, except Friday: 6:00 am to 12:00 pm & 2:00 pm to 9:00 pm.

Note: You are an AI assistant, not a doctor. Prioritize user safety and well-being.`;

// Helper to clean markdown bold syntax (**) from responses
const cleanText = (text: string): string => {
    if (!text) return "";
    return text.replace(/\*\*/g, '').trim();
};

export const getGeminiResponse = async (userMessage: string, imageBase64?: string): Promise<string> => {
    try {
        const ai = getAIClient();
        if (!ai) return "I am currently offline. Please check back later.";

        let contents: any = userMessage;

        // Handle Image Input
        if (imageBase64) {
             const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
             if (match) {
                 const mimeType = match[1];
                 const data = match[2];
                 contents = {
                     parts: [
                         { inlineData: { mimeType, data } },
                         { text: userMessage || "Please analyze this image." }
                     ]
                 };
             }
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
            }
        });

        const text = response.text;
        return cleanText(text) || "I didn't quite catch that. Could you rephrase?";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "I'm having trouble connecting to the server. Please consult a pharmacist in person.";
    }
};

export const translateText = async (text: string): Promise<string> => {
    try {
        const ai = getAIClient();
        if (!ai) return text;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following medical advice into clear, easy-to-understand Hindi. Keep numbered lists. Do not use bold markdown. Text: \n\n${text}`,
        });

        return cleanText(response.text) || text;
    } catch (error) {
        console.error("Translation Error:", error);
        return text;
    }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
    try {
        const ai = getAIClient();
        if (!ai) return [];

        // Request a structured JSON response to ensure all fields are present
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are an expert pharmacist in India. User Query: "${query}".
            Generate a list of 4 DISTINCT, POPULAR BRAND NAME medicines available in India that match the query.
            
            STRICT RULES FOR "NAME" FIELD:
            1. MUST BE A BRAND NAME: Return commercially sold names like "Dolo 650", "Saridon", "Ascoril", "Shelcal", "Digene".
            2. NO GENERIC NAMES: Do NOT use chemical names like "Paracetamol", "Ibuprofen", "Amoxycillin" as the main name.
            3. NO DESCRIPTIONS IN NAME: Do not write "Paracetamol Tablet". Write "Dolo 650".
            4. REAL PRODUCTS ONLY: Use actual products found in Indian medical stores.
            5. Show First Result according to query.

            Example:
            - Query: "Fever" -> Name: "Dolo 650", "Crocin Advance", "Calpol 500".
            - Query: "Gas" -> Name: "Eno", "Digene", "Pan 40".
            - Query: "Cough" -> Name: "Benadryl", "Ascoril LS", "Grilinctus".
            
            Provide: Category (e.g., Pain Relief), Usage (short instruction), Side Effects, Precautions, and Prescription Status.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            category: { type: Type.STRING },
                            usage: { type: Type.STRING },
                            sideEffects: { type: Type.STRING },
                            precautions: { 
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            isPrescriptionRequired: { type: Type.BOOLEAN }
                        },
                        required: ["name", "description", "category", "usage", "sideEffects", "precautions", "isPrescriptionRequired"]
                    }
                }
            }
        });

        let rawData = response.text;
        if (!rawData) return [];

        // Clean markdown fences if the model includes them despite JSON mode
        if (rawData.startsWith('```json')) {
            rawData = rawData.replace(/^```json\s+/, '').replace(/\s+```$/, '');
        } else if (rawData.startsWith('```')) {
            rawData = rawData.replace(/^```\s+/, '').replace(/\s+```$/, '');
        }

        const parsedData = JSON.parse(rawData);
        
        // Transform the AI response to match our Product type
        return parsedData.map((item: any, index: number) => ({
            id: Date.now() + index, // Unique ID
            name: item.name,
            description: item.description,
            // Use Pollinations AI to generate a relevant image based on the product name
            image: `https://image.pollinations.ai/prompt/medicine%20${encodeURIComponent(item.name)}%20product%20packaging%20white%20background?width=400&height=400&nologo=true`,
            delay: `reveal-delay-${(index * 100) % 400}`,
            category: item.category,
            usage: item.usage,
            sideEffects: item.sideEffects,
            precautions: item.precautions,
            isPrescriptionRequired: item.isPrescriptionRequired
        }));

    } catch (error) {
        console.error("Gemini Search Error:", error);
        return [];
    }
};