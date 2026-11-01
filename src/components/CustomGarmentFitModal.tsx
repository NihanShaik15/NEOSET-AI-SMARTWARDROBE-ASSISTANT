import React, { useState } from 'react';
import { WardrobeItem, CategoryType } from '../types';
import {
  Upload,
  Sparkles,
  X,
  Check,
  Image as ImageIcon,
  Sliders,
  Scissors,
  Layers,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface CustomGarmentFitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEquipItem: (category: CategoryType, item: WardrobeItem) => void;
  theme?: 'light' | 'dark' | 'neon';
  isBoy?: boolean;
}

// Preset Haute-Couture PNG & Cutout Dresses for Instant 1-Click Testing
export const PRESET_PNG_DRESSES: {
  name: string;
  subCategory: string;
  color: string;
  colorName: string;
  imageUrl: string;
  dressLength: 'mini' | 'midi' | 'maxi';
  clipToSilhouette: boolean;
  imageScale: number;
  imageOffsetY: number;
  previewThumbnail: string;
}[] = [
  {
    name: 'Emerald Silk Bias-Cut Gown',
    subCategory: 'Evening Gown',
    color: '#1D3B2E',
    colorName: 'British Racing Green',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    previewThumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80',
    dressLength: 'midi',
    clipToSilhouette: false,
    imageScale: 1.0,
    imageOffsetY: 0,
  },
  {
    name: 'Noir Velvet Cocktail Dress',
    subCategory: 'Cocktail Dress',
    color: '#18181B',
    colorName: 'Midnight Velvet',
    imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80',
    previewThumbnail: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=300&q=80',
    dressLength: 'mini',
    clipToSilhouette: false,
    imageScale: 1.0,
    imageOffsetY: 0,
  },
  {
    name: 'Champagne Pleated Gala Gown',
    subCategory: 'Gala Gown',
    color: '#D4AF37',
    colorName: 'Champagne Gold',
    imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    previewThumbnail: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=300&q=80',
    dressLength: 'maxi',
    clipToSilhouette: false,
    imageScale: 1.02,
    imageOffsetY: 0,
  },
  {
    name: 'Parisian Floral Summer Dress',
    subCategory: 'Sundress',
    color: '#E8E1D5',
    colorName: 'Linen Ecru',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    previewThumbnail: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=300&q=80',
    dressLength: 'midi',
    clipToSilhouette: false,
    imageScale: 1.0,
    imageOffsetY: 0,
  },
  {
    name: 'Royal Crimson Silk Evening Gown',
    subCategory: 'Silk Gown',
    color: '#5C1D24',
    colorName: 'Crimson Wine',
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
    previewThumbnail: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=300&q=80',
    dressLength: 'maxi',
    clipToSilhouette: false,
    imageScale: 1.0,
    imageOffsetY: 0,
  },
];

