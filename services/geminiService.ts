import { GoogleGenAI, Type, Tool, Modality } from "@google/genai";
import { Product } from "../types";
import { productList } from "../data/products";

// Initialize safely - relies on Vite's define plugin to replace process.env.API_KEY at build time
const getAIClient = () => {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        console.warn("API Key is missing. Please set API_KEY in your environment variables.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

// Public check for UI status
export const isAIConfigured = (): boolean => {
    return !!process.env.API_KEY;
};

const SYSTEM_INSTRUCTION = `You are a warm, caring, and friendly AI Pharmacist assistant for 'New Lucky Pharma', located in Hanwara, Jharkhand. Your goal is to help users with their health queries in a supportive and reassuring manner.

GUIDELINES:
1. GREETING:
   - If user ask questions then give answer remove greeeting.
   - If the user starts with a simple greeting (e.g., "Hi", "Hello", "How are you?"), reply briefly with a friendly, single-sentence greeting and ask how you can help.
   - For all other queries (i.e., medical questions, product questions), reply directly and immediately to the user's query. Do not add any extra conversational text.
   - Always start with a friendly greeting if it is the very first message.
2. TONE:
   - Be empathetic, polite, and respectful. Use emojis (💊, 🌿, 😊, 🙏) to make the conversation warm.
   - Use bold text (**) for key medicine names, headings, and important warnings.
3. MEDICAL QUERIES:
   - Provide clear, point-wise advice.
   - Format:
     1. **[Medicine Name/Remedy]**
     2. Usage Instructions
     3. Dietary Tip
     4. **Warning**
   - Keep it concise but helpful.
   - Keep Answer short and clean, aiming for less lines maximum.
4. IMAGE ANALYSIS:
   - Identify medicines or visible symptoms.
   - Explain uses/remedies clearly.
5. PRODUCT SEARCH:
   - If the user asks to "find", "search", "show", "buy" or asks about the "price" or "availability" of a specific medicine, USE THE 'search_medicines' TOOL.
6. MANDATORY DISCLAIMER: End *every* medical suggestion with: "Please consult a doctor for serious advice. Stay safe! 💚"
7. LOCATION & DIRECTIONS:
   - If a user asks for the pharmacy's location or directions, provide the address below.
   - Mention that they can use the "Directions" button in the top menu or the interactive map at the bottom of the page for GPS navigation.
   - Location: New Lucky Pharma, Main Road, Hanwara, Godda, Jharkhand (814154).
   - Time: Open 7 days a week, MON-SUN: 6:00 am to 12:00 pm & 1:00 pm to 9:00 pm, except Friday: 6:00 am to 12:00 pm & 2:00 pm to 9:00 pm.

Note: You are an AI assistant, not a doctor. Prioritize user safety and well-being.`;

// Tool Definition
const searchTool: Tool = {
    functionDeclarations: [{
        name: "search_medicines",
        description: "Search for medicines, health products, or remedies in the store inventory.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: {
                    type: Type.STRING,
                    description: "The name of the medicine, symptom, or category to search for."
                }
            },
            required: ["query"]
        }
    }]
};

// Helper to clean markdown bold syntax (**) from responses
const cleanText = (text: string): string => {
    if (!text) return "";
    return text.trim();
};

