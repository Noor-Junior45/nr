import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Initialize safely - if API key is missing, it will throw only when called, not on app load
const getAIClient = () => {
    let apiKey = '';
    try {
        // Safe access to process.env for browser environments
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            apiKey = process.env.API_KEY;
        }
    } catch (e) {
        console.warn("Could not access process.env");
    }

    if (!apiKey) {
        console.warn("API Key is missing.");
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
    // Remove ** markers but keep the text inside them
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

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a list of 4 popular pharmaceutical products available in India related to '${query}'.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.INTEGER },
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            imageKeyword: { type: Type.STRING, description: "A single keyword to search for an image, e.g., 'pill', 'syrup', 'bottle'" }
                        },
                        required: ["id", "name", "description", "imageKeyword"]
                    }
                }
            }
        });

        const rawData = response.text;
        if (!rawData) return [];

        const parsedData = JSON.parse(rawData);
        
        // Transform the AI response to match our Product type, adding placeholder images
        return parsedData.map((item: any, index: number) => ({
            id: Date.now() + index, // Unique ID
            name: item.name,
            description: item.description,
            // Use a reliable placeholder service with the name or keyword
            image: `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(item.name)}`,
            delay: `reveal-delay-${(index * 100) % 400}`
        }));

    } catch (error) {
        console.error("Gemini Search Error:", error);
        return [];
    }
};