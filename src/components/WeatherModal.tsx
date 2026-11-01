import React, { useState, useEffect } from 'react';
import { WeatherData } from '../types';
import {
  fetchRealtimeWeather,
  searchCities,
  detectUserCoordinates,
  CitySearchResult,
  POPULAR_CITIES,
} from '../services/weatherService';
import {
  X,
  MapPin,
  Search,
  Navigation,
  RefreshCw,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  Droplets,
  Thermometer,
  Sparkles,
  ArrowRight,
  Check,
  Moon,
  AlertCircle,
} from 'lucide-react';

interface WeatherModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentWeather: WeatherData;
  onSelectWeather: (weather: WeatherData) => void;
  onOpenStylistForWeather?: () => void;
  theme?: 'light' | 'dark' | 'neon';
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  isOpen = true,
  onClose,
  currentWeather,
  onSelectWeather,
  onOpenStylistForWeather,
  theme = 'dark',
}) => {
  if (!isOpen) return null;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLight = theme === 'light';

  // Debounced search for cities
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setErrorMessage(null);
      try {
        const results = await searchCities(searchQuery);
        setSearchResults(results);
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleCitySelect = async (cityItem: CitySearchResult) => {
    setIsLoadingWeather(true);
    setErrorMessage(null);
    try {
      const weather = await fetchRealtimeWeather({
        lat: cityItem.lat,
        lon: cityItem.lon,
        cityName: cityItem.name,
        countryName: cityItem.country,
      });
      onSelectWeather(weather);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to fetch real-time weather');
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setErrorMessage(null);
    try {
      const coords = await detectUserCoordinates();
      const weather = await fetchRealtimeWeather({
        lat: coords.lat,
        lon: coords.lon,
        cityName: 'My Current Location',
      });
      onSelectWeather(weather);
      setSearchQuery('');
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Could not access geolocation. Please allow location access in your browser or search your city.'
      );
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoadingWeather(true);
    setErrorMessage(null);
    try {
      const weather = await fetchRealtimeWeather(
        currentWeather.latitude && currentWeather.longitude
          ? {
              lat: currentWeather.latitude,
              lon: currentWeather.longitude,
              cityName: currentWeather.city,
              countryName: currentWeather.country,
            }
          : currentWeather.city
      );
      onSelectWeather(weather);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not refresh real-time weather');
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const getWeatherIcon = (condition: string, isDay: boolean = true) => {
    if (!isDay && condition === 'sunny') return <Moon className="w-8 h-8 text-indigo-400" />;
    switch (condition) {
      case 'sunny':
        return <Sun className="w-8 h-8 text-amber-400" />;
      case 'rainy':
        return <CloudRain className="w-8 h-8 text-sky-400" />;
      case 'snowy':
        return <Snowflake className="w-8 h-8 text-blue-200" />;
      case 'chilly':
        return <Wind className="w-8 h-8 text-teal-300" />;
      case 'cloudy':
      default:
        return <Cloud className="w-8 h-8 text-neutral-400" />;
    }
  };

  const displayTemp = unit === 'C' ? `${currentWeather.temp}°C` : `${currentWeather.tempF}°F`;
  const displayApparent =
    unit === 'C'
      ? `${currentWeather.apparentTemp ?? currentWeather.temp}°C`
      : `${currentWeather.apparentTempF ?? currentWeather.tempF}°F`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isLight ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-neutral-900 border-neutral-800 text-neutral-100'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg">Real-Time Weather</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live API
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Synchronized with Open-Meteo live meteorology station
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Unit Toggle */}
            <div
              className={`flex items-center p-0.5 rounded-xl border ${
                isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-800 border-neutral-700'
              }`}
            >
              <button
                type="button"
                onClick={() => setUnit('C')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  unit === 'C' ? 'bg-[#244837] text-white shadow-sm' : 'text-neutral-400'
                }`}
              >
                °C
              </button>
              <button
                type="button"
                onClick={() => setUnit('F')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  unit === 'F' ? 'bg-[#244837] text-white shadow-sm' : 'text-neutral-400'
                }`}
              >
                °F
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Error notice if any */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Live Card */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border relative overflow-hidden ${
              isLight
                ? 'bg-gradient-to-br from-sky-50 to-indigo-50/50 border-sky-200/70'
                : 'bg-gradient-to-br from-neutral-850 to-neutral-900 border-neutral-750'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#B38F5F]" />
                  <span>
                    {currentWeather.city}
                    {currentWeather.country ? `, ${currentWeather.country}` : ''}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif">
                    {displayTemp}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    Feels like {displayApparent}
                  </span>
                </div>
                <div className="mt-1 text-sm font-semibold text-sky-500">
                  {currentWeather.conditionLabel}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="p-2.5 rounded-2xl bg-white/40 dark:bg-neutral-800/80 backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-sm">
                  {getWeatherIcon(currentWeather.condition, currentWeather.isDay ?? true)}
                </div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isLoadingWeather}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium border border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 hover:bg-white dark:hover:bg-neutral-800 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Refresh live metrics"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingWeather ? 'animate-spin text-[#B38F5F]' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Weather Metrics Strip */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-black/5 dark:border-white/5 text-center">
              <div className="p-2 rounded-xl bg-white/30 dark:bg-neutral-800/40">
                <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                  <Droplets className="w-3 h-3 text-sky-400" />
                  <span>Humidity</span>
                </div>
                <span className="text-xs font-bold mt-0.5 block">{currentWeather.humidity}%</span>
              </div>
              <div className="p-2 rounded-xl bg-white/30 dark:bg-neutral-800/40">
                <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                  <Wind className="w-3 h-3 text-teal-400" />
                  <span>Wind Speed</span>
                </div>
                <span className="text-xs font-bold mt-0.5 block">{currentWeather.windSpeed} km/h</span>
              </div>
              <div className="p-2 rounded-xl bg-white/30 dark:bg-neutral-800/40">
                <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                  <Thermometer className="w-3 h-3 text-amber-400" />
                  <span>Atmosphere</span>
                </div>
                <span className="text-xs font-bold mt-0.5 block capitalize">
                  {currentWeather.isDay ?? true ? 'Daytime' : 'Night'}
                </span>
              </div>
            </div>

            {/* Smart Wardrobe & Styling Advice */}
            {currentWeather.clothingAdvice && (
              <div className="mt-3.5 p-3 rounded-xl bg-[#244837]/10 border border-[#244837]/20 text-left flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#B38F5F] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-[#244837] dark:text-[#C5A880]">Live Styling Advice:</strong>{' '}
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {currentWeather.clothingAdvice}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions: Detect Location & Search */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="flex-1 py-2.5 px-3 rounded-2xl border border-[#244837]/30 bg-[#244837]/10 hover:bg-[#244837]/20 text-[#244837] dark:text-[#C5A880] font-semibold text-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                <span>{isDetectingLocation ? 'Detecting GPS...' : 'Detect My Real-Time Location'}</span>
              </button>
            </div>

            {/* City Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any city in the world (e.g., London, Tokyo, Seoul)..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs outline-none transition ${
                  isLight
                    ? 'bg-neutral-50 border-neutral-200 focus:border-[#244837] focus:bg-white text-neutral-900'
                    : 'bg-neutral-850 border-neutral-800 focus:border-[#C5A880] focus:bg-neutral-800 text-neutral-100'
                }`}
              />
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div
                className={`p-1.5 rounded-2xl border max-h-48 overflow-y-auto space-y-1 ${
                  isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-850 border-neutral-800'
                }`}
              >
                {searchResults.map((item, idx) => (
                  <button
                    key={`${item.name}-${item.lat}-${idx}`}
                    type="button"
                    onClick={() => handleCitySelect(item)}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800 flex items-center justify-between transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="font-semibold truncate">{item.name}</span>
                      <span className="text-neutral-400 text-[11px] truncate">
                        {item.admin1 ? `${item.admin1}, ` : ''}
                        {item.country}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#244837] dark:text-[#C5A880] font-semibold shrink-0 ml-2">Select</span>
                  </button>
                ))}
              </div>
            )}

            {/* Fashion Capitals Quick Chips */}
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 block mb-2">
                Popular Fashion Capitals:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CITIES.map((c) => {
                  const isSelected = currentWeather.city.toLowerCase() === c.name.toLowerCase();
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleCitySelect(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'border-[#244837] dark:border-[#C5A880] bg-[#244837]/10 text-[#244837] dark:text-[#C5A880] font-semibold'
                          : isLight
                          ? 'border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                          : 'border-neutral-800 bg-neutral-850 hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      <span>{c.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-[#244837] dark:text-[#C5A880]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
          <div className="text-[11px] text-neutral-400 truncate">
            Last updated:{' '}
            {currentWeather.lastUpdated
              ? new Date(currentWeather.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Live'}
          </div>

          {onOpenStylistForWeather && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenStylistForWeather();
              }}
              className="py-2 px-4 rounded-xl text-xs font-medium bg-[#244837] hover:bg-[#1E3A2D] text-white shadow-md shadow-[#244837]/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Style for this Weather</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
