import React, { useState, useEffect } from 'react';
import {
  AvatarConfig,
  WardrobeItem,
  CategoryType,
  StylistRecommendation,
  UserProfile,
  UserGender,
  WeatherData,
  CalendarOutfitEntry,
} from './types';
import { HomeView } from './components/HomeView';
import { FittingRoomView } from './components/FittingRoomView';
import { WardrobeView } from './components/WardrobeView';
import { AIStylistFlow } from './components/AIStylistFlow';
import { CalendarView } from './components/CalendarView';
import { AvatarCustomizer } from './components/AvatarCustomizer';
import { AuthModal } from './components/AuthModal';
import { WeatherModal } from './components/WeatherModal';
import { isDressItem } from './components/AvatarRenderer';
import { fetchRealtimeWeather } from './services/weatherService';
import { generateInitialCalendarHistory } from './data/seedCalendarHistory';
import {
  Home,
  Layers,
  Shirt,
  Sparkles,
  Calendar as CalendarIcon,
  Smartphone,
  Tablet,
  Maximize2,
  Sun,
  Moon,
  Zap,
  Lock,
  LogOut,
  UserCheck,
  RotateCcw,
  CloudRain,
  Trash2,
} from 'lucide-react';

const DEFAULT_GIRL_AVATAR: AvatarConfig = {
  userName: 'Mia',
  gender: 'girl',
  genderLocked: true,
  genderExpression: 'feminine',
  skinTone: '#DDA776',
  skinToneName: 'Golden Honey',
  height: 'average',
  build: 'athletic',
  hairStyle: 'wavy-lob',
  hairColor: '#452A18',
  hasCompletedOnboarding: true,
};

const DEFAULT_BOY_AVATAR: AvatarConfig = {
  userName: 'Leo',
  gender: 'boy',
  genderLocked: true,
  genderExpression: 'masculine',
  skinTone: '#E0B594',
  skinToneName: 'Almond Beige',
  height: 'tall',
  build: 'athletic',
  hairStyle: 'short-fade',
  hairColor: '#1A1817',
  hasCompletedOnboarding: true,
  facialHair: 'stubble',
};

