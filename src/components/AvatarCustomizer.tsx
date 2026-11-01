import React, { useState } from 'react';
import { AvatarConfig, BodyBuild, BodyHeight, HairStyle } from '../types';
import { AvatarRenderer } from './AvatarRenderer';
import {
  Upload,
  Sparkles,
  Check,
  RefreshCw,
  User,
  Sliders,
  Scissors,
  Palette,
  Lock,
  Camera,
  Trash2,
  ZoomIn,
  Move,
} from 'lucide-react';

interface AvatarCustomizerProps {
  config: AvatarConfig;
  onSave: (newConfig: AvatarConfig) => void;
  onClose?: () => void;
  isInitialOnboarding?: boolean;
  theme?: 'light' | 'dark' | 'neon';
}

const SKIN_TONES = [
  { id: '#FCE7D8', name: 'Porcelain Warm' },
  { id: '#F7D9C4', name: 'Fair Ivory' },
  { id: '#F1C6AA', name: 'Light Peach' },
  { id: '#E5B48B', name: 'Golden Beige' },
  { id: '#D69A68', name: 'Warm Honey' },
  { id: '#C68B59', name: 'Olive Neutral' },
  { id: '#BA7846', name: 'Warm Bronze' },
  { id: '#9E5B32', name: 'Rich Caramel' },
  { id: '#7D4727', name: 'Deep Espresso' },
  { id: '#5C3119', name: 'Dark Chestnut' },
  { id: '#3D2314', name: 'Rich Ebony' },
  { id: '#2B170D', name: 'Deep Obsidian' },
];

const BOY_HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: 'short-fade', label: 'Barber Fade' },
  { id: 'textured-crop', label: 'Textured Crop' },
  { id: 'casual-part', label: 'Classic Side-Part' },
  { id: 'pompadour', label: 'Styled Pompadour' },
  { id: 'buzz-cut', label: 'Military Buzz' },
  { id: 'curls-afro', label: 'High-Top Curls' },
];

const GIRL_HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: 'wavy-lob', label: 'Wavy Lob' },
  { id: 'sleek-long', label: 'Sleek Long' },
  { id: 'curls-afro', label: 'Textured Curls' },
  { id: 'pixie', label: 'Modern Pixie' },
  { id: 'casual-part', label: 'Side Parting' },
  { id: 'short-fade', label: 'Undercut Bob' },
];

