import React from 'react';
import clsx from 'clsx';

export type MascotPose = 'idle' | 'celebrating' | 'concerned' | 'encouraging' | 'sleepy';

export interface MascotProps {
  pose?: MascotPose;
  className?: string;
  size?: number | string;
}

export const Mascot: React.FC<MascotProps> = ({
  pose = 'idle',
  className = 'w-24 h-24 sm:w-28 sm:h-28',
  size,
}) => {
  const sizeStyle = size ? { width: size, height: size } : undefined;

  switch (pose) {
    case 'celebrating':
      return (
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={clsx('transition-transform duration-300 hover:scale-105', className)}
          style={sizeStyle}
          aria-label="Celebrating Cat Mascot"
          role="img"
        >
          {/* Soft background aura */}
          <circle cx="60" cy="60" r="50" fill="var(--peach-soft)" />

          {/* Celebratory confetti and sparks */}
          <circle cx="28" cy="28" r="3" fill="var(--peach)" />
          <circle cx="94" cy="24" r="3.5" fill="var(--success)" />
          <circle cx="102" cy="54" r="2.5" fill="var(--peach)" />
          <circle cx="20" cy="56" r="2.5" fill="var(--lavender)" />
          <rect x="58" y="14" width="5" height="5" rx="1.5" fill="var(--peach)" transform="rotate(45 60.5 16.5)" />

          {/* Upright happy tail */}
          <path
            d="M86 80 C98 76 104 54 94 48 C88 44 86 52 89 58"
            stroke="var(--lavender)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cat Chubby Body */}
          <ellipse cx="60" cy="78" rx="25" ry="24" fill="var(--lavender)" />
          {/* White / Cream Belly */}
          <ellipse cx="60" cy="82" rx="16" ry="16" fill="var(--surface)" />

          {/* Raised Arms / Paws in Victory */}
          <path d="M40 72 C32 60 28 44 38 42 C44 40 46 54 44 68 Z" fill="var(--lavender)" />
          <ellipse cx="36" cy="42" rx="4.5" ry="4" fill="var(--surface)" />
          <path d="M80 72 C88 60 92 44 82 42 C76 40 74 54 76 68 Z" fill="var(--lavender)" />
          <ellipse cx="84" cy="42" rx="4.5" ry="4" fill="var(--surface)" />

          {/* Cat Head */}
          <circle cx="60" cy="54" r="22" fill="var(--lavender)" />

          {/* Cat Ears */}
          <path d="M43 46 C40 30 46 25 53 38 Z" fill="var(--lavender)" />
          <path d="M45 44 C43 33 47 29 51 38 Z" fill="var(--peach)" />
          <path d="M77 46 C80 30 74 25 67 38 Z" fill="var(--lavender)" />
          <path d="M75 44 C77 33 73 29 69 38 Z" fill="var(--peach)" />

          {/* Happy closed eyes (^ ^) */}
          <path d="M48 51 Q52 45 56 51" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M64 51 Q68 45 72 51" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Cheerful cheeks */}
          <circle cx="45" cy="56" r="3.5" fill="var(--peach)" opacity="0.7" />
          <circle cx="75" cy="56" r="3.5" fill="var(--peach)" opacity="0.7" />

          {/* Pink nose & open happy mouth */}
          <path d="M58 53 Q60 56 62 53 Z" fill="var(--peach)" />
          <path d="M57 55 Q60 62 63 55 Z" fill="var(--peach)" />

          {/* Whiskers */}
          <line x1="36" y1="53" x2="44" y2="54" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="36" y1="57" x2="44" y2="57" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="76" y1="54" x2="84" y2="53" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="76" y1="57" x2="84" y2="57" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />

          {/* Little Sprout Crown on Head */}
          <path d="M60 36 C56 30 50 32 52 27 C58 27 60 32 60 36 Z" fill="var(--success)" />
          <path d="M60 36 C64 30 70 32 68 27 C62 27 60 32 60 36 Z" fill="var(--success)" />
        </svg>
      );

    case 'concerned':
      return (
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={clsx('transition-transform duration-300', className)}
          style={sizeStyle}
          aria-label="Concerned Cat Mascot"
          role="img"
        >
          {/* Soft warning/coral aura */}
          <circle cx="60" cy="60" r="50" fill="var(--danger-soft)" />

          {/* Tucked tail */}
          <path
            d="M82 82 C88 84 92 80 90 75 C88 72 82 74 80 78"
            stroke="var(--lavender)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cat Chubby Body */}
          <ellipse cx="60" cy="78" rx="25" ry="24" fill="var(--lavender)" />
          <ellipse cx="60" cy="82" rx="16" ry="16" fill="var(--surface)" />

          {/* Paws held to chest with care */}
          <ellipse cx="53" cy="72" rx="4.5" ry="4" fill="var(--surface)" />
          <ellipse cx="67" cy="72" rx="4.5" ry="4" fill="var(--surface)" />

          {/* Cat Head */}
          <circle cx="60" cy="54" r="22" fill="var(--lavender)" />

          {/* Slightly flattened ears */}
          <path d="M42 48 C37 36 43 31 51 40 Z" fill="var(--lavender)" />
          <path d="M44 46 C40 37 44 33 49 40 Z" fill="var(--peach)" />
          <path d="M78 48 C83 36 77 31 69 40 Z" fill="var(--lavender)" />
          <path d="M76 46 C80 37 76 33 71 40 Z" fill="var(--peach)" />

          {/* Caring concerned wide eyes */}
          <circle cx="51" cy="50" r="4.5" fill="var(--surface)" />
          <circle cx="69" cy="50" r="4.5" fill="var(--surface)" />
          <circle cx="52" cy="50" r="2.5" fill="var(--danger)" />
          <circle cx="68" cy="50" r="2.5" fill="var(--danger)" />
          <circle cx="51" cy="49" r="0.9" fill="var(--surface)" />
          <circle cx="67" cy="49" r="0.9" fill="var(--surface)" />

          {/* Tilted concerned eyebrows */}
          <path d="M46 44 L54 47" stroke="var(--text-primary)" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M74 44 L66 47" stroke="var(--text-primary)" strokeWidth="1.8" strokeLinecap="round" />

          {/* Shy blush */}
          <circle cx="44" cy="56" r="3" fill="var(--peach)" opacity="0.5" />
          <circle cx="76" cy="56" r="3" fill="var(--peach)" opacity="0.5" />

          {/* Nose & concerned gentle mouth */}
          <path d="M58 54 Q60 57 62 54 Z" fill="var(--peach)" />
          <path d="M56 59 Q60 56 64 59" stroke="var(--text-primary)" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* Whiskers */}
          <line x1="36" y1="54" x2="44" y2="55" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="36" y1="58" x2="44" y2="58" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="76" y1="55" x2="84" y2="54" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="76" y1="58" x2="84" y2="58" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case 'encouraging':
      return (
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={clsx('transition-transform duration-300 hover:scale-105', className)}
          style={sizeStyle}
          aria-label="Encouraging Cat Mascot"
          role="img"
        >
          {/* Soft encouraging peach aura */}
          <circle cx="60" cy="60" r="50" fill="var(--peach-soft)" />

          {/* Tail curled happily */}
          <path
            d="M84 80 C94 80 98 70 92 66 C88 64 86 70 88 72"
            stroke="var(--lavender)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cat Chubby Body */}
          <ellipse cx="60" cy="78" rx="25" ry="24" fill="var(--lavender)" />
          <ellipse cx="60" cy="82" rx="16" ry="16" fill="var(--surface)" />

          {/* Left resting paw */}
          <ellipse cx="48" cy="74" rx="4.5" ry="3.5" fill="var(--surface)" />

          {/* Right Paw Raised in High-Five / Encouragement */}
          <path d="M72 74 C82 68 88 56 86 48 C82 44 76 54 74 66 Z" fill="var(--lavender)" />
          <ellipse cx="86" cy="46" rx="5" ry="4.5" fill="var(--surface)" />
          {/* Paw pads */}
          <circle cx="86" cy="46" r="1.5" fill="var(--peach)" />

          {/* Cat Head */}
          <circle cx="60" cy="54" r="22" fill="var(--lavender)" />

          {/* Cat Ears */}
          <path d="M43 46 C40 30 46 25 53 38 Z" fill="var(--lavender)" />
          <path d="M45 44 C43 33 47 29 51 38 Z" fill="var(--peach)" />
          <path d="M77 46 C80 30 74 25 67 38 Z" fill="var(--lavender)" />
          <path d="M75 44 C77 33 73 29 69 38 Z" fill="var(--peach)" />

          {/* One bright open eye & one friendly wink */}
          <circle cx="51" cy="50" r="4" fill="var(--surface)" />
          <circle cx="51" cy="50" r="2" fill="var(--text-primary)" />
          <circle cx="52" cy="49" r="0.8" fill="var(--surface)" />
          <path d="M64 51 Q68 46 72 51" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Cheerful blush */}
          <circle cx="44" cy="56" r="3.5" fill="var(--peach)" opacity="0.7" />
          <circle cx="76" cy="56" r="3.5" fill="var(--peach)" opacity="0.7" />

          {/* Pink nose & warm smile */}
          <path d="M58 53 Q60 56 62 53 Z" fill="var(--peach)" />
          <path d="M56 56 Q58 59 60 56 Q62 59 64 56" stroke="var(--text-primary)" strokeWidth="1.6" strokeLinecap="round" fill="none" />

          {/* Whiskers */}
          <line x1="36" y1="53" x2="44" y2="54" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="36" y1="57" x2="44" y2="57" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="76" y1="54" x2="84" y2="53" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="76" y1="57" x2="84" y2="57" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />

          {/* Little motivational star spark */}
          <circle cx="98" cy="42" r="3" fill="var(--peach)" />
        </svg>
      );

    case 'sleepy':
      return (
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={clsx('transition-transform duration-300', className)}
          style={sizeStyle}
          aria-label="Sleepy Resting Cat Mascot"
          role="img"
        >
          {/* Cozy muted well aura */}
          <circle cx="60" cy="60" r="50" fill="var(--surface-secondary)" />

          {/* Tail curled cozily over front paws */}
          <path
            d="M86 78 C94 80 92 90 78 90 C66 90 62 86 58 84"
            stroke="var(--lavender)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cat Curled Sleeping Body */}
          <ellipse cx="60" cy="74" rx="28" ry="20" fill="var(--lavender)" />
          <ellipse cx="60" cy="77" rx="18" ry="13" fill="var(--surface)" />

          {/* Tucked sleeping head */}
          <circle cx="50" cy="62" r="18" fill="var(--lavender)" />

          {/* Relaxed tilted ears */}
          <path d="M38 52 C35 42 41 38 46 46 Z" fill="var(--lavender)" />
          <path d="M39 50 C37 43 41 40 44 46 Z" fill="var(--peach)" />
          <path d="M62 52 C65 42 59 38 54 46 Z" fill="var(--lavender)" />
          <path d="M61 50 C63 43 59 40 56 46 Z" fill="var(--peach)" />

          {/* Peaceful closed eyes (- -) */}
          <path d="M42 63 Q46 66 50 63" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M52 63 Q56 66 60 63" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Soft sleeping breath / nose */}
          <path d="M49 66 Q51 68 53 66 Z" fill="var(--peach)" />

          {/* Cozy sleeping paws tucked together */}
          <ellipse cx="44" cy="76" rx="4" ry="3" fill="var(--surface)" />
          <ellipse cx="54" cy="76" rx="4" ry="3" fill="var(--surface)" />

          {/* Floating 'z Z Z' sleep letters */}
          <text x="82" y="44" fill="var(--lavender)" fontSize="11" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="90" y="34" fill="var(--lavender)" fontSize="14" fontWeight="bold" fontFamily="sans-serif">Z</text>
          <text x="100" y="22" fill="var(--peach)" fontSize="16" fontWeight="bold" fontFamily="sans-serif">Z</text>
        </svg>
      );

    case 'idle':
    default:
      return (
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={clsx('transition-transform duration-300 hover:scale-105', className)}
          style={sizeStyle}
          aria-label="Friendly Cat Mascot"
          role="img"
        >
          {/* Soft background aura */}
          <circle cx="60" cy="60" r="50" fill="var(--lavender)" />

          {/* Cat Tail curled on right */}
          <path
            d="M84 80 C94 80 98 70 92 66 C88 64 86 70 88 72"
            stroke="var(--lavender)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cat Chubby Body */}
          <ellipse cx="60" cy="78" rx="25" ry="24" fill="var(--lavender)" />
          {/* Soft Cream / White Belly */}
          <ellipse cx="60" cy="82" rx="16" ry="16" fill="var(--surface)" />

          {/* Tiny Heart Emblem on chest */}
          <path
            d="M60 76 C59 74 57 74 56 75 C55 76 55 78 60 81 C65 78 65 76 64 75 C63 74 61 74 60 76 Z"
            fill="var(--peach)"
          />

          {/* Cat Head */}
          <circle cx="60" cy="54" r="22" fill="var(--lavender)" />

          {/* Cat Ears */}
          <path d="M43 46 C40 30 46 25 53 38 Z" fill="var(--lavender)" />
          <path d="M45 44 C43 33 47 29 51 38 Z" fill="var(--peach)" />
          <path d="M77 46 C80 30 74 25 67 38 Z" fill="var(--lavender)" />
          <path d="M75 44 C77 33 73 29 69 38 Z" fill="var(--peach)" />

          {/* Cute Cat Eyes with Sparkle */}
          <circle cx="51" cy="50" r="3.8" fill="var(--surface)" />
          <circle cx="69" cy="50" r="3.8" fill="var(--surface)" />
          <circle cx="51" cy="50" r="2.2" fill="var(--text-primary)" />
          <circle cx="69" cy="50" r="2.2" fill="var(--text-primary)" />
          <circle cx="52" cy="49" r="0.8" fill="var(--surface)" />
          <circle cx="70" cy="49" r="0.8" fill="var(--surface)" />

          {/* Soft Rosy Cheeks */}
          <circle cx="44" cy="56" r="3.5" fill="var(--peach)" opacity="0.6" />
          <circle cx="76" cy="56" r="3.5" fill="var(--peach)" opacity="0.6" />

          {/* Pink Nose & Cute Cat Mouth (ω) */}
          <path d="M58 53 Q60 56 62 53 Z" fill="var(--peach)" />
          <path d="M56 56 Q58 59 60 56 Q62 59 64 56" stroke="var(--text-primary)" strokeWidth="1.6" strokeLinecap="round" fill="none" />

          {/* Whiskers */}
          <line x1="36" y1="53" x2="44" y2="54" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="36" y1="57" x2="44" y2="57" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="76" y1="54" x2="84" y2="53" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="76" y1="57" x2="84" y2="57" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />

          {/* Front Paws resting on belly */}
          <ellipse cx="53" cy="76" rx="4.5" ry="3.5" fill="var(--surface)" />
          <ellipse cx="67" cy="76" rx="4.5" ry="3.5" fill="var(--surface)" />
        </svg>
      );
  }
};

export default Mascot;
