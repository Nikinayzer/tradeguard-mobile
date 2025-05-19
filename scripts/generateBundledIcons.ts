import * as fs from 'fs';
import * as path from 'path';

/**
 * This script generates an index file for bundled icons in the crypto directory.
 * Run after downloading icons.
 */
const ICONS_DIR = path.join(__dirname, '../assets/icons/crypto');
const OUTPUT_FILE = path.join(ICONS_DIR, 'index.ts');

function generateBundledIconsList() {
    try {
        const files = fs.readdirSync(ICONS_DIR);

        const icons = files
            .filter(file => file.endsWith('.png'))
            .map(file => file.replace('.png', ''));

        const content = `// This file is auto-generated. Do not edit manually.
// Generated at: ${new Date().toISOString()}

export const BUNDLED_ICONS = [
    ${icons.map(icon => `'${icon}'`).join(',\n    ')}
] as const;

export type BundledIcon = typeof BUNDLED_ICONS[number];

export function isBundledIcon(symbol: string): symbol is BundledIcon {
    return BUNDLED_ICONS.includes(symbol.toLowerCase() as BundledIcon);
}

// Export all icons
${icons.map(icon => `export const ${icon} = require('./${icon}.png');`).join('\n')}
`;
        fs.writeFileSync(OUTPUT_FILE, content);
        console.log(`✅ Generated bundled icons index with ${icons.length} icons`);
    } catch (error) {
        console.error('❌ Error generating bundled icons index:', error);
        process.exit(1);
    }
}

generateBundledIconsList(); 