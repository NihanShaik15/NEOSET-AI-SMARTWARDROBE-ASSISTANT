export type CategoryType = 'topwear' | 'bottomwear' | 'footwear' | 'accessories';

export type OccasionType = 'work' | 'casual' | 'party' | 'gym';

export type WeatherSuitability = 'warm' | 'cool' | 'cold' | 'rainy' | 'all';

export type ThemeMode = 'light' | 'dark' | 'neon';

export type UserGender = 'boy' | 'girl';

export type BodyBuild = 'slim' | 'athletic' | 'muscular' | 'curvy' | 'regular' | 'plus';
export type BodyHeight = 'petite' | 'average' | 'tall' | 'extra-tall';
export type HairStyle =
  | 'short-fade'
  | 'textured-crop'
  | 'buzz-cut'
  | 'pompadour'
  | 'casual-part'
  | 'wavy-lob'
  | 'sleek-long'
  | 'curls-afro'
  | 'pixie';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender: UserGender;
  createdAt: string;
}

export interface AvatarConfig {
  userName: string;
  gender: UserGender;
  genderLocked: boolean;
  genderExpression?: 'neutral' | 'feminine' | 'masculine';
  skinTone: string; // hex code
  skinToneName: string;
  height: BodyHeight;
  build: BodyBuild;
  hairStyle: HairStyle;
  hairColor: string;
  facialHair?: 'clean' | 'stubble' | 'beard';
  shoulderWidth?: number; // 0.8 to 1.3
  torsoScale?: number; // 0.8 to 1.3
  legLength?: number; // 0.8 to 1.2
  userPhoto?: string;
  photoScale?: number; // 0.8 to 1.5
  photoOffsetY?: number; // -30 to 30
  photoOffsetX?: number; // -30 to 30
  hasCompletedOnboarding: boolean;
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: CategoryType;
  subCategory: string;
  color: string;
  colorName: string;
  pattern: 'solid' | 'striped' | 'checkered' | 'floral' | 'textured';
  weather: WeatherSuitability[];
  occasions: OccasionType[];
  imageUrl: string;
  tags: string[];
  genderTarget?: 'boy' | 'girl' | 'unisex';
  isFavorite?: boolean;
  createdAt?: string;
  styleDetails?: {
    sleeve?: 'short' | 'long' | 'sleeveless' | 'oversized';
    cut?: 'crew' | 'collar' | 'vneck' | 'hoodie' | 'blazer' | 'tank' | 'dress' | 'gown';
    bottomType?: 'jeans' | 'trousers' | 'skirt' | 'shorts' | 'joggers' | 'cargos' | 'boxers';
    shoeType?: 'sneakers' | 'boots' | 'loafers' | 'heels' | 'runners' | 'oxfords';
    accessoryType?: 'bag' | 'sunglasses' | 'necklace' | 'watch' | 'cap';
    isDress?: boolean;
    dressLength?: 'mini' | 'midi' | 'maxi';
    imageScale?: number;
    imageOffsetY?: number;
    imageOffsetX?: number;
    clipToSilhouette?: boolean;
  };
}

export interface OutfitSelection {
  topwear: WardrobeItem | null;
  bottomwear: WardrobeItem | null;
  footwear: WardrobeItem | null;
  accessory: WardrobeItem | null;
}

export interface WeatherData {
  city: string;
  country?: string;
  temp: number; // in Celsius
  tempF: number;
  apparentTemp?: number;
  apparentTempF?: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'chilly' | 'snowy';
  conditionLabel: string;
  humidity: number;
  windSpeed: number; // km/h
  precipitation?: number;
  isDay?: boolean;
  clothingAdvice?: string;
  isRealTime?: boolean;
  lastUpdated?: string;
  latitude?: number;
  longitude?: number;
}

export interface StylistRecommendation {
  id: string;
  title: string;
  outfit: {
    topwear: WardrobeItem;
    bottomwear: WardrobeItem;
    footwear: WardrobeItem;
    accessory?: WardrobeItem;
  };
  occasion: OccasionType;
  mood: string;
  weatherReason: string;
  stylistAdvice: string;
  colorPalette: string[];
  matchScore: number;
  aiGenerated: boolean;
}

export interface StylistChatMessage {
  id: string;
  sender: 'user' | 'stylist';
  text: string;
  timestamp: string;
  suggestedOutfit?: OutfitSelection;
  fashionTips?: string[];
}

export interface AIChatQuestion {
  id: string;
  question: string;
  subtitle: string;
  type: 'destination' | 'vibe' | 'confirm';
  options?: {
    id: string;
    label: string;
    iconName: string;
    description: string;
  }[];
}

export interface CalendarOutfitEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  occasion: OccasionType | string;
  vibe?: string;
  weather?: {
    temp: number;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'chilly' | 'snowy';
    city: string;
  };
  outfit: {
    topwear: WardrobeItem | null;
    bottomwear: WardrobeItem | null;
    footwear: WardrobeItem | null;
    accessory: WardrobeItem | null;
  };
  notes?: string;
  loggedAt: string;
}

