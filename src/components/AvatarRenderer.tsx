import React from 'react';
import { AvatarConfig, WardrobeItem } from '../types';

export const isDressItem = (item?: WardrobeItem | null): boolean => {
  if (!item) return false;
  if (item.styleDetails?.isDress) return true;
  if (item.styleDetails?.cut === 'dress' || item.styleDetails?.cut === 'gown') return true;
  const name = (item.name || '').toLowerCase();
  const sub = (item.subCategory || '').toLowerCase();
  const tags = (item.tags || []).map((t) => t.toLowerCase());
  return (
    name.includes('dress') ||
    name.includes('gown') ||
    name.includes('sundress') ||
    name.includes('slip dress') ||
    name.includes('one-piece') ||
    name.includes('jumpsuit') ||
    name.includes('romper') ||
    sub.includes('dress') ||
    sub.includes('gown') ||
    sub.includes('one-piece') ||
    tags.includes('dress') ||
    tags.includes('gown')
  );
};

export interface GarmentFitOverrides {
  dressScale?: number;
  dressOffsetY?: number;
  dressOffsetX?: number;
  dressClipMode?: 'natural' | 'silhouette';
  dressLength?: 'mini' | 'midi' | 'maxi';
  topScale?: number;
  topOffsetY?: number;
  topOffsetX?: number;
  bottomScale?: number;
  bottomOffsetY?: number;
  bottomOffsetX?: number;
}

