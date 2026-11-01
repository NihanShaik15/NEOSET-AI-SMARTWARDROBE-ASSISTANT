import React, { useState, useMemo } from 'react';
import { CalendarOutfitEntry, WardrobeItem, WeatherData } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
  CloudRain,
  Sun,
  Cloud,
  Snowflake,
  Wind,
  Check,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  Shirt,
  Layers,
  MapPin,
  Bookmark,
} from 'lucide-react';

interface CalendarViewProps {
  history: CalendarOutfitEntry[];
  currentOutfit: {
    topwear: WardrobeItem | null;
    bottomwear: WardrobeItem | null;
    footwear: WardrobeItem | null;
    accessory: WardrobeItem | null;
  };
  activeWeather?: WeatherData;
  onApplyOutfitToAvatar: (outfit: {
    topwear: WardrobeItem | null;
    bottomwear: WardrobeItem | null;
    footwear: WardrobeItem | null;
    accessory: WardrobeItem | null;
  }) => void;
  onSaveOutfitToDate: (entry: CalendarOutfitEntry) => void;
  onDeleteOutfitFromDate: (id: string) => void;
  theme?: 'light' | 'dark' | 'neon';
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  history,
  currentOutfit,
  activeWeather,
  onApplyOutfitToAvatar,
  onSaveOutfitToDate,
  onDeleteOutfitFromDate,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed

