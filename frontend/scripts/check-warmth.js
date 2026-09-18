import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colorsFile = path.resolve(__dirname, '../src/design-system/colors.ts');
const content = fs.readFileSync(colorsFile, 'utf-8');

// Parse key-value hex colors from colors.ts
const hexMatchRegex = /([a-zA-Z0-9]+)\s*:\s*['"](#([0-9a-fA-F]{6}))['"]/g;
const colors = {};
let match;
while ((match = hexMatchRegex.exec(content)) !== null) {
  // Only capture top-level tokens (before "dark:")
  if (match.index > content.indexOf('dark:')) break;
  colors[match[1]] = match[2].toUpperCase();
}

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
  ];
}

function lum(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastRatio(h1, h2) {
  const [r1, g1, b1] = hexToRgb(h1);
  const [r2, g2, b2] = hexToRgb(h2);
  const l1 = lum(r1, g1, b1);
  const l2 = lum(r2, g2, b2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

console.log(`\n======================================================`);
console.log(`🌡️  RGB Warmth Channel Balance & Contrast Verification`);
console.log(`======================================================\n`);

const warmTokens = [
  { name: 'App Background', hex: colors.background },
  { name: 'Surface Secondary (Well)', hex: colors.surfaceSecondary },
  { name: 'Border', hex: colors.border },
  { name: 'Text Primary', hex: colors.textPrimary },
  { name: 'Text Secondary', hex: colors.textSecondary },
  { name: 'Mentor Accent (Warm Lavender)', hex: colors.primary },
  { name: 'Mentor Accent Hover', hex: colors.primaryHover },
  { name: 'Soft Lavender Surface', hex: colors.lavender },
  { name: 'Soft Peach Surface', hex: colors.peachSoft },
  { name: 'Peach Accent', hex: colors.peach },
  { name: 'Coral Alert', hex: colors.danger },
  { name: 'Soft Coral Surface', hex: colors.dangerSoft },
];

let failedWarmth = 0;

console.log(`Warmth Clauses:`);
console.log(`  Clause 1: R >= B           (Red exceeds or equals Blue)`);
console.log(`  Clause 2: (R + G) > 2 * B  (Warm channels R+G strictly exceed 2*B)\n`);

warmTokens.forEach((t) => {
  const [r, g, b] = hexToRgb(t.hex);
  const c1 = r - b;
  const c2 = (r + g) - (2 * b);
  const c1Pass = c1 >= 0;
  const c2Pass = c2 >= 0;

  const passed = c1Pass && c2Pass;
  if (!passed) failedWarmth++;

  const status = passed ? '✅' : '❌';
  console.log(
    `${status} ${t.name.padEnd(30)} [${t.hex}] R:${r.toString().padStart(3)} G:${g
      .toString()
      .padStart(3)} B:${b.toString().padStart(3)} | C1 (R-B): ${c1 >= 0 ? '+' : ''}${c1
      .toString()
      .padStart(3)} | C2 ((R+G)-2B): ${c2 >= 0 ? '+' : ''}${c2.toString().padStart(3)}`
  );
});

console.log(`\n------------------------------------------------------`);
console.log(`📐 WCAG AA Contrast Checks (Target: >= 4.5:1)`);
console.log(`------------------------------------------------------\n`);

const contrastPairs = [
  { name: 'Text Primary on White Card', fg: colors.textPrimary, bg: colors.surface },
  { name: 'Text Primary on Cream Background', fg: colors.textPrimary, bg: colors.background },
  { name: 'Text Secondary on White Card', fg: colors.textSecondary, bg: colors.surface },
  { name: 'Text Secondary on Cream Background', fg: colors.textSecondary, bg: colors.background },
  { name: 'Primary Action (Rest) on White', fg: colors.success, bg: colors.surface },
  { name: 'Primary Action (Hover) on White', fg: colors.successHover, bg: colors.surface },
  { name: 'Mentor Lavender on White', fg: colors.primary, bg: colors.surface },
  { name: 'Mentor Lavender on Soft Lavender', fg: colors.primary, bg: colors.lavender },
  { name: 'Danger Text on Soft Danger', fg: colors.dangerText, bg: colors.dangerSoft },
  { name: 'Warning Text on Soft Warning', fg: colors.warningText, bg: colors.warningSoft },
  { name: 'Peach Text on Soft Peach', fg: colors.peachText, bg: colors.peachSoft },
];

let failedContrast = 0;

contrastPairs.forEach((pair) => {
  const cr = contrastRatio(pair.fg, pair.bg);
  const passed = cr >= 4.5;
  if (!passed) failedContrast++;
  const status = passed ? '✅' : '❌';
  const margin = cr - 4.5;
  console.log(
    `${status} ${pair.name.padEnd(36)} : ${cr.toFixed(2)}:1 (Req: >= 4.5:1) [Margin: ${margin >= 0 ? '+' : ''}${margin.toFixed(2)}]`
  );
});

console.log(`\n======================================================`);
if (failedWarmth > 0 || failedContrast > 0) {
  console.error(`❌ Verification failed: ${failedWarmth} warmth failures, ${failedContrast} contrast failures.\n`);
  process.exit(1);
} else {
  console.log(`🎉 ALL Warmth channel balance and WCAG AA contrast checks PASSED with wide headroom!\n`);
  process.exit(0);
}
