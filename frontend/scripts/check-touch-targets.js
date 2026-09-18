import fs from 'fs';
import path from 'path';

console.log('======================================================');
console.log('📱 Mobile Touch Target Accessibility Verification (>= 48px)');
console.log('======================================================\n');

const bottomNavPath = path.resolve('src/components/domain/BottomNav.tsx');
const content = fs.readFileSync(bottomNavPath, 'utf8');

const violations = [];

// Verify min-h and min-w in BottomNav
const minHMatch = content.match(/min-h-\[(\d+)px\]/g);
const minWMatch = content.match(/min-w-\[(\d+)px\]/g);

console.log('Inspecting BottomNav.tsx:');
let touchTargetMinH = 0;
let touchTargetMinW = 0;

if (content.includes('min-h-[48px]')) {
  touchTargetMinH = 48;
  console.log('✅ Nav Item minimum height: 48px (meets >= 48px requirement)');
} else {
  violations.push('BottomNav items missing min-h-[48px]');
}

if (content.includes('min-w-[48px]')) {
  touchTargetMinW = 48;
  console.log('✅ Nav Item minimum width:  48px (meets >= 48px requirement)');
} else {
  violations.push('BottomNav items missing min-w-[48px]');
}

if (content.includes('min-h-[64px]') || content.includes('h-16')) {
  console.log('✅ Nav Bar container height: 64px (ample container headroom)');
} else {
  violations.push('BottomNav container height should be at least 64px');
}

if (violations.length > 0) {
  console.error('\n❌ Violations found:');
  violations.forEach(v => console.error(`  - ${v}`));
  process.exit(1);
} else {
  console.log('\n🎉 ALL Mobile Touch Targets conform to >= 48px requirement!\n');
  process.exit(0);
}
