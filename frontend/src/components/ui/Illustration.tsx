import React from 'react';
import { Mascot } from './Mascot.js';

export type IllustrationName =
  | 'books'
  | 'coffee'
  | 'plant'
  | 'sprout'
  | 'laptop'
  | 'desk'
  | 'blooming'
  | 'seed'
  | 'mascot-idle'
  | 'mascot-celebrate'
  | 'mascot-concerned'
  | 'mascot-encouraging'
  | 'mascot-sleepy'
  | 'empty-roadmaps'
  | 'empty-calendar';

interface IllustrationProps {
  name: IllustrationName;
  className?: string;
  size?: number | string;
}

export const Illustration: React.FC<IllustrationProps> = ({
  name,
  className = 'w-24 h-24 sm:w-28 sm:h-28',
  size,
}) => {
  const sizeStyle = size ? { width: size, height: size } : undefined;

  switch (name) {
    case 'books':
      return (
        <svg
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={sizeStyle}
          aria-hidden="true"
        >
          <circle cx="70" cy="70" r="54" fill="var(--success-soft)" />
          {/* Base Book (bottom) */}
          <rect x="34" y="96" width="72" height="14" rx="3" fill="var(--primary)" />
          <rect x="36" y="98" width="68" height="10" rx="1.5" fill="var(--surface)" />
          <line x1="42" y1="103" x2="98" y2="103" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />

          {/* Middle Book */}
          <rect x="38" y="80" width="64" height="13" rx="3" fill="var(--peach)" />
          <rect x="40" y="82" width="60" height="9" rx="1.5" fill="var(--surface)" />
          <line x1="46" y1="86" x2="94" y2="86" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />

          {/* Top Open Book */}
          <path
            d="M40 56 C52 53 66 57 70 60 C74 57 88 53 100 56 L100 76 C88 73 74 77 70 80 C66 77 52 73 40 76 Z"
            fill="var(--surface)"
            stroke="var(--success)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M70 60 L70 80" stroke="var(--success)" strokeWidth="2" />
          {/* Page Lines */}
          <line x1="48" y1="63" x2="64" y2="65" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="48" y1="69" x2="62" y2="71" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="76" y1="65" x2="92" y2="63" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="76" y1="71" x2="90" y2="69" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />

          {/* Warm Sparks */}
          <circle cx="106" cy="44" r="3" fill="var(--peach)" />
          <circle cx="34" cy="48" r="2.5" fill="var(--primary)" />
          <circle cx="108" cy="76" r="2" fill="var(--success)" />
        </svg>
      );

    case 'coffee':
      return (
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={sizeStyle}
          aria-hidden="true"
        >
          <circle cx="60" cy="60" r="48" fill="var(--peach-soft)" />
          {/* Saucer */}
          <ellipse cx="60" cy="88" rx="34" ry="7" fill="var(--border)" />
          {/* Cup */}
          <path
            d="M38 52 L42 82 C43 85 47 87 51 87 L69 87 C73 87 77 85 78 82 L82 52 Z"
            fill="var(--surface)"
            stroke="var(--peach)"
            strokeWidth="2.5"
          />
          {/* Handle */}
          <path
            d="M82 58 C90 58 94 65 92 73 C90 79 84 81 80 80"
            stroke="var(--peach)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Heart / Warm Emblem */}
          <circle cx="60" cy="68" r="4" fill="var(--peach)" />
          {/* Steams */}
          <path d="M52 44 C50 40 54 36 52 32" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M60 42 C58 38 62 34 60 30" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M68 44 C66 40 70 36 68 32" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'seed':
      return (
        <svg
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={sizeStyle}
          aria-hidden="true"
        >
          <circle cx="70" cy="70" r="54" fill="var(--peach-soft)" />
          {/* Soil Mound */}
          <ellipse cx="70" cy="98" rx="46" ry="14" fill="var(--surface-secondary)" />
          <path d="M30 96 C45 88 95 88 110 96 C105 106 35 106 30 96 Z" fill="var(--border)" opacity="0.6" />
          {/* Gentle Seed */}
          <ellipse cx="70" cy="88" rx="9" ry="12" transform="rotate(-15 70 88)" fill="var(--peach)" />
          {/* Tiny emerging root / spark */}
          <path d="M70 76 C70 70 74 66 77 62" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="78" cy="60" r="3" fill="var(--success)" />
          {/* Gentle aura sparkles */}
          <circle cx="52" cy="64" r="2.5" fill="var(--peach)" />
          <circle cx="92" cy="72" r="2" fill="var(--primary)" />
        </svg>
      );

    case 'sprout':
    case 'plant':
      return (
        <svg
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={sizeStyle}
          aria-hidden="true"
        >
          <circle cx="70" cy="70" r="54" fill="var(--success-soft)" />
          {/* Pot */}
          <path d="M52 86 L88 86 L83 110 L57 110 Z" fill="var(--peach)" />
          <ellipse cx="70" cy="86" rx="18" ry="4" fill="var(--peach-hover)" />
          {/* Stem */}
          <path d="M70 84 C70 66 69 52 70 42" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" />
          {/* Left Leaf */}
          <path
            d="M70 68 C58 64 50 52 54 44 C62 44 68 56 70 68 Z"
            fill="var(--success)"
            stroke="var(--success-hover)"
            strokeWidth="1.5"
          />
          {/* Right Leaf */}
          <path
            d="M70 56 C82 52 90 40 86 32 C78 32 72 44 70 56 Z"
            fill="var(--success)"
            stroke="var(--success-hover)"
            strokeWidth="1.5"
          />
          {/* Top Sprout Tip */}
          <circle cx="70" cy="40" r="3" fill="var(--success)" />
          {/* Sparkles */}
          <circle cx="44" cy="50" r="2.5" fill="var(--peach)" />
          <circle cx="96" cy="46" r="2.5" fill="var(--primary)" />
        </svg>
      );

    case 'blooming':
      return (
        <svg
          viewBox="0 0 150 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={sizeStyle}
          aria-hidden="true"
        >
          <circle cx="75" cy="75" r="60" fill="var(--lavender)" />
          {/* Stem */}
          <path d="M75 125 C75 105 74 90 75 75" stroke="var(--success)" strokeWidth="3.5" strokeLinecap="round" />
          {/* Foliage leaves */}
          <path d="M75 105 C60 102 52 88 58 78 C68 80 74 94 75 105 Z" fill="var(--success)" />
          <path d="M75 95 C90 92 98 78 92 68 C82 70 76 84 75 95 Z" fill="var(--success)" />
          {/* Blooming Petals */}
          <circle cx="75" cy="55" r="14" fill="var(--primary)" />
          <circle cx="58" cy="65" r="13" fill="var(--primary)" opacity="0.9" />
          <circle cx="92" cy="65" r="13" fill="var(--primary)" opacity="0.9" />
          <circle cx="65" cy="80" r="12" fill="var(--peach)" />
          <circle cx="85" cy="80" r="12" fill="var(--peach)" />
          {/* Center Golden Pistil */}
          <circle cx="75" cy="68" r="9" fill="var(--peach-soft)" stroke="var(--peach)" strokeWidth="2" />
          <circle cx="75" cy="68" r="4" fill="var(--peach)" />
          {/* Floating celebratory dots */}
          <circle cx="42" cy="45" r="3" fill="var(--primary)" />
          <circle cx="108" cy="48" r="3.5" fill="var(--peach)" />
          <circle cx="75" cy="28" r="2.5" fill="var(--success)" />
        </svg>
      );

    case 'laptop':
      return (
        <svg
          viewBox="0 0 140 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={sizeStyle}
          aria-hidden="true"
        >
          <circle cx="70" cy="60" r="48" fill="var(--lavender)" />
          {/* Screen Shell */}
          <rect x="36" y="32" width="68" height="46" rx="4" fill="var(--primary)" />
          {/* Screen Glass */}
          <rect x="40" y="36" width="60" height="38" rx="2" fill="var(--surface)" />
          {/* Code/Text lines on screen */}
          <rect x="46" y="44" width="28" height="3" rx="1.5" fill="var(--success)" />
          <rect x="46" y="51" width="42" height="2.5" rx="1" fill="var(--border)" />
          <rect x="46" y="57" width="34" height="2.5" rx="1" fill="var(--border)" />
          <circle cx="88" cy="45" r="3" fill="var(--peach)" />
          {/* Base keyboard */}
          <path d="M26 80 L114 80 L108 90 L32 90 Z" fill="var(--surface-secondary)" stroke="var(--border)" strokeWidth="1.5" />
          <rect x="62" y="82" width="16" height="3" rx="1" fill="var(--border)" />
        </svg>
      );

    case 'desk':
      return (
        <svg
          viewBox="0 0 160 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={sizeStyle}
          aria-hidden="true"
        >
          <circle cx="80" cy="70" r="56" fill="var(--success-soft)" />
          {/* Desk Base */}
          <rect x="20" y="112" width="120" height="6" rx="3" fill="var(--border)" />
          {/* Laptop */}
          <rect x="36" y="98" width="54" height="14" rx="3" fill="var(--surface-secondary)" />
          <rect x="42" y="58" width="42" height="40" rx="4" fill="var(--primary)" />
          <rect x="45" y="61" width="36" height="32" rx="2" fill="var(--surface)" />
          <rect x="49" y="68" width="18" height="3" rx="1.5" fill="var(--success)" />
          <rect x="49" y="74" width="26" height="2" rx="1" fill="var(--border)" />
          <rect x="49" y="79" width="20" height="2" rx="1" fill="var(--border)" />
          <circle cx="73" cy="84" r="2.5" fill="var(--peach)" />
          {/* Potted Plant on desk */}
          <path d="M104 88 L120 88 L117 110 L107 110 Z" fill="var(--peach)" />
          <ellipse cx="112" cy="88" rx="8" ry="3" fill="var(--peach-hover)" />
          <path d="M112 86 C108 74 98 76 100 68 C106 68 112 78 112 86 Z" fill="var(--success)" />
          <path d="M112 86 C116 70 128 72 124 64 C118 64 113 76 112 86 Z" fill="var(--success)" />
          {/* Coffee Mug */}
          <rect x="94" y="98" width="7" height="11" rx="2" fill="var(--primary)" />
        </svg>
      );

    case 'mascot-idle':
      return <Mascot pose="idle" className={className} size={size} />;

    case 'mascot-celebrate':
      return <Mascot pose="celebrating" className={className} size={size} />;

    case 'mascot-concerned':
      return <Mascot pose="concerned" className={className} size={size} />;

    case 'mascot-encouraging':
      return <Mascot pose="encouraging" className={className} size={size} />;

    case 'mascot-sleepy':
      return <Mascot pose="sleepy" className={className} size={size} />;

    case 'empty-roadmaps':
      return (
        <svg
          viewBox="0 0 160 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={sizeStyle}
          aria-hidden="true"
        >
          <circle cx="80" cy="70" r="56" fill="var(--lavender)" />
          {/* Bookshelf wooden shelf */}
          <rect x="24" y="96" width="112" height="8" rx="3" fill="var(--border)" />
          <rect x="30" y="104" width="8" height="14" rx="2" fill="var(--border)" opacity="0.6" />
          <rect x="122" y="104" width="8" height="14" rx="2" fill="var(--border)" opacity="0.6" />
          {/* Single potted succulent waiting for books */}
          <path d="M42 78 L56 78 L53 96 L45 96 Z" fill="var(--peach)" />
          <ellipse cx="49" cy="78" rx="7" ry="2.5" fill="var(--peach-hover)" />
          <path d="M49 76 C46 66 40 68 41 62 C46 62 49 70 49 76 Z" fill="var(--success)" />
          <path d="M49 76 C52 66 58 68 57 62 C52 62 49 70 49 76 Z" fill="var(--success)" />
          {/* Bookend awaiting roadmaps */}
          <path d="M106 96 L106 74 L114 96 Z" fill="var(--primary)" opacity="0.4" />
          {/* Sparks of imagination */}
          <circle cx="80" cy="62" r="3" fill="var(--peach)" />
          <circle cx="72" cy="74" r="2" fill="var(--primary)" />
          <circle cx="88" cy="76" r="2.5" fill="var(--success)" />
        </svg>
      );

    case 'empty-calendar':
      return (
        <svg
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={sizeStyle}
          aria-hidden="true"
        >
          <circle cx="70" cy="70" r="54" fill="var(--success-soft)" />
          {/* Calendar Body */}
          <rect x="36" y="42" width="68" height="64" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
          <path d="M36 50 C36 45.6 39.6 42 44 42 L96 42 C100.4 42 104 45.6 104 50 L104 58 L36 58 Z" fill="var(--primary)" />
          {/* Binder Rings */}
          <rect x="48" y="36" width="5" height="12" rx="2.5" fill="var(--text-primary)" />
          <rect x="87" y="36" width="5" height="12" rx="2.5" fill="var(--text-primary)" />
          {/* Grid Dots */}
          <circle cx="50" cy="70" r="3" fill="var(--success)" />
          <circle cx="64" cy="70" r="3" fill="var(--success)" />
          <circle cx="78" cy="70" r="3" fill="var(--peach)" />
          <circle cx="92" cy="70" r="3" fill="var(--border)" />
          <circle cx="50" cy="84" r="3" fill="var(--border)" />
          <circle cx="64" cy="84" r="3.5" fill="var(--primary)" />
          <circle cx="78" cy="84" r="3" fill="var(--border)" />
          <circle cx="92" cy="84" r="3" fill="var(--border)" />
        </svg>
      );

    default:
      return null;
  }
};

export default Illustration;
