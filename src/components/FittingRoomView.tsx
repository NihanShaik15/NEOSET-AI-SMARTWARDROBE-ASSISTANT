import React, { useState } from 'react';
import { AvatarConfig, WardrobeItem, CategoryType } from '../types';
import { AvatarRenderer, isDressItem, GarmentFitOverrides } from './AvatarRenderer';
import { SwipeClothesRack } from './SwipeClothesRack';
import { CustomGarmentFitModal } from './CustomGarmentFitModal';
import {
  Sparkles,
  Shuffle,
  Trash2,
  Bookmark,
  Check,
  Layers,
  X,
  Hand,
  SlidersHorizontal,
  Sliders,
  Scissors,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface FittingRoomViewProps {
  config: AvatarConfig;
  wardrobe: WardrobeItem[];
  currentOutfit: {
    topwear: WardrobeItem | null;
    bottomwear: WardrobeItem | null;
    footwear: WardrobeItem | null;
    accessory: WardrobeItem | null;
  };
  onSelectSlotItem: (category: CategoryType, item: WardrobeItem | null) => void;
  onRandomizeOutfit: () => void;
  onClearOutfit: () => void;
  onSaveOutfitLook: () => void;
  onOpenStylistForLook?: () => void;
  theme?: 'light' | 'dark' | 'neon';
  initialCategory?: CategoryType;
}

export const FittingRoomView: React.FC<FittingRoomViewProps> = ({
  config,
  wardrobe,
  currentOutfit,
  onSelectSlotItem,
  onRandomizeOutfit,
  onClearOutfit,
  onSaveOutfitLook,
  onOpenStylistForLook,
  theme = 'dark',
  initialCategory,
}) => {
  const [activeCategoryTab, setActiveCategoryTab] = useState<CategoryType>(initialCategory || 'topwear');
  const [saveToast, setSaveToast] = useState(false);
  const [viewMode, setViewMode] = useState<'rack' | 'grid'>('rack');
  const [showCustomFitModal, setShowCustomFitModal] = useState(false);
  const [dressOnlyFilter, setDressOnlyFilter] = useState(false);
  const [showFitTuning, setShowFitTuning] = useState(false);
  const [fitOverrides, setFitOverrides] = useState<GarmentFitOverrides>({
    dressScale: 1.0,
    dressOffsetY: 0,
    dressOffsetX: 0,
    dressClipMode: 'natural',
    topScale: 1.0,
    topOffsetY: 0,
    topOffsetX: 0,
  });

  React.useEffect(() => {
    if (initialCategory) {
      setActiveCategoryTab(initialCategory);
    }
  }, [initialCategory]);

  // Filter items matching user gender preference (or unisex)
  const isBoy = config.gender === 'boy';
  const filteredWardrobe = wardrobe.filter((item) => {
    if (!item.genderTarget || item.genderTarget === 'unisex') return true;
    return isBoy ? item.genderTarget === 'boy' : item.genderTarget === 'girl';
  });

  const availableForActiveCategory = filteredWardrobe.filter((i) => {
    if (i.category !== activeCategoryTab) return false;
    if (activeCategoryTab === 'topwear' && dressOnlyFilter) {
      return isDressItem(i);
    }
    return true;
  });

  const getOutfitItem = (cat: CategoryType) => {
    if (cat === 'accessories') return currentOutfit.accessory;
    return currentOutfit[cat];
  };

  const isSelected = (item: WardrobeItem) => {
    return getOutfitItem(item.category)?.id === item.id;
  };

  const handleToggleItem = (item: WardrobeItem) => {
    if (isSelected(item)) {
      onSelectSlotItem(item.category, null);
    } else {
      onSelectSlotItem(item.category, item);
    }
  };

  const handleSave = () => {
    onSaveOutfitLook();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2200);
  };

  // Direct swipe cycling when user gestures across the avatar directly
  const handleSwipeAvatar = (slot: 'topwear' | 'bottomwear' | 'footwear', direction: 'prev' | 'next') => {
    const slotItems = filteredWardrobe.filter((i) => i.category === slot);
    if (slotItems.length === 0) return;

    const currentItem = currentOutfit[slot];
    const currentIndex = currentItem ? slotItems.findIndex((i) => i.id === currentItem.id) : -1;

    let nextIndex: number;
    if (direction === 'next') {
      nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % slotItems.length;
    } else {
      nextIndex = currentIndex <= 0 ? slotItems.length - 1 : currentIndex - 1;
    }

    onSelectSlotItem(slot, slotItems[nextIndex]);
    setActiveCategoryTab(slot);
  };

  const isLight = theme === 'light';
  const isNeon = theme === 'neon';

  const isWearingDress = isDressItem(currentOutfit.topwear);
  const hasGarmentImage = !!(currentOutfit.topwear?.imageUrl || currentOutfit.bottomwear?.imageUrl);
  const isFullOutfit = (currentOutfit.topwear || isWearingDress) && (currentOutfit.bottomwear || isWearingDress) && currentOutfit.footwear;

  return (
    <div className="space-y-5">
      {/* Fitting Room Control Header */}
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl border transition-all ${
          isLight
            ? 'bg-white border-neutral-200 shadow-sm'
            : isNeon
            ? 'bg-neutral-950 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
            : 'bg-neutral-900/80 border-neutral-800'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#B38F5F] font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Interactive Fitting Studio</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-[#244837]/10 text-[#244837] dark:text-[#C5A880] border border-[#244837]/20">
              {isBoy ? 'Boy Fitted' : 'Girl Fitted'}
            </span>
            {isWearingDress && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Dress Silhouette</span>
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-serif tracking-tight mt-0.5">
            Slide & Swap Dressing Stage
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {/* Try On Dress / PNG Button */}
          <button
            type="button"
            onClick={() => setShowCustomFitModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#B38F5F] hover:bg-[#9A7649] active:scale-95 text-white text-xs font-semibold shadow-md transition min-h-[40px] cursor-pointer"
            title="Try on any dress or garment image (PNG)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Try On Dress / PNG</span>
          </button>

          <button
            type="button"
            onClick={onRandomizeOutfit}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-medium transition active:scale-95 min-h-[40px] ${
              isLight
                ? 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                : 'border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200'
            }`}
            title="Randomize outfit combination"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#B38F5F]" />
            <span>Shuffle</span>
          </button>
          <button
            type="button"
            onClick={onClearOutfit}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-medium transition active:scale-95 min-h-[40px] ${
              isLight
                ? 'border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                : 'border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
            title="Clear all clothes"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Undress</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#244837] hover:bg-[#1C382B] active:scale-95 text-white text-xs font-semibold shadow-lg shadow-[#244837]/20 transition min-h-[40px] cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save Look</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Avatar Canvas (Left) + Interactive Swipe Rack & Closet (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Left Column: Avatar Showcase */}
        <div
          className={`lg:col-span-5 lg:sticky lg:top-20 self-start rounded-3xl border p-4 sm:p-6 flex flex-col items-center relative overflow-hidden shadow-2xl transition-all ${
            isLight
              ? 'bg-neutral-50 border-neutral-200'
              : isNeon
              ? 'bg-neutral-950 border-cyan-500/30'
              : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          {/* Toast feedback */}
          {saveToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-emerald-900/90 border border-emerald-500 text-emerald-200 text-xs font-medium flex items-center gap-2 shadow-xl z-20 whitespace-nowrap animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Outfit saved to your curated looks!</span>
            </div>
          )}

          {/* Swipe on Avatar Hint Banner */}
          <div className="w-full text-center mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#244837] dark:text-[#C5A880] uppercase tracking-wider bg-[#244837]/10 px-2.5 py-1 rounded-full border border-[#244837]/20">
              <Hand className="w-3 h-3 animate-pulse" />
              <span>Swipe horizontally on avatar to change clothes</span>
            </span>
          </div>

          {/* Avatar Canvas with Touch Gestures */}
          <div className="w-full max-w-[210px] sm:max-w-[240px] aspect-[9/16] relative flex items-center justify-center my-2 cursor-ew-resize">
            <AvatarRenderer
              config={config}
              outfit={currentOutfit}
              className="w-full h-full"
              interactive={true}
              highlightCategory={activeCategoryTab}
              onSelectSlot={(cat) => setActiveCategoryTab(cat)}
              onSwipeSlot={handleSwipeAvatar}
              renderGarmentImages={true}
              garmentFitOverrides={fitOverrides}
            />
          </div>

          {/* Slot Badges Below Avatar */}
          <div className="w-full max-w-sm mt-3 grid grid-cols-4 gap-1.5 border-t border-neutral-200 dark:border-neutral-800 pt-3">
            {(['topwear', 'bottomwear', 'footwear', 'accessories'] as CategoryType[]).map((cat) => {
              const item = getOutfitItem(cat);
              const isActive = activeCategoryTab === cat;
              const isDressSlot = cat === 'topwear' && isWearingDress;
              const isSuppressedBottom = cat === 'bottomwear' && isWearingDress;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryTab(cat)}
                  className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center justify-center min-h-[58px] cursor-pointer ${
                    isActive
                      ? 'border-[#244837] dark:border-[#C5A880] bg-[#244837]/10 dark:bg-[#C5A880]/10 shadow-sm'
                      : isLight
                      ? 'border-neutral-200 bg-white hover:bg-neutral-100'
                      : 'border-neutral-800 bg-neutral-850 hover:bg-neutral-800'
                  }`}
                >
                  <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">
                    {isDressSlot ? 'Dress' : cat === 'accessories' ? 'Acc.' : cat.replace('wear', '')}
                  </span>
                  {item ? (
                    <div className="mt-1 flex flex-col items-center w-full">
                      <div className="w-6 h-6 rounded-lg overflow-hidden border border-black/15 relative">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] font-medium truncate w-full mt-0.5">
                        {item.name.split(' ')[0]}
                      </span>
                    </div>
                  ) : isSuppressedBottom ? (
                    <span className="text-[9px] text-[#B38F5F] mt-1 font-medium truncate">
                      (Dress draped)
                    </span>
                  ) : (
                    <span className="text-[9px] text-neutral-400 mt-1 font-light truncate">
                      {cat === 'topwear'
                        ? isBoy
                          ? 'Tank Top'
                          : 'Cami'
                        : cat === 'bottomwear'
                        ? isBoy
                          ? 'Boxers'
                          : 'Boyshort'
                        : 'None'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Direct Fine-Tune Calibrator for Fitted Dress / Image */}
          {(isWearingDress || hasGarmentImage) && (
            <div className="w-full max-w-sm mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowFitTuning(!showFitTuning)}
                className="w-full py-1.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 flex items-center justify-between text-xs font-medium transition cursor-pointer"
              >
                <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#B38F5F]" />
                  <span>Garment Live Fit Calibration</span>
                </span>
                <span className="text-[10px] text-[#B38F5F] font-bold">
                  {showFitTuning ? 'Hide ▲' : 'Tune Fit ▼'}
                </span>
              </button>

              {showFitTuning && (
                <div className="mt-2.5 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700/60 space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                      Live Precision Drape
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFitOverrides({
                          dressScale: 1.0,
                          dressOffsetY: 0,
                          dressOffsetX: 0,
                          dressClipMode: 'natural',
                          topScale: 1.0,
                          topOffsetY: 0,
                          topOffsetX: 0,
                        })
                      }
                      className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* Scale Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-500 mb-0.5">
                      <span>Scale / Fit Zoom</span>
                      <span className="font-mono">
                        {Math.round(((isWearingDress ? fitOverrides.dressScale : fitOverrides.topScale) || 1.0) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.75"
                      max="1.35"
                      step="0.02"
                      value={(isWearingDress ? fitOverrides.dressScale : fitOverrides.topScale) || 1.0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setFitOverrides((prev) => ({
                          ...prev,
                          dressScale: val,
                          topScale: val,
                        }));
                      }}
                      className="w-full accent-[#244837] dark:accent-[#C5A880] cursor-pointer"
                    />
                  </div>

                  {/* Vertical Position (Y) */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-500 mb-0.5">
                      <span>Vertical Offset (Y)</span>
                      <span className="font-mono">
                        {(isWearingDress ? fitOverrides.dressOffsetY : fitOverrides.topOffsetY) || 0}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="1"
                      value={(isWearingDress ? fitOverrides.dressOffsetY : fitOverrides.topOffsetY) || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setFitOverrides((prev) => ({
                          ...prev,
                          dressOffsetY: val,
                          topOffsetY: val,
                        }));
                      }}
                      className="w-full accent-[#244837] dark:accent-[#C5A880] cursor-pointer"
                    />
                  </div>

                  {/* Silhouette Mask Toggle (for dress) */}
                  {isWearingDress && (
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400">
                        Silhouette Mask
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFitOverrides((prev) => ({
                            ...prev,
                            dressClipMode: prev.dressClipMode === 'silhouette' ? 'natural' : 'silhouette',
                          }))
                        }
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition cursor-pointer ${
                          fitOverrides.dressClipMode === 'silhouette'
                            ? 'bg-[#244837] text-white dark:bg-[#C5A880] dark:text-neutral-900'
                            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        {fitOverrides.dressClipMode === 'silhouette' ? 'Masked ON' : 'Natural Drape (PNG)'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Style Harmony Score */}
          <div
            className={`mt-3 w-full max-w-sm px-3.5 py-2 rounded-2xl border flex items-center justify-between gap-2 ${
              isLight ? 'bg-white border-neutral-200' : 'bg-neutral-850 border-neutral-800'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-[#B38F5F] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">
                  {isWearingDress
                    ? 'Haute Couture Dress Fitted'
                    : isFullOutfit
                    ? 'Complete Ensemble'
                    : 'Curating Look...'}
                </p>
                <p className="text-[10px] text-neutral-400 truncate">
                  {isWearingDress
                    ? 'One-piece full silhouette drape'
                    : isFullOutfit
                    ? 'Color Harmony: 98%'
                    : 'Slide pieces to assemble outfit'}
                </p>
              </div>
            </div>

            {onOpenStylistForLook && (
              <button
                type="button"
                onClick={onOpenStylistForLook}
                className="text-[10px] text-[#244837] dark:text-[#C5A880] hover:text-[#1C382B] font-semibold px-2.5 py-1 rounded-lg bg-[#244837]/10 border border-[#244837]/30 transition active:scale-95 shrink-0 cursor-pointer"
              >
                Ask Stylist
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Swipe Rack & Wardrobe Browser */}
        <div className="lg:col-span-7 space-y-4">
          {/* FEATURE: Gesture-Based Swipe & Slide Clothes Rack */}
          <SwipeClothesRack
            category={activeCategoryTab}
            items={availableForActiveCategory}
            selectedItem={getOutfitItem(activeCategoryTab)}
            onSelectItem={(item) => onSelectSlotItem(activeCategoryTab, item)}
            onCategoryChange={(cat) => setActiveCategoryTab(cat)}
            theme={theme}
          />

          {/* Closet Grid Browser with View Switcher */}
          <div
            className={`rounded-3xl border p-4 sm:p-5 shadow-xl ${
              isLight
                ? 'bg-white border-neutral-200'
                : isNeon
                ? 'bg-neutral-950 border-cyan-500/30'
                : 'bg-neutral-900 border-neutral-800'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold capitalize">
                  {activeCategoryTab} Collection
                </h3>
                <span className="text-xs text-neutral-400">
                  ({availableForActiveCategory.length} items)
                </span>
              </div>

              {/* Sub-category filter pills for Tops/Dresses */}
              {activeCategoryTab === 'topwear' && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDressOnlyFilter(false)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      !dressOnlyFilter
                        ? 'bg-[#244837] text-white dark:bg-[#C5A880] dark:text-neutral-900'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    All Tops
                  </button>
                  <button
                    type="button"
                    onClick={() => setDressOnlyFilter(true)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                      dressOnlyFilter
                        ? 'bg-[#B38F5F] text-white'
                        : 'text-neutral-500 hover:text-[#B38F5F] border border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Dresses & Gowns</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomFitModal(true)}
                  className="text-xs font-medium text-[#B38F5F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Custom PNG</span>
                </button>

                {getOutfitItem(activeCategoryTab) && (
                  <button
                    type="button"
                    onClick={() => onSelectSlotItem(activeCategoryTab, null)}
                    className="text-neutral-400 hover:text-[#B38F5F] flex items-center gap-1 text-xs transition active:scale-95 p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Grid for direct selection */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 max-h-[380px] overflow-y-auto pr-1">
              {availableForActiveCategory.map((item) => {
                const worn = isSelected(item);
                const isDress = isDressItem(item);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleItem(item)}
                    className={`group relative rounded-2xl border p-2.5 cursor-pointer transition-all active:scale-95 flex flex-col justify-between ${
                      worn
                        ? 'border-[#244837] dark:border-[#C5A880] bg-[#244837]/10 ring-2 ring-[#244837]/30'
                        : isLight
                        ? 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
                        : 'border-neutral-800 bg-neutral-850 hover:border-neutral-700'
                    }`}
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-950">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {worn && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#244837] text-white flex items-center justify-center shadow-md border border-[#C5A880]/30">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                      {isDress && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-[#B38F5F] text-white text-[9px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Dress</span>
                        </div>
                      )}
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/40"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-white font-medium truncate max-w-[110px]">
                          {item.subCategory}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-left">
                      <h4 className="text-xs font-semibold truncate group-hover:text-[#244837] dark:group-hover:text-[#C5A880]">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                        {item.colorName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Fit Custom Dress / PNG Modal */}
      <CustomGarmentFitModal
        isOpen={showCustomFitModal}
        onClose={() => setShowCustomFitModal(false)}
        onEquipItem={(category, item) => onSelectSlotItem(category, item)}
        theme={theme}
        isBoy={isBoy}
      />
    </div>
  );
};

