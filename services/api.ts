
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
    MOCK_USERS, 
    MOCK_BAKERIES, 
    MOCK_CLIENT_SUBSCRIPTIONS, 
    MOCK_BAKERY_STATS, 
    MOCK_DELIVERY_JOBS,
    MOCK_CLIENT_FAQS,
    MOCK_CLIENT_ACHIEVEMENTS,
    MOCK_GALLERY_IMAGES,
    MOCK_CLIENT_CHAT_MESSAGES,
    MOCK_DELIVERY_FAQS,
    MOCK_DELIVERY_ACHIEVEMENTS,
    MOCK_SUPPORT_CHAT_MESSAGES,
    MOCK_DELIVERY_HISTORY,
    MOCK_BAKERY_WEEKLY_REVENUE,
    MOCK_BAKERY_FEED_POSTS,
    MOCK_PLATFORM_STATS,
    MOCK_ALL_FEED_POSTS,
    MOCK_MARKETING_CAMPAIGNS,
    MOCK_APP_NOTIFICATIONS,
    MOCK_PAYMENT_GATEWAYS,
    MOCK_PAYMENT_TRANSACTIONS,
    MOCK_PAYMENT_STATS
} from './mockData';
import type { User, Bakery, Subscription, Delivery, Product, PackageType, FaqItem, Achievement, GalleryImage, ChatMessage, WeeklyRevenue, FeedPost, PlatformStats, MarketingCampaign, AppNotification, AIMarketingSuggestion, PaymentGateway, PaymentTransaction, PaymentStats } from '../types';
import { UserRole, DeliveryStatus } from '../types';

const API_KEY = process.env.API_KEY;

const simulateNetwork = <T,>(data: T, delay?: number): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, delay || 500 + Math.random() * 500);
  });
};

export const login = (email: string, password: string): Promise<User | null> => {
  const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  return simulateNetwork(user || null);
};

export const register = (name: string, email: string, password: string, role: UserRole): Promise<User> => {
    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        role,
        address: 'Rua Fictícia, 123', // default address
        status: 'pending',
    };
    MOCK_USERS.push(newUser);
    return simulateNetwork(newUser);
};


export const getNearbyBakeries = (): Promise<Bakery[]> => {
    return simulateNetwork(MOCK_BAKERIES.filter(b => b.status === 'approved'));
}

export const getBakeryById = (bakeryId: string): Promise<Bakery | undefined> => {
    const bakery = MOCK_BAKERIES.find(b => b.id === bakeryId || b.ownerId === bakeryId); // Allow fetch by ownerId
    return simulateNetwork(bakery);
}

export const getClientSubscriptions = (userId: string): Promise<Subscription[]> => {
    return simulateNetwork(MOCK_CLIENT_SUBSCRIPTIONS.filter(s => s.userId === userId));
}

export const createSubscription = (
    userId: string,
    bakeryId: string,
    bakeryName: string,
    plan: PackageType,
    items: Product[]
): Promise<Subscription> => {
    const newSubscription: Subscription = {
        id: `sub-${Date.now()}`,
        userId,
        bakeryId,
        bakeryName,
        plan,
        items,
        status: 'Active',
        nextDelivery: 'Amanhã', // simplified for mock
    };
    MOCK_CLIENT_SUBSCRIPTIONS.push(newSubscription);
    return simulateNetwork(newSubscription);
};

export const getBakeryDashboardData = (bakeryId: string) => {
    return simulateNetwork(MOCK_BAKERY_STATS);
}

export const getDeliveryJobs = (deliveryPersonId: string): Promise<Delivery[]> => {
    return simulateNetwork(MOCK_DELIVERY_JOBS);
}

export const updateDeliveryStatus = (deliveryId: string, status: DeliveryStatus): Promise<{ success: true }> => {
    const delivery = MOCK_DELIVERY_JOBS.find(d => d.id === deliveryId);
    if (delivery) {
        delivery.status = status;
        return simulateNetwork({ success: true });
    }
    return Promise.reject("Delivery not found");
};


export const getDeliveryHistory = (deliveryPersonId: string): Promise<Delivery[]> => {
    return simulateNetwork(MOCK_DELIVERY_HISTORY);
}

export const getBakeryWeeklyRevenue = (bakeryId: string): Promise<WeeklyRevenue[]> => {
    return simulateNetwork(MOCK_BAKERY_WEEKLY_REVENUE);
}

// --- PRODUCT MANAGEMENT API ---

export const getBakeryProducts = (ownerId: string): Promise<Product[]> => {
    const bakery = MOCK_BAKERIES.find(b => b.ownerId === ownerId);
    return simulateNetwork(bakery?.products || []);
};

export const addProduct = (ownerId: string, productData: Omit<Product, 'id'>): Promise<Product> => {
    const bakery = MOCK_BAKERIES.find(b => b.ownerId === ownerId);
    if (!bakery) return Promise.reject("Bakery not found");
    
    const newProduct: Product = { ...productData, id: `prod-${Date.now()}` };
    bakery.products.push(newProduct);
    return simulateNetwork(newProduct);
};

