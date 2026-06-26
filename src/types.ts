export interface CatProfile {
  id: string;
  name: string;
  breed: string;
  age: string;
  weight: string;
  medicalHistory: string;
  vaccinations: string;
  allergies: string;
  diet: string;
  behavior: string;
  appearance: string;
  personality: string;
  avatarUrl?: string;
  isCustomPhoto?: boolean;
  createdAt: string;
}

export interface Insights {
  healthScore: number;
  breedDescription: string;
  nutritionPlan: string;
  preventiveCare: string;
  groomingTips: string;
  dailySchedule: Array<{
    time: string;
    activity: string;
    type: 'feeding' | 'hydration' | 'play' | 'grooming' | 'medication' | 'vet';
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole?: string;
  content: string;
  imageUrl?: string;
  likes: number;
  likedByMe?: boolean;
  comments: Array<{
    id: string;
    author: string;
    authorAvatar?: string;
    content: string;
    timestamp: string;
  }>;
  category: string;
  timestamp: string;
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  isPremium: boolean;
  aiRecommended?: boolean;
  description: string;
}

export interface VetClinic {
  id: string;
  name: string;
  distance: string;
  rating: number;
  reviewsCount: number;
  address: string;
  phone: string;
  isEmergency: boolean;
  hasOnlineConsult: boolean;
}
