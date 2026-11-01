import React, { useState, useRef, useEffect } from 'react';
import { WardrobeItem, CategoryType } from '../types';
import { ChevronLeft, ChevronRight, Check, Sparkles, Hand, ArrowLeftRight } from 'lucide-react';

interface SwipeClothesRackProps {
  category: CategoryType;
  items: WardrobeItem[];
  selectedItem: WardrobeItem | null;
  onSelectItem: (item: WardrobeItem | null) => void;
  onCategoryChange: (category: CategoryType) => void;
  theme?: 'light' | 'dark' | 'neon';
}

export const SwipeClothesRack: React.FC<SwipeClothesRackProps> = ({
  category,
  items,
  selectedItem,
  onSelectItem,
  onCategoryChange,
  theme = 'dark',
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [browseIndex, setBrowseIndex] = useState(0);

  // Sync browseIndex when selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      const idx = items.findIndex((i) => i.id === selectedItem.id);
      if (idx >= 0) setBrowseIndex(idx);
    }
  }, [selectedItem?.id, category]);

  // Safe index calculation
  const safeIndex = items.length > 0 ? Math.min(Math.max(0, browseIndex), items.length - 1) : 0;
  const currentItem = items[safeIndex] || null;

  const handlePrev = () => {
    if (items.length === 0) return;
    const prevIndex = (safeIndex - 1 + items.length) % items.length;
    setBrowseIndex(prevIndex);
    onSelectItem(items[prevIndex]);
  };

  const handleNext = () => {
    if (items.length === 0) return;
    const nextIndex = (safeIndex + 1) % items.length;
    setBrowseIndex(nextIndex);
    onSelectItem(items[nextIndex]);
  };

  // Touch handlers for mobile finger swiping
  const onTouchStartHandler = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const onTouchMoveHandler = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStart;
    setTouchDelta(diff);
  };

  const onTouchEndHandler = () => {
    if (touchStart === null) return;
    const threshold = 40; // minimum swipe distance in px
    if (touchDelta > threshold) {
      // Swiped Right -> Previous
      handlePrev();
    } else if (touchDelta < -threshold) {
      // Swiped Left -> Next
      handleNext();
    }
    setTouchStart(null);
    setTouchDelta(0);
    setIsSwiping(false);
  };

  // Mouse drag support for desktop users too
  const [mouseStart, setMouseStart] = useState<number | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    setMouseStart(e.clientX);
    setIsSwiping(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (mouseStart === null) return;
    setTouchDelta(e.clientX - mouseStart);
  };

  const onMouseUp = () => {
    if (mouseStart === null) return;
    if (touchDelta > 40) handlePrev();
    else if (touchDelta < -40) handleNext();
    setMouseStart(null);
    setTouchDelta(0);
    setIsSwiping(false);
  };

  const isLight = theme === 'light';
  const isNeon = theme === 'neon';

  return (
    <div
      className={`rounded-3xl border p-4 sm:p-5 transition-all shadow-xl ${
        isLight
          ? 'bg-white border-neutral-200 text-neutral-900'
          : isNeon
          ? 'bg-neutral-950 border-cyan-500/40 text-neutral-100 shadow-[0_0_20px_rgba(6,182,212,0.18)]'
          : 'bg-neutral-900 border-neutral-800 text-neutral-100'
      }`}
    >
      {/* Category Selection Tabs */}
      <div className="flex items-center justify-between gap-1.5 pb-3 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto scrollbar-none">
        {(['topwear', 'bottomwear', 'footwear', 'accessories'] as CategoryType[]).map((cat) => {
          const isActive = category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
                isActive
                  ? 'bg-[#244837] text-white shadow-md shadow-[#244837]/20'
                  : isLight
                  ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat === 'accessories' ? 'Accessories' : cat.replace('wear', '')}
            </button>
          );
        })}
      </div>

      {/* Swipe Header Hint */}
      <div className="flex items-center justify-between pt-3 pb-2 text-xs">
        <div className="flex items-center gap-1.5 text-[#244837] dark:text-[#C5A880] font-semibold">
          <Hand className="w-3.5 h-3.5 animate-bounce" />
          <span>Slide with Fingers</span>
        </div>
        <span className="text-[11px] text-neutral-400">
          {items.length > 0 ? `Item ${safeIndex + 1} of ${items.length}` : 'Empty Rack'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-400">
          No items in this category yet. Upload a piece to start sliding!
        </div>
      ) : (
        /* The Touch & Drag Swipe Stage */
        <div className="relative mt-2">
          {/* Main Card with transform drag */}
          <div
            onTouchStart={onTouchStartHandler}
            onTouchMove={onTouchMoveHandler}
            onTouchEnd={onTouchEndHandler}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            className={`cursor-grab active:cursor-grabbing select-none rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 transition-transform duration-150 ${
              isLight
                ? 'bg-neutral-50/90 border-neutral-200 hover:border-neutral-300'
                : 'bg-neutral-850 border-neutral-750 hover:border-neutral-700'
            }`}
            style={{
              transform: isSwiping ? `translateX(${touchDelta * 0.7}px)` : 'translateX(0px)',
            }}
          >
            {/* Clothing Image Showcase */}
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden border border-black/10 shrink-0 relative shadow-md bg-neutral-800">
              {currentItem?.imageUrl ? (
                <img
                  src={currentItem.imageUrl}
                  alt={currentItem.name}
                  className="w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                  No preview
                </div>
              )}

              {/* Color indicator badge */}
              {currentItem?.color && (
                <div
                  className="absolute bottom-2 right-2 w-4 h-4 rounded-full border border-white/70 shadow-sm"
                  style={{ backgroundColor: currentItem.color }}
                  title={currentItem.colorName}
                />
              )}
            </div>

            {/* Item Details & Actions */}
            <div className="flex-1 text-center sm:text-left min-w-0 w-full">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#244837]/10 text-[#244837] dark:text-[#C5A880] border border-[#244837]/20">
                  {currentItem?.subCategory || category}
                </span>
                {selectedItem?.id === currentItem?.id && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Check className="w-3 h-3" /> Worn on Avatar
                  </span>
                )}
              </div>

              <h4 className="text-sm sm:text-base font-bold truncate">
                {currentItem?.name}
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                {currentItem?.colorName} • {currentItem?.weather?.join(', ')}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-2">
                {currentItem?.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Button: Wear / Remove */}
              <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                {selectedItem?.id === currentItem?.id ? (
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(null);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 active:scale-95 transition"
                  >
                    Take Off
                  </button>
                ) : (
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentItem) onSelectItem(currentItem);
                    }}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#244837] hover:bg-[#1C382B] text-white shadow-md shadow-[#244837]/20 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Wear on Avatar</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Left / Right Swipe Arrows (Accessible on Mobile & Desktop) */}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2.5 sm:-translate-x-3 w-9 h-9 rounded-full border shadow-lg flex items-center justify-center transition active:scale-90 z-20 ${
              isLight
                ? 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100 hover:border-neutral-400'
                : 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700 hover:border-neutral-600'
            }`}
            title="Previous outfit piece (Swipe Right)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2.5 sm:translate-x-3 w-9 h-9 rounded-full border shadow-lg flex items-center justify-center transition active:scale-90 z-20 ${
              isLight
                ? 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100 hover:border-neutral-400'
                : 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700 hover:border-neutral-600'
            }`}
            title="Next outfit piece (Swipe Left)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Visual Dots Carousel Indicator */}
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setBrowseIndex(idx);
                onSelectItem(item);
              }}
              className={`h-2 rounded-full transition-all active:scale-90 ${
                safeIndex === idx
                  ? 'w-6 bg-[#244837] dark:bg-[#C5A880] shadow-sm shadow-[#244837]/40'
                  : 'w-2 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400'
              }`}
              title={item.name}
            />
          ))}
        </div>
      )}
    </div>
  );
};