export const updateProduct = (ownerId: string, updatedProduct: Product): Promise<Product> => {
    const bakery = MOCK_BAKERIES.find(b => b.ownerId === ownerId);
    if (!bakery) return Promise.reject("Bakery not found");
    
    const productIndex = bakery.products.findIndex(p => p.id === updatedProduct.id);
    if (productIndex === -1) return Promise.reject("Product not found");
    
    bakery.products[productIndex] = updatedProduct;
    return simulateNetwork(updatedProduct);
};

export const removeProduct = (ownerId: string, productId: string): Promise<{ success: true }> => {
    const bakery = MOCK_BAKERIES.find(b => b.ownerId === ownerId);
    if (!bakery) return Promise.reject("Bakery not found");

    bakery.products = bakery.products.filter(p => p.id !== productId);
    return simulateNetwork({ success: true });
};

// --- BAKERY FEED & PROFILE API ---

export const getBakeryFeed = (bakeryId: string): Promise<FeedPost[]> => {
    return simulateNetwork(MOCK_BAKERY_FEED_POSTS.filter(p => p.bakeryId === bakeryId));
};

export const updateBakeryProfile = (
    ownerId: string, 
    userData: Partial<User>, 
    bakeryData: Partial<Bakery>
): Promise<{ success: true }> => {
    const user = MOCK_USERS.find(u => u.id === ownerId);
    const bakery = MOCK_BAKERIES.find(b => b.ownerId === ownerId);
    if (user) {
        Object.assign(user, userData);
    }
    if (bakery) {
        Object.assign(bakery, bakeryData);
    }
    return simulateNetwork({ success: true });
};


// --- PROFILE API FUNCTIONS ---

// Client Profile
export const getClientFaqs = (): Promise<FaqItem[]> => simulateNetwork(MOCK_CLIENT_FAQS, 300);
export const getClientAchievements = (): Promise<Achievement[]> => simulateNetwork(MOCK_CLIENT_ACHIEVEMENTS, 300);
export const getGalleryImages = (): Promise<GalleryImage[]> => simulateNetwork(MOCK_GALLERY_IMAGES, 300);
export const getClientChatMessages = (): Promise<ChatMessage[]> => simulateNetwork(MOCK_CLIENT_CHAT_MESSAGES, 300);

// Delivery Profile
export const getDeliveryFaqs = (): Promise<FaqItem[]> => simulateNetwork(MOCK_DELIVERY_FAQS, 300);
export const getDeliveryAchievements = (): Promise<Achievement[]> => simulateNetwork(MOCK_DELIVERY_ACHIEVEMENTS, 300);
export const getSupportChatMessages = (): Promise<ChatMessage[]> => simulateNetwork(MOCK_SUPPORT_CHAT_MESSAGES, 300);

// --- PAYMENT FLOW API ---
export const processPayment = (
    clientName: string,
    amount: number,
    method: string
): Promise<{ success: true; transactionId: string }> => {
    const newTransaction: PaymentTransaction = {
        id: `tr-${Date.now()}`,
        clientName,
        amount,
        method,
        status: 'Aprovada', // Simulate successful payment
        date: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    };
    MOCK_PAYMENT_TRANSACTIONS.unshift(newTransaction);
    // In a real app, you'd also update revenue stats, etc.
    MOCK_PAYMENT_STATS.revenueToday += amount;
    MOCK_PAYMENT_STATS.approvedTransactions += 1;
    return simulateNetwork({ success: true, transactionId: newTransaction.id }, 1500); // Simulate network delay for processing
};


// --- ADMIN API FUNCTIONS ---

export const getPlatformStats = (): Promise<PlatformStats> => {
    return simulateNetwork(MOCK_PLATFORM_STATS);
};

export const getAllBakeriesForAdmin = (): Promise<Bakery[]> => {
    return simulateNetwork(MOCK_BAKERIES.filter(b => b.status === 'approved'));
};

export const getAllFeedPostsForModeration = (): Promise<FeedPost[]> => {
    // Make a copy to prevent mutation issues during moderation
    return simulateNetwork([...MOCK_ALL_FEED_POSTS]);
};

export const moderatePost = (postId: string, action: 'approve' | 'remove'): Promise<{ success: true }> => {
    if (action === 'remove') {
        const index = MOCK_ALL_FEED_POSTS.findIndex(p => p.id === postId);
        if (index > -1) {
            MOCK_ALL_FEED_POSTS.splice(index, 1);
        }
    }
    // "Approve" does nothing in this mock, as posts are visible by default
    return simulateNetwork({ success: true });
};

export const getAllProductsForAdmin = (): Promise<(Product & { bakeryName: string })[]> => {
    const allProducts = MOCK_BAKERIES.flatMap(bakery => 
        bakery.products.map(product => ({
            ...product,
            bakeryName: bakery.name,
        }))
    );
    return simulateNetwork(allProducts);
}

export const getMarketingCampaigns = (): Promise<MarketingCampaign[]> => {
    return simulateNetwork([...MOCK_MARKETING_CAMPAIGNS]); // Return a copy
};