export const CustomGarmentFitModal: React.FC<CustomGarmentFitModalProps> = ({
  isOpen,
  onClose,
  onEquipItem,
  theme = 'dark',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'dress' | 'topwear' | 'bottomwear' | 'footwear'>('dress');
  const [garmentName, setGarmentName] = useState('Custom Designer Dress');
  const [imageUrl, setImageUrl] = useState('');
  const [dressLength, setDressLength] = useState<'mini' | 'midi' | 'maxi'>('midi');
  const [clipToSilhouette, setClipToSilhouette] = useState(false);
  const [imageScale, setImageScale] = useState(1.0);
  const [imageOffsetY, setImageOffsetY] = useState(0);
  const [imageOffsetX, setImageOffsetX] = useState(0);
  const [garmentColor, setGarmentColor] = useState('#1D3B2E');
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
      if (file.name) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setGarmentName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_PNG_DRESSES[0]) => {
    setSelectedCategory('dress');
    setGarmentName(preset.name);
    setImageUrl(preset.imageUrl);
    setDressLength(preset.dressLength);
    setClipToSilhouette(preset.clipToSilhouette);
    setImageScale(preset.imageScale);
    setImageOffsetY(preset.imageOffsetY);
    setImageOffsetX(0);
    setGarmentColor(preset.color);
  };

  const handleApply = () => {
    const isDress = selectedCategory === 'dress';
    const category: CategoryType = isDress ? 'topwear' : selectedCategory;

    const newItem: WardrobeItem = {
      id: `custom-img-${Date.now()}`,
      name: garmentName.trim() || (isDress ? 'Haute Couture Dress' : 'Custom Garment'),
      category,
      subCategory: isDress ? 'Dress / Gown' : 'Custom Fit',
      color: garmentColor,
      colorName: 'Custom Tint',
      pattern: 'solid',
      weather: ['all'],
      occasions: ['party', 'casual', 'work'],
      genderTarget: 'unisex',
      imageUrl: imageUrl.trim() || PRESET_PNG_DRESSES[0].imageUrl,
      tags: ['custom-fit', 'png-dress', isDress ? 'dress' : 'image-clothing'],
      isFavorite: true,
      styleDetails: {
        sleeve: 'sleeveless',
        cut: isDress ? (dressLength === 'maxi' ? 'gown' : 'dress') : 'crew',
        isDress,
        dressLength: isDress ? dressLength : undefined,
        imageScale,
        imageOffsetY,
        imageOffsetX,
        clipToSilhouette,
      },
    };

    onEquipItem(category, newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-7 flex flex-col gap-6 transition-all ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900'
            : 'bg-neutral-900 border-neutral-800 text-neutral-100'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b pb-4 border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#244837]/15 text-[#244837] dark:text-[#C5A880]">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B38F5F]">
                Virtual Fit Studio
              </span>
            </div>
            <h2 className="text-xl font-bold font-serif tracking-tight">
              Fit Any Dress or Clothing Image (PNG) on Avatar
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Upload any PNG or clothing photo. Our dynamic coordinate engine fits and drapes it onto your avatar's body proportions.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset PNG Dresses Bar (1-Click Try On) */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#B38F5F]" />
            <span>Instant Haute-Couture PNG Dress Presets (Click to Load)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {PRESET_PNG_DRESSES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition group text-left cursor-pointer ${
                  imageUrl === preset.imageUrl
                    ? 'border-[#244837] dark:border-[#C5A880] ring-2 ring-[#244837]/20 bg-[#244837]/5 dark:bg-[#C5A880]/10'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50'
                }`}
              >
                <div className="w-full aspect-[3/4] rounded-xl overflow-hidden relative bg-neutral-200 dark:bg-neutral-800">
                  <img
                    src={preset.previewThumbnail}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div
                    className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: preset.color }}
                  />
                </div>
                <span className="text-[11px] font-medium truncate w-full text-center">
                  {preset.name.split(' ')[0]} {preset.name.split(' ')[1]}
                </span>
                <span className="text-[9px] text-neutral-400 capitalize -mt-1">
                  {preset.dressLength}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Upload or Image URL Input */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-[#B38F5F]" />
              <span>Upload Custom PNG / Image or Paste URL</span>
            </span>
            {imageUrl && (
              <span className="text-[10px] text-emerald-500 font-normal flex items-center gap-1">
                <Check className="w-3 h-3" /> Image Loaded
              </span>
            )}
          </label>

          {/* Drag & Drop Area */}
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer ${
              dragActive
                ? 'border-[#244837] bg-[#244837]/10'
                : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/40'
            }`}
          >
            <input
              type="file"
              id="dress-image-upload"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <label
              htmlFor="dress-image-upload"
              className="flex flex-col items-center gap-2 cursor-pointer w-full"
            >
              <div className="p-3 rounded-full bg-[#244837]/10 text-[#244837] dark:text-[#C5A880]">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold">
                  Click to select PNG dress image or drag & drop here
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Supports transparent PNGs, WebP, JPEG dress cutouts
                </p>
              </div>
            </label>
          </div>

          {/* Or Paste URL */}
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Or paste direct image URL (https://.../dress.png)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#244837]"
            />
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Configuration Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
          {/* Garment Category */}
          <div>
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1.5 block">
              Garment Classification
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'dress', label: 'Dress / Gown' },
                { id: 'topwear', label: 'Top / Jacket' },
                { id: 'bottomwear', label: 'Bottom / Skirt' },
                { id: 'footwear', label: 'Footwear' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'border-[#244837] bg-[#244837] text-white dark:border-[#C5A880] dark:bg-[#C5A880] dark:text-neutral-900'
                      : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Garment Name & Color */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1 block">
                Garment Label
              </label>
              <input
                type="text"
                value={garmentName}
                onChange={(e) => setGarmentName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#244837]"
              />
            </div>

            {selectedCategory === 'dress' && (
              <div>
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1 block">
                  Dress Length
                </label>
                <div className="flex gap-1.5">
                  {(['mini', 'midi', 'maxi'] as const).map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setDressLength(len)}
                      className={`flex-1 py-1 rounded-lg text-xs font-medium border capitalize cursor-pointer ${
                        dressLength === len
                          ? 'border-[#244837] bg-[#244837] text-white dark:border-[#C5A880] dark:bg-[#C5A880] dark:text-neutral-900'
                          : 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Fit & Scale Fine-Tuning Controls */}
        <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#B38F5F]" />
              <span>Fitting & Drape Calibrator</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setImageScale(1.0);
                setImageOffsetY(0);
                setImageOffsetX(0);
                setClipToSilhouette(false);
              }}
              className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Calibration</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Scale Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                <span>Scale / Zoom</span>
                <span className="font-mono">{Math.round(imageScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.4"
                step="0.02"
                value={imageScale}
                onChange={(e) => setImageScale(parseFloat(e.target.value))}
                className="w-full accent-[#244837] dark:accent-[#C5A880] cursor-pointer"
              />
            </div>

            {/* Vertical Y-Offset Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                <span>Vertical Position (Y)</span>
                <span className="font-mono">{imageOffsetY}px</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                step="1"
                value={imageOffsetY}
                onChange={(e) => setImageOffsetY(parseInt(e.target.value))}
                className="w-full accent-[#244837] dark:accent-[#C5A880] cursor-pointer"
              />
            </div>

            {/* Horizontal X-Offset Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                <span>Horizontal Position (X)</span>
                <span className="font-mono">{imageOffsetX}px</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={imageOffsetX}
                onChange={(e) => setImageOffsetX(parseInt(e.target.value))}
                className="w-full accent-[#244837] dark:accent-[#C5A880] cursor-pointer"
              />
            </div>
          </div>

          {/* Silhouette Clipping Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700/60">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#B38F5F]" />
              <div>
                <span className="text-xs font-medium block">Clip to Anatomical Silhouette Mask</span>
                <span className="text-[10px] text-neutral-400">
                  {clipToSilhouette
                    ? 'Clips image precisely inside avatar dress contour'
                    : 'Natural transparent overlay (recommended for clean PNGs)'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setClipToSilhouette(!clipToSilhouette)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                clipToSilhouette
                  ? 'bg-[#244837] text-white dark:bg-[#C5A880] dark:text-neutral-900'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {clipToSilhouette ? 'Silhouette Mask ON' : 'Natural Drape (PNG)'}
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#244837] hover:bg-[#1C382B] active:scale-95 text-white text-xs font-semibold shadow-lg shadow-[#244837]/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fit on Avatar Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