  // Today's date string format: YYYY-MM-DD
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  // Selected date defaults to today or first day with look
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [isEquippedSuccess, setIsEquippedSuccess] = useState<boolean>(false);
  const [isLoggingFormOpen, setIsLoggingFormOpen] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customOccasion, setCustomOccasion] = useState<string>('casual');
  const [customNotes, setCustomNotes] = useState<string>('');

  // Calendar matrix calculation
  const calendarData = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days: Array<{
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      entry?: CalendarOutfitEntry;
    }> = [];

    // Previous month padding
    const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const prevMonth = currentMonth === 0 ? 12 : currentMonth;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dayNumber: dayNum,
        dateStr: dStr,
        isCurrentMonth: false,
        entry: history.find((h) => h.date === dStr),
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateStr: dStr,
        isCurrentMonth: true,
        entry: history.find((h) => h.date === dStr),
      });
    }

    // Trailing days padding to complete 6 rows (42 total or multiples of 7)
    const totalRemaining = 42 - days.length;
    for (let r = 1; r <= (totalRemaining <= 7 ? totalRemaining : totalRemaining - 7); r++) {
      const nextMonth = currentMonth === 11 ? 1 : currentMonth + 2;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(r).padStart(2, '0')}`;
      days.push({
        dayNumber: r,
        dateStr: dStr,
        isCurrentMonth: false,
        entry: history.find((h) => h.date === dStr),
      });
    }

    return days;
  }, [currentYear, currentMonth, history]);

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
  });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(todayStr);
  };

  // Find active entry for the selected date
  const selectedEntry = useMemo(() => {
    return history.find((h) => h.date === selectedDateStr);
  }, [history, selectedDateStr]);

  const hasEquippedCurrentOutfit = Boolean(
    currentOutfit.topwear || currentOutfit.bottomwear || currentOutfit.footwear || currentOutfit.accessory
  );

  const handleEquipLook = (entry: CalendarOutfitEntry) => {
    onApplyOutfitToAvatar(entry.outfit);
    setIsEquippedSuccess(true);
    setTimeout(() => setIsEquippedSuccess(false), 2500);
  };

  const handleLogTodayOutfit = () => {
    if (!hasEquippedCurrentOutfit) return;

    const newEntry: CalendarOutfitEntry = {
      id: `cal-${Date.now()}`,
      date: selectedDateStr,
      title: customTitle.trim() || `${customOccasion.toUpperCase()} Ensemble`,
      occasion: customOccasion,
      vibe: 'Old Money Curated',
      weather: activeWeather
        ? {
            temp: activeWeather.temp,
            condition: activeWeather.condition,
            city: activeWeather.city,
          }
        : {
            temp: 19,
            condition: 'sunny',
            city: 'Atelier',
          },
      outfit: {
        topwear: currentOutfit.topwear,
        bottomwear: currentOutfit.bottomwear,
        footwear: currentOutfit.footwear,
        accessory: currentOutfit.accessory,
      },
      notes: customNotes.trim() || 'Logged to personal sartorial archives with tailored proportion.',
      loggedAt: new Date().toISOString(),
    };

    onSaveOutfitToDate(newEntry);
    setIsLoggingFormOpen(false);
    setCustomTitle('');
    setCustomNotes('');
  };

  const renderWeatherIcon = (condition: string = 'sunny') => {
    switch (condition) {
      case 'sunny':
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'rainy':
        return <CloudRain className="w-3.5 h-3.5 text-sky-400" />;
      case 'snowy':
        return <Snowflake className="w-3.5 h-3.5 text-blue-300" />;
      case 'chilly':
        return <Wind className="w-3.5 h-3.5 text-emerald-400" />;
      case 'cloudy':
      default:
        return <Cloud className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  const totalEntriesThisMonth = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    return history.filter((h) => h.date.startsWith(prefix)).length;
  }, [history, currentYear, currentMonth]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Calendar Header Masthead */}
      <div
        className={`p-6 sm:p-7 rounded-3xl border transition-all ${
          isLight
            ? 'bg-white border-[#E5E0D8] text-[#1A2421] shadow-sm'
            : 'bg-[#141A17] border-[#222E28] text-[#ECE8E1]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-widest text-[#B38F5F] font-bold">
                NeoSet Sartorial Archives
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  isLight
                    ? 'bg-[#F2EFEB] text-[#244837] border-[#DCD6CC]'
                    : 'bg-[#1E2822] text-[#C5A880] border-[#2E3C34]'
                }`}
              >
                Fashion History
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              Lookbook & Outfit Calendar
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl">
              Chronological ledger of your daily fashion choices. Review historical ensembles, inspect weathered pieces, or equip any past look directly onto your digital twin.
            </p>
          </div>

          {/* Month Navigation Controls */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              type="button"
              onClick={handleJumpToToday}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition active:scale-95 cursor-pointer ${
                isLight
                  ? 'border-[#DCD6CC] bg-[#FAF8F5] hover:bg-[#F2EFEB] text-[#244837]'
                  : 'border-[#2E3C34] bg-[#1A231E] hover:bg-[#232F28] text-[#C5A880]'
              }`}
            >
              Today
            </button>

            <div
              className={`flex items-center p-1 rounded-xl border ${
                isLight
                  ? 'border-[#DCD6CC] bg-[#FAF8F5]'
                  : 'border-[#2E3C34] bg-[#1A231E]'
              }`}
            >
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4 text-current" />
              </button>
              <span className="px-3 text-xs font-serif font-bold min-w-[130px] text-center tracking-wide">
                {monthName} {currentYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4 text-current" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Month Metrics Bar */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t ${
            isLight ? 'border-[#EAE6DF]' : 'border-[#222E28]'
          }`}
        >
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-neutral-400">Total Looks Recorded</span>
            <span className="text-lg font-serif font-bold text-[#B38F5F] mt-0.5">
              {totalEntriesThisMonth} {totalEntriesThisMonth === 1 ? 'Outfit' : 'Outfits'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-neutral-400">Archived Lifetime</span>
            <span className="text-lg font-serif font-bold mt-0.5">{history.length} Ensembles</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-neutral-400">Active Aesthetic</span>
            <span className="text-lg font-serif font-bold text-[#244837] dark:text-[#8FA89B] mt-0.5">Old Money Sartorial</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-neutral-400">Live Weather Sync</span>
            <span className="text-lg font-serif font-bold text-sky-500 mt-0.5">
              {activeWeather ? `${activeWeather.city} • ${activeWeather.temp}°C` : 'Connected'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Split: Calendar Grid + Selected Date Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Month Grid (lg:col-span-8) */}
        <div
          className={`lg:col-span-8 p-4 sm:p-6 rounded-3xl border transition-all ${
            isLight
              ? 'bg-white border-[#E5E0D8] text-[#1A2421] shadow-sm'
              : 'bg-[#141A17] border-[#222E28] text-[#ECE8E1]'
          }`}
        >
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
            {calendarData.map((item, index) => {
              const isSelected = item.dateStr === selectedDateStr;
              const isToday = item.dateStr === todayStr;
              const hasEntry = Boolean(item.entry);

              return (
                <button
                  key={`${item.dateStr}-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedDateStr(item.dateStr);
                    setIsLoggingFormOpen(false);
                  }}
                  className={`min-h-[78px] sm:min-h-[94px] p-1.5 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden group cursor-pointer ${
                    isSelected
                      ? isLight
                        ? 'border-[#244837] bg-[#F2EFEB] ring-2 ring-[#244837]/20 shadow-md'
                        : 'border-[#C5A880] bg-[#1E2822] ring-2 ring-[#C5A880]/30 shadow-md'
                      : isToday
                      ? isLight
                        ? 'border-[#C5A880] bg-[#FAF8F5]'
                        : 'border-[#B38F5F]/60 bg-[#17201B]'
                      : item.isCurrentMonth
                      ? isLight
                        ? 'border-[#EAE6DF] bg-[#FAF8F5]/60 hover:border-[#D5CFC5] hover:bg-white'
                        : 'border-[#1E2721] bg-[#101513] hover:border-[#2C3831] hover:bg-[#151C18]'
                      : isLight
                      ? 'border-transparent bg-transparent opacity-35'
                      : 'border-transparent bg-transparent opacity-25'
                  }`}
                >
                  {/* Top Bar: Date Number + Today Indicator / Weather */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-semibold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-[#244837] text-white flex items-center justify-center font-bold text-[10px]'
                          : isSelected
                          ? 'font-bold text-[#B38F5F]'
                          : ''
                      }`}
                    >
                      {item.dayNumber}
                    </span>

                    {item.entry?.weather && (
                      <span className="flex items-center gap-0.5 text-[10px] text-neutral-400">
                        {renderWeatherIcon(item.entry.weather.condition)}
                        <span className="hidden sm:inline font-mono">{item.entry.weather.temp}°</span>
                      </span>
                    )}
                  </div>

                  {/* Body: Thumbnail Preview or Empty Slot */}
                  {item.entry ? (
                    <div className="mt-1 flex items-center gap-1">
                      <div className="flex -space-x-2 overflow-hidden shrink-0">
                        {item.entry.outfit.topwear?.imageUrl && (
                          <img
                            src={item.entry.outfit.topwear.imageUrl}
                            alt="Top"
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-black/40 object-cover shadow-sm"
                          />
                        )}
                        {item.entry.outfit.bottomwear?.imageUrl && (
                          <img
                            src={item.entry.outfit.bottomwear.imageUrl}
                            alt="Bottom"
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-black/40 object-cover shadow-sm"
                          />
                        )}
                      </div>
                      <div className="min-w-0 hidden sm:block">
                        <span className="text-[9px] font-bold text-[#B38F5F] truncate block capitalize leading-none">
                          {item.entry.occasion}
                        </span>
                        <span className="text-[9px] text-neutral-400 truncate block leading-tight mt-0.5 font-medium">
                          {item.entry.title.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto hidden sm:flex items-center justify-center py-1 opacity-0 group-hover:opacity-100 transition">
                      <span className="text-[9px] text-neutral-400 flex items-center gap-0.5">
                        <Plus className="w-2.5 h-2.5" />
                        Log
                      </span>
                    </div>
                  )}

                  {/* Bottom Accent Bar for logged looks */}
                  {hasEntry && (
                    <div className="w-full h-1 rounded-full bg-gradient-to-r from-[#244837] to-[#C5A880] mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Day Detail Inspector (lg:col-span-4) */}
        <div
          className={`lg:col-span-4 p-5 sm:p-6 rounded-3xl border transition-all sticky top-20 ${
            isLight
              ? 'bg-white border-[#E5E0D8] text-[#1A2421] shadow-sm'
              : 'bg-[#141A17] border-[#222E28] text-[#ECE8E1]'
          }`}
        >
          {selectedEntry ? (
            /* Selected Historical Outfit Details */
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#B38F5F]">
                      {new Date(selectedEntry.date + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                        isLight
                          ? 'bg-[#F2EFEB] text-[#244837] border-[#DCD6CC]'
                          : 'bg-[#1E2822] text-[#C5A880] border-[#2E3C34]'
                      }`}
                    >
                      {selectedEntry.occasion}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold tracking-tight mt-1">
                    {selectedEntry.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteOutfitFromDate(selectedEntry.id)}
                  className="p-1.5 text-neutral-400 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-500/10 rounded-xl transition"
                  title="Remove this look from calendar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Weather Snapshot on that day */}
              {selectedEntry.weather && (
                <div
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    isLight
                      ? 'bg-[#FAF8F5] border-[#EAE6DF] text-[#1A2421]'
                      : 'bg-[#18201B] border-[#232F28] text-[#ECE8E1]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#244837]/10 flex items-center justify-center text-[#244837] dark:text-[#C5A880]">
                      {renderWeatherIcon(selectedEntry.weather.condition)}
                    </div>
                    <div>
                      <span className="font-semibold block">{selectedEntry.weather.city}</span>
                      <span className="text-[10px] text-neutral-400 capitalize">
                        {selectedEntry.weather.condition} Conditions
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-serif font-bold text-[#B38F5F]">
                    {selectedEntry.weather.temp}°C
                  </span>
                </div>
              )}

              {/* Pieces Grid */}
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-2.5">
                  Archived Ensemble Pieces
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { slot: 'Topwear', item: selectedEntry.outfit.topwear },
                    { slot: 'Bottomwear', item: selectedEntry.outfit.bottomwear },
                    { slot: 'Footwear', item: selectedEntry.outfit.footwear },
                    { slot: 'Accessory', item: selectedEntry.outfit.accessory },
                  ]
                    .filter((p) => Boolean(p.item))
                    .map((piece) => (
                      <div
                        key={piece.slot}
                        className={`p-2 rounded-xl border flex items-center gap-2.5 ${
                          isLight
                            ? 'bg-[#FAF8F5] border-[#EAE6DF]'
                            : 'bg-[#18201B] border-[#232F28]'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-black/20 shrink-0 bg-black/40">
                          {piece.item?.imageUrl ? (
                            <img
                              src={piece.item.imageUrl}
                              alt={piece.item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Shirt className="w-4 h-4 m-auto text-neutral-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] uppercase tracking-wider text-neutral-400 block font-semibold">
                            {piece.slot}
                          </span>
                          <span className="text-[11px] font-bold truncate block leading-tight">
                            {piece.item?.name}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Sartorial Notes */}
              {selectedEntry.notes && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs leading-relaxed italic ${
                    isLight
                      ? 'bg-[#FAF8F5] border-[#EAE6DF] text-[#55625B]'
                      : 'bg-[#18201B] border-[#232F28] text-neutral-300'
                  }`}
                >
                  &ldquo;{selectedEntry.notes}&rdquo;
                </div>
              )}

              {/* Action Button: Equip on Avatar */}
              <button
                type="button"
                onClick={() => handleEquipLook(selectedEntry)}
                disabled={isEquippedSuccess}
                className="w-full py-3 px-4 rounded-2xl font-semibold text-xs text-white bg-[#244837] hover:bg-[#1E3A2F] active:scale-95 transition shadow-lg shadow-[#244837]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80"
              >
                {isEquippedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-[#C5A880]" />
                    <span>Equipped on Digital Twin Avatar!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#C5A880]" />
                    <span>Wear This Look on Avatar Today</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Empty State for Selected Date: Allow Logging */
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-[#244837]/10 text-[#244837] dark:text-[#C5A880] flex items-center justify-center mx-auto border border-[#244837]/20">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg">
                  {new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                  No historical outfit logged for this date. Would you like to record your currently worn outfit to this date?
                </p>
              </div>

              {hasEquippedCurrentOutfit ? (
                !isLoggingFormOpen ? (
                  <button
                    type="button"
                    onClick={() => setIsLoggingFormOpen(true)}
                    className="mt-2 w-full py-2.5 px-4 rounded-2xl font-semibold text-xs text-white bg-[#244837] hover:bg-[#1E3A2F] active:scale-95 transition shadow-md shadow-[#244837]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 text-[#C5A880]" />
                    <span>Log Current Outfit to this Date</span>
                  </button>
                ) : (
                  /* Form to complete the log */
                  <div
                    className={`text-left p-4 rounded-2xl border space-y-3 mt-3 ${
                      isLight
                        ? 'bg-[#FAF8F5] border-[#EAE6DF]'
                        : 'bg-[#18201B] border-[#232F28]'
                    }`}
                  >
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Look Title
                      </label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="e.g., Saturday Morning Brunch in Brera"
                        className={`w-full px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#244837] ${
                          isLight
                            ? 'bg-white border-[#DCD6CC] text-[#1A2421]'
                            : 'bg-[#101513] border-[#2E3C34] text-[#ECE8E1]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Occasion
                      </label>
                      <select
                        value={customOccasion}
                        onChange={(e) => setCustomOccasion(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                          isLight
                            ? 'bg-white border-[#DCD6CC] text-[#1A2421]'
                            : 'bg-[#101513] border-[#2E3C34] text-[#ECE8E1]'
                        }`}
                      >
                        <option value="casual">Casual Leisure</option>
                        <option value="work">Business & Tailored</option>
                        <option value="party">Evening Gala & Black Tie</option>
                        <option value="gym">Club Sport & Equestrian</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Sartorial Notes
                      </label>
                      <textarea
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        placeholder="Key styling reflections or fabric pairings..."
                        rows={2}
                        className={`w-full px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                          isLight
                            ? 'bg-white border-[#DCD6CC] text-[#1A2421]'
                            : 'bg-[#101513] border-[#2E3C34] text-[#ECE8E1]'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleLogTodayOutfit}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#244837] hover:bg-[#1E3A2F] text-white text-xs font-semibold shadow transition cursor-pointer"
                      >
                        Save to Lookbook
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsLoggingFormOpen(false)}
                        className="py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs hover:bg-black/5 dark:hover:bg-white/5 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div
                  className={`p-3 rounded-2xl border text-xs text-neutral-400 mt-2 ${
                    isLight ? 'bg-[#FAF8F5] border-[#EAE6DF]' : 'bg-[#18201B] border-[#232F28]'
                  }`}
                >
                  Equip clothes on your avatar via the Fitting Room or Wardrobe to log an outfit.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