export const createMarketingCampaign = (campaign: Omit<MarketingCampaign, 'id' | 'views' | 'clicks'>): Promise<MarketingCampaign> => {
    const newCampaign: MarketingCampaign = {
        ...campaign,
        id: `camp-${Date.now()}`,
        views: 0,
        clicks: 0,
    };
    MOCK_MARKETING_CAMPAIGNS.push(newCampaign);
    return simulateNetwork(newCampaign);
};

export const updateMarketingCampaign = (updatedCampaign: MarketingCampaign): Promise<MarketingCampaign> => {
    const index = MOCK_MARKETING_CAMPAIGNS.findIndex(c => c.id === updatedCampaign.id);
    if (index === -1) {
        return Promise.reject("Campaign not found");
    }
    MOCK_MARKETING_CAMPAIGNS[index] = updatedCampaign;
    return simulateNetwork(updatedCampaign);
};

export const removeMarketingCampaign = (campaignId: string): Promise<{ success: true }> => {
    const index = MOCK_MARKETING_CAMPAIGNS.findIndex(c => c.id === campaignId);
    if (index === -1) {
        return Promise.reject("Campaign not found");
    }
    MOCK_MARKETING_CAMPAIGNS.splice(index, 1);
    return simulateNetwork({ success: true });
};


export const getNotifications = (): Promise<AppNotification[]> => {
    return simulateNetwork(MOCK_APP_NOTIFICATIONS);
};

export const sendNotification = (notification: Omit<AppNotification, 'id' | 'sentAt' | 'opens' | 'clicks'>): Promise<AppNotification> => {
    const newNotification: AppNotification = {
        ...notification,
        id: `notif-${Date.now()}`,
        sentAt: new Date().toLocaleString('pt-BR'),
        opens: 0,
        clicks: 0,
    };
    MOCK_APP_NOTIFICATIONS.unshift(newNotification);
    return simulateNetwork(newNotification);
};

// New Admin functions for Registration Management
export const getPendingRegistrations = (): Promise<{ bakeries: Bakery[], deliveries: User[] }> => {
    const bakeries = MOCK_BAKERIES.filter(b => b.status === 'pending');
    const deliveries = MOCK_USERS.filter(u => u.role === UserRole.DELIVERY && u.status === 'pending');
    return simulateNetwork({ bakeries, deliveries });
};

export const updateRegistrationStatus = (id: string, type: 'bakery' | 'delivery', status: 'approved' | 'suspended'): Promise<{ success: true }> => {
    if (type === 'bakery') {
        const bakery = MOCK_BAKERIES.find(b => b.id === id);
        if (bakery) bakery.status = status;
    } else {
        const user = MOCK_USERS.find(u => u.id === id);
        if (user) user.status = status;
    }
    return simulateNetwork({ success: true });
};

export const getAIMarketingSuggestions = async (): Promise<AIMarketingSuggestion[]> => {
    if (!API_KEY) {
        // Return a fallback suggestion if API key is not present
        return Promise.resolve([
            { title: "Especial de Pão de Queijo", description: "Todo dia é dia de pão de queijo! Adicione à sua assinatura e comece o dia com mais sabor.", productName: "Pão de Queijo (100g)" },
            { title: "Manhã Parisiense", description: "Que tal um croissant quentinho? Sinta-se em Paris sem sair de casa. Peça já!", productName: "Croissant" }
        ]);
    }
    const ai = new GoogleGenerativeAI({ apiKey: API_KEY });
    const prompt = `You are a growth marketing expert for a bakery subscription app called Padoka. Based on our platform data (best-selling products: Pão Francês, Pão de Queijo; most popular bakery: Pão Quente & Cia), suggest two specific marketing campaigns. For each, provide a catchy title, a short description for the notification, and the productName to feature. Return the response as a JSON array of objects.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            description: { type: "string" },
                            productName: { type: "string" },
                        },
                        required: ['title', 'description', 'productName'],
                    },
                },
            },
        });

        const suggestions = JSON.parse(response.text);
        return suggestions;
    } catch (error) {
        console.error("Error generating AI marketing suggestions:", error);
        throw new Error("Failed to get suggestions from AI.");
    }
};

// New Admin functions for Payment Management
export const getPaymentGateways = (): Promise<PaymentGateway[]> => simulateNetwork([...MOCK_PAYMENT_GATEWAYS]);

export const updatePaymentGateway = (gateway: PaymentGateway): Promise<PaymentGateway> => {
    const index = MOCK_PAYMENT_GATEWAYS.findIndex(g => g.id === gateway.id);
    if (index > -1) {
        MOCK_PAYMENT_GATEWAYS[index] = gateway;
    }
    return simulateNetwork(gateway);
};

export const getPaymentStats = (): Promise<PaymentStats> => simulateNetwork(MOCK_PAYMENT_STATS);

export const getRecentTransactions = (): Promise<PaymentTransaction[]> => simulateNetwork(MOCK_PAYMENT_TRANSACTIONS);