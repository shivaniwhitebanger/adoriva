import React from 'react';

interface BrandLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'dark',
  size = 'md',
  showTagline = true,
}) => {
  const isGold = variant === 'gold';
  const isLight = variant === 'light'; // on dark background

  // Colors
  const emblemGold = isLight ? '#D4AF7C' : (isGold ? '#D4AF7C' : '#D4AF7C');
  const textColor = isLight ? '#F5F1EE' : '#483A38';
  const subtextColor = isLight ? '#9A8582' : '#9A8582';
  const starColor = '#D4AF7C';

  const [imgFailed, setImgFailed] = React.useState(false);

  const sizeDimensions = {
    sm: { icon: 40, imgSize: 'h-11 sm:h-12 w-auto max-w-[150px]', text: 'text-xl sm:text-2xl', subtext: 'text-[9px]' },
    md: { icon: 64, imgSize: 'h-16 sm:h-18 lg:h-20 w-auto max-w-[210px] sm:max-w-[240px]', text: 'text-2xl sm:text-3xl lg:text-4xl', subtext: 'text-[9px] sm:text-[10px] lg:text-[11px]' },
    lg: { icon: 76, imgSize: 'h-22 sm:h-26 w-auto max-w-[280px]', text: 'text-4xl sm:text-5xl', subtext: 'text-xs' },
    hero: { icon: 104, imgSize: 'h-28 sm:h-34 w-auto max-w-[360px]', text: 'text-5xl sm:text-6xl', subtext: 'text-sm' },
  }[size];

  return (
    <div className={`flex flex-col items-center select-none text-center ${className}`}>
      {/* Authentic Luxury Monogram / Brand Logo */}
      {!imgFailed ? (
        <div
          className={`relative rounded-xl overflow-hidden transition-transform duration-300 hover:scale-105 flex items-center justify-center flex-shrink-0 ${
            isLight
              ? 'bg-[#F5F1EE] p-1.5 shadow-md border border-[#D4AF7C]/40'
              : 'mix-blend-multiply'
          } ${sizeDimensions.imgSize}`}
        >
          <img
            src="/assets/aistudio/Untitled_Design_43b544a4.png"
            alt="Adoriva - Gifts with Love"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('Adoriva_Gifts_with_Love_b54684ee.png')) {
                target.src = '/assets/aistudio/Adoriva_Gifts_with_Love_b54684ee.png';
              } else if (!target.src.includes('luxury-adoriva-logo.png')) {
                target.src = '/images2/luxury-adoriva-logo.png';
              } else {
                setImgFailed(true);
              }
            }}
            className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
          />
        </div>
      ) : (
        /* Fallback SVG */
        <svg
          width={sizeDimensions.icon}
          height={sizeDimensions.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          <defs>
            <linearGradient id="goldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DFBA63" />
              <stop offset="35%" stopColor="#FFF2B2" />
              <stop offset="70%" stopColor="#C59B3F" />
              <stop offset="100%" stopColor="#966F21" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#966F21" floodOpacity="0.25" />
            </filter>
          </defs>
          <g filter="url(#softGlow)">
            <path
              d="M32 78 L26 78 C25 78 24 77 24 76 L24 75 C25 75 28 74 30 70 L48 24 C49 21 51 21 52 24 L70 70 C72 74 75 75 76 75 L76 76 C76 77 75 78 74 78 L68 78 C67 78 66 77 66 75 L63 67 L37 67 L34 75 C34 77 33 78 32 78 Z"
              fill="url(#goldSheen)"
            />
            <path d="M50 20 L55 33 L45 33 Z" fill="url(#goldSheen)" />
          </g>
          <g filter="url(#softGlow)">
            <path
              d="M50 54 C42 45 28 46 32 57 C35 64 45 61 50 55 Z"
              fill="url(#goldSheen)"
              stroke="#966F21"
              strokeWidth="0.8"
            />
            <path
              d="M50 54 C58 45 72 46 68 57 C65 64 55 61 50 55 Z"
              fill="url(#goldSheen)"
              stroke="#966F21"
              strokeWidth="0.8"
            />
            <ellipse cx="50" cy="54" rx="4" ry="4.5" fill="#FFF2B2" stroke="#966F21" strokeWidth="1" />
            <path
              d="M48 56 C47 62 48 70 51 75 C50 75 46 72 45 67 C44 62 46 57 48 56 Z"
              fill="url(#goldSheen)"
            />
            <path
              d="M52 56 C54 62 60 68 67 71 C65 71 58 68 55 63 C53 59 52 57 52 56 Z"
              fill="url(#goldSheen)"
            />
          </g>
        </svg>
      )}

      {/* Screen Reader and Fallback Text */}
      {imgFailed ? (
        <>
          <span
            style={{ color: textColor }}
            className={`font-serif tracking-[0.28em] uppercase font-semibold leading-none mt-1.5 ${sizeDimensions.text}`}
          >
            ADORIVA
          </span>

          {showTagline && (
            <div className="flex flex-col items-center mt-1 w-full">
              <div className="flex items-center justify-center gap-2 w-full max-w-[200px] sm:max-w-[240px] lg:max-w-[280px]">
                <span className="h-[0.5px] flex-1 bg-current opacity-25" style={{ color: starColor }} />
                <span className="text-[9px] leading-none" style={{ color: starColor }}>✦</span>
                <span className="h-[0.5px] flex-1 bg-current opacity-25" style={{ color: starColor }} />
              </div>
              <span
                style={{ color: subtextColor }}
                className={`font-sans tracking-[0.25em] uppercase font-medium mt-1 ${sizeDimensions.subtext}`}
              >
                GIFTS THAT SPEAK FROM THE HEART
              </span>
            </div>
          )}
        </>
      ) : (
        <span className="sr-only">Adoriva - Gifts with Love</span>
      )}
    </div>
  );
};