export default function App() {
  // Theme state: 'light' | 'dark' | 'neon'
  const [theme, setTheme] = useState<'light' | 'dark' | 'neon'>(() => {
    const saved = localStorage.getItem('neoset_theme');
    return (saved as 'light' | 'dark' | 'neon') || 'dark';
  });

  // User Authentication State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('neoset_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // Avatar Configuration
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => {
    const saved = localStorage.getItem('neoset_avatar_config');
    if (saved) return JSON.parse(saved);
    return DEFAULT_GIRL_AVATAR;
  });

  // Wardrobe Items (strictly empty by default for clean new accounts: no clothes added)
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(() => {
    const saved = localStorage.getItem('neoset_wardrobe');
    return saved ? JSON.parse(saved) : [];
  });

  // Active outfit worn on avatar (clean canvas default: no dress)
  const [currentOutfit, setCurrentOutfit] = useState<{
    topwear: WardrobeItem | null;
    bottomwear: WardrobeItem | null;
    footwear: WardrobeItem | null;
    accessory: WardrobeItem | null;
  }>(() => {
    const saved = localStorage.getItem('neoset_current_outfit');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Clean dashboard default on new account / clean state: no any dress!
    return {
      topwear: null,
      bottomwear: null,
      footwear: null,
      accessory: null,
    };
  });

  const [savedOutfits, setSavedOutfits] = useState<StylistRecommendation[]>(() => {
    const saved = localStorage.getItem('neoset_saved_outfits');
    return saved ? JSON.parse(saved) : [];
  });

  // Calendar Outfit History State
  const [calendarHistory, setCalendarHistory] = useState<CalendarOutfitEntry[]>(() => {
    const saved = localStorage.getItem('neoset_calendar_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return generateInitialCalendarHistory();
  });

  useEffect(() => {
    localStorage.setItem('neoset_calendar_history', JSON.stringify(calendarHistory));
  }, [calendarHistory]);

  const [activeTab, setActiveTab] = useState<'home' | 'tryon' | 'wardrobe' | 'stylist' | 'calendar'>('home');
  const [fittingRoomCategory, setFittingRoomCategory] = useState<CategoryType>('topwear');
  const [showAvatarStudio, setShowAvatarStudio] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'signin'>('signup');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Real-time weather state
  const [activeWeather, setActiveWeather] = useState<WeatherData>(() => {
    const saved = localStorage.getItem('neoset_active_weather');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      city: 'Paris',
      country: 'France',
      temp: 18,
      tempF: 64,
      apparentTemp: 18,
      apparentTempF: 64,
      condition: 'sunny',
      conditionLabel: 'Clear Sky',
      humidity: 55,
      windSpeed: 10,
      isDay: true,
      clothingAdvice: 'Mild & pleasant: Breathable cottons, lightweight button-downs, and relaxed chinos or skirts.',
      isRealTime: true,
      latitude: 48.8566,
      longitude: 2.3522,
    };
  });
  const [showWeatherModal, setShowWeatherModal] = useState(false);

  // Sync active weather to localStorage
  useEffect(() => {
    localStorage.setItem('neoset_active_weather', JSON.stringify(activeWeather));
  }, [activeWeather]);

  // Auto-refresh real-time weather from Open-Meteo on mount
  useEffect(() => {
    const loadRealtimeWeather = async () => {
      try {
        const live = await fetchRealtimeWeather(
          activeWeather.latitude && activeWeather.longitude
            ? {
                lat: activeWeather.latitude,
                lon: activeWeather.longitude,
                cityName: activeWeather.city,
                countryName: activeWeather.country,
              }
            : activeWeather.city
        );
        setActiveWeather(live);
      } catch (err) {
        console.warn('Initial real-time weather load:', err);
      }
    };
    loadRealtimeWeather();
  }, []);

  // Sync theme
  useEffect(() => {
    localStorage.setItem('neoset_theme', theme);
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-neon');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  // Sync profile & avatar
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('neoset_user_profile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('neoset_user_profile');
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('neoset_avatar_config', JSON.stringify(avatarConfig));
  }, [avatarConfig]);

  useEffect(() => {
    localStorage.setItem('neoset_wardrobe', JSON.stringify(wardrobe));
  }, [wardrobe]);

  useEffect(() => {
    localStorage.setItem('neoset_saved_outfits', JSON.stringify(savedOutfits));
  }, [savedOutfits]);

  useEffect(() => {
    localStorage.setItem('neoset_current_outfit', JSON.stringify(currentOutfit));
  }, [currentOutfit]);

  // Clear current outfit to clean avatar state
  const handleClearOutfit = () => {
    const cleanOutfit = {
      topwear: null,
      bottomwear: null,
      footwear: null,
      accessory: null,
    };
    setCurrentOutfit(cleanOutfit);
    localStorage.setItem('neoset_current_outfit', JSON.stringify(cleanOutfit));
  };

  // Handle Authentication completion (gender selection & lock)
  // When a new account is created, the dashboard is clean with no dress equipped.
  const handleAuthComplete = (profile: UserProfile, isNewAccount: boolean = true) => {
    setUserProfile(profile);

    const isBoy = profile.gender === 'boy';
    const baseAvatar = isBoy ? DEFAULT_BOY_AVATAR : DEFAULT_GIRL_AVATAR;

    const newConfig: AvatarConfig = {
      ...baseAvatar,
      userName: profile.name,
      gender: profile.gender,
      genderLocked: true,
      genderExpression: isBoy ? 'masculine' : 'feminine',
    };

    setAvatarConfig(newConfig);

    if (isNewAccount) {
      // CLEAN DASHBOARD & CLEAN WARDROBE ON NEW ACCOUNT: NO DRESS / NO CLOTHES
      const cleanOutfit = {
        topwear: null,
        bottomwear: null,
        footwear: null,
        accessory: null,
      };
      setCurrentOutfit(cleanOutfit);
      localStorage.setItem('neoset_current_outfit', JSON.stringify(cleanOutfit));
      setWardrobe([]);
      localStorage.setItem('neoset_wardrobe', JSON.stringify([]));
      setSavedOutfits([]);
      localStorage.removeItem('neoset_saved_outfits');
    }
    setActiveTab('home');
  };

  // Clear all clothes from wardrobe to ensure completely empty closet
  const handleClearWardrobe = () => {
    setWardrobe([]);
    localStorage.setItem('neoset_wardrobe', JSON.stringify([]));
    handleClearOutfit();
  };

  const handleSignOut = () => {
    setAuthModalMode('signin');
    setUserProfile(null);
    setShowProfileMenu(false);
  };

  // Handler: Add wardrobe item
  const handleAddWardrobeItem = (item: WardrobeItem) => {
    setWardrobe((prev) => [item, ...prev]);
  };

  // Handler: Delete wardrobe item
  const handleDeleteWardrobeItem = (id: string) => {
    setWardrobe((prev) => prev.filter((i) => i.id !== id));
    setCurrentOutfit((prev) => ({
      topwear: prev.topwear?.id === id ? null : prev.topwear,
      bottomwear: prev.bottomwear?.id === id ? null : prev.bottomwear,
      footwear: prev.footwear?.id === id ? null : prev.footwear,
      accessory: prev.accessory?.id === id ? null : prev.accessory,
    }));
  };

  // Handler: Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setWardrobe((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i))
    );
  };

  // Handler: Slot item change in try-on
  const handleSelectSlotItem = (category: CategoryType, item: WardrobeItem | null) => {
    setCurrentOutfit((prev) => ({
      ...prev,
      [category]: item,
    }));
  };

  // Handler: Direct try-on from wardrobe
  const handleTryOnFromWardrobe = (item: WardrobeItem) => {
    setCurrentOutfit((prev) => ({
      ...prev,
      [item.category]: item,
    }));
    setActiveTab('tryon');
  };

  // Handler: Shuffle outfit
  const handleRandomizeOutfit = () => {
    const isBoy = avatarConfig.gender === 'boy';
    const filtered = wardrobe.filter((i) => !i.genderTarget || i.genderTarget === 'unisex' || (isBoy ? i.genderTarget === 'boy' : i.genderTarget === 'girl'));

    const tops = filtered.filter((i) => i.category === 'topwear');
    const bottoms = filtered.filter((i) => i.category === 'bottomwear');
    const shoes = filtered.filter((i) => i.category === 'footwear');
    const accs = filtered.filter((i) => i.category === 'accessories');

    setCurrentOutfit({
      topwear: tops[Math.floor(Math.random() * tops.length)] || null,
      bottomwear: bottoms[Math.floor(Math.random() * bottoms.length)] || null,
      footwear: shoes[Math.floor(Math.random() * shoes.length)] || null,
      accessory: Math.random() > 0.3 ? accs[Math.floor(Math.random() * accs.length)] || null : null,
    });
  };

  // Handler: Save current look
  const handleSaveCurrentLook = () => {
    const isDress = isDressItem(currentOutfit.topwear);
    if (!currentOutfit.topwear || (!currentOutfit.bottomwear && !isDress) || !currentOutfit.footwear) return;
    
    const title = isDress
      ? `${currentOutfit.topwear.name} Ensemble`
      : `${currentOutfit.topwear.name.split(' ')[0]} & ${currentOutfit.bottomwear?.name.split(' ')[0] || ''} Look`;

    const look: StylistRecommendation = {
      id: `saved-${Date.now()}`,
      title,
      outfit: {
        topwear: currentOutfit.topwear,
        bottomwear: currentOutfit.bottomwear || currentOutfit.topwear, // fallback for strict types
        footwear: currentOutfit.footwear,
        accessory: currentOutfit.accessory || undefined,
      },
      occasion: currentOutfit.topwear.occasions[0] || 'casual',
      mood: isDress ? 'Haute Elegance' : 'Personal Customization',
      weatherReason: isDress ? 'Draped one-piece dress look.' : 'Hand-assembled in virtual fitting room.',
      stylistAdvice: isDress ? 'Full-silhouette styling with streamlined proportions.' : 'Balanced proportions and cohesive tones.',
      colorPalette: [
        currentOutfit.topwear.color,
        currentOutfit.bottomwear ? currentOutfit.bottomwear.color : currentOutfit.topwear.color,
        currentOutfit.footwear.color,
      ],
      matchScore: 99,
      aiGenerated: false,
    };
    setSavedOutfits((prev) => [look, ...prev]);
  };

  // Handler: Apply AI Recommended Outfit
  const handleApplyAIOutfit = (outfit: {
    topwear: WardrobeItem;
    bottomwear: WardrobeItem;
    footwear: WardrobeItem;
    accessory?: WardrobeItem;
  }) => {
    setCurrentOutfit({
      topwear: outfit.topwear,
      bottomwear: outfit.bottomwear,
      footwear: outfit.footwear,
      accessory: outfit.accessory || null,
    });
    setActiveTab('home');
  };

  // Handler: Save AI recommendation
  const handleSaveAIRecommendation = (rec: StylistRecommendation) => {
    setSavedOutfits((prev) => {
      if (prev.some((p) => p.id === rec.id)) return prev;
      return [rec, ...prev];
    });
  };

  // Calendar Handlers
  const handleApplyOutfitFromCalendar = (outfit: {
    topwear: WardrobeItem | null;
    bottomwear: WardrobeItem | null;
    footwear: WardrobeItem | null;
    accessory: WardrobeItem | null;
  }) => {
    setCurrentOutfit(outfit);
    localStorage.setItem('neoset_current_outfit', JSON.stringify(outfit));
  };

  const handleSaveOutfitToDate = (entry: CalendarOutfitEntry) => {
    setCalendarHistory((prev) => {
      const filtered = prev.filter((e) => e.date !== entry.date && e.id !== entry.id);
      return [entry, ...filtered];
    });
  };

  const handleDeleteOutfitFromDate = (id: string) => {
    setCalendarHistory((prev) => prev.filter((e) => e.id !== id));
  };

  const navTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tryon', label: 'Try-On', icon: Layers },
    { id: 'wardrobe', label: 'Wardrobe', icon: Shirt, badge: wardrobe.length },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, badge: calendarHistory.length },
    { id: 'stylist', label: 'AI Stylist', icon: Sparkles },
  ];

  // Helper for responsive frame mode
  const getFrameContainerClass = () => {
    switch (viewportMode) {
      case 'mobile':
        return 'w-full max-w-[420px] min-h-[850px] my-4 sm:my-8 rounded-[44px] border-[9px] border-neutral-800 shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden relative ring-1 ring-neutral-700/50';
      case 'tablet':
        return 'w-full max-w-[768px] min-h-[880px] my-4 sm:my-8 rounded-[36px] border-[8px] border-neutral-800 shadow-[0_25px_70px_rgba(0,0,0,0.7)] overflow-hidden relative ring-1 ring-neutral-700/40';
      case 'desktop':
      default:
        return 'w-full max-w-7xl min-h-screen sm:min-h-[94vh] my-0 sm:my-3 sm:rounded-3xl border sm:border-neutral-200 dark:sm:border-neutral-800/80 shadow-2xl overflow-hidden relative';
    }
  };

  const isLight = theme === 'light';
  const isNeon = theme === 'neon';
  const isBoy = avatarConfig.gender === 'boy';

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-start p-0 sm:p-3 md:p-6 select-none font-sans transition-colors duration-300 theme-${theme} ${
        isLight
          ? 'bg-[#F9F9F8] text-[#1E2022]'
          : isNeon
          ? 'bg-[#06070a] text-[#f1f5f9]'
          : 'bg-[#0e1015] text-neutral-100'
      }`}
    >
      {/* AUTHENTICATION MODAL GATE (Must authenticate and select gender before entering dashboard) */}
      {!userProfile && (
        <AuthModal
          isOpen={!userProfile}
          onAuthSuccess={handleAuthComplete}
          theme={theme}
          initialMode={authModalMode}
        />
      )}

      {/* Outer Application Frame */}
      <div
        className={`transition-all duration-300 flex flex-col justify-between ${
          isLight
            ? 'bg-white text-neutral-900 border-neutral-200'
            : isNeon
            ? 'bg-neutral-950 text-neutral-100 border-cyan-500/30'
            : 'bg-neutral-950/95 text-neutral-100 border-neutral-800/80'
        } ${getFrameContainerClass()}`}
      >
        {/* Device Status Bar in Phone/Tablet Mode */}
        {viewportMode !== 'desktop' && (
          <div
            className={`px-7 pt-3 pb-1 flex items-center justify-between text-[11px] font-semibold select-none border-b ${
              isLight
                ? 'bg-neutral-100 border-neutral-200 text-neutral-600'
                : 'bg-neutral-950 border-neutral-900 text-neutral-400'
            }`}
          >
            <span>9:41</span>
            <div className="w-24 h-4 bg-neutral-800/30 rounded-full mx-auto flex items-center justify-center">
              <span className="w-2.5 h-2.5 bg-neutral-600 rounded-full" />
            </div>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-5 h-2.5 border border-current rounded-sm p-0.5">
                <div className="h-full bg-current w-3/4 rounded-2xs" />
              </div>
            </div>
          </div>
        )}

        {/* Global Navigation Header */}
        <header
          className={`px-3 sm:px-5 py-3 border-b flex items-center justify-between backdrop-blur-xl sticky top-0 z-40 gap-2 ${
            isLight
              ? 'bg-white/95 border-neutral-200'
              : isNeon
              ? 'bg-neutral-950/90 border-cyan-500/30'
              : 'bg-neutral-950/90 border-neutral-800/80'
          }`}
        >
          {/* Brand Logo & Name */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#244837] border border-[#C5A880]/40 flex items-center justify-center shadow-md shadow-[#244837]/25 group-hover:scale-105 transition shrink-0">
              <Sparkles className="w-4 h-4 text-[#C5A880]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-base sm:text-lg tracking-tight leading-none text-neutral-900 dark:text-neutral-100">
                  NeoSet
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#244837]/15 text-[#244837] dark:text-[#C5A880] border border-[#244837]/25 font-bold uppercase tracking-wider hidden xs:inline-block">
                  AI
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold mt-0.5 hidden xs:block">
                Smart Wardrobe
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links - hidden in tablet & mobile viewports to provide ample room */}
          <nav
            className={`${
              viewportMode === 'desktop' ? 'hidden xl:flex' : 'hidden'
            } items-center gap-1 p-1 rounded-2xl border ${
              isLight
                ? 'bg-neutral-100 border-neutral-200'
                : 'bg-neutral-900/90 border-neutral-800'
            }`}
          >
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 lg:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#244837] text-white shadow-sm'
                      : isLight
                      ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-[#C5A880]/30 text-white' : 'bg-black/10 dark:bg-neutral-800 text-current'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Header Controls: Theme Switcher, Responsive Viewport, & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* FEATURE: Theme Switcher (Light / Dark / Neon) */}
            <div
              className={`flex items-center p-0.5 rounded-xl border ${
                isLight
                  ? 'bg-neutral-100 border-neutral-200'
                  : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Old Money Alabaster Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden 2xl:inline">Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#244837] text-[#C5A880] shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Old Money Forest Slate Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden 2xl:inline">Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('neon')}
                className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer ${
                  theme === 'neon'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.3)] font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Emerald Night Theme"
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden 2xl:inline">Neon</span>
              </button>
            </div>

            {/* Responsive Viewport Switcher */}
            <div
              className={`hidden sm:flex items-center p-0.5 rounded-xl border shrink-0 ${
                isLight
                  ? 'bg-neutral-100 border-neutral-200'
                  : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              <button
                type="button"
                onClick={() => setViewportMode('desktop')}
                className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer ${
                  viewportMode === 'desktop'
                    ? isLight
                      ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                      : 'bg-neutral-800 text-[#C5A880] font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                }`}
                title="Full Responsive Desktop View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('tablet')}
                className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer ${
                  viewportMode === 'tablet'
                    ? isLight
                      ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                      : 'bg-neutral-800 text-[#C5A880] font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                }`}
                title="Tablet Frame Preview (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('mobile')}
                className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer ${
                  viewportMode === 'mobile'
                    ? isLight
                      ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                      : 'bg-neutral-800 text-[#C5A880] font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                }`}
                title="Mobile Phone Frame (420px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live Weather Pill Button */}
            <button
              type="button"
              onClick={() => setShowWeatherModal(true)}
              className={`hidden md:flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-2xl border text-xs transition cursor-pointer active:scale-95 shrink-0 ${
                isLight
                  ? 'border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-850 text-neutral-200'
              }`}
              title="Click to view real-time Open-Meteo weather or search any location"
            >
              <CloudRain className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="font-semibold hidden lg:inline">{activeWeather.city}</span>
              <span className="font-bold text-[#244837] dark:text-[#C5A880]">{activeWeather.temp}°C</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </button>

            {/* Profile Avatar & Locked Gender Indicator - High Priority in all viewports */}
            <div className="relative shrink-0 z-50">
              <button
                type="button"
                id="header-profile-btn"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-2xl border transition shrink-0 cursor-pointer shadow-xs ${
                  isLight
                    ? 'border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                    : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-850 text-neutral-200'
                }`}
                title="Account & Gender Lock Profile"
              >
                <div
                  className="w-5 h-5 rounded-full border border-black/30 shadow-sm shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ backgroundColor: avatarConfig.skinTone }}
                >
                  {isBoy ? '♂' : '♀'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold max-w-[70px] sm:max-w-[100px] truncate leading-tight">
                    {avatarConfig.userName || 'Profile'}
                  </span>
                  <span className="text-[9px] text-[#B38F5F] dark:text-[#C5A880] flex items-center gap-0.5 leading-none font-medium">
                    <Lock className="w-2 h-2" />
                    <span>{isBoy ? 'Boy' : 'Girl'}</span>
                  </span>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div
                  className={`absolute right-0 mt-2 w-56 rounded-2xl border p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 ${
                    isLight
                      ? 'bg-white border-neutral-200 text-neutral-900'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-100'
                  }`}
                >
                  <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 mb-1">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#B38F5F] dark:text-[#C5A880]" />
                      <span className="text-xs font-bold">{avatarConfig.userName}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-[#B38F5F] dark:text-[#C5A880]" />
                      <span>
                        Gender locked to <strong>{isBoy ? 'Boy' : 'Girl'}</strong>
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAvatarStudio(true);
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 transition cursor-pointer"
                  >
                    <span>Customizer & Photo Overlay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleClearOutfit();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 transition cursor-pointer text-amber-600 dark:text-amber-400"
                    title="Remove all clothing items from the avatar"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clean Dashboard (Undress)</span>
                  </button>

                  {wardrobe.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClearWardrobe();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 transition cursor-pointer text-amber-700 dark:text-amber-500"
                      title="Remove all clothes from wardrobe"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Wardrobe ({wardrobe.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 transition mt-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Viewport Container */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
          {activeTab === 'home' && (
            <HomeView
              config={avatarConfig}
              currentOutfit={currentOutfit}
              totalWardrobeCount={wardrobe.length}
              savedOutfits={savedOutfits}
              activeWeather={activeWeather}
              onOpenWeatherModal={() => setShowWeatherModal(true)}
              onOpenStylist={() => setActiveTab('stylist')}
              onOpenFittingRoom={(cat) => {
                if (cat) setFittingRoomCategory(cat);
                setActiveTab('tryon');
              }}
              onOpenWardrobe={() => setActiveTab('wardrobe')}
              onOpenCalendar={() => setActiveTab('calendar')}
              onOpenAvatarStudio={() => setShowAvatarStudio(true)}
              onApplySavedLook={(look) => {
                setCurrentOutfit({
                  topwear: look.outfit.topwear,
                  bottomwear: look.outfit.bottomwear,
                  footwear: look.outfit.footwear,
                  accessory: look.outfit.accessory || null,
                });
              }}
              onClearOutfit={handleClearOutfit}
              theme={theme}
            />
          )}

          {activeTab === 'tryon' && (
            <FittingRoomView
              config={avatarConfig}
              wardrobe={wardrobe}
              currentOutfit={currentOutfit}
              onSelectSlotItem={handleSelectSlotItem}
              onRandomizeOutfit={handleRandomizeOutfit}
              onClearOutfit={handleClearOutfit}
              onSaveOutfitLook={handleSaveCurrentLook}
              onOpenStylistForLook={() => setActiveTab('stylist')}
              theme={theme}
              initialCategory={fittingRoomCategory}
            />
          )}

          {activeTab === 'wardrobe' && (
            <WardrobeView
              wardrobe={wardrobe}
              onAddItem={handleAddWardrobeItem}
              onDeleteItem={handleDeleteWardrobeItem}
              onToggleFavorite={handleToggleFavorite}
              onTryOnItem={handleTryOnFromWardrobe}
              onClearAll={handleClearWardrobe}
              currentOutfitIds={{
                topwearId: currentOutfit.topwear?.id,
                bottomwearId: currentOutfit.bottomwear?.id,
                footwearId: currentOutfit.footwear?.id,
                accessoryId: currentOutfit.accessory?.id,
              }}
              theme={theme}
              userGender={avatarConfig.gender}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              history={calendarHistory}
              currentOutfit={currentOutfit}
              activeWeather={activeWeather}
              onApplyOutfitToAvatar={handleApplyOutfitFromCalendar}
              onSaveOutfitToDate={handleSaveOutfitToDate}
              onDeleteOutfitFromDate={handleDeleteOutfitFromDate}
              theme={theme}
            />
          )}

          {activeTab === 'stylist' && (
            <AIStylistFlow
              config={avatarConfig}
              wardrobe={wardrobe}
              currentOutfit={currentOutfit}
              activeWeather={activeWeather}
              onOpenWeatherModal={() => setShowWeatherModal(true)}
              onApplyOutfit={handleApplyAIOutfit}
              onSaveOutfit={handleSaveAIRecommendation}
              theme={theme}
            />
          )}
        </main>

        {/* Mobile & Tablet Bottom Navigation Bar */}
        <nav
          className={`${
            viewportMode === 'desktop' ? 'xl:hidden' : 'flex'
          } ${
            viewportMode !== 'desktop' ? 'absolute' : 'fixed sm:absolute'
          } bottom-0 inset-x-0 backdrop-blur-xl border-t px-2 sm:px-4 py-2 pb-3 z-40 flex items-center justify-around shadow-2xl ${
            isLight
              ? 'bg-white/95 border-neutral-200'
              : isNeon
              ? 'bg-neutral-950/95 border-cyan-500/30'
              : 'bg-neutral-950/95 border-neutral-800/80'
          }`}
        >
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center py-1 px-3 rounded-xl transition cursor-pointer ${
                  isActive
                    ? 'text-[#244837] dark:text-[#C5A880] font-bold'
                    : isLight
                    ? 'text-neutral-500 hover:text-neutral-900'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {tab.id === 'stylist' && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#C5A880] animate-pulse" />
                  )}
                  {tab.badge !== undefined && tab.badge > 0 && tab.id !== 'stylist' && (
                    <span
                      className={`absolute -top-1.5 -right-2.5 text-[9px] px-1 rounded-full font-bold leading-none py-0.5 ${
                        isActive
                          ? 'bg-[#244837] text-white dark:bg-[#C5A880] dark:text-neutral-950'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1">{tab.label}</span>
              </button>
            );
          })}

          {/* Profile Quick Toggle for Tablet / Mobile Navigation */}
          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition cursor-pointer ${
              showProfileMenu
                ? 'text-[#244837] dark:text-[#C5A880] font-bold'
                : isLight
                ? 'text-neutral-500 hover:text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Profile & Preferences"
          >
            <div className="w-5 h-5 rounded-full border border-black/30 shadow-xs flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: avatarConfig.skinTone }}>
              {isBoy ? '♂' : '♀'}
            </div>
            <span className="text-[10px] mt-1">Profile</span>
          </button>
        </nav>

        {/* Real-time Weather Modal */}
        {showWeatherModal && (
          <WeatherModal
            currentWeather={activeWeather}
            onSelectWeather={(newWeather) => {
              setActiveWeather(newWeather);
              setShowWeatherModal(false);
            }}
            onClose={() => setShowWeatherModal(false)}
            theme={theme}
          />
        )}

        {/* Avatar Customizer Modal (Gender Locked if selected) */}
        {showAvatarStudio && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <AvatarCustomizer
              config={avatarConfig}
              onSave={(newCfg) => {
                setAvatarConfig({
                  ...newCfg,
                  gender: avatarConfig.gender, // Strict gender lock preservation
                  genderLocked: true,
                });
                setShowAvatarStudio(false);
              }}
              onClose={() => setShowAvatarStudio(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