interface AvatarRendererProps {
  config: AvatarConfig;
  outfit: {
    topwear?: WardrobeItem | null;
    bottomwear?: WardrobeItem | null;
    footwear?: WardrobeItem | null;
    accessory?: WardrobeItem | null;
  };
  className?: string;
  showShadow?: boolean;
  showDetailsBadge?: boolean;
  highlightCategory?: string | null;
  interactive?: boolean;
  renderGarmentImages?: boolean;
  garmentFitOverrides?: GarmentFitOverrides;
  onSelectSlot?: (category: 'topwear' | 'bottomwear' | 'footwear' | 'accessories') => void;
  onSwipeSlot?: (category: 'topwear' | 'bottomwear' | 'footwear', direction: 'prev' | 'next') => void;
}

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  config,
  outfit,
  className = '',
  showShadow = true,
  showDetailsBadge = false,
  highlightCategory = null,
  interactive = false,
  renderGarmentImages = true,
  garmentFitOverrides,
  onSelectSlot,
  onSwipeSlot,
}) => {
  const {
    skinTone,
    height,
    build,
    hairStyle,
    hairColor,
    gender = 'boy',
    facialHair = 'clean',
    userPhoto,
    photoScale = 1.0,
    photoOffsetY = 0,
    photoOffsetX = 0,
  } = config;

  const isBoy = gender === 'boy';

  // Height scaling
  const heightScale =
    height === 'extra-tall' ? 1.09 : height === 'tall' ? 1.05 : height === 'petite' ? 0.93 : 1.0;

  // Build & proportion modifiers
  const shoulderMultiplier =
    build === 'muscular'
      ? 1.25
      : build === 'athletic'
      ? 1.16
      : build === 'slim'
      ? 0.88
      : build === 'curvy'
      ? 0.96
      : build === 'plus'
      ? 1.12
      : 1.02;

  const waistMultiplier =
    build === 'slim'
      ? 0.84
      : build === 'athletic'
      ? 0.9
      : build === 'muscular'
      ? 0.95
      : build === 'curvy'
      ? 0.8
      : build === 'plus'
      ? 1.22
      : 1.0;

  const hipMultiplier =
    build === 'curvy'
      ? 1.26
      : build === 'plus'
      ? 1.24
      : build === 'slim'
      ? 0.86
      : build === 'athletic'
      ? 0.96
      : build === 'muscular'
      ? 0.98
      : 1.02;

  const limbThickness =
    build === 'muscular'
      ? 1.2
      : build === 'athletic'
      ? 1.12
      : build === 'slim'
      ? 0.86
      : build === 'plus'
      ? 1.22
      : 1.0;

  // Anchor Y coordinates
  const headY = 66;
  const neckY = 88;
  const shoulderY = 112;
  const chestY = 150;
  const waistY = 195;
  const hipY = 244;
  const crotchY = 266;
  const kneeY = 356;
  const ankleY = 458;
  const groundY = 484;

  // Width calculations based on gender & build
  const customShoulder = config.shoulderWidth || 1.0;
  const baseShoulder = isBoy ? 43 : 36;
  const shoulderHalfW = baseShoulder * shoulderMultiplier * customShoulder;

  const chestHalfW = (isBoy ? 35 : 30) * shoulderMultiplier;
  const waistHalfW = (isBoy ? 27 : 22) * waistMultiplier;
  const hipHalfW = (isBoy ? 29 : 35) * hipMultiplier;

  const thighHalfW = (isBoy ? 14.5 : 15) * limbThickness;
  const calfHalfW = 11 * limbThickness;

  const leftArmX = 150 - shoulderHalfW;
  const rightArmX = 150 + shoulderHalfW;

  const { topwear, bottomwear, footwear, accessory } = outfit;

  // Touch swipe support on the avatar directly
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !onSwipeSlot) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Minimum swipe threshold
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      // Determine vertical zone:
      // Avatar container height is roughly 520px
      const rect = e.currentTarget.getBoundingClientRect();
      const relativeY = t.clientY - rect.top;
      const heightPercent = relativeY / rect.height;

      const direction = dx < 0 ? 'next' : 'prev';

      if (heightPercent < 0.48) {
        onSwipeSlot('topwear', direction);
      } else if (heightPercent < 0.85) {
        onSwipeSlot('bottomwear', direction);
      } else {
        onSwipeSlot('footwear', direction);
      }
    }
  };

  const isWearingDress = isDressItem(topwear);
  const dressLength = garmentFitOverrides?.dressLength ?? topwear?.styleDetails?.dressLength ?? 'midi';
  const dressHemY = dressLength === 'maxi' ? ankleY - 14 : dressLength === 'mini' ? crotchY + 48 : kneeY + 22;
  const dressHemFlare = dressLength === 'maxi' ? hipHalfW + 28 : dressLength === 'mini' ? hipHalfW + 12 : hipHalfW + 20;

  // Garment Fit Overrides & Live Fine-Tuning
  const dressScale = garmentFitOverrides?.dressScale ?? topwear?.styleDetails?.imageScale ?? 1.0;
  const dressOffsetY = garmentFitOverrides?.dressOffsetY ?? topwear?.styleDetails?.imageOffsetY ?? 0;
  const dressOffsetX = garmentFitOverrides?.dressOffsetX ?? topwear?.styleDetails?.imageOffsetX ?? 0;
  const dressClipMode = garmentFitOverrides?.dressClipMode ?? (topwear?.styleDetails?.clipToSilhouette ? 'silhouette' : 'natural');

  const topScale = garmentFitOverrides?.topScale ?? topwear?.styleDetails?.imageScale ?? 1.0;
  const topOffsetY = garmentFitOverrides?.topOffsetY ?? topwear?.styleDetails?.imageOffsetY ?? 0;
  const topOffsetX = garmentFitOverrides?.topOffsetX ?? topwear?.styleDetails?.imageOffsetX ?? 0;

  const botScale = garmentFitOverrides?.bottomScale ?? bottomwear?.styleDetails?.imageScale ?? 1.0;
  const botOffsetY = garmentFitOverrides?.bottomOffsetY ?? bottomwear?.styleDetails?.imageOffsetY ?? 0;
  const botOffsetX = garmentFitOverrides?.bottomOffsetX ?? bottomwear?.styleDetails?.imageOffsetX ?? 0;

  // Tailored Dress Silhouette Path (for vector rendering & clipPath)
  const dressSilhouettePath = `M${150 - shoulderHalfW * 0.72} ${shoulderY - 3} 
    Q150 ${neckY + 16}, ${150 + shoulderHalfW * 0.72} ${shoulderY - 3} 
    L${rightArmX - 2} ${shoulderY + 2} 
    C${150 + chestHalfW + 1} ${chestY}, ${150 + waistHalfW + 2} ${waistY}, ${150 + hipHalfW + 4} ${hipY} 
    C${150 + hipHalfW + 8} ${crotchY + 30}, ${150 + dressHemFlare} ${dressHemY - 20}, ${150 + dressHemFlare} ${dressHemY} 
    Q150 ${dressHemY + 12}, ${150 - dressHemFlare} ${dressHemY} 
    C${150 - dressHemFlare} ${dressHemY - 20}, ${150 - hipHalfW - 8} ${crotchY + 30}, ${150 - hipHalfW - 4} ${hipY} 
    C${150 - waistHalfW - 2} ${waistY}, ${150 - chestHalfW - 1} ${chestY}, ${leftArmX + 2} ${shoulderY + 2} Z`;

  // Standard Torso Silhouette Path (for topwear clipping)
  const torsoSilhouettePath = `M${leftArmX - 4} ${shoulderY - 2} 
    L136 ${neckY + 6} Q150 ${neckY + 12}, 164 ${neckY + 6} L${rightArmX + 4} ${shoulderY - 2} 
    C${rightArmX + 8} ${chestY}, ${150 + waistHalfW + 5} ${waistY}, ${150 + waistHalfW + 4} ${waistY + 22} 
    L${150 - waistHalfW - 4} ${waistY + 22} 
    C${150 - waistHalfW - 5} ${waistY}, ${leftArmX - 8} ${chestY}, ${leftArmX - 4} ${shoulderY - 2} Z`;

  // Standard Bottomwear Silhouette Path (for pants clipping)
  const bottomSilhouettePath = `M${150 - waistHalfW - 2} ${waistY + 12} 
    C${150 - hipHalfW - 3} ${hipY}, ${150 - thighHalfW - 6} ${kneeY}, 128 ${ankleY + 3} 
    L144 ${ankleY + 3} 
    C150 ${kneeY + 20}, 150 ${crotchY + 6}, 150 ${crotchY + 10} 
    C150 ${crotchY + 6}, 150 ${kneeY + 20}, 156 ${ankleY + 3} 
    L172 ${ankleY + 3} 
    C${150 + thighHalfW + 6} ${kneeY}, ${150 + hipHalfW + 3} ${hipY}, ${150 + waistHalfW + 2} ${waistY + 12} Z`;

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <svg
        viewBox="0 0 300 520"
        className="w-full h-full max-h-[520px] transition-all duration-300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Natural Human Skin Lighting Gradient */}
          <linearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={skinTone} />
            <stop offset="70%" stopColor={skinTone} />
            <stop offset="100%" stopColor={skinTone} stopOpacity="0.88" />
          </linearGradient>

          {/* Subsurface anatomical shade */}
          <linearGradient id="torsoShadowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="50%" stopColor="rgba(0,0,0,0.06)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.14)" />
          </linearGradient>

          {/* Underwear base gradient */}
          <linearGradient id="underwearGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2A2D34" />
            <stop offset="100%" stopColor="#1B1C20" />
          </linearGradient>

          {/* Athletic Ribbed Tank Top Gradient (Boy) */}
          <linearGradient id="boyTankGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="60%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Athletic Boxer Briefs Gradient (Boy) */}
          <linearGradient id="boyBoxerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Boxer Elastic Waistband Gradient (Boy) */}
          <linearGradient id="boyWaistbandGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Floor Ambient Radial Shadow */}
          <radialGradient id="platformShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.22)" />
            <stop offset="60%" stopColor="rgba(0,0,0,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          {/* Oval Clip Path for Human Face & Photo Fit */}
          <clipPath id="avatarPhotoFaceClip">
            <ellipse cx="150" cy={headY} rx="18.5" ry="22.5" />
          </clipPath>

          {/* Tailored Dress Silhouette Clip Path */}
          <clipPath id="avatarDressSilhouetteClip">
            <path d={dressSilhouettePath} />
          </clipPath>

          {/* Torso Garment Clip Path */}
          <clipPath id="avatarTorsoClip">
            <path d={torsoSilhouettePath} />
          </clipPath>

          {/* Bottomwear Pants Clip Path */}
          <clipPath id="avatarBottomClip">
            <path d={bottomSilhouettePath} />
          </clipPath>
        </defs>

        {/* Floor Shadow */}
        {showShadow && (
          <ellipse
            cx="150"
            cy={groundY + 12}
            rx={isBoy ? 78 : 72}
            ry="13"
            fill="url(#platformShadow)"
          />
        )}

        {/* ================= BACKGROUND LONG HAIR ================= */}
        {(!userPhoto || hairStyle === 'sleek-long' || hairStyle === 'wavy-lob') &&
          (hairStyle === 'sleek-long' || hairStyle === 'wavy-lob') && (
            <path
              d={
                hairStyle === 'sleek-long'
                  ? `M120 ${headY + 10} C112 110, 108 190, 118 230 C128 235, 134 220, 136 170 C136 130, 140 100, 142 80 L158 80 C160 100, 164 130, 164 170 C166 220, 172 235, 182 230 C192 190, 188 110, 180 ${headY + 10} Z`
                  : `M122 ${headY + 10} C114 110, 110 160, 120 185 C128 188, 134 175, 136 150 C136 120, 140 95, 142 80 L158 80 C160 95, 164 120, 164 150 C166 175, 172 188, 180 185 C190 160, 186 110, 178 ${headY + 10} Z`
              }
              fill={hairColor}
            />
          )}

        {/* ================= BASE HUMAN ANATOMY ================= */}
        {/* Realistic Human Neck */}
        <path
          d={
            isBoy
              ? `M139 ${neckY} L138 ${shoulderY - 2} C144 ${shoulderY + 2}, 156 ${shoulderY + 2}, 162 ${shoulderY - 2} L161 ${neckY} Z`
              : `M142 ${neckY} L141 ${shoulderY} C146 ${shoulderY + 3}, 154 ${shoulderY + 3}, 159 ${shoulderY} L158 ${neckY} Z`
          }
          fill="url(#skinGrad)"
        />

        {/* Left & Right Legs (Anatomical Curves) */}
        {/* Left Leg */}
        <path
          d={`M${150 - hipHalfW * 0.7} ${crotchY} 
             Q${148 - thighHalfW} ${kneeY - 30}, ${145 - calfHalfW} ${kneeY} 
             Q${142 - calfHalfW} ${ankleY - 20}, 132 ${ankleY} 
             L141 ${ankleY} 
             Q149 ${ankleY - 20}, ${150 + calfHalfW * 0.25} ${kneeY} 
             Q152 ${kneeY - 30}, 150 ${crotchY} Z`}
          fill="url(#skinGrad)"
        />
        {/* Right Leg */}
        <path
          d={`M150 ${crotchY} 
             Q148 ${kneeY - 30}, ${150 - calfHalfW * 0.25} ${kneeY} 
             Q${151} ${ankleY - 20}, 159 ${ankleY} 
             L168 ${ankleY} 
             Q${158 + calfHalfW} ${ankleY - 20}, ${155 + calfHalfW} ${kneeY} 
             Q${152 + thighHalfW} ${kneeY - 30}, ${150 + hipHalfW * 0.7} ${crotchY} Z`}
          fill="url(#skinGrad)"
        />

        {/* Patella (Knee highlight) */}
        <ellipse cx="140" cy={kneeY} rx="3" ry="4" fill="rgba(255,255,255,0.08)" />
        <ellipse cx="160" cy={kneeY} rx="3" ry="4" fill="rgba(255,255,255,0.08)" />

        {/* Torso & Pelvis (Anatomical Human Contour) */}
        <path
          d={
            isBoy
              ? `M${leftArmX} ${shoulderY} 
                 C${150 - chestHalfW} ${chestY}, ${150 - waistHalfW} ${waistY}, ${150 - hipHalfW} ${hipY} 
                 L${150 - hipHalfW * 0.8} ${crotchY + 4} 
                 Q150 ${crotchY + 12}, ${150 + hipHalfW * 0.8} ${crotchY + 4} 
                 L${150 + hipHalfW} ${hipY} 
                 C${150 + waistHalfW} ${waistY}, ${150 + chestHalfW} ${chestY}, ${rightArmX} ${shoulderY} 
                 C165 ${shoulderY - 7}, 135 ${shoulderY - 7}, ${leftArmX} ${shoulderY} Z`
              : `M${leftArmX} ${shoulderY} 
                 C${150 - chestHalfW} ${chestY}, ${150 - waistHalfW} ${waistY}, ${150 - hipHalfW} ${hipY} 
                 L${150 - hipHalfW * 0.8} ${crotchY + 4} 
                 Q150 ${crotchY + 14}, ${150 + hipHalfW * 0.8} ${crotchY + 4} 
                 L${150 + hipHalfW} ${hipY} 
                 C${150 + waistHalfW} ${waistY}, ${150 + chestHalfW} ${chestY}, ${rightArmX} ${shoulderY} 
                 C163 ${shoulderY - 4}, 137 ${shoulderY - 4}, ${leftArmX} ${shoulderY} Z`
          }
          fill="url(#skinGrad)"
        />

        {/* Boy Athletic Pectorals or Girl Bust Contours */}
        {isBoy ? (
          <g opacity="0.18">
            <path d="M136 142 Q144 148, 149 146" stroke="#000" strokeWidth="1.2" fill="none" />
            <path d="M164 142 Q156 148, 151 146" stroke="#000" strokeWidth="1.2" fill="none" />
            <line x1="150" y1="130" x2="150" y2="175" stroke="#000" strokeWidth="0.8" />
          </g>
        ) : (
          <g opacity="0.15">
            <path d="M137 146 Q144 154, 150 152 Q156 154, 163 146" stroke="#000" strokeWidth="1.2" fill="none" />
          </g>
        )}

        {/* Clavicle / Collarbone */}
        <path
          d={
            isBoy
              ? 'M133 115 Q143 118, 150 117 Q157 118, 167 115'
              : 'M137 116 Q144 119, 150 118 Q156 119, 163 116'
          }
          stroke="rgba(0, 0, 0, 0.14)"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Undergarment Layer (Athletic Tank Top & Boxers for Boy, Cami & Boyshorts for Girl) */}
        {!topwear && (
          isBoy ? (
            // Boy: Athletic Ribbed Tank Top / Singlet (Undershirt)
            <g id="boy-base-tanktop">
              {/* Tank Top Body */}
              <path
                d={`M139 ${shoulderY - 2} 
                   Q150 ${shoulderY + 18}, 161 ${shoulderY - 2} 
                   L165 ${shoulderY - 1} 
                   Q${150 + chestHalfW - 3} ${chestY - 8}, ${150 + chestHalfW - 1} ${chestY + 4} 
                   C${150 + waistHalfW + 1} ${waistY}, ${150 + waistHalfW + 1} ${waistY + 16}, ${150 + waistHalfW} ${waistY + 20} 
                   L${150 - waistHalfW} ${waistY + 20} 
                   C${150 - waistHalfW - 1} ${waistY + 16}, ${150 - waistHalfW - 1} ${waistY}, ${150 - chestHalfW + 1} ${chestY + 4} 
                   Q${150 - chestHalfW + 3} ${chestY - 8}, 135 ${shoulderY - 1} Z`}
                fill="url(#boyTankGrad)"
                stroke="rgba(0,0,0,0.18)"
                strokeWidth="0.8"
              />
              {/* Ribbed Neckline scoop trim */}
              <path
                d={`M138 ${shoulderY - 2} Q150 ${shoulderY + 18}, 162 ${shoulderY - 2}`}
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="1.3"
                fill="none"
              />
              {/* Armhole trims */}
              <path
                d={`M135 ${shoulderY - 1} Q${150 - chestHalfW + 3} ${chestY - 8}, ${150 - chestHalfW + 1} ${chestY + 4}`}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.2"
                fill="none"
              />
              <path
                d={`M165 ${shoulderY - 1} Q${150 + chestHalfW - 3} ${chestY - 8}, ${150 + chestHalfW - 1} ${chestY + 4}`}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.2"
                fill="none"
              />
              {/* Subtle athletic ribbing texture lines */}
              <g opacity="0.14">
                <line x1="144" y1={chestY - 4} x2="144" y2={waistY + 18} stroke="#334155" strokeWidth="0.7" strokeDasharray="2 3" />
                <line x1="147" y1={chestY} x2="147" y2={waistY + 18} stroke="#334155" strokeWidth="0.7" strokeDasharray="2 3" />
                <line x1="150" y1={chestY + 2} x2="150" y2={waistY + 18} stroke="#334155" strokeWidth="0.7" strokeDasharray="2 3" />
                <line x1="153" y1={chestY} x2="153" y2={waistY + 18} stroke="#334155" strokeWidth="0.7" strokeDasharray="2 3" />
                <line x1="156" y1={chestY - 4} x2="156" y2={waistY + 18} stroke="#334155" strokeWidth="0.7" strokeDasharray="2 3" />
              </g>
            </g>
          ) : (
            // Girl: Seamless Bralette / Camisole
            <g id="girl-base-top">
              <path
                d={`M142 ${shoulderY} 
                   L144 ${shoulderY} 
                   L146 ${chestY - 6} 
                   Q150 ${chestY - 2}, 154 ${chestY - 6} 
                   L156 ${shoulderY} 
                   L158 ${shoulderY} 
                   L157 ${chestY - 6} 
                   Q${150 + chestHalfW} ${chestY - 4}, ${150 + chestHalfW - 1} ${chestY + 8} 
                   L${150 + chestHalfW - 2} ${chestY + 16} 
                   Q150 ${chestY + 20}, ${150 - chestHalfW + 2} ${chestY + 16} 
                   L${150 - chestHalfW + 1} ${chestY + 8} 
                   Q${150 - chestHalfW} ${chestY - 4}, 143 ${chestY - 6} Z`}
                fill="url(#underwearGrad)"
                opacity="0.9"
              />
              <line x1={150 - chestHalfW + 2} y1={chestY + 16} x2={150 + chestHalfW - 2} y2={chestY + 16} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </g>
          )
        )}

        {!bottomwear && (
          isBoy ? (
            // Boy: Modern Athletic Boxer Briefs
            <g id="boy-base-boxers">
              {/* Boxers Body extending down to mid-thigh */}
              <path
                d={`M${150 - waistHalfW - 1} ${waistY + 14} 
                   C${150 - hipHalfW - 2} ${hipY}, ${150 - hipHalfW - 1} ${crotchY + 14}, ${150 - hipHalfW} ${crotchY + 26} 
                   L147 ${crotchY + 26} 
                   L150 ${crotchY + 7} 
                   L153 ${crotchY + 26} 
                   L${150 + hipHalfW} ${crotchY + 26} 
                   C${150 + hipHalfW + 1} ${crotchY + 14}, ${150 + hipHalfW + 2} ${hipY}, ${150 + waistHalfW + 1} ${waistY + 14} Z`}
                fill="url(#boyBoxerGrad)"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth="0.8"
              />
              {/* Elastic Waistband */}
              <rect
                x={150 - waistHalfW - 1.5}
                y={waistY + 14}
                width={(waistHalfW + 1.5) * 2}
                height="8.5"
                rx="1.5"
                fill="url(#boyWaistbandGrad)"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="0.5"
              />
              {/* Waistband center accent logo patch */}
              <rect
                x="146.5"
                y={waistY + 16}
                width="7"
                height="4.5"
                rx="1"
                fill="rgba(255,255,255,0.25)"
              />
              {/* Center Fly Seam Contour */}
              <path
                d={`M148 ${waistY + 22.5} Q147 ${crotchY}, 150 ${crotchY + 7}`}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.1"
                fill="none"
              />
              {/* Leg opening hem trims */}
              <line
                x1={150 - hipHalfW}
                y1={crotchY + 26}
                x2="147"
                y2={crotchY + 26}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.2"
              />
              <line
                x1="153"
                y1={crotchY + 26}
                x2={150 + hipHalfW}
                y2={crotchY + 26}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.2"
              />
            </g>
          ) : (
            // Girl: Seamless Boyshorts / Hipster Briefs
            <g id="girl-base-bottoms">
              <path
                d={`M${150 - hipHalfW + 2} ${waistY + 20} 
                   C${150 - hipHalfW} ${hipY}, ${150 - hipHalfW * 0.7} ${crotchY + 8}, 150 ${crotchY + 12} 
                   C${150 + hipHalfW * 0.7} ${crotchY + 8}, ${150 + hipHalfW} ${hipY}, ${150 + hipHalfW - 2} ${waistY + 20} Z`}
                fill="url(#underwearGrad)"
                opacity="0.9"
              />
              {/* Soft waistband */}
              <rect
                x={150 - hipHalfW + 2}
                y={waistY + 20}
                width={(hipHalfW - 2) * 2}
                height="4"
                rx="1"
                fill="rgba(255,255,255,0.1)"
              />
            </g>
          )
        )}

        {/* Arms & Anatomical Hands */}
        {/* Left Arm: Deltoid -> Bicep -> Forearm -> Wrist */}
        <path
          d={`M${leftArmX - 2} ${shoulderY + 2} 
             C${leftArmX - 8 * limbThickness} ${chestY}, ${leftArmX - 10 * limbThickness} ${waistY}, 117 262 
             L125 262 
             C${leftArmX + 1} ${waistY}, ${leftArmX + 3} ${chestY}, ${leftArmX + 9} ${shoulderY + 6} Z`}
          fill="url(#skinGrad)"
        />
        {/* Left Hand with Thumb Silhouette */}
        <path
          d="M118 262 Q115 272, 118 276 Q122 278, 124 274 L125 262 Z"
          fill="url(#skinGrad)"
        />

        {/* Right Arm */}
        <path
          d={`M${rightArmX + 2} ${shoulderY + 2} 
             C${rightArmX + 8 * limbThickness} ${chestY}, ${rightArmX + 10 * limbThickness} ${waistY}, 183 262 
             L175 262 
             C${rightArmX - 1} ${waistY}, ${rightArmX - 3} ${chestY}, ${rightArmX - 9} ${shoulderY + 6} Z`}
          fill="url(#skinGrad)"
        />
        {/* Right Hand */}
        <path
          d="M182 262 Q185 272, 182 276 Q178 278, 176 274 L175 262 Z"
          fill="url(#skinGrad)"
        />

        {/* ================= CLOTHING LAYER 1: BOTTOMWEAR ================= */}
        {bottomwear && !isWearingDress && (
          <g
            id="bottomwear-layer"
            className={`transition-all duration-300 ${interactive ? 'cursor-pointer hover:opacity-95' : ''}`}
            onClick={() => onSelectSlot && onSelectSlot('bottomwear')}
          >
            {highlightCategory === 'bottomwear' && (
              <path
                d={`M${150 - hipHalfW - 6} ${waistY + 12} L${150 - hipHalfW - 8} ${ankleY + 4} L${150 + hipHalfW + 8} ${ankleY + 4} L${150 + hipHalfW + 6} ${waistY + 12} Z`}
                stroke="#E11D48"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="none"
              />
            )}

            {bottomwear.styleDetails?.bottomType === 'boxers' || bottomwear.styleDetails?.bottomType === 'shorts' || bottomwear.subCategory?.toLowerCase().includes('boxer') ? (
              // Boxer Shorts / Fitted Lounge Boxers
              <g>
                <path
                  d={`M${150 - waistHalfW - 1} ${waistY + 12} 
                     C${150 - hipHalfW - 2} ${hipY}, ${150 - hipHalfW - 1} ${crotchY + 14}, ${150 - hipHalfW} ${crotchY + 28} 
                     L147 ${crotchY + 28} 
                     L150 ${crotchY + 8} 
                     L153 ${crotchY + 28} 
                     L${150 + hipHalfW} ${crotchY + 28} 
                     C${150 + hipHalfW + 1} ${crotchY + 14}, ${150 + hipHalfW + 2} ${hipY}, ${150 + waistHalfW + 1} ${waistY + 12} Z`}
                  fill={bottomwear.color}
                  stroke="rgba(0,0,0,0.22)"
                  strokeWidth="0.8"
                />
                {/* Elastic Waistband */}
                <rect x={150 - waistHalfW - 1.5} y={waistY + 12} width={(waistHalfW + 1.5) * 2} height="8.5" rx="1.5" fill="rgba(0,0,0,0.2)" />
                {/* Center front fly contour / seam */}
                <path d={`M148 ${waistY + 20.5} Q147 ${crotchY}, 150 ${crotchY + 8}`} stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />
                {/* Hem lines */}
                <line x1={150 - hipHalfW} y1={crotchY + 28} x2="147" y2={crotchY + 28} stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" />
                <line x1="153" y1={crotchY + 28} x2={150 + hipHalfW} y2={crotchY + 28} stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" />
              </g>
            ) : bottomwear.styleDetails?.bottomType === 'skirt' ? (
              // Flowing Skirt
              <path
                d={`M${150 - waistHalfW - 2} ${waistY + 10} 
                   C${150 - hipHalfW - 4} ${hipY}, ${150 - hipHalfW - 18} ${kneeY - 10}, ${150 - hipHalfW - 24} ${kneeY + 25} 
                   Q150 ${kneeY + 36}, ${150 + hipHalfW + 24} ${kneeY + 25} 
                   C${150 + hipHalfW + 18} ${kneeY - 10}, ${150 + hipHalfW + 4} ${hipY}, ${150 + waistHalfW + 2} ${waistY + 10} Z`}
                fill={bottomwear.color}
                stroke="rgba(0,0,0,0.18)"
                strokeWidth="0.8"
              />
            ) : bottomwear.styleDetails?.bottomType === 'cargos' ? (
              // Utility Cargo Pants (Tactical Side Pockets for Boys)
              <g>
                <path
                  d={`M${150 - waistHalfW - 2} ${waistY + 12} 
                     C${150 - hipHalfW - 3} ${hipY}, ${150 - thighHalfW - 6} ${kneeY}, 128 ${ankleY - 2} 
                     L144 ${ankleY - 2} 
                     C150 ${kneeY + 20}, 150 ${crotchY + 6}, 150 ${crotchY + 10} 
                     C150 ${crotchY + 6}, 150 ${kneeY + 20}, 156 ${ankleY - 2} 
                     L172 ${ankleY - 2} 
                     C${150 + thighHalfW + 6} ${kneeY}, ${150 + hipHalfW + 3} ${hipY}, ${150 + waistHalfW + 2} ${waistY + 12} Z`}
                  fill={bottomwear.color}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.8"
                />
                {/* Cargo Flap Pockets on Thighs */}
                <rect x="119" y={kneeY - 32} width="14" height="18" rx="2" fill="rgba(0,0,0,0.22)" />
                <rect x="167" y={kneeY - 32} width="14" height="18" rx="2" fill="rgba(0,0,0,0.22)" />
              </g>
            ) : bottomwear.styleDetails?.bottomType === 'joggers' ? (
              // Cuffed Joggers
              <g>
                <path
                  d={`M${150 - waistHalfW - 2} ${waistY + 12} 
                     C${150 - hipHalfW - 3} ${hipY}, ${150 - thighHalfW - 6} ${kneeY}, 130 ${ankleY - 8} 
                     L142 ${ankleY - 8} 
                     C150 ${kneeY + 20}, 150 ${crotchY + 6}, 150 ${crotchY + 10} 
                     C150 ${crotchY + 6}, 150 ${kneeY + 20}, 158 ${ankleY - 8} 
                     L170 ${ankleY - 8} 
                     C${150 + thighHalfW + 6} ${kneeY}, ${150 + hipHalfW + 3} ${hipY}, ${150 + waistHalfW + 2} ${waistY + 12} Z`}
                  fill={bottomwear.color}
                  stroke="rgba(0,0,0,0.18)"
                  strokeWidth="0.8"
                />
                <rect x="130" y={ankleY - 8} width="12" height="7" rx="1.5" fill="rgba(0,0,0,0.25)" />
                <rect x="158" y={ankleY - 8} width="12" height="7" rx="1.5" fill="rgba(0,0,0,0.25)" />
              </g>
            ) : bottomwear.styleDetails?.bottomType === 'jeans' ? (
              // Denim Jeans with contrast stitching
              <g>
                <path
                  d={`M${150 - waistHalfW - 1} ${waistY + 14} 
                     C${150 - hipHalfW - 2} ${hipY}, ${150 - thighHalfW - 4} ${kneeY}, 130 ${ankleY} 
                     L143 ${ankleY} 
                     C150 ${kneeY + 25}, 150 ${crotchY + 5}, 150 ${crotchY + 8} 
                     C150 ${crotchY + 5}, 150 ${kneeY + 25}, 157 ${ankleY} 
                     L170 ${ankleY} 
                     C${150 + thighHalfW + 4} ${kneeY}, ${150 + hipHalfW + 2} ${hipY}, ${150 + waistHalfW + 1} ${waistY + 14} Z`}
                  fill={bottomwear.color}
                  stroke="rgba(0,0,0,0.24)"
                  strokeWidth="0.8"
                />
                <path d={`M150 ${waistY + 14} L150 ${crotchY + 8}`} stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                <path d={`M147 ${waistY + 20} Q144 ${waistY + 36}, 150 ${waistY + 42}`} stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" fill="none" />
                <line x1="137" y1={kneeY - 40} x2="136" y2={kneeY + 40} stroke="rgba(255,255,255,0.15)" strokeWidth="3" strokeLinecap="round" />
                <line x1="163" y1={kneeY - 40} x2="164" y2={kneeY + 40} stroke="rgba(255,255,255,0.15)" strokeWidth="3" strokeLinecap="round" />
              </g>
            ) : (
              // Tailored Trousers / Chinos
              <path
                d={`M${150 - waistHalfW - 2} ${waistY + 12} 
                   C${150 - hipHalfW - 3} ${hipY}, ${150 - thighHalfW - 6} ${kneeY}, 128 ${ankleY + 3} 
                   L144 ${ankleY + 3} 
                   C150 ${kneeY + 20}, 150 ${crotchY + 6}, 150 ${crotchY + 10} 
                   C150 ${crotchY + 6}, 150 ${kneeY + 20}, 156 ${ankleY + 3} 
                   L172 ${ankleY + 3} 
                   C${150 + thighHalfW + 6} ${kneeY}, ${150 + hipHalfW + 3} ${hipY}, ${150 + waistHalfW + 2} ${waistY + 12} Z`}
                fill={bottomwear.color}
                stroke="rgba(0,0,0,0.18)"
                strokeWidth="0.8"
              />
            )}

            {/* Real Garment Image Overlay for Bottomwear (PNG or Photo) */}
            {bottomwear.imageUrl && renderGarmentImages !== false && (
              <image
                href={bottomwear.imageUrl}
                x={150 - ((hipHalfW * 2 + 30) * botScale) / 2 + botOffsetX}
                y={waistY + 8 + botOffsetY}
                width={(hipHalfW * 2 + 30) * botScale}
                height={(ankleY - waistY + 16) * botScale}
                preserveAspectRatio="xMidYMid meet"
                className="pointer-events-none transition-all duration-200"
              />
            )}
          </g>
        )}

        {/* ================= CLOTHING LAYER 2: TOPWEAR / DRESS ================= */}
        {topwear && (
          <g
            id="topwear-layer"
            className={`transition-all duration-300 ${interactive ? 'cursor-pointer hover:opacity-95' : ''}`}
            onClick={() => onSelectSlot && onSelectSlot('topwear')}
          >
            {highlightCategory === 'topwear' && (
              <path
                d={
                  isWearingDress
                    ? `M${150 - dressHemFlare - 6} ${shoulderY - 6} L${150 + dressHemFlare + 6} ${shoulderY - 6} L${150 + dressHemFlare + 6} ${dressHemY + 6} L${150 - dressHemFlare - 6} ${dressHemY + 6} Z`
                    : `M${leftArmX - 8} ${shoulderY - 5} L${rightArmX + 8} ${shoulderY - 5} L${150 + waistHalfW + 8} ${waistY + 20} L${150 - waistHalfW - 8} ${waistY + 20} Z`
                }
                stroke="#E11D48"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="none"
              />
            )}

            {isWearingDress ? (
              // ================= HAUTE-COUTURE DRESS / GOWN / ONE-PIECE =================
              <g id="avatar-dress-silhouette-group">
                {/* Base Tailored Vector Dress Silhouette */}
                <path
                  d={dressSilhouettePath}
                  fill={topwear.color}
                  stroke="rgba(0,0,0,0.22)"
                  strokeWidth="0.9"
                />

                {/* Elegant Neckline Collar / Straps Accent */}
                <path
                  d={`M${150 - shoulderHalfW * 0.72} ${shoulderY - 3} Q150 ${neckY + 16}, ${150 + shoulderHalfW * 0.72} ${shoulderY - 3}`}
                  stroke="rgba(0,0,0,0.25)"
                  strokeWidth="1.2"
                  fill="none"
                />

                {/* Waist Seam / Bodice Contour Accent */}
                <path
                  d={`M${150 - waistHalfW - 1} ${waistY} Q150 ${waistY + 4}, ${150 + waistHalfW + 1} ${waistY}`}
                  stroke="rgba(0,0,0,0.18)"
                  strokeWidth="0.9"
                  fill="none"
                />

                {/* Vertical Drapery Folds */}
                <path
                  d={`M${150 - 8} ${waistY + 6} Q${150 - 12} ${crotchY + 20}, ${150 - 16} ${dressHemY - 4}`}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={`M${150 + 8} ${waistY + 6} Q${150 + 12} ${crotchY + 20}, ${150 + 16} ${dressHemY - 4}`}
                  stroke="rgba(0,0,0,0.16)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Hemline Contour Curve */}
                <path
                  d={`M${150 - dressHemFlare} ${dressHemY} Q150 ${dressHemY + 12}, ${150 + dressHemFlare} ${dressHemY}`}
                  stroke="rgba(0,0,0,0.28)"
                  strokeWidth="1.2"
                  fill="none"
                />

                {/* Real Garment Image Overlay (PNG or Photo of Dress) */}
                {topwear.imageUrl && renderGarmentImages !== false && (
                  <image
                    href={topwear.imageUrl}
                    x={150 - ((dressHemFlare * 2 + 20) * dressScale) / 2 + dressOffsetX}
                    y={neckY + 2 + dressOffsetY}
                    width={(dressHemFlare * 2 + 20) * dressScale}
                    height={(dressHemY - neckY + 24) * dressScale}
                    preserveAspectRatio={dressClipMode === 'silhouette' ? 'xMidYMid slice' : 'xMidYMid meet'}
                    clipPath={dressClipMode === 'silhouette' ? 'url(#avatarDressSilhouetteClip)' : undefined}
                    className="pointer-events-none transition-all duration-200"
                  />
                )}
              </g>
            ) : topwear.styleDetails?.cut === 'tank' || topwear.subCategory?.toLowerCase().includes('tank') ? (
              // Athletic Ribbed Tank Top / Sleeveless Singlet
              <g>
                <path
                  d={`M139 ${shoulderY - 2} 
                     Q150 ${shoulderY + 18}, 161 ${shoulderY - 2} 
                     L165 ${shoulderY - 1} 
                     Q${150 + chestHalfW - 3} ${chestY - 8}, ${150 + chestHalfW - 1} ${chestY + 4} 
                     C${150 + waistHalfW + 1} ${waistY}, ${150 + waistHalfW + 1} ${waistY + 16}, ${150 + waistHalfW} ${waistY + 20} 
                     L${150 - waistHalfW} ${waistY + 20} 
                     C${150 - waistHalfW - 1} ${waistY + 16}, ${150 - waistHalfW - 1} ${waistY}, ${150 - chestHalfW + 1} ${chestY + 4} 
                     Q${150 - chestHalfW + 3} ${chestY - 8}, 135 ${shoulderY - 1} Z`}
                  fill={topwear.color}
                  stroke="rgba(0,0,0,0.22)"
                  strokeWidth="0.8"
                />
                {/* Ribbed Neckline scoop trim */}
                <path d={`M138 ${shoulderY - 2} Q150 ${shoulderY + 18}, 162 ${shoulderY - 2}`} stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" fill="none" />
                {/* Armhole trims */}
                <path d={`M135 ${shoulderY - 1} Q${150 - chestHalfW + 3} ${chestY - 8}, ${150 - chestHalfW + 1} ${chestY + 4}`} stroke="rgba(0,0,0,0.2)" strokeWidth="1.1" fill="none" />
                <path d={`M165 ${shoulderY - 1} Q${150 + chestHalfW - 3} ${chestY - 8}, ${150 + chestHalfW - 1} ${chestY + 4}`} stroke="rgba(0,0,0,0.2)" strokeWidth="1.1" fill="none" />
              </g>
            ) : topwear.styleDetails?.cut === 'blazer' ? (
              // Structured Tailored Blazer
              <g>
                <path
                  d={`M${leftArmX - 4} ${shoulderY - 2} 
                     L134 ${shoulderY + 2} L137 ${neckY + 4} L163 ${neckY + 4} L166 ${shoulderY + 2} 
                     L${rightArmX + 4} ${shoulderY - 2} 
                     C${rightArmX + 10} ${chestY}, ${150 + waistHalfW + 7} ${waistY + 10}, ${150 + hipHalfW + 2} ${hipY - 10} 
                     L${150 - hipHalfW - 2} ${hipY - 10} 
                     C${150 - waistHalfW - 7} ${waistY + 10}, ${leftArmX - 10} ${chestY}, ${leftArmX - 4} ${shoulderY - 2} Z`}
                  fill={topwear.color}
                  stroke="rgba(0,0,0,0.22)"
                  strokeWidth="0.9"
                />
                {/* Lapel V-Cut */}
                <path d={`M138 ${neckY + 4} L150 ${waistY - 10} L162 ${neckY + 4}`} stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" fill="none" />
                {/* Center Button */}
                <circle cx="150" cy={waistY - 2} r="2.2" fill="#D4AF37" />
                {/* Left & Right Sleeves */}
                <path
                  d={`M${leftArmX - 4} ${shoulderY - 2} L${leftArmX - 12} ${waistY + 10} L${leftArmX - 4} ${waistY + 10} L${leftArmX + 6} ${shoulderY + 8} Z`}
                  fill={topwear.color}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.8"
                />
                <path
                  d={`M${rightArmX + 4} ${shoulderY - 2} L${rightArmX + 12} ${waistY + 10} L${rightArmX + 4} ${waistY + 10} L${rightArmX - 6} ${shoulderY + 8} Z`}
                  fill={topwear.color}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.8"
                />
              </g>
            ) : topwear.styleDetails?.cut === 'collar' ? (
              // Oxford Button-Down / Polo Shirt
              <g>
                <path
                  d={`M${leftArmX - 2} ${shoulderY} 
                     L136 ${shoulderY + 3} L140 ${neckY + 6} L160 ${neckY + 6} L164 ${shoulderY + 3} 
                     L${rightArmX + 2} ${shoulderY} 
                     C${rightArmX + 6} ${chestY}, ${150 + waistHalfW + 4} ${waistY}, ${150 + waistHalfW + 3} ${waistY + 18} 
                     L${150 - waistHalfW - 3} ${waistY + 18} 
                     C${150 - waistHalfW - 4} ${waistY}, ${leftArmX - 6} ${chestY}, ${leftArmX - 2} ${shoulderY} Z`}
                  fill={topwear.color}
                  stroke="rgba(0,0,0,0.18)"
                  strokeWidth="0.8"
                />
                {/* Collar Points */}
                <polygon points="140,94 150,104 144,106 136,98" fill="rgba(255,255,255,0.85)" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" />
                <polygon points="160,94 150,104 156,106 164,98" fill="rgba(255,255,255,0.85)" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" />
                {/* Placket line & buttons */}
                <line x1="150" y1="104" x2="150" y2={waistY + 18} stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
                <circle cx="150" cy="120" r="1.2" fill="rgba(0,0,0,0.35)" />
                <circle cx="150" cy="140" r="1.2" fill="rgba(0,0,0,0.35)" />
                <circle cx="150" cy="160" r="1.2" fill="rgba(0,0,0,0.35)" />
                {/* Short or long sleeves */}
                {topwear.styleDetails?.sleeve === 'short' ? (
                  <>
                    <path d={`M${leftArmX - 2} ${shoulderY} L${leftArmX - 9} ${chestY + 6} L${leftArmX} ${chestY + 6} L${leftArmX + 7} ${shoulderY + 8} Z`} fill={topwear.color} />
                    <path d={`M${rightArmX + 2} ${shoulderY} L${rightArmX + 9} ${chestY + 6} L${rightArmX} ${chestY + 6} L${rightArmX - 7} ${shoulderY + 8} Z`} fill={topwear.color} />
                  </>
                ) : (
                  <>
                    <path d={`M${leftArmX - 2} ${shoulderY} L${leftArmX - 11} ${waistY + 8} L${leftArmX - 3} ${waistY + 8} L${leftArmX + 7} ${shoulderY + 8} Z`} fill={topwear.color} stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" />
                    <path d={`M${rightArmX + 2} ${shoulderY} L${rightArmX + 11} ${waistY + 8} L${rightArmX + 3} ${waistY + 8} L${rightArmX - 7} ${shoulderY + 8} Z`} fill={topwear.color} stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" />
                  </>
                )}
              </g>
            ) : topwear.styleDetails?.cut === 'hoodie' ? (
              // Pullover Streetwear Hoodie
              <g>
                <path
                  d={`M${leftArmX - 4} ${shoulderY} 
                     L136 ${shoulderY + 2} Q150 ${neckY + 12}, 164 ${shoulderY + 2} 
                     L${rightArmX + 4} ${shoulderY} 
                     C${rightArmX + 8} ${chestY}, ${150 + waistHalfW + 6} ${waistY}, ${150 + waistHalfW + 5} ${waistY + 20} 
                     L${150 - waistHalfW - 5} ${waistY + 20} 
                     C${150 - waistHalfW - 6} ${waistY}, ${leftArmX - 8} ${chestY}, ${leftArmX - 4} ${shoulderY} Z`}
                  fill={topwear.color}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.8"
                />
                {/* Kangaroo Pocket */}
                <path
                  d={`M${150 - waistHalfW + 2} ${waistY - 8} L${150 + waistHalfW - 2} ${waistY - 8} L${150 + waistHalfW} ${waistY + 14} L${150 - waistHalfW} ${waistY + 14} Z`}
                  fill="rgba(0,0,0,0.15)"
                />
                {/* Hoodie drawstrings */}
                <line x1="147" y1="102" x2="147" y2="132" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="153" y1="102" x2="153" y2="130" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" strokeLinecap="round" />
                {/* Sleeves */}
                <path d={`M${leftArmX - 4} ${shoulderY} L${leftArmX - 12} ${waistY + 10} L${leftArmX - 3} ${waistY + 10} L${leftArmX + 7} ${shoulderY + 8} Z`} fill={topwear.color} />
                <path d={`M${rightArmX + 4} ${shoulderY} L${rightArmX + 12} ${waistY + 10} L${rightArmX + 3} ${waistY + 10} L${rightArmX - 7} ${shoulderY + 8} Z`} fill={topwear.color} />
              </g>
            ) : (
              // T-Shirt / Crewneck Sweater (Default)
              <g>
                <path
                  d={`M${leftArmX - 2} ${shoulderY} 
                     L136 ${shoulderY + 2} Q150 ${neckY + 10}, 164 ${shoulderY + 2} 
                     L${rightArmX + 2} ${shoulderY} 
                     C${rightArmX + 6} ${chestY}, ${150 + waistHalfW + 3} ${waistY}, ${150 + waistHalfW + 3} ${waistY + 18} 
                     L${150 - waistHalfW - 3} ${waistY + 18} 
                     C${150 - waistHalfW - 3} ${waistY}, ${leftArmX - 6} ${chestY}, ${leftArmX - 2} ${shoulderY} Z`}
                  fill={topwear.color}
                  stroke="rgba(0,0,0,0.18)"
                  strokeWidth="0.8"
                />
                {/* Ribbed Collar */}
                <path d={`M137 ${shoulderY + 2} Q150 ${neckY + 10}, 163 ${shoulderY + 2}`} stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" fill="none" />
                {/* Sleeves based on style */}
                {topwear.styleDetails?.sleeve === 'long' ? (
                  <>
                    <path d={`M${leftArmX - 2} ${shoulderY} L${leftArmX - 11} ${waistY + 8} L${leftArmX - 3} ${waistY + 8} L${leftArmX + 7} ${shoulderY + 8} Z`} fill={topwear.color} stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" />
                    <path d={`M${rightArmX + 2} ${shoulderY} L${rightArmX + 11} ${waistY + 8} L${rightArmX + 3} ${waistY + 8} L${rightArmX - 7} ${shoulderY + 8} Z`} fill={topwear.color} stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" />
                  </>
                ) : (
                  <>
                    <path d={`M${leftArmX - 2} ${shoulderY} L${leftArmX - 9} ${chestY + 6} L${leftArmX} ${chestY + 6} L${leftArmX + 7} ${shoulderY + 8} Z`} fill={topwear.color} />
                    <path d={`M${rightArmX + 2} ${shoulderY} L${rightArmX + 9} ${chestY + 6} L${rightArmX} ${chestY + 6} L${rightArmX - 7} ${shoulderY + 8} Z`} fill={topwear.color} />
                  </>
                )}
              </g>
            )}

            {/* Real Garment Image Overlay for Standard Topwear (when not wearing dress) */}
            {!isWearingDress && topwear.imageUrl && renderGarmentImages !== false && (
              <image
                href={topwear.imageUrl}
                x={150 - ((shoulderHalfW * 2 + 26) * topScale) / 2 + topOffsetX}
                y={neckY + 4 + topOffsetY}
                width={(shoulderHalfW * 2 + 26) * topScale}
                height={(waistY - neckY + 36) * topScale}
                preserveAspectRatio="xMidYMid meet"
                className="pointer-events-none transition-all duration-200"
              />
            )}
          </g>
        )}

        {/* ================= CLOTHING LAYER 3: FOOTWEAR ================= */}
        {footwear && (
          <g
            id="footwear-layer"
            className={`transition-all duration-300 ${interactive ? 'cursor-pointer hover:opacity-95' : ''}`}
            onClick={() => onSelectSlot && onSelectSlot('footwear')}
          >
            {highlightCategory === 'footwear' && (
              <rect x="116" y={ankleY - 4} width="66" height="34" rx="6" stroke="#E11D48" strokeWidth="2" strokeDasharray="4 4" fill="none" />
            )}

            {footwear.styleDetails?.shoeType === 'boots' ? (
              // Chelsea / Leather Boots
              <g>
                <path d={`M130 ${ankleY - 10} L143 ${ankleY - 10} L143 ${groundY} L122 ${groundY} Q119 ${groundY - 5}, 130 ${ankleY - 10} Z`} fill={footwear.color} stroke="rgba(0,0,0,0.25)" strokeWidth="0.8" />
                <path d={`M157 ${ankleY - 10} L170 ${ankleY - 10} Q181 ${groundY - 5}, 178 ${groundY} L157 ${groundY} Z`} fill={footwear.color} stroke="rgba(0,0,0,0.25)" strokeWidth="0.8" />
                <rect x="121" y={groundY - 2} width="22" height="3" fill="#111" />
                <rect x="157" y={groundY - 2} width="22" height="3" fill="#111" />
              </g>
            ) : (
              // Sneakers or Penny Loafers (with sole)
              <g>
                <path d={`M131 ${ankleY - 2} L142 ${ankleY - 2} L143 ${groundY - 2} L123 ${groundY - 2} Q120 ${groundY - 6}, 131 ${ankleY - 2} Z`} fill={footwear.color} stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
                <rect x="122" y={groundY - 3} width="22" height="4" rx="1.5" fill="#F8FAFC" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" />
                <path d={`M158 ${ankleY - 2} L169 ${ankleY - 2} Q180 ${groundY - 6}, 177 ${groundY - 2} L157 ${groundY - 2} Z`} fill={footwear.color} stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
                <rect x="156" y={groundY - 3} width="22" height="4" rx="1.5" fill="#F8FAFC" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" />
              </g>
            )}

            {/* Real Footwear Image Overlay */}
            {footwear.imageUrl && renderGarmentImages !== false && (
              <image
                href={footwear.imageUrl}
                x="116"
                y={ankleY - 8}
                width="68"
                height="36"
                preserveAspectRatio="xMidYMid meet"
                className="pointer-events-none transition-all duration-200"
              />
            )}
          </g>
        )}

        {/* Bare Feet if no footwear */}
        {!footwear && (
          <g id="bare-feet">
            <path d={`M131 ${ankleY} L142 ${ankleY} L142 ${groundY - 1} L126 ${groundY - 1} Q123 ${groundY - 4}, 131 ${ankleY} Z`} fill="url(#skinGrad)" />
            <path d={`M158 ${ankleY} L169 ${ankleY} Q177 ${groundY - 4}, 174 ${groundY - 1} L158 ${groundY - 1} Z`} fill="url(#skinGrad)" />
          </g>
        )}

        {/* ================= CLOTHING LAYER 4: ACCESSORIES ================= */}
        {accessory && (
          <g
            id="accessory-layer"
            className={`transition-all duration-300 ${interactive ? 'cursor-pointer hover:opacity-95' : ''}`}
            onClick={() => onSelectSlot && onSelectSlot('accessories')}
          >
            {accessory.styleDetails?.accessoryType === 'necklace' && (
              <path d="M141 114 Q150 134, 159 114" stroke={accessory.color || '#D4AF37'} strokeWidth="1.8" fill="none" strokeLinecap="round" />
            )}
            {accessory.styleDetails?.accessoryType === 'watch' && (
              // Luxury Chronograph Watch on Left Wrist
              <g>
                <rect x="114" y="258" width="5" height="7" rx="1.5" fill="#333" />
                <circle cx="116.5" cy="261.5" r="3.2" fill={accessory.color || '#94A3B8'} stroke="#111" strokeWidth="0.8" />
              </g>
            )}
            {accessory.styleDetails?.accessoryType === 'bag' && (
              <g>
                <path d={`M${leftArmX + 10} ${shoulderY + 2} L176 ${waistY + 30}`} stroke={accessory.color} strokeWidth="3.2" strokeLinecap="round" />
                <rect x="166" y={waistY + 22} width="26" height="20" rx="4" fill={accessory.color} stroke="rgba(0,0,0,0.25)" strokeWidth="0.9" />
                <rect x="177" y={waistY + 29} width="4" height="5" rx="1" fill="#D4AF37" />
              </g>
            )}
            {accessory.styleDetails?.accessoryType === 'sunglasses' && (
              <g>
                <rect x="135" y={headY - 6} width="12" height="9" rx="2.5" fill={accessory.color || '#262626'} stroke="#111" strokeWidth="0.8" />
                <rect x="153" y={headY - 6} width="12" height="9" rx="2.5" fill={accessory.color || '#262626'} stroke="#111" strokeWidth="0.8" />
                <line x1="147" y1={headY - 3} x2="153" y2={headY - 3} stroke={accessory.color || '#262626'} strokeWidth="1.4" />
              </g>
            )}
          </g>
        )}

        {/* ================= REALISTIC HEAD, FACE & PHOTO INTEGRATION ================= */}
        {/* Head Contour: Slightly squarer for boy, softer oval for girl */}
        <ellipse
          cx="150"
          cy={headY}
          rx={isBoy ? 19 : 18}
          ry={isBoy ? 22 : 22.5}
          fill="url(#skinGrad)"
        />

        {/* Human Ears with Inner Concha */}
        <g id="ears">
          <ellipse cx="130.5" cy={headY + 2} rx="2.6" ry="5.5" fill="url(#skinGrad)" />
          <ellipse cx="131" cy={headY + 2} rx="1.3" ry="3.5" fill="rgba(0,0,0,0.12)" />
          <ellipse cx="169.5" cy={headY + 2} rx="2.6" ry="5.5" fill="url(#skinGrad)" />
          <ellipse cx="169" cy={headY + 2} rx="1.3" ry="3.5" fill="rgba(0,0,0,0.12)" />
        </g>

        {/* USER PHOTO OVERLAY (If user uploaded a selfie / portrait) */}
        {userPhoto ? (
          <g id="avatar-user-photo-twin">
            {/* Clapped Head Image perfectly centered on the head frame */}
            <image
              href={userPhoto}
              x={150 - 24 * photoScale + photoOffsetX}
              y={headY - 26 * photoScale + photoOffsetY}
              width={48 * photoScale}
              height={52 * photoScale}
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#avatarPhotoFaceClip)"
            />
            {/* Subtle soft gradient border to blend photo edge into avatar head */}
            <ellipse
              cx="150"
              cy={headY}
              rx={isBoy ? 19 : 18}
              ry={isBoy ? 22 : 22.5}
              stroke="url(#skinGrad)"
              strokeWidth="2"
              fill="none"
              opacity="0.8"
            />
          </g>
        ) : (
          /* Realistic Human Facial Features (When no photo) */
          <g id="human-face">
            {/* Eyebrows (Stronger for boy, softer arch for girl) */}
            {isBoy ? (
              <>
                <path d="M135 58 Q142 56, 146 59" stroke={hairColor} strokeWidth="1.7" strokeLinecap="round" fill="none" />
                <path d="M154 59 Q158 56, 165 58" stroke={hairColor} strokeWidth="1.7" strokeLinecap="round" fill="none" />
              </>
            ) : (
              <>
                <path d="M136 57 Q142 54, 145 58" stroke={hairColor} strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <path d="M155 58 Q158 54, 164 57" stroke={hairColor} strokeWidth="1.2" strokeLinecap="round" fill="none" />
              </>
            )}

            {/* Realistic Human Eyes: Almond Shape, Sclera, Iris, Pupil, Catchlight */}
            {/* Left Eye */}
            <g id="left-eye">
              <ellipse cx="141" cy="65" rx="3.2" ry="2.2" fill="#FFFFFF" />
              <circle cx="141" cy="65" r="1.8" fill="#3D271D" />
              <circle cx="141" cy="65" r="0.9" fill="#111111" />
              <circle cx="140.3" cy="64.2" r="0.5" fill="#FFFFFF" />
              {/* Upper Eyelash line */}
              <path d="M137.5 64 Q141 62.5, 144.5 64" stroke="#1A1A1A" strokeWidth={isBoy ? 0.9 : 1.3} strokeLinecap="round" fill="none" />
            </g>

            {/* Right Eye */}
            <g id="right-eye">
              <ellipse cx="159" cy="65" rx="3.2" ry="2.2" fill="#FFFFFF" />
              <circle cx="159" cy="65" r="1.8" fill="#3D271D" />
              <circle cx="159" cy="65" r="0.9" fill="#111111" />
              <circle cx="158.3" cy="64.2" r="0.5" fill="#FFFFFF" />
              {/* Upper Eyelash line */}
              <path d="M155.5 64 Q159 62.5, 162.5 64" stroke="#1A1A1A" strokeWidth={isBoy ? 0.9 : 1.3} strokeLinecap="round" fill="none" />
            </g>

            {/* Sculpted Nose: Bridge, Soft Tip & Nostril curves */}
            <path d="M149.5 63 L149 71 Q150 73.5, 152 72.5" stroke="rgba(0,0,0,0.22)" strokeWidth="1.1" strokeLinecap="round" fill="none" />
            <ellipse cx="148" cy="72.5" rx="0.8" ry="0.6" fill="rgba(0,0,0,0.18)" />

            {/* Realistic Human Lips with Cupid's Bow */}
            <g id="lips">
              <path
                d={
                  isBoy
                    ? 'M144 78 Q150 80, 156 78'
                    : 'M143 78 Q147 76.5, 150 78 Q153 76.5, 157 78'
                }
                stroke={isBoy ? 'rgba(0,0,0,0.3)' : '#C46868'}
                strokeWidth={isBoy ? 1.2 : 1.5}
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M145 78.5 Q150 81.5, 155 78.5"
                stroke={isBoy ? 'rgba(0,0,0,0.15)' : '#D98282'}
                strokeWidth={isBoy ? 1.0 : 1.6}
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* Boy Facial Hair (Stubble / Beard) */}
            {isBoy && facialHair === 'stubble' && (
              <path
                d="M137 73 Q139 84, 150 86 Q161 84, 163 73"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth="1.8"
                strokeDasharray="1.5 1.5"
                fill="none"
              />
            )}
            {isBoy && facialHair === 'beard' && (
              <path
                d="M136 71 Q138 86, 150 88 Q162 86, 164 71 L162 76 Q150 84, 138 76 Z"
                fill={hairColor}
                opacity="0.85"
              />
            )}
          </g>
        )}

        {/* ================= FRONT HAIRSTYLES ================= */}
        {/* Even with photo, front hair frames the forehead naturally */}
        <g id="front-hair">
          {hairStyle === 'short-fade' && (
            // Clean Barber Fade (Boy / Classic)
            <path
              d={`M131 ${headY - 2} C130 ${headY - 23}, 170 ${headY - 23}, 169 ${headY - 2} 
                 C169 ${headY + 6}, 166 ${headY - 4}, 162 ${headY - 8} 
                 C154 ${headY - 14}, 144 ${headY - 14}, 138 ${headY - 8} 
                 C134 ${headY - 4}, 131 ${headY + 6}, 131 ${headY - 2} Z`}
              fill={hairColor}
            />
          )}

          {hairStyle === 'textured-crop' && (
            // Modern Textured Fringe / French Crop (Popular Boy Haircut)
            <path
              d={`M130 ${headY} 
                 C128 ${headY - 24}, 144 ${headY - 27}, 150 ${headY - 27} 
                 C156 ${headY - 27}, 172 ${headY - 24}, 170 ${headY} 
                 C168 ${headY + 2}, 163 ${headY - 4}, 158 ${headY - 3} 
                 C152 ${headY - 5}, 148 ${headY - 3}, 142 ${headY - 4} 
                 C136 ${headY - 3}, 132 ${headY + 2}, 130 ${headY} Z`}
              fill={hairColor}
            />
          )}

          {hairStyle === 'buzz-cut' && (
            // Military / Clean Buzz Cut
            <path
              d={`M131 ${headY} C131 ${headY - 21}, 169 ${headY - 21}, 169 ${headY} 
                 C167 ${headY - 6}, 158 ${headY - 11}, 150 ${headY - 11} 
                 C142 ${headY - 11}, 133 ${headY - 6}, 131 ${headY} Z`}
              fill={hairColor}
              opacity="0.9"
            />
          )}

          {hairStyle === 'pompadour' && (
            // Voluminous Styled Pompadour (Boy / Dapper)
            <path
              d={`M131 ${headY} 
                 C128 ${headY - 28}, 144 ${headY - 35}, 150 ${headY - 34} 
                 C158 ${headY - 34}, 173 ${headY - 28}, 169 ${headY} 
                 C166 ${headY - 4}, 159 ${headY - 10}, 150 ${headY - 12} 
                 C141 ${headY - 10}, 134 ${headY - 4}, 131 ${headY} Z`}
              fill={hairColor}
            />
          )}

          {hairStyle === 'casual-part' && (
            // Classic Side Parting
            <path
              d={`M130 ${headY} 
                 C128 ${headY - 23}, 145 ${headY - 27}, 150 ${headY - 27} 
                 C162 ${headY - 27}, 172 ${headY - 19}, 170 ${headY} 
                 C166 ${headY + 2}, 160 ${headY - 8}, 154 ${headY - 10} 
                 C148 ${headY - 12}, 138 ${headY - 6}, 130 ${headY} Z`}
              fill={hairColor}
            />
          )}

          {hairStyle === 'curls-afro' && (
            // Rounded Curls / Afro
            <path
              d={`M124 ${headY} 
                 C118 ${headY - 28}, 138 ${headY - 34}, 150 ${headY - 34} 
                 C162 ${headY - 34}, 182 ${headY - 28}, 176 ${headY} 
                 C172 ${headY + 8}, 166 ${headY - 4}, 160 ${headY - 8} 
                 C150 ${headY - 12}, 140 ${headY - 8}, 134 ${headY - 4} 
                 C128 ${headY + 8}, 124 ${headY + 2}, 124 ${headY} Z`}
              fill={hairColor}
            />
          )}

          {hairStyle === 'wavy-lob' && (
            // Wavy Lob (Girl)
            <path
              d={`M126 ${headY + 8} 
                 C124 ${headY - 22}, 140 ${headY - 28}, 150 ${headY - 28} 
                 C160 ${headY - 28}, 176 ${headY - 22}, 174 ${headY + 8} 
                 C170 ${headY + 28}, 164 ${headY + 14}, 163 ${headY - 4} 
                 C156 ${headY - 16}, 144 ${headY - 16}, 137 ${headY - 4} 
                 C136 ${headY + 14}, 130 ${headY + 28}, 126 ${headY + 8} Z`}
              fill={hairColor}
            />
          )}

          {hairStyle === 'sleek-long' && (
            // Sleek Parted Long (Girl)
            <path
              d={`M127 ${headY + 14} 
                 C125 ${headY - 24}, 142 ${headY - 28}, 150 ${headY - 28} 
                 C158 ${headY - 28}, 175 ${headY - 24}, 173 ${headY + 14} 
                 C168 ${headY + 22}, 164 ${headY + 6}, 162 ${headY - 6} 
                 C155 ${headY - 16}, 145 ${headY - 16}, 138 ${headY - 6} 
                 C136 ${headY + 6}, 132 ${headY + 22}, 127 ${headY + 14} Z`}
              fill={hairColor}
            />
          )}

          {hairStyle === 'pixie' && (
            // Modern Textured Pixie
            <path
              d={`M131 ${headY - 2} 
                 C129 ${headY - 20}, 145 ${headY - 26}, 150 ${headY - 26} 
                 C162 ${headY - 26}, 170 ${headY - 16}, 168 ${headY - 2} 
                 C166 ${headY + 4}, 160 ${headY - 6}, 152 ${headY - 8} 
                 C144 ${headY - 10}, 136 ${headY - 4}, 131 ${headY - 2} Z`}
              fill={hairColor}
            />
          )}
        </g>
      </svg>

      {/* Floating Info Badges */}
      {showDetailsBadge && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-2 bg-neutral-900/85 backdrop-blur-md border border-neutral-800 rounded-xl text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full border border-neutral-700"
              style={{ backgroundColor: skinTone }}
            />
            <span className="capitalize font-medium">{config.userName || 'Model'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#244837]/20 text-[#244837] dark:text-[#C5A880] border border-[#244837]/30 font-semibold uppercase">
              {isBoy ? 'Boy' : 'Girl'}
            </span>
          </div>
          <div className="text-[11px] text-neutral-400">
            {config.height} • {config.build}
          </div>
        </div>
      )}
    </div>
  );
};
