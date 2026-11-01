import React, { useState, useEffect } from 'react';
import { AvatarConfig, WardrobeItem, OccasionType, WeatherData, StylistRecommendation } from '../types';
import { AvatarRenderer } from './AvatarRenderer';
import { StylistChat } from './StylistChat';
import {
  Sparkles,
  CloudRain,
  Sun,
  Cloud,
  Snowflake,
  Check,
  RefreshCw,
  ArrowRight,
  Briefcase,
  Coffee,
  Wine,
  Dumbbell,
  Compass,
  Bookmark,
  MessageSquare,
  Wand2,
  MapPin,
  Shirt,
} from 'lucide-react';

interface AIStylistFlowProps {
  config: AvatarConfig;
  wardrobe: WardrobeItem[];
  currentOutfit?: {
    topwear: WardrobeItem | null;
    bottomwear: WardrobeItem | null;
    footwear: WardrobeItem | null;
    accessory: WardrobeItem | null;
  };
  activeWeather?: WeatherData;
  onOpenWeatherModal?: () => void;
  onApplyOutfit: (outfit: {
    topwear: WardrobeItem;
    bottomwear: WardrobeItem;
    footwear: WardrobeItem;
    accessory?: WardrobeItem;
  }) => void;
  onSaveOutfit: (recommendation: StylistRecommendation) => void;
  theme?: 'light' | 'dark' | 'neon';
}

const PRESET_CITIES: WeatherData[] = [
  {
    city: 'Tokyo',
    temp: 19,
    tempF: 66,
    condition: 'sunny',
    conditionLabel: 'Clear & Crisp',
    humidity: 48,
    windSpeed: 8,
  },
  {
    city: 'Paris',
    temp: 14,
    tempF: 57,
    condition: 'rainy',
    conditionLabel: 'Light Rain & Breezy',
    humidity: 82,
    windSpeed: 14,
  },
  {
    city: 'New York',
    temp: 26,
    tempF: 79,
    condition: 'sunny',
    conditionLabel: 'Warm Summer Sun',
    humidity: 55,
    windSpeed: 10,
  },
  {
    city: 'London',
    temp: 11,
    tempF: 52,
    condition: 'cloudy',
    conditionLabel: 'Overcast & Chilly',
    humidity: 76,
    windSpeed: 16,
  },
  {
    city: 'Milan',
    temp: 21,
    tempF: 70,
    condition: 'sunny',
    conditionLabel: 'Golden Hour Mild',
    humidity: 50,
    windSpeed: 9,
  },
];

const DESTINATIONS: { id: OccasionType; label: string; desc: string; icon: any }[] = [
  { id: 'work', label: 'Work & Office', desc: 'Client meetings, boardroom or creative studio', icon: Briefcase },
  { id: 'casual', label: 'Casual Outing', desc: 'Brunch, cafe hopping, gallery walk, shopping', icon: Coffee },
  { id: 'party', label: 'Night Out & Party', desc: 'Cocktails, dinner date, evening event', icon: Wine },
  { id: 'gym', label: 'Gym & Athleisure', desc: 'Workout session, Pilates, morning run', icon: Dumbbell },
];

const VIBES = [
  { id: 'minimalist', label: 'Minimalist Chic', desc: 'Clean silhouettes, quiet luxury, neutral palette' },
  { id: 'relaxed', label: 'Relaxed & Cozy', desc: 'Effortless layers, comfort-first textiles' },
  { id: 'sharp', label: 'Sharp & Tailored', desc: 'Structured lines, refined confidence' },
  { id: 'bold', label: 'Statement & Trendy', desc: 'Curated color pops, modern proportions' },
];

