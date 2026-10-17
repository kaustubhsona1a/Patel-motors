import React from 'react';

export const PATEL_MOTORS_LOGO_SVG_RAW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 280" width="100%" height="100%" style="display:block;">
  <defs>
    <linearGradient id="patelFlameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff9100" />
      <stop offset="50%" stop-color="#ff7300" />
      <stop offset="100%" stop-color="#e05300" />
    </linearGradient>
  </defs>
  <rect width="500" height="280" rx="20" fill="#140908" />
  <g transform="translate(10, 8)">
    <path d="M 235 68 C 205 66 165 42 125 40 C 158 52 178 68 152 79 C 182 78 208 74 235 68 Z" fill="url(#patelFlameGrad)" />
    <path d="M 205 79 C 182 79 160 70 140 68 C 155 76 166 86 150 94 C 172 93 192 88 215 82 Z" fill="url(#patelFlameGrad)" />
    <path d="M 205 82 C 228 65 264 64 294 80 C 275 96 238 98 205 82 Z" fill="url(#patelFlameGrad)" />
    <path d="M 276 72 C 298 52 322 32 352 28 C 336 48 324 72 306 88 C 295 81 285 76 276 72 Z" fill="url(#patelFlameGrad)" />
    <path d="M 245 92 C 265 92 288 88 308 84 C 296 102 268 112 238 110 C 242 103 244 97 245 92 Z" fill="url(#patelFlameGrad)" />
    <path d="M 115 132 C 114 96 142 68 178 68 C 188 68 198 71 206 76 C 196 86 182 82 174 82 C 148 82 130 102 131 128 C 131 130 131 132 132 134 L 115 134 C 115 133 115 133 115 132 Z" fill="#f1f5f9" />
    <path d="M 160 85 C 182 85 204 98 214 118 C 198 122 182 114 174 100 C 168 92 165 88 160 85 Z" fill="url(#patelFlameGrad)" />
    <path d="M 148 134 C 145 120 154 108 168 106 C 176 105 184 108 190 114 C 184 124 174 132 162 134 Z" fill="url(#patelFlameGrad)" opacity="0.95" />
    <path d="M 314 134 C 314 106 332 82 358 76 C 362 75 366 75 370 75 C 396 75 418 96 418 122 C 418 126 417 130 416 134 L 398 134 C 399 130 400 126 400 122 C 400 106 386 92 370 92 C 354 92 340 104 336 120 L 332 134 Z" fill="#f1f5f9" />
    <path d="M 324 104 L 348 134 L 336 134 L 314 108 Z" fill="#f1f5f9" />
    <path d="M 252 134 C 275 110 305 92 338 88 C 328 106 308 124 282 134 Z" fill="url(#patelFlameGrad)" />
  </g>
  <text x="250" y="206" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Montserrat', 'Arial Black', sans-serif" font-size="44" font-weight="900" letter-spacing="2.5" fill="#ffffff">PATEL MOTORS</text>
  <text x="250" y="244" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Montserrat', 'Arial Black', sans-serif" font-size="20" font-weight="800" letter-spacing="5" fill="#ffffff">RIDE WITH PRIDE</text>
</svg>`;

export const PATEL_MOTORS_LOGO_DATA_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(PATEL_MOTORS_LOGO_SVG_RAW)}`;

interface PatelMotorsLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export const PatelMotorsLogo: React.FC<PatelMotorsLogoProps> = ({ className = 'h-14 w-auto', style }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 500 280" 
      className={`shrink-0 block rounded-lg shadow-sm aspect-[500/280] ${className}`}
      style={style}
      role="img"
      aria-label="Patel Motors - Ride with Pride"
    >
      <defs>
        <linearGradient id="patelFlameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff9100" />
          <stop offset="50%" stopColor="#ff7300" />
          <stop offset="100%" stopColor="#e05300" />
        </linearGradient>
      </defs>
      <rect width="500" height="280" rx="20" fill="#140908" />
      <g transform="translate(10, 8)">
        <path d="M 235 68 C 205 66 165 42 125 40 C 158 52 178 68 152 79 C 182 78 208 74 235 68 Z" fill="url(#patelFlameGrad)" />
        <path d="M 205 79 C 182 79 160 70 140 68 C 155 76 166 86 150 94 C 172 93 192 88 215 82 Z" fill="url(#patelFlameGrad)" />
        <path d="M 205 82 C 228 65 264 64 294 80 C 275 96 238 98 205 82 Z" fill="url(#patelFlameGrad)" />
        <path d="M 276 72 C 298 52 322 32 352 28 C 336 48 324 72 306 88 C 295 81 285 76 276 72 Z" fill="url(#patelFlameGrad)" />
        <path d="M 245 92 C 265 92 288 88 308 84 C 296 102 268 112 238 110 C 242 103 244 97 245 92 Z" fill="url(#patelFlameGrad)" />
        <path d="M 115 132 C 114 96 142 68 178 68 C 188 68 198 71 206 76 C 196 86 182 82 174 82 C 148 82 130 102 131 128 C 131 130 131 132 132 134 L 115 134 C 115 133 115 133 115 132 Z" fill="#f1f5f9" />
        <path d="M 160 85 C 182 85 204 98 214 118 C 198 122 182 114 174 100 C 168 92 165 88 160 85 Z" fill="url(#patelFlameGrad)" />
        <path d="M 148 134 C 145 120 154 108 168 106 C 176 105 184 108 190 114 C 184 124 174 132 162 134 Z" fill="url(#patelFlameGrad)" opacity="0.95" />
        <path d="M 314 134 C 314 106 332 82 358 76 C 362 75 366 75 370 75 C 396 75 418 96 418 122 C 418 126 417 130 416 134 L 398 134 C 399 130 400 126 400 122 C 400 106 386 92 370 92 C 354 92 340 104 336 120 L 332 134 Z" fill="#f1f5f9" />
        <path d="M 324 104 L 348 134 L 336 134 L 314 108 Z" fill="#f1f5f9" />
        <path d="M 252 134 C 275 110 305 92 338 88 C 328 106 308 124 282 134 Z" fill="url(#patelFlameGrad)" />
      </g>
      <text x="250" y="206" textAnchor="middle" fontFamily="-apple-system, BlinkMacSystemFont, 'Montserrat', 'Arial Black', sans-serif" fontSize="44" fontWeight="900" letterSpacing="2.5" fill="#ffffff">PATEL MOTORS</text>
      <text x="250" y="244" textAnchor="middle" fontFamily="-apple-system, BlinkMacSystemFont, 'Montserrat', 'Arial Black', sans-serif" fontSize="20" fontWeight="800" letterSpacing="5" fill="#ffffff">RIDE WITH PRIDE</text>
    </svg>
  );
};

export default PatelMotorsLogo;
