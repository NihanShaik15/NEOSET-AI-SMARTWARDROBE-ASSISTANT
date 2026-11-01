import React, { useState } from 'react';
import { AvatarConfig, WardrobeItem, StylistRecommendation, WeatherData } from '../types';
import { AvatarRenderer } from './AvatarRenderer';
import {
  Sparkles,
  CloudRain,
  Sun,
  Cloud,
  Snowflake,
  Wind,
  Moon,
  ArrowRight,
  Shirt,
  Layers,
  Lock,
  RotateCcw,
  Plus,
  Heart,
  MapPin,
  Calendar,
  Compass,
  CheckCircle2,
  Mail,
  Send,
  Phone,
  Clock,
  ShieldCheck,
  Feather,
  Gem,
} from 'lucide-react';

interface HomeViewProps {
  config: AvatarConfig;
  currentOutfit: {
    topwear: WardrobeItem | null;
    bottomwear: WardrobeItem | null;
    footwear: WardrobeItem | null;
    accessory: WardrobeItem | null;
  };
  totalWardrobeCount: number;
  savedOutfits: StylistRecommendation[];
  activeWeather?: WeatherData;
  onOpenWeatherModal?: () => void;
  onOpenStylist: () => void;
  onOpenFittingRoom: (category?: any) => void;
  onOpenWardrobe: () => void;
  onOpenCalendar: () => void;
  onOpenAvatarStudio: () => void;
  onApplySavedLook: (look: StylistRecommendation) => void;
  onClearOutfit?: () => void;
  theme?: 'light' | 'dark' | 'neon';
}