export const getGeminiResponse = async (userMessage: string, imageBase64?: string, targetLanguage: string = 'English'): Promise<{ text: string, products?: Product[], groundingSources?: { title: string; url: string }[] }> => {
    try {
        const ai = getAIClient();
        if (!ai) return { text: "I am currently offline. Please check back later." };

        let contents: any;
        
        let finalMessage = userMessage;
        if (targetLanguage && targetLanguage !== 'English') {
            finalMessage = `${userMessage}\n\n[System Instruction: You MUST reply to this message in ${targetLanguage} language.]`;
        }

        if (imageBase64) {
             const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
             if (match) {
                 const mimeType = match[1];
                 const data = match[2];
                 contents = {
                     parts: [
                         { inlineData: { mimeType, data } },
                         { text: finalMessage || "Please analyze this image." }
                     ]
                 };
             }
        } else {
            contents = finalMessage;
        }

        // Fixed 400 Error: Removed googleMaps tool from gemini-3-flash-preview call.
        // Google Maps grounding is only supported in Gemini 2.5 series and cannot be combined with FunctionDeclarations.
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                tools: [searchTool]
            }
        });

        const functionCalls = response.functionCalls;
        
        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            if (call.name === "search_medicines") {
                const query = call.args['query'] as string;
                const products = await performHybridSearch(query);
                
                let resultText = products.length > 0 
                    ? `I found ${products.length} products matching "**${query}**" for you. Tap 'View' to see details!`
                    : `I couldn't find "**${query}**" in our local inventory, but I can suggest general remedies if you like.`;

                if (targetLanguage && targetLanguage !== 'English') {
                    resultText = await translateText(resultText, targetLanguage);
                }

                return {
                    text: resultText,
                    products: products
                };
            }
        }

        const text = response.text || "";
        const groundingSources: { title: string; url: string }[] = [];

        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
                if (chunk.web?.uri && chunk.web?.title) {
                    groundingSources.push({ title: chunk.web.title, url: chunk.web.uri });
                }
                if (chunk.maps?.uri && chunk.maps?.title) {
                    groundingSources.push({ title: chunk.maps.title, url: chunk.maps.uri });
                } else if (chunk.maps?.uri) {
                     groundingSources.push({ title: "View on Google Maps", url: chunk.maps.uri });
                }
            });
        }

        return { 
            text: cleanText(text) || "I didn't quite catch that. Could you rephrase?",
            groundingSources: groundingSources.length > 0 ? groundingSources : undefined
        };

    } catch (error) {
        console.error("Gemini API Error:", error);
        return { text: "I'm having trouble connecting to the server. Please consult a pharmacist in person." };
    }
};

const performHybridSearch = async (query: string): Promise<Product[]> => {
    const lowerQuery = query.toLowerCase();
    
    const localResults = productList.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category?.toLowerCase().includes(lowerQuery)
    );

    if (localResults.length > 0) {
        return localResults.slice(0, 4);
    }

    return await searchProducts(query);
};

export const translateText = async (text: string, targetLanguage: string = 'English'): Promise<string> => {
    try {
        const ai = getAIClient();
        if (!ai) return text;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Translate the following text into ${targetLanguage}. Keep any markdown formatting like bolding (**). Text: \n\n${text}`,
        });

        return response.text || text;
    } catch (error) {
        console.error("Translation Error:", error);
        return text;
    }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
    try {
        const ai = getAIClient();
        if (!ai) return null;

        const cleanSpeechText = text.replace(/\*\*/g, "").replace(/\*/g, "");

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: cleanSpeechText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("TTS Error:", error);
        return null;
    }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
    try {
        const ai = getAIClient();
        if (!ai) return [];

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `You are an expert pharmacist in India. User Query: "${query}".
            Generate a list of 4 DISTINCT, POPULAR BRAND NAME medicines available in India that match the query.
            
            STRICT RULES FOR "NAME" FIELD:
            1. MUST BE A BRAND NAME: Return commercially sold names like "Dolo 650", "Saridon", "Ascoril", "Shelcal", "Digene".
            2. NO GENERIC NAMES: Do NOT use chemical names like "Paracetamol", "Ibuprofen", "Amoxycillin" as the main name.
            3. NO DESCRIPTIONS IN NAME: Do not write "Paracetamol Tablet". Write "Dolo 650".
            4. REAL PRODUCTS ONLY: Use actual products found in Indian medical stores.
            5. SHOW Result according to User Query.
            6. Match first result with user queries.

            Provide: Category, Composition (Active Ingredients with strength), Usage, Side Effects, Precautions, and Prescription Status.`,
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
                            composition: { type: Type.STRING },
                            usage: { type: Type.STRING },
                            sideEffects: { type: Type.STRING },
                            precautions: { 
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            isPrescriptionRequired: { type: Type.BOOLEAN }
                        },
                        required: ["name", "description", "category", "composition", "usage", "sideEffects", "precautions", "isPrescriptionRequired"]
                    }
                }
            }
        });

        let rawData = response.text;
        if (!rawData) return [];

        const parsedData = JSON.parse(rawData);
        
        return parsedData.map((item: any, index: number) => ({
            id: Date.now() + index + 100000,
            name: item.name,
            description: item.description,
            image: `https://image.pollinations.ai/prompt/medicine%20${encodeURIComponent(item.name)}%20product%20packaging%20white%20background?width=400&height=400&nologo=true`,
            delay: `reveal-delay-${(index * 100) % 400}`,
            category: item.category,
            composition: item.composition,
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