export const AIStylistFlow: React.FC<AIStylistFlowProps> = ({
  config,
  wardrobe,
  currentOutfit,
  activeWeather,
  onOpenWeatherModal,
  onApplyOutfit,
  onSaveOutfit,
  theme = 'dark',
}) => {
  const [activeMode, setActiveMode] = useState<'curate' | 'chat'>('curate');
  const [step, setStep] = useState<'destination' | 'vibe' | 'loading' | 'result'>('destination');
  const [selectedWeather, setSelectedWeather] = useState<WeatherData>(() => activeWeather || PRESET_CITIES[1]);
  const [selectedDestination, setSelectedDestination] = useState<OccasionType>('work');
  const [selectedVibe, setSelectedVibe] = useState('minimalist');
  const [recommendation, setRecommendation] = useState<StylistRecommendation | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [appliedToast, setAppliedToast] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [altSeed, setAltSeed] = useState(0);

  // Sync with active real-time weather whenever it changes
  useEffect(() => {
    if (activeWeather) {
      setSelectedWeather(activeWeather);
    }
  }, [activeWeather]);

  const isLight = theme === 'light';
  const isNeon = theme === 'neon';
  const isBoy = config.gender === 'boy';

  // Filter wardrobe based on user gender
  const filteredWardrobe = wardrobe.filter((item) => {
    if (!item.genderTarget || item.genderTarget === 'unisex') return true;
    return isBoy ? item.genderTarget === 'boy' : item.genderTarget === 'girl';
  });

  const loadingMessages = [
    `Checking current weather in ${selectedWeather.city} (${selectedWeather.temp}°C, ${selectedWeather.conditionLabel})...`,
    `Filtering your ${filteredWardrobe.length} wardrobe pieces for ${selectedDestination} appropriateness...`,
    `Balancing fabric weights, color harmony & ${selectedVibe} aesthetic...`,
    'Finalizing bespoke styling notes for your 2D avatar...',
  ];

  const handleGenerateRecommendation = async (dest = selectedDestination, vibe = selectedVibe, seedOffset = 0) => {
    if (filteredWardrobe.length === 0) {
      setStep('destination');
      return;
    }

    setStep('loading');
    setLoadingMessageIndex(0);
    setIsSaved(false);

    const messageTimer = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 600);

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wardrobe: filteredWardrobe,
          occasion: dest,
          vibe: vibe,
          weather: selectedWeather,
          seed: altSeed + seedOffset,
        }),
      });

      clearInterval(messageTimer);

      if (response.ok) {
        const data = await response.json();
        const recData = data.recommendation || data;

        // Match IDs to wardrobe items
        const topItem = filteredWardrobe.find((i) => i.id === recData.topwearId) || filteredWardrobe.find((i) => i.category === 'topwear');
        const bottomItem = filteredWardrobe.find((i) => i.id === recData.bottomwearId) || filteredWardrobe.find((i) => i.category === 'bottomwear');
        const footItem = filteredWardrobe.find((i) => i.id === recData.footwearId) || filteredWardrobe.find((i) => i.category === 'footwear');
        const accItem = filteredWardrobe.find((i) => i.id === recData.accessoryId);

        if (topItem && bottomItem && footItem) {
          setRecommendation({
            id: `rec-${Date.now()}`,
            title: recData.title || `${vibe} Ensemble for ${dest}`,
            outfit: {
              topwear: topItem,
              bottomwear: bottomItem,
              footwear: footItem,
              accessory: accItem,
            },
            occasion: dest,
            mood: vibe,
            weatherReason: recData.weatherReason || `Optimal for ${selectedWeather.city}'s ${selectedWeather.temp}°C climate.`,
            stylistAdvice: recData.stylistAdvice || 'Clean silhouette lines complementing your body proportions.',
            colorPalette: recData.colorPalette?.length ? recData.colorPalette : [topItem.color, bottomItem.color, footItem.color],
            matchScore: recData.matchScore || 96,
            aiGenerated: true,
          });
          setStep('result');
          return;
        }
      }
    } catch (e) {
      console.warn('Backend API request failed, using intelligent client fallback');
    }

    // Client-side fallback curation with variety based on seed
    const matchingTops = filteredWardrobe.filter((i) => i.category === 'topwear' && i.occasions.includes(dest));
    const fallbackTops = filteredWardrobe.filter((i) => i.category === 'topwear');
    const availableTops = matchingTops.length > 0 ? matchingTops : fallbackTops;
    const topIdx = (altSeed + seedOffset) % Math.max(1, availableTops.length);
    const topItem = availableTops[topIdx] || availableTops[0];

    const matchingBottoms = filteredWardrobe.filter((i) => i.category === 'bottomwear');
    const bottomIdx = (altSeed + seedOffset) % Math.max(1, matchingBottoms.length);
    const bottomItem = matchingBottoms[bottomIdx] || matchingBottoms[0];

    const matchingShoes = filteredWardrobe.filter((i) => i.category === 'footwear');
    const shoesIdx = (altSeed + seedOffset) % Math.max(1, matchingShoes.length);
    const footItem = matchingShoes[shoesIdx] || matchingShoes[0];

    const matchingAccs = filteredWardrobe.filter((i) => i.category === 'accessories');
    const accItem = matchingAccs.length > 0 ? matchingAccs[(altSeed + seedOffset) % matchingAccs.length] : undefined;

    if (topItem && bottomItem && footItem) {
      setRecommendation({
        id: `rec-${Date.now()}`,
        title: `${vibe.charAt(0).toUpperCase() + vibe.slice(1)} ${dest.charAt(0).toUpperCase() + dest.slice(1)} Look`,
        outfit: {
          topwear: topItem,
          bottomwear: bottomItem,
          footwear: footItem,
          accessory: accItem,
        },
        occasion: dest,
        mood: vibe,
        weatherReason: `Carefully tuned for ${selectedWeather.city}'s ${selectedWeather.temp}°C weather with comfortable layering.`,
        stylistAdvice: `Pairing the ${topItem.name} with ${bottomItem.name} creates an effortless, flattering proportion tailored to ${dest}.`,
        colorPalette: [topItem.color, bottomItem.color, footItem.color],
        matchScore: 94 + ((altSeed * 3) % 5),
        aiGenerated: false,
      });
      setStep('result');
    }
  };

  const handleApplyToActive = () => {
    if (!recommendation) return;
    onApplyOutfit(recommendation.outfit);
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 2400);
  };

  const getWeatherIcon = (cond: string) => {
    switch (cond) {
      case 'rainy':
        return <CloudRain className="w-4 h-4 text-sky-400" />;
      case 'cloudy':
        return <Cloud className="w-4 h-4 text-neutral-300" />;
      case 'chilly':
      case 'snowy':
        return <Snowflake className="w-4 h-4 text-indigo-300" />;
      default:
        return <Sun className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Mode Switcher: Curated Look Generator vs Live Chat */}
      <div
        className={`p-1.5 rounded-2xl border flex items-center justify-center gap-2 max-w-md mx-auto ${
          isLight
            ? 'bg-white border-neutral-200 shadow-sm'
            : isNeon
            ? 'bg-neutral-950 border-cyan-500/30'
            : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveMode('curate')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeMode === 'curate'
              ? 'bg-[#244837] text-white shadow-md shadow-[#244837]/20'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Curated Recommendations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('chat')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeMode === 'chat'
              ? 'bg-[#244837] text-white shadow-md shadow-[#244837]/20'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Interactive AI Stylist Chat</span>
        </button>
      </div>

      {/* RENDER CHAT MODE */}
      {activeMode === 'chat' && (
        <StylistChat
          config={config}
          wardrobe={filteredWardrobe}
          currentOutfit={currentOutfit}
          theme={theme}
        />
      )}

      {/* RENDER CURATED LOOK GENERATOR MODE */}
      {activeMode === 'curate' && (
        <>
          {/* Weather Header Bar */}
          <div
            className={`rounded-3xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              isLight
                ? 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
                : isNeon
                ? 'bg-neutral-950 border-cyan-500/30 text-neutral-100 shadow-[0_0_20px_rgba(6,182,212,0.12)]'
                : 'bg-neutral-900 border-neutral-800 text-neutral-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                  isLight
                    ? 'bg-neutral-100 border-neutral-200'
                    : 'bg-neutral-800 border-neutral-700/60'
                }`}
              >
                {getWeatherIcon(selectedWeather.condition)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">Local Weather Forecast</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#244837]/15 text-[#244837] dark:text-[#C5A880] font-bold uppercase tracking-wider">
                    Live Context
                  </span>
                </div>
                <p className="text-sm font-semibold mt-0.5">
                  {selectedWeather.city} • {selectedWeather.temp}°C ({selectedWeather.tempF}°F) —{' '}
                  <span className="text-neutral-400 font-normal">{selectedWeather.conditionLabel}</span>
                </p>
              </div>
            </div>

            {/* City Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
              {onOpenWeatherModal && (
                <button
                  type="button"
                  onClick={onOpenWeatherModal}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#244837]/10 hover:bg-[#244837]/20 text-[#244837] dark:text-[#C5A880] border border-[#244837]/30 transition flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer active:scale-95 shadow-sm"
                  title="Search any city or detect real-time GPS location"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Search City / GPS</span>
                </button>
              )}

              {PRESET_CITIES.map((c) => (
                <button
                  key={c.city}
                  type="button"
                  onClick={() => setSelectedWeather(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                    selectedWeather.city.toLowerCase() === c.city.toLowerCase()
                      ? 'bg-[#244837] text-white font-bold shadow-sm'
                      : isLight
                      ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      : 'bg-neutral-850 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-neutral-800'
                  }`}
                >
                  {getWeatherIcon(c.condition)}
                  <span>{c.city}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 1: DESTINATION */}
          {step === 'destination' && (
            <div
              className={`rounded-3xl border p-6 sm:p-8 space-y-6 shadow-xl transition-all ${
                isLight
                  ? 'bg-white border-neutral-200'
                  : isNeon
                  ? 'bg-neutral-950 border-cyan-500/30'
                  : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              <div className="max-w-xl">
                <span className="text-xs uppercase tracking-widest text-[#B38F5F] dark:text-[#C5A880] font-semibold">
                  Step 1 of 2 • Destination Planning
                </span>
                <h3 className="text-2xl font-serif font-bold tracking-tight mt-1">
                  "Where are you heading today, {config.userName || 'there'}?"
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  NeoSet will synthesize pieces strictly from your wardrobe to match the venue and weather.
                </p>
              </div>

              {filteredWardrobe.length === 0 && (
                <div
                  className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
                    isLight
                      ? 'border-neutral-200 bg-neutral-50 text-neutral-600'
                      : 'border-neutral-800 bg-neutral-850/70 text-neutral-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-[#244837]/10 text-[#244837] dark:text-[#C5A880] flex items-center justify-center shrink-0 border border-[#244837]/20">
                    <Shirt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#244837] dark:text-[#C5A880]">Wardrobe is currently clean with 0 clothes</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      New accounts start clean. Go to the Wardrobe tab to add customized pieces to your closet whenever you wish.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {DESTINATIONS.map((dest) => {
                  const Icon = dest.icon;
                  const isSelected = selectedDestination === dest.id;
                  return (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => setSelectedDestination(dest.id)}
                      className={`p-4 rounded-2xl border text-left transition flex items-start gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'border-[#244837] dark:border-[#C5A880] bg-[#244837]/10 ring-2 ring-[#244837]/20'
                          : isLight
                          ? 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
                          : 'border-neutral-800 bg-neutral-850 hover:border-neutral-700'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#244837] text-white'
                            : isLight
                            ? 'bg-white text-neutral-700 border border-neutral-200'
                            : 'bg-neutral-850 text-neutral-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">{dest.label}</h4>
                        <p className="text-xs text-neutral-400 mt-0.5 leading-snug">{dest.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep('vibe')}
                  className="bg-[#244837] hover:bg-[#1b372a] text-white font-semibold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-[#244837]/20 transition cursor-pointer"
                >
                  <span>Next: Choose Aesthetic Vibe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VIBE */}
          {step === 'vibe' && (
            <div
              className={`rounded-3xl border p-6 sm:p-8 space-y-6 shadow-xl transition-all ${
                isLight
                  ? 'bg-white border-neutral-200'
                  : isNeon
                  ? 'bg-neutral-950 border-cyan-500/30'
                  : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              <div className="max-w-xl">
                <span className="text-xs uppercase tracking-widest text-[#B38F5F] dark:text-[#C5A880] font-semibold">
                  Step 2 of 2 • Aesthetic Mood
                </span>
                <h3 className="text-2xl font-serif font-bold tracking-tight mt-1">
                  "What energy do you want to project?"
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Choose the styling tone for your {selectedDestination} occasion.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {VIBES.map((vibe) => {
                  const isSelected = selectedVibe === vibe.id;
                  return (
                    <button
                      key={vibe.id}
                      type="button"
                      onClick={() => setSelectedVibe(vibe.id)}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-[#244837] dark:border-[#C5A880] bg-[#244837]/10 ring-2 ring-[#244837]/20'
                          : isLight
                          ? 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
                          : 'border-neutral-800 bg-neutral-850 hover:border-neutral-700'
                      }`}
                    >
                      <h4 className="text-sm font-bold">{vibe.label}</h4>
                      <p className="text-xs text-neutral-400 mt-1">{vibe.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('destination')}
                  className="text-xs text-neutral-400 hover:text-neutral-200 cursor-pointer"
                >
                  Back to destination
                </button>

                <button
                  type="button"
                  onClick={() => handleGenerateRecommendation()}
                  className="bg-[#244837] hover:bg-[#1b372a] text-white font-semibold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-[#244837]/20 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#C5A880]" />
                  <span>Synthesize Outfit on Avatar</span>
                </button>
              </div>
            </div>
          )}

          {/* LOADING STATE */}
          {step === 'loading' && (
            <div
              className={`rounded-3xl border p-12 text-center space-y-4 shadow-xl flex flex-col items-center justify-center min-h-[360px] transition-all ${
                isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              <div className="w-16 h-16 rounded-3xl bg-[#244837] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] shadow-xl shadow-[#244837]/30 animate-pulse">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>

              <h3 className="text-lg font-bold font-serif">Curating Your Bespoke Outfit</h3>
              <p className="text-xs text-neutral-400 max-w-md h-8 transition-all duration-300">
                {loadingMessages[loadingMessageIndex]}
              </p>
            </div>
          )}

          {/* RESULT VIEW */}
          {step === 'result' && recommendation && (
            <div
              className={`rounded-3xl border p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden transition-all ${
                isLight
                  ? 'bg-white border-neutral-200'
                  : isNeon
                  ? 'bg-neutral-950 border-cyan-500/30'
                  : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              {appliedToast && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-emerald-900/90 border border-emerald-500 text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xl z-20">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Equipped outfit to your Avatar!</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Avatar Showcase */}
                <div
                  className={`lg:col-span-5 rounded-2xl border p-4 flex flex-col items-center relative ${
                    isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-850 border-neutral-800'
                  }`}
                >
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#244837]/20 border border-[#244837]/30 text-[#244837] dark:text-[#C5A880] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#C5A880]" />
                    <span>{recommendation.matchScore}% Match</span>
                  </div>

                  <div className="w-full max-w-[210px] aspect-[9/16] relative flex items-center justify-center my-2">
                    <AvatarRenderer
                      config={config}
                      outfit={recommendation.outfit}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Color Swatches */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400 font-medium">Palette:</span>
                    <div className="flex items-center gap-1">
                      {recommendation.colorPalette.map((col, idx) => (
                        <span
                          key={idx}
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm"
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#B38F5F] dark:text-[#C5A880] font-bold">
                      {recommendation.occasion} • {recommendation.mood}
                    </span>
                    <h3 className="text-2xl font-serif font-bold tracking-tight mt-1">
                      {recommendation.title}
                    </h3>
                  </div>

                  {/* Stylist Advice */}
                  <div
                    className={`p-4 rounded-2xl border space-y-2 ${
                      isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-850 border-neutral-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Compass className="w-4 h-4 text-[#B38F5F] dark:text-[#C5A880] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold">Why this look works:</h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-300 mt-1 leading-relaxed">
                          {recommendation.stylistAdvice}
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2 text-[11px] text-neutral-400">
                      {getWeatherIcon(selectedWeather.condition)}
                      <span>{recommendation.weatherReason}</span>
                    </div>
                  </div>

                  {/* Selected Pieces List */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'Top', item: recommendation.outfit.topwear },
                      { label: 'Bottom', item: recommendation.outfit.bottomwear },
                      { label: 'Shoes', item: recommendation.outfit.footwear },
                      { label: 'Acc.', item: recommendation.outfit.accessory },
                    ].map(({ label, item }) =>
                      item ? (
                        <div
                          key={item.id}
                          className={`p-2 rounded-xl border flex items-center gap-2 ${
                            isLight
                              ? 'bg-neutral-50 border-neutral-200'
                              : 'bg-neutral-850 border-neutral-800'
                          }`}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-7 h-7 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-bold text-neutral-400 block truncate">
                              {label}
                            </span>
                            <span className="text-[11px] font-semibold block truncate">
                              {item.name}
                            </span>
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={handleApplyToActive}
                      className="flex-1 min-w-[150px] bg-[#244837] hover:bg-[#1b372a] text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-[#244837]/20 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Wear This Today</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSaveOutfit(recommendation);
                        setIsSaved(true);
                        setSavedToast(true);
                        setTimeout(() => setSavedToast(false), 2500);
                      }}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                        isSaved
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                          : isLight
                          ? 'border-neutral-300 hover:bg-neutral-100 text-neutral-800'
                          : 'border-neutral-700 hover:bg-neutral-800 text-neutral-200'
                      }`}
                    >
                      {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                      <span>{isSaved ? 'Saved to Looks' : 'Save Look'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAltSeed((prev) => prev + 1);
                        handleGenerateRecommendation(selectedDestination, selectedVibe, 1);
                      }}
                      className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                        isLight
                          ? 'border-neutral-300 hover:bg-neutral-100 text-neutral-700'
                          : 'border-neutral-800 hover:bg-neutral-800 text-neutral-300'
                      }`}
                      title="Generate a fresh alternative pairing"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#B38F5F] dark:text-[#C5A880]" />
                      <span>Alternative</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('destination')}
                      className="px-3 py-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs underline cursor-pointer"
                    >
                      Change Occasion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* Floating Action Confirmation Toast */}
      {(appliedToast || savedToast) && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900/95 border border-emerald-500/40 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md animate-bounce">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold">
            ✓
          </div>
          <span>{appliedToast ? 'Outfit applied directly to your 2D avatar!' : 'Look saved to your curated looks collection!'}</span>
        </div>
      )}
    </div>
  );
};