const HAIR_COLORS = [
  { hex: '#1C1917', name: 'Jet Black' },
  { hex: '#3E2723', name: 'Espresso Brown' },
  { hex: '#5D4037', name: 'Chestnut Amber' },
  { hex: '#A1887F', name: 'Mushroom Brown' },
  { hex: '#C59B63', name: 'Golden Honey' },
  { hex: '#8B1E1E', name: 'Auburn Red' },
  { hex: '#A8A29E', name: 'Platinum Silver' },
];

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  config,
  onSave,
  onClose,
  isInitialOnboarding = false,
  theme = 'dark',
}) => {
  const [formData, setFormData] = useState<AvatarConfig>({
    ...config,
    shoulderWidth: config.shoulderWidth || 1.0,
    torsoScale: config.torsoScale || 1.0,
    legLength: config.legLength || 1.0,
    photoScale: config.photoScale || 1.0,
    photoOffsetY: config.photoOffsetY || 0,
    photoOffsetX: config.photoOffsetX || 0,
  });

  const [activeTab, setActiveTab] = useState<'proportions' | 'skin' | 'hair' | 'photo'>('proportions');
  const [isScanningPhoto, setIsScanningPhoto] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const isBoy = formData.gender === 'boy';
  const hairList = isBoy ? BOY_HAIR_STYLES : GIRL_HAIR_STYLES;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setIsScanningPhoto(true);
      setScanMessage('Calibrating facial oval, chin alignment & scale...');

      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          userPhoto: base64,
          photoScale: 1.05,
          photoOffsetY: 0,
          photoOffsetX: 0,
        }));
        setIsScanningPhoto(false);
        setScanMessage('Portrait locked & fitted onto avatar frame.');
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const handleRandomize = () => {
    const randomTone = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
    const randomHair = hairList[Math.floor(Math.random() * hairList.length)];
    const randomHairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
    const heights: BodyHeight[] = ['petite', 'average', 'tall', 'extra-tall'];
    const builds: BodyBuild[] = isBoy
      ? ['athletic', 'muscular', 'slim', 'regular', 'plus']
      : ['curvy', 'slim', 'athletic', 'regular', 'plus'];

    setFormData((prev) => ({
      ...prev,
      skinTone: randomTone.id,
      skinToneName: randomTone.name,
      hairStyle: randomHair.id,
      hairColor: randomHairColor.hex,
      height: heights[Math.floor(Math.random() * heights.length)],
      build: builds[Math.floor(Math.random() * builds.length)],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      hasCompletedOnboarding: true,
      genderLocked: true,
    });
  };

  const isLight = theme === 'light';
  const isNeon = theme === 'neon';

  return (
    <div
      className={`w-full max-w-2xl mx-auto rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        isLight
          ? 'bg-white border-neutral-200 text-neutral-900'
          : isNeon
          ? 'bg-neutral-950 border-cyan-500/40 text-neutral-100 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
          : 'bg-neutral-900 border-neutral-800 text-neutral-100'
      }`}
    >
      {/* Header */}
      <div
        className={`px-6 py-5 border-b flex items-center justify-between backdrop-blur-md ${
          isLight ? 'border-neutral-200 bg-neutral-50/70' : 'border-neutral-800 bg-neutral-900/60'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#B38F5F] font-semibold">
              {isInitialOnboarding ? 'Onboarding • NeoSet Twin' : 'Avatar Studio'}
            </span>
            {/* Locked Gender Badge */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                isBoy
                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                  : 'bg-[#244837]/10 text-[#244837] dark:text-[#C5A880] border-[#244837]/30'
              }`}
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Gender: {isBoy ? 'Boy (Locked)' : 'Girl (Locked)'}</span>
            </span>
          </div>
          <h2 className="text-xl font-bold font-serif tracking-tight mt-0.5">
            {isInitialOnboarding ? 'Craft Your Digital Twin' : 'Fine-Tune Avatar & Proportions'}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleRandomize}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition active:scale-95 cursor-pointer ${
            isLight
              ? 'border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700'
              : 'border-neutral-700/60 bg-neutral-800/40 hover:bg-neutral-800 text-neutral-300'
          }`}
          title="Randomize style"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Surprise Me</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Live Avatar Preview */}
          <div
            className={`md:col-span-5 rounded-2xl border p-4 flex flex-col items-center justify-center relative overflow-hidden ${
              isLight
                ? 'bg-neutral-100/70 border-neutral-200'
                : 'bg-gradient-to-b from-neutral-900 to-neutral-950 border-neutral-800'
            }`}
          >
            <AvatarRenderer
              config={formData}
              outfit={{
                topwear: null,
                bottomwear: null,
                footwear: null,
                accessory: null,
              }}
              showDetailsBadge={false}
              className="w-full max-w-[210px]"
            />
            {/* Quick summary below avatar */}
            <div className="text-center mt-3">
              <span className="text-xs font-semibold capitalize">
                {formData.userName || (isBoy ? 'Julian' : 'Elena')}
              </span>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                {formData.height} • {formData.build} • {formData.skinToneName}
              </p>
            </div>
          </div>

          {/* Right Column: Controls */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            {/* Tabs */}
            <div
              className={`flex border-b pb-1 gap-1 overflow-x-auto scrollbar-none ${
                isLight ? 'border-neutral-200' : 'border-neutral-800'
              }`}
            >
              {[
                { id: 'proportions', label: 'Proportions', icon: Sliders },
                { id: 'skin', label: 'Skin Tone', icon: Palette },
                { id: 'hair', label: isBoy ? 'Boy Hair & Beard' : 'Hairstyles', icon: Scissors },
                { id: 'photo', label: 'Photo Twin', icon: Camera },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg font-medium transition active:scale-95 shrink-0 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? isLight
                          ? 'bg-[#244837]/10 text-[#244837] border border-[#244837]/30 font-bold'
                          : 'bg-[#244837]/30 text-[#C5A880] border border-[#244837]/50 font-bold'
                        : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: BODY PROPORTIONS */}
            {activeTab === 'proportions' && (
              <div className="space-y-3.5 py-1 text-xs">
                {/* Name */}
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-sm transition focus:outline-none ${
                      isLight
                        ? 'bg-neutral-50 border border-neutral-300 text-neutral-900 focus:border-[#244837]'
                        : 'bg-neutral-800/80 border border-neutral-700 text-neutral-100 focus:border-[#C5A880]'
                    }`}
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Height Category
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'petite', label: 'Petite', desc: '< 5\'4"' },
                      { id: 'average', label: 'Average', desc: '5\'5" - 5\'8"' },
                      { id: 'tall', label: 'Tall', desc: '5\'9" - 6\'1"' },
                      { id: 'extra-tall', label: 'Tall+', desc: '6\'2"+' },
                    ].map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, height: h.id as BodyHeight })}
                        className={`p-2 rounded-xl border text-center transition ${
                          formData.height === h.id
                            ? isLight
                              ? 'bg-[#244837]/10 border-[#244837] text-[#244837] font-bold'
                              : 'bg-[#244837]/30 border-[#C5A880] text-[#C5A880] font-bold'
                            : isLight
                            ? 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                            : 'border-neutral-800 bg-neutral-800/40 hover:bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        <div className="font-semibold text-xs">{h.label}</div>
                        <div className="text-[10px] text-neutral-400">{h.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Body Build (Expanded) */}
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Body Build & Silhouette
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(isBoy
                      ? [
                          { id: 'athletic', label: 'Athletic', desc: 'V-Taper frame' },
                          { id: 'muscular', label: 'Muscular', desc: 'Broad shoulders' },
                          { id: 'slim', label: 'Slim', desc: 'Lean silhouette' },
                          { id: 'regular', label: 'Classic', desc: 'Balanced' },
                          { id: 'plus', label: 'Plus Size', desc: 'Full comfort' },
                        ]
                      : [
                          { id: 'curvy', label: 'Curvy', desc: 'Hourglass curves' },
                          { id: 'athletic', label: 'Athletic', desc: 'Toned frame' },
                          { id: 'slim', label: 'Slim', desc: 'Slender linear' },
                          { id: 'regular', label: 'Classic', desc: 'Balanced' },
                          { id: 'plus', label: 'Plus Size', desc: 'Full comfort' },
                        ]
                    ).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, build: b.id as BodyBuild })}
                        className={`p-2 rounded-xl border text-left transition ${
                          formData.build === b.id
                            ? isLight
                              ? 'bg-[#244837]/10 border-[#244837] text-[#244837] font-bold'
                              : 'bg-[#244837]/30 border-[#C5A880] text-[#C5A880] font-bold'
                            : isLight
                            ? 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                            : 'border-neutral-800 bg-neutral-800/40 hover:bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        <div className="font-semibold text-xs">{b.label}</div>
                        <div className="text-[10px] text-neutral-400">{b.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shoulder Width Slider */}
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                    <span>Shoulder Width</span>
                    <span className="font-semibold">{Math.round((formData.shoulderWidth || 1.0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.85"
                    max="1.25"
                    step="0.05"
                    value={formData.shoulderWidth || 1.0}
                    onChange={(e) =>
                      setFormData({ ...formData, shoulderWidth: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#244837] dark:accent-[#C5A880]"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: SKIN COMPLEXION */}
            {activeTab === 'skin' && (
              <div className="space-y-3 py-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                  Skin Tone (12 Inclusive Spectrum Undertones)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, skinTone: tone.id, skinToneName: tone.name })
                      }
                      className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition ${
                        formData.skinTone === tone.id
                          ? isLight
                            ? 'border-[#244837] bg-[#244837]/10 ring-1 ring-[#244837]'
                            : 'border-[#C5A880] bg-[#244837]/30 ring-1 ring-[#C5A880]'
                          : isLight
                          ? 'border-neutral-200 bg-white hover:bg-neutral-50'
                          : 'border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/20 shadow-inner shrink-0"
                        style={{ backgroundColor: tone.id }}
                      />
                      <span className="text-[11px] font-medium truncate">{tone.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: HAIR & BOY FEATURES */}
            {activeTab === 'hair' && (
              <div className="space-y-4 py-1 text-xs">
                {/* Haircut */}
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    {isBoy ? 'Boy Haircuts & Styles' : 'Hairstyles'}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {hairList.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, hairStyle: h.id })}
                        className={`p-2 rounded-xl border text-left transition ${
                          formData.hairStyle === h.id
                            ? isLight
                              ? 'bg-[#244837]/10 border-[#244837] text-[#244837] font-bold'
                              : 'bg-[#244837]/30 border-[#C5A880] text-[#C5A880] font-bold'
                            : isLight
                            ? 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                            : 'border-neutral-800 bg-neutral-800/40 hover:bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        <div className="font-semibold">{h.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Boy Facial Hair Options */}
                {isBoy && (
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Facial Hair / Grooming
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'clean', label: 'Clean Shaven' },
                        { id: 'stubble', label: "5 O'Clock Stubble" },
                        { id: 'beard', label: 'Short Trimmed Beard' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, facialHair: f.id as any })}
                          className={`p-2 rounded-xl border text-center transition ${
                            formData.facialHair === f.id
                              ? isLight
                                ? 'bg-[#244837]/10 border-[#244837] text-[#244837] font-bold'
                                : 'bg-[#244837]/30 border-[#C5A880] text-[#C5A880] font-bold'
                              : isLight
                              ? 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                              : 'border-neutral-800 bg-neutral-800/40 hover:bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          <span className="font-medium text-[11px]">{f.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hair Color */}
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Hair Pigment
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {HAIR_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setFormData({ ...formData, hairColor: c.hex })}
                        className={`w-7 h-7 rounded-full border-2 transition shrink-0 ${
                          formData.hairColor === c.hex
                            ? 'border-[#244837] dark:border-[#C5A880] scale-110 shadow-md'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PHOTO TWIN (Upload selfie & calibrate face fit) */}
            {activeTab === 'photo' && (
              <div className="space-y-4 py-1 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Upload Your Portrait / Selfie
                  </label>
                  <p className="text-[11px] text-neutral-400 mb-2">
                    Your photo will be mapped onto the avatar's face oval with realistic skin blending.
                  </p>

                  <div className="flex items-center gap-3">
                    <label
                      className={`cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium border transition ${
                        isLight
                          ? 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                          : 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                      }`}
                    >
                      <Camera className="w-4 h-4 text-[#B38F5F]" />
                      <span>{formData.userPhoto ? 'Change Photo' : 'Upload Selfie'}</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>

                    {formData.userPhoto && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, userPhoto: undefined })}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-500 border border-red-500/30 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                {isScanningPhoto && (
                  <div className="p-3 rounded-xl bg-[#244837]/10 border border-[#244837]/20 text-[#244837] dark:text-[#C5A880] text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin shrink-0" />
                    <span>{scanMessage}</span>
                  </div>
                )}

                {formData.userPhoto && (
                  <div
                    className={`p-3.5 rounded-2xl border space-y-3 ${
                      isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-850 border-neutral-800'
                    }`}
                  >
                    <div className="font-semibold text-neutral-400 uppercase tracking-wider text-[10px]">
                      Fine-Tune Photo Alignment on Head
                    </div>

                    {/* Scale */}
                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                        <span className="flex items-center gap-1">
                          <ZoomIn className="w-3 h-3" /> Face Zoom
                        </span>
                        <span>{Math.round((formData.photoScale || 1.0) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="1.4"
                        step="0.02"
                        value={formData.photoScale || 1.0}
                        onChange={(e) =>
                          setFormData({ ...formData, photoScale: parseFloat(e.target.value) })
                        }
                        className="w-full accent-[#244837] dark:accent-[#C5A880]"
                      />
                    </div>

                    {/* Vertical offset */}
                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                        <span className="flex items-center gap-1">
                          <Move className="w-3 h-3" /> Vertical Position (Up / Down)
                        </span>
                        <span>{formData.photoOffsetY || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        step="1"
                        value={formData.photoOffsetY || 0}
                        onChange={(e) =>
                          setFormData({ ...formData, photoOffsetY: parseInt(e.target.value, 10) })
                        }
                        className="w-full accent-[#244837] dark:accent-[#C5A880]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div
              className={`pt-3 border-t flex items-center justify-end gap-3 ${
                isLight ? 'border-neutral-200' : 'border-neutral-800'
              }`}
            >
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition active:scale-95"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-medium text-xs text-white bg-[#244837] hover:bg-[#1C382B] active:scale-95 transition shadow-lg shadow-[#244837]/20 flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Avatar Configuration</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
