import React, { useState } from 'react';
import { WardrobeItem, CategoryType, OccasionType, WeatherSuitability } from '../types';
import { Plus, Search, Filter, Heart, Trash2, Check, Sparkles, X, Image as ImageIcon, Shirt } from 'lucide-react';

interface WardrobeViewProps {
  wardrobe: WardrobeItem[];
  onAddItem: (item: WardrobeItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTryOnItem: (item: WardrobeItem) => void;
  onClearAll?: () => void;
  currentOutfitIds: {
    topwearId?: string | null;
    bottomwearId?: string | null;
    footwearId?: string | null;
    accessoryId?: string | null;
  };
  theme?: 'light' | 'dark' | 'neon';
  userGender?: 'boy' | 'girl';
}

export const WardrobeView: React.FC<WardrobeViewProps> = ({
  wardrobe,
  onAddItem,
  onDeleteItem,
  onToggleFavorite,
  onTryOnItem,
  onClearAll,
  currentOutfitIds,
  theme = 'dark',
  userGender,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionType | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isLight = theme === 'light';
  const isNeon = theme === 'neon';

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<CategoryType>('topwear');
  const [newItemSubCategory, setNewItemSubCategory] = useState('Top');
  const [newItemColor, setNewItemColor] = useState('#2A2D34');
  const [newItemColorName, setNewItemColorName] = useState('Slate Navy');
  const [newItemImageUrl, setNewItemImageUrl] = useState('');
  const [newItemGenderTarget, setNewItemGenderTarget] = useState<'boy' | 'girl' | 'unisex'>('unisex');
  const [newItemOccasions, setNewItemOccasions] = useState<OccasionType[]>(['casual']);
  const [newItemWeather, setNewItemWeather] = useState<WeatherSuitability[]>(['all']);

  // Filtered wardrobe
  const filteredItems = wardrobe.filter((item) => {
    let matchesCategory = true;
    if (activeCategory === 'favorites') {
      matchesCategory = !!item.isFavorite;
    } else if (activeCategory !== 'all') {
      matchesCategory = item.category === activeCategory;
    }

    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesOccasion = selectedOccasion === 'all' || item.occasions.includes(selectedOccasion);
    return matchesCategory && matchesSearch && matchesOccasion;
  });

  const isItemWorn = (item: WardrobeItem) => {
    if (item.category === 'topwear') return currentOutfitIds.topwearId === item.id;
    if (item.category === 'bottomwear') return currentOutfitIds.bottomwearId === item.id;
    if (item.category === 'footwear') return currentOutfitIds.footwearId === item.id;
    if (item.category === 'accessories') return currentOutfitIds.accessoryId === item.id;
    return false;
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const fallbackImages: Record<CategoryType, string> = {
      topwear: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
      bottomwear: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
      footwear: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
      accessories: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    };

    const item: WardrobeItem = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      subCategory: newItemSubCategory || 'Custom Piece',
      color: newItemColor,
      colorName: newItemColorName,
      pattern: 'solid',
      weather: newItemWeather.length > 0 ? newItemWeather : ['all'],
      occasions: newItemOccasions.length > 0 ? newItemOccasions : ['casual'],
      imageUrl: newItemImageUrl || fallbackImages[newItemCategory],
      tags: ['my-closet', newItemSubCategory.toLowerCase()],
      genderTarget: newItemGenderTarget,
      isFavorite: false,
      styleDetails: {
        sleeve: newItemCategory === 'topwear' ? 'short' : undefined,
        cut: newItemCategory === 'topwear' ? 'crew' : undefined,
        bottomType: newItemCategory === 'bottomwear' ? 'trousers' : undefined,
        shoeType: newItemCategory === 'footwear' ? 'sneakers' : undefined,
        accessoryType: newItemCategory === 'accessories' ? 'bag' : undefined,
      },
    };

    onAddItem(item);
    setIsAddModalOpen(false);
    // Reset
    setNewItemName('');
    setNewItemImageUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search & Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tops, trousers, sneakers, silk, cashmere..."
            className={`w-full pl-10 pr-9 py-2.5 rounded-2xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-[#244837]/30 ${
              isLight
                ? 'bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 p-0.5 active:scale-90"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {wardrobe.length > 0 && onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-2xl text-xs font-medium border transition active:scale-95 cursor-pointer ${
                isLight
                  ? 'border-neutral-200 hover:border-neutral-400 text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-100'
                  : 'border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 bg-neutral-900 hover:bg-neutral-800'
              }`}
              title="Remove all clothes from closet"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Closet ({wardrobe.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#244837] hover:bg-[#1C382B] active:scale-95 text-white font-medium py-2.5 px-5 rounded-2xl shadow-lg shadow-[#244837]/20 text-sm transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Real Clothes</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Items', count: wardrobe.length, isFav: false },
          { id: 'favorites', label: 'Favorites', count: wardrobe.filter((i) => i.isFavorite).length, isFav: true },
          { id: 'topwear', label: 'Topwear', count: wardrobe.filter((i) => i.category === 'topwear').length, isFav: false },
          { id: 'bottomwear', label: 'Bottomwear', count: wardrobe.filter((i) => i.category === 'bottomwear').length, isFav: false },
          { id: 'footwear', label: 'Footwear', count: wardrobe.filter((i) => i.category === 'footwear').length, isFav: false },
          { id: 'accessories', label: 'Accessories', count: wardrobe.filter((i) => i.category === 'accessories').length, isFav: false },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 flex items-center gap-2 ${
              activeCategory === tab.id
                ? isLight
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-900 shadow-sm'
                : isLight
                ? 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:bg-neutral-50'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:bg-neutral-850'
            }`}
          >
            {tab.isFav && (
              <Heart
                className={`w-3 h-3 ${
                  activeCategory === 'favorites' ? 'fill-[#B38F5F] text-[#B38F5F]' : 'text-[#C5A880]'
                }`}
              />
            )}
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeCategory === tab.id
                  ? isLight
                    ? 'bg-white/20 text-white font-bold'
                    : 'bg-neutral-900/15 text-neutral-900 font-bold'
                  : isLight
                  ? 'bg-neutral-100 text-neutral-600'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Occasion Filter Tags */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-neutral-400 text-xs font-medium pl-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {(['all', 'work', 'casual', 'party', 'gym'] as const).map((occ) => (
          <button
            key={occ}
            type="button"
            onClick={() => setSelectedOccasion(occ)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] capitalize transition active:scale-95 ${
              selectedOccasion === occ
                ? 'bg-[#244837]/15 text-[#244837] dark:text-[#C5A880] border-[#244837]/40 font-semibold'
                : isLight
                ? 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300'
                : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            {occ === 'all' ? 'All Occasions' : occ}
          </button>
        ))}
      </div>

      {/* Wardrobe Grid Cards */}
      {wardrobe.length === 0 ? (
        <div
          className={`p-12 text-center rounded-3xl border ${
            isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900/50 border-neutral-800'
          }`}
        >
          <div className="w-16 h-16 rounded-3xl bg-[#244837]/10 text-[#244837] dark:text-[#C5A880] flex items-center justify-center mx-auto mb-4 border border-[#244837]/20">
            <Shirt className="w-8 h-8" />
          </div>
          <p className="text-base font-semibold">Your Wardrobe is Clean & Empty</p>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Your closet is clean with no clothes. Tap &quot;Add Real Clothes&quot; above whenever you want to add customized pieces.
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold bg-[#244837] hover:bg-[#1C382B] text-white transition active:scale-95 shadow-lg shadow-[#244837]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Piece</span>
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div
          className={`p-12 text-center rounded-3xl border ${
            isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900/50 border-neutral-800'
          }`}
        >
          <Shirt className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
          <p className="font-medium">No wardrobe items match your filter</p>
          <p className="text-xs text-neutral-400 mt-1">Try resetting the filters or add a new piece to your closet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredItems.map((item) => {
            const worn = isItemWorn(item);
            return (
              <div
                key={item.id}
                onClick={() => onTryOnItem(item)}
                className={`group cursor-pointer rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col justify-between active:scale-[0.98] ${
                  worn
                    ? 'border-[#244837] dark:border-[#C5A880] shadow-md shadow-[#244837]/15 ring-2 ring-[#244837]/40 dark:ring-[#C5A880]/30'
                    : isLight
                    ? 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-md'
                    : 'bg-neutral-900 border-neutral-800/80 hover:border-neutral-700 hover:shadow-lg'
                }`}
              >
                {/* Image & Badges Container */}
                <div className="relative aspect-[4/4.5] bg-neutral-950 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Top Gradient & Favorite Button */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                  {/* Active Worn Badge */}
                  {worn && (
                    <div className="absolute top-2.5 left-2.5 bg-[#244837] text-white text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10 border border-[#C5A880]/40">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>On Avatar</span>
                    </div>
                  )}

                  {/* Favorite Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-neutral-900/80 backdrop-blur-md flex items-center justify-center text-neutral-300 hover:text-[#C5A880] active:scale-90 transition z-10"
                    title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        item.isFavorite ? 'fill-[#B38F5F] text-[#B38F5F]' : 'text-neutral-300'
                      }`}
                    />
                  </button>

                  {/* Bottom Image Overlay Info */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md bg-neutral-900/85 backdrop-blur-md text-neutral-200 border border-neutral-700/40 text-[10px]">
                      {item.subCategory}
                    </span>
                    <div className="flex items-center gap-1.5 bg-neutral-900/85 backdrop-blur-md px-2 py-0.5 rounded-md border border-neutral-700/40">
                      <span
                        className="w-2 h-2 rounded-full border border-white/20"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[10px] text-neutral-200 truncate max-w-[70px]">
                        {item.colorName || 'Color'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Content & Action */}
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <h3
                      className={`text-xs font-semibold line-clamp-1 group-hover:text-[#244837] dark:group-hover:text-[#C5A880] transition ${
                        isLight ? 'text-neutral-900' : 'text-neutral-200'
                      }`}
                    >
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.occasions.slice(0, 2).map((occ) => (
                        <span
                          key={occ}
                          className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isLight ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {occ}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTryOnItem(item);
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center justify-center gap-1.5 ${
                        worn
                          ? 'bg-[#244837]/20 text-[#244837] dark:text-[#C5A880] border border-[#244837]/30'
                          : isLight
                          ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-[#B38F5F]" />
                      <span>{worn ? 'Applied' : 'Wear on Avatar'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                      className="w-7 h-7 rounded-xl bg-neutral-200/60 dark:bg-neutral-800/60 hover:bg-red-500/10 text-neutral-500 hover:text-red-500 flex items-center justify-center active:scale-90 transition"
                      title="Delete item"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Clothes Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#B38F5F] font-semibold">
                  Digitize Real Wardrobe
                </span>
                <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                  Add Clothing Item
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="p-6 space-y-4">
              {/* Quick Sample Presets */}
              <div className="bg-neutral-850 p-3 rounded-2xl border border-neutral-800">
                <span className="text-[11px] font-semibold text-[#B38F5F] block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Quick Add Inspiration Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    {
                      name: 'Silk Camp-Collar Shirt',
                      cat: 'topwear' as CategoryType,
                      sub: 'Shirt',
                      color: '#E2D4C9',
                      cName: 'Sand Silk',
                      img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
                    },
                    {
                      name: 'Pleated Relaxed Trousers',
                      cat: 'bottomwear' as CategoryType,
                      sub: 'Trousers',
                      color: '#26292B',
                      cName: 'Charcoal',
                      img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
                    },
                    {
                      name: 'Minimalist Leather Low-Tops',
                      cat: 'footwear' as CategoryType,
                      sub: 'Sneakers',
                      color: '#FFFFFF',
                      cName: 'Optic White',
                      img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
                    },
                    {
                      name: 'Structured Leather Crossbody',
                      cat: 'accessories' as CategoryType,
                      sub: 'Bag',
                      color: '#5C3826',
                      cName: 'Cognac',
                      img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
                    },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setNewItemName(preset.name);
                        setNewItemCategory(preset.cat);
                        setNewItemSubCategory(preset.sub);
                        setNewItemColor(preset.color);
                        setNewItemColorName(preset.cName);
                        setNewItemImageUrl(preset.img);
                      }}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 transition active:scale-95"
                    >
                      + {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['topwear', 'bottomwear', 'footwear', 'accessories'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setNewItemCategory(cat);
                        if (cat === 'topwear') setNewItemSubCategory('Shirt');
                        if (cat === 'bottomwear') setNewItemSubCategory('Trousers');
                        if (cat === 'footwear') setNewItemSubCategory('Sneakers');
                        if (cat === 'accessories') setNewItemSubCategory('Bag');
                      }}
                      className={`p-2.5 rounded-xl border text-center text-xs font-medium capitalize transition active:scale-95 ${
                        newItemCategory === cat
                          ? 'border-[#244837] bg-[#244837]/30 text-[#C5A880] font-bold'
                          : 'border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Silhouette Gender */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Fit For Profile
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'unisex', label: 'Unisex (All)' },
                    { id: 'boy', label: 'Boy Profile' },
                    { id: 'girl', label: 'Girl Profile' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setNewItemGenderTarget(g.id as any)}
                      className={`p-2 rounded-xl border text-center text-xs font-medium transition active:scale-95 ${
                        newItemGenderTarget === g.id
                          ? 'border-[#244837] bg-[#244837]/30 text-[#C5A880] font-bold'
                          : 'border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Item Name & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Linen Button-Down Shirt"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-neutral-100 focus:outline-none focus:border-[#244837]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Subcategory / Cut
                  </label>
                  <input
                    type="text"
                    value={newItemSubCategory}
                    onChange={(e) => setNewItemSubCategory(e.target.value)}
                    placeholder="e.g. Knitwear, Denim, Loafers"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-neutral-100 focus:outline-none focus:border-[#244837]"
                  />
                </div>
              </div>

              {/* Color Swatch & Color Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Primary Color Tone
                  </label>
                  <div className="flex items-center gap-3 p-2 bg-neutral-800 rounded-xl border border-neutral-700">
                    <input
                      type="color"
                      value={newItemColor}
                      onChange={(e) => setNewItemColor(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-neutral-300 uppercase">{newItemColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Color Name
                  </label>
                  <input
                    type="text"
                    value={newItemColorName}
                    onChange={(e) => setNewItemColorName(e.target.value)}
                    placeholder="e.g. Navy Blue, Olive Green"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-neutral-100 focus:outline-none focus:border-[#244837]"
                  />
                </div>
              </div>

              {/* Photo Upload or Preset */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                  Upload Clothing Photo / Image
                </label>
                <div className="border border-dashed border-neutral-700 rounded-xl p-3 text-center bg-neutral-850">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const r = new FileReader();
                        r.onload = (ev) => setNewItemImageUrl(ev.target?.result as string);
                        r.readAsDataURL(file);
                      }
                    }}
                    className="text-xs text-neutral-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#244837]/30 file:text-[#C5A880] hover:file:bg-[#244837]/50 cursor-pointer"
                  />
                  {newItemImageUrl && (
                    <div className="mt-2 flex items-center justify-center">
                      <img
                        src={newItemImageUrl}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-lg border border-neutral-700"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Occasions */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Best For Occasion
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['work', 'casual', 'party', 'gym'] as OccasionType[]).map((occ) => {
                    const active = newItemOccasions.includes(occ);
                    return (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setNewItemOccasions(newItemOccasions.filter((o) => o !== occ));
                          } else {
                            setNewItemOccasions([...newItemOccasions, occ]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs capitalize transition ${
                          active
                            ? 'bg-[#244837] text-white font-medium'
                            : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                        }`}
                      >
                        {occ}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-neutral-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#244837] hover:bg-[#1C382B] text-white font-semibold px-5 py-2 rounded-xl text-xs shadow-lg shadow-[#244837]/20 transition cursor-pointer"
                >
                  Save to Wardrobe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
