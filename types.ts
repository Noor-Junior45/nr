export interface ChatMessage {
    id: string;
    text: string;
    originalText?: string;
    image?: string;
    isUser: boolean;
    timestamp: number;
    products?: Product[];
    groundingSources?: { title: string; url: string }[];
}

export interface Product {
    id: number;
    name: string;
    description: string;
    image: string;
    delay?: string;
    // Enhanced details
    category?: string;
    usage?: string;
    sideEffects?: string;
    precautions?: string[];
    isPrescriptionRequired?: boolean;
    composition?: string;
}

export interface ServiceItem {
    id: number;
    icon: string;
    title: string;
    description: string;
    delay?: string;
}

export interface Review {
    id: string;
    productId: number;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}