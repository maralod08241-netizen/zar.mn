const fs = require('node:fs');
const path = require('node:path');

const iconNames = [
  'house', 'layout-list', 'circle-plus', 'log-in', 'user-round-plus', 'log-out',
  'search', 'arrow-up-right', 'map-pin', 'calendar-days', 'sparkles', 'phone',
  'trash-2', 'book-open', 'users-round', 'blocks', 'handshake', 'newspaper',
  'circle-help', 'arrow-right'
];
const sourceDirectory = path.join(__dirname, '../node_modules/lucide-static/icons');
const outputDirectory = path.join(__dirname, '../public/icons');

fs.mkdirSync(outputDirectory, { recursive: true });

for (const iconName of iconNames) {
  fs.copyFileSync(
    path.join(sourceDirectory, `${iconName}.svg`),
    path.join(outputDirectory, `${iconName}.svg`)
  );
}

console.log(`Copied ${iconNames.length} Lucide icons to public/icons`);