export const HomeView: React.FC<HomeViewProps> = ({
  config,
  currentOutfit,
  totalWardrobeCount,
  savedOutfits,
  activeWeather,
  onOpenWeatherModal,
  onOpenStylist,
  onOpenFittingRoom,
  onOpenWardrobe,
  onOpenCalendar,
  onOpenAvatarStudio,
  onApplySavedLook,
  onClearOutfit,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const isBoy = config.gender === 'boy';

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('bespoke');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const hasAnyDress = Boolean(
    currentOutfit.topwear ||
    currentOutfit.bottomwear ||
    currentOutfit.footwear ||
    currentOutfit.accessory
  );

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const activePieces = [
    { label: 'Top', category: 'topwear', item: currentOutfit.topwear },
    { label: 'Bottom', category: 'bottomwear', item: currentOutfit.bottomwear },
    { label: 'Footwear', category: 'footwear', item: currentOutfit.footwear },
    { label: 'Accessory', category: 'accessories', item: currentOutfit.accessory },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() || !contactMessage.trim()) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 4000);
  };

  const renderWeatherIcon = (condition: string = 'sunny', isDay: boolean = true) => {
    if (!isDay && condition === 'sunny') return <Moon className="w-3.5 h-3.5 text-indigo-300" />;
    switch (condition) {
      case 'sunny':
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'rainy':
        return <CloudRain className="w-3.5 h-3.5 text-sky-400" />;
      case 'snowy':
        return <Snowflake className="w-3.5 h-3.5 text-blue-200" />;
      case 'chilly':
        return <Wind className="w-3.5 h-3.5 text-emerald-400" />;
      case 'cloudy':
      default:
        return <Cloud className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-12">
      {/* 1. EDITORIAL HERO MASTHEAD */}
      <section className="text-center space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-widest transition-all shadow-xs bg-[#FAF8F5] border-[#E5E0D8] text-[#244837] dark:bg-[#161F1A] dark:border-[#2A3B31] dark:text-[#C5A880]">
          <Gem className="w-3 h-3 text-[#B38F5F]" />
          <span>Sartorial Twin Atelier • Quiet Luxury</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-[#1A2421] dark:text-[#ECE8E1] leading-tight max-w-3xl mx-auto">
          The Art of Intentional Dressing.
        </h1>

        <p className="text-sm sm:text-base text-[#55625B] dark:text-[#9FB1A7] max-w-2xl mx-auto font-normal leading-relaxed">
          NeoSet harmonizes the discipline of Savile Row tailoring with real-time meteorological intelligence and bespoke capsule curation for your digital twin.
        </p>

        {/* Quick Navigation Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => onOpenFittingRoom()}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#244837] hover:bg-[#1C382B] text-white shadow-md shadow-[#244837]/20 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Fitting Room</span>
          </button>
          <button
            type="button"
            onClick={onOpenCalendar}
            className="px-4 py-2 rounded-xl text-xs font-semibold border transition active:scale-95 flex items-center gap-1.5 cursor-pointer bg-white dark:bg-[#1A231E] border-[#DCD6CC] dark:border-[#2E3C34] text-[#1A2421] dark:text-[#ECE8E1] hover:border-[#B38F5F]"
          >
            <Calendar className="w-3.5 h-3.5 text-[#B38F5F]" />
            <span>Lookbook Calendar</span>
          </button>
          <button
            type="button"
            onClick={onOpenStylist}
            className="px-4 py-2 rounded-xl text-xs font-semibold border transition active:scale-95 flex items-center gap-1.5 cursor-pointer bg-white dark:bg-[#1A231E] border-[#DCD6CC] dark:border-[#2E3C34] text-[#1A2421] dark:text-[#ECE8E1] hover:border-[#B38F5F]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B38F5F]" />
            <span>AI Stylist</span>
          </button>
          <button
            type="button"
            onClick={onOpenWardrobe}
            className="px-4 py-2 rounded-xl text-xs font-semibold border transition active:scale-95 flex items-center gap-1.5 cursor-pointer bg-white dark:bg-[#1A231E] border-[#DCD6CC] dark:border-[#2E3C34] text-[#1A2421] dark:text-[#ECE8E1] hover:border-[#B38F5F]"
          >
            <Shirt className="w-3.5 h-3.5 text-[#B38F5F]" />
            <span>Closet ({totalWardrobeCount})</span>
          </button>
        </div>
      </section>

      {/* 2. THE DIGITAL ATELIER (2D AVATAR STAGE + TODAY'S STATUS) */}
      <section
        className={`rounded-3xl border p-6 sm:p-8 transition-all relative overflow-hidden shadow-xl ${
          isLight
            ? 'bg-white border-[#E5E0D8] text-[#1A2421]'
            : 'bg-[#141A17] border-[#222E28] text-[#ECE8E1]'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Avatar Canvas */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div
              onClick={() => onOpenFittingRoom()}
              className={`w-full max-w-[240px] aspect-[9/16] relative flex items-center justify-center cursor-pointer transition hover:scale-[1.01] rounded-3xl border p-3 ${
                isLight ? 'bg-[#FAF8F5] border-[#EAE6DF]' : 'bg-[#101513] border-[#1C2420]'
              }`}
              title="Click to enter fitting room"
            >
              <AvatarRenderer
                config={config}
                outfit={currentOutfit}
                showDetailsBadge={true}
                className="w-full h-full"
              />
            </div>

            <div className="mt-4 flex items-center gap-2 w-full max-w-[240px]">
              <button
                type="button"
                onClick={() => onOpenFittingRoom()}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#244837] hover:bg-[#1C382B] text-white flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow"
              >
                <Layers className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>{hasAnyDress ? 'Change Outfit' : 'Dress Avatar'}</span>
              </button>

              {hasAnyDress && onClearOutfit && (
                <button
                  type="button"
                  onClick={onClearOutfit}
                  className="py-2 px-3 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition active:scale-95 text-neutral-500 hover:text-[#244837] cursor-pointer"
                  title="Undress avatar to clean canvas"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Daily Sartorial Status & Live Meteorology */}
          <div className="md:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#B38F5F]">
                  {currentDate}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isBoy
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  <Lock className="w-2.5 h-2.5" />
                  <span>{isBoy ? 'Gentleman Profile' : 'Lady Profile'}</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
                {hasAnyDress
                  ? currentOutfit.topwear && currentOutfit.bottomwear
                    ? `${currentOutfit.topwear.name} & ${currentOutfit.bottomwear.name}`
                    : 'Custom Curated Look'
                  : 'Undressed Atelier Canvas'}
              </h2>

              <p className="text-xs text-[#55625B] dark:text-[#9FB1A7] leading-relaxed">
                {hasAnyDress
                  ? `Calibrated for ${config.userName || 'your twin'}, matching your ${config.height} stature and ${config.skinToneName} undertones.`
                  : `Your avatar stage is clean with no garments equipped. Select individual pieces below or consult the AI stylist.`}
              </p>
            </div>

            {/* Weather Sensor Card */}
            {activeWeather && (
              <div
                onClick={onOpenWeatherModal}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition hover:border-[#B38F5F] ${
                  isLight
                    ? 'bg-[#FAF8F5] border-[#EAE6DF] text-[#1A2421]'
                    : 'bg-[#101513] border-[#1C2420] text-[#ECE8E1]'
                }`}
                title="Tap to change city or refresh meteorological data"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#244837]/10 flex items-center justify-center text-[#244837] dark:text-[#C5A880]">
                    {renderWeatherIcon(activeWeather.condition, activeWeather.isDay)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">{activeWeather.city}</span>
                      <span className="text-[10px] text-neutral-400">• {activeWeather.conditionLabel}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 block">
                      {activeWeather.clothingAdvice || 'Optimal temperature for layered tailoring.'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-serif font-bold text-[#B38F5F]">
                    {activeWeather.temp}°C
                  </span>
                </div>
              </div>
            )}

            {/* Currently Equipped Garment Slots */}
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-2.5">
                Current Garment Ensemble
              </span>
              <div className="grid grid-cols-2 gap-2">
                {activePieces.map((slot) => (
                  <button
                    key={slot.label}
                    type="button"
                    onClick={() => onOpenFittingRoom(slot.category)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition active:scale-95 text-left group cursor-pointer ${
                      isLight
                        ? 'bg-[#FAF8F5] border-[#EAE6DF] hover:border-[#B38F5F]'
                        : 'bg-[#101513] border-[#1C2420] hover:border-[#C5A880]/50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg overflow-hidden border flex items-center justify-center shrink-0 ${
                        slot.item?.imageUrl
                          ? 'border-black/20 bg-neutral-900'
                          : 'border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400'
                      }`}
                    >
                      {slot.item?.imageUrl ? (
                        <img src={slot.item.imageUrl} alt={slot.item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase font-bold text-neutral-400 block">
                        {slot.label}
                      </span>
                      <span className="text-xs font-semibold truncate block">
                        {slot.item?.name || 'Empty slot'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT NEOSET (THE SARTORIAL PHILOSOPHY & PILLARS) */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[11px] uppercase tracking-widest text-[#B38F5F] font-bold">
            The NeoSet Philosophy
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-[#1A2421] dark:text-[#ECE8E1]">
            About NeoSet
          </h2>
          <p className="text-xs sm:text-sm text-[#55625B] dark:text-[#9FB1A7] mt-1.5 leading-relaxed">
            Born out of admiration for timeless European craftsmanship, NeoSet replaces impulsive fast fashion with thoughtful digital atelier curation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1 */}
          <div
            className={`p-6 rounded-3xl border transition-all ${
              isLight
                ? 'bg-white border-[#E5E0D8] text-[#1A2421]'
                : 'bg-[#141A17] border-[#222E28] text-[#ECE8E1]'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-[#244837]/10 text-[#244837] dark:text-[#C5A880] flex items-center justify-center mb-4 border border-[#244837]/20">
              <Feather className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg">Anatomical Twin Calibration</h3>
            <p className="text-xs text-[#55625B] dark:text-[#9FB1A7] mt-2 leading-relaxed">
              Every digital twin reflects personalized stature, shoulder span, torso drape, and undertones. Clothing isn&apos;t just displayed—it falls with natural sartorial balance.
            </p>
          </div>

          {/* Pillar 2 */}
          <div
            className={`p-6 rounded-3xl border transition-all ${
              isLight
                ? 'bg-white border-[#E5E0D8] text-[#1A2421]'
                : 'bg-[#141A17] border-[#222E28] text-[#ECE8E1]'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-[#244837]/10 text-[#244837] dark:text-[#C5A880] flex items-center justify-center mb-4 border border-[#244837]/20">
              <CloudRain className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg">Atmospheric Intelligence</h3>
            <p className="text-xs text-[#55625B] dark:text-[#9FB1A7] mt-2 leading-relaxed">
              Connected directly to global Open-Meteo meteorological stations. Our AI stylist cross-references ambient temperature, barometric shift, and rain to curate functional elegance.
            </p>
          </div>

          {/* Pillar 3 */}
          <div
            className={`p-6 rounded-3xl border transition-all ${
              isLight
                ? 'bg-white border-[#E5E0D8] text-[#1A2421]'
                : 'bg-[#141A17] border-[#222E28] text-[#ECE8E1]'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-[#244837]/10 text-[#244837] dark:text-[#C5A880] flex items-center justify-center mb-4 border border-[#244837]/20">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg">Sartorial Archive & Lookbook</h3>
            <p className="text-xs text-[#55625B] dark:text-[#9FB1A7] mt-2 leading-relaxed">
              Your personal fashion ledger. Record daily ensembles, inspect rotation frequencies over the month, and resurrect favorite outfits with a single tap.
            </p>
          </div>
        </div>
      </section>

      {/* 4. DETAILS ABOUT NEOSET ATELIER INNOVATIONS */}
      <section
        className={`rounded-3xl border p-6 sm:p-8 transition-all ${
          isLight
            ? 'bg-[#FAF8F5] border-[#E5E0D8] text-[#1A2421]'
            : 'bg-[#101513] border-[#1C2420] text-[#ECE8E1]'
        }`}
      >
        <div className="max-w-xl mb-6">
          <span className="text-[11px] uppercase tracking-widest text-[#B38F5F] font-bold">
            Innovation Specifications
          </span>
          <h2 className="text-2xl font-serif font-bold tracking-tight mt-1">
            Details About NeoSet Capabilities
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#222E28]">
            <CheckCircle2 className="w-4 h-4 text-[#244837] dark:text-[#C5A880] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide">Dynamic 2D Vector Rendering</h4>
              <p className="text-xs text-[#55625B] dark:text-[#9FB1A7] mt-1">
                Zero lag client-side procedural avatar assembly with customizable skin tones, facial features, and proportional scales.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#222E28]">
            <CheckCircle2 className="w-4 h-4 text-[#244837] dark:text-[#C5A880] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide">Multi-Occasion Suitability</h4>
              <p className="text-xs text-[#55625B] dark:text-[#9FB1A7] mt-1">
                Categorization across business formal, casual leisure, evening black tie, and club sports.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#222E28]">
            <CheckCircle2 className="w-4 h-4 text-[#244837] dark:text-[#C5A880] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide">Clean Slate Profile Isolation</h4>
              <p className="text-xs text-[#55625B] dark:text-[#9FB1A7] mt-1">
                New accounts start with completely clean closets and zero pre-populated clutter, putting you in absolute control of your capsule.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#222E28]">
            <CheckCircle2 className="w-4 h-4 text-[#244837] dark:text-[#C5A880] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide">Old Money Color Refinement</h4>
              <p className="text-xs text-[#55625B] dark:text-[#9FB1A7] mt-1">
                Cashmere oatmeal, heritage British racing green, rich cognac leather, and bespoke navy replace loud synthetic gradients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CONTACT US & PRIVATE CONCIERGE DESK */}
      <section
        className={`rounded-3xl border p-6 sm:p-8 transition-all ${
          isLight
            ? 'bg-white border-[#E5E0D8] text-[#1A2421]'
            : 'bg-[#141A17] border-[#222E28] text-[#ECE8E1]'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left info */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#B38F5F] font-bold">
                Private Inquiries
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1">
                Contact Us
              </h2>
              <p className="text-xs sm:text-sm text-[#55625B] dark:text-[#9FB1A7] mt-1.5 leading-relaxed">
                Connect with the NeoSet Sartorial Concierge. Whether seeking bespoke styling consultation or technical archival assistance, our atelier desk is at your disposal.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-xl bg-[#244837]/10 text-[#244837] dark:text-[#C5A880] flex items-center justify-center shrink-0 border border-[#244837]/20">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold block">Styling Concierge Desk</span>
                  <span className="text-neutral-400 font-mono text-[11px]">concierge@neoset-atelier.com</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-xl bg-[#244837]/10 text-[#244837] dark:text-[#C5A880] flex items-center justify-center shrink-0 border border-[#244837]/20">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold block">Flagship Ateliers</span>
                  <span className="text-neutral-400 text-[11px]">Milan • Paris • London (Savile Row) • New York</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-xl bg-[#244837]/10 text-[#244837] dark:text-[#C5A880] flex items-center justify-center shrink-0 border border-[#244837]/20">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold block">Client Advisory Hours</span>
                  <span className="text-neutral-400 text-[11px]">Monday to Saturday, 09:00 – 19:00 CET</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleContactSubmit}
              className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
                isLight ? 'bg-[#FAF8F5] border-[#EAE6DF]' : 'bg-[#101513] border-[#1C2420]'
              }`}
            >
              <h3 className="font-serif font-bold text-lg">Send an Inquiry to the Atelier</h3>

              {contactSubmitted ? (
                <div className="p-5 rounded-xl bg-[#244837]/15 border border-[#244837]/30 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#244837] dark:text-[#C5A880] mx-auto" />
                  <p className="font-serif font-bold text-sm">Inquiry Received with Distinction</p>
                  <p className="text-xs text-neutral-400">
                    Thank you, {contactName || 'esteemed guest'}. Our styling desk will review your notes and reply promptly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g., Lord Alistair"
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#244837] ${
                          isLight
                            ? 'bg-white border-[#DCD6CC] text-[#1A2421]'
                            : 'bg-[#141A17] border-[#222E28] text-[#ECE8E1]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#244837] ${
                          isLight
                            ? 'bg-white border-[#DCD6CC] text-[#1A2421]'
                            : 'bg-[#141A17] border-[#222E28] text-[#ECE8E1]'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Subject
                    </label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
                        isLight
                          ? 'bg-white border-[#DCD6CC] text-[#1A2421]'
                          : 'bg-[#141A17] border-[#222E28] text-[#ECE8E1]'
                      }`}
                    >
                      <option value="bespoke">Bespoke Styling & Consultation</option>
                      <option value="wardrobe">Capsule Wardrobe Archival Assistance</option>
                      <option value="press">Editorial & Press Inquiries</option>
                      <option value="technical">Technical Twin Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Message
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Detail your styling preferences, event requirements, or question..."
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
                        isLight
                          ? 'bg-white border-[#DCD6CC] text-[#1A2421]'
                          : 'bg-[#141A17] border-[#222E28] text-[#ECE8E1]'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#244837] hover:bg-[#1C382B] text-white shadow-md shadow-[#244837]/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Send Inquiry to Atelier Desk</span>
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
