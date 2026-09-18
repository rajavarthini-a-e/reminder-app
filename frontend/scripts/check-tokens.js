import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDirs = [
  path.resolve(__dirname, '../src/components'),
  path.resolve(__dirname, '../src/pages'),
];

function getFiles(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getFiles(fullPath));
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      // Exclude vector illustration assets that are purely self-contained SVG paths if needed,
      // but let's check all files
      files.push(fullPath);
    }
  }
  return files;
}

const hexRegex = /#([0-9a-fA-F]{3,8})\b/g;

let violations = [];

for (const dir of targetDirs) {
  const files = getFiles(dir);
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Ignore single line comments
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

      const matches = line.match(hexRegex);
      if (matches) {
        violations.push({
          file: path.relative(path.resolve(__dirname, '../..'), file),
          line: index + 1,
          matches,
          snippet: trimmed,
        });
      }
    });
  }
}

console.log(`\n========================================`);
console.log(`🔍 Token Enforcement Check`);
console.log(`========================================`);

if (violations.length > 0) {
  console.error(`❌ Found ${violations.length} raw hex color violations in components/pages:`);
  violations.forEach((v) => {
    console.error(`  - ${v.file}:${v.line} -> [${v.matches.join(', ')}] in "${v.snippet.slice(0, 60)}..."`);
  });
  console.error(`\nPlease replace raw hex colors with design tokens or semantic Tailwind classes.\n`);
  process.exit(1);
} else {
  console.log(`✅ Passed! Zero raw hex colors detected in components and pages.\n`);
  process.exit(0);
}
