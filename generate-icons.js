const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Generate icon at specified size
async function generateIcon(size, filename) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#5ac8fa"/>
      <stop offset="100%" style="stop-color:#007aff"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.39}" fill="rgba(255,255,255,0.15)"/>
  <path d="M${size/2} ${size * 0.25} L${size/2} ${size * 0.75} M${size * 0.25} ${size/2} L${size * 0.75} ${size/2}"
        stroke="white" stroke-width="${size * 0.094}" stroke-linecap="round"/>
</svg>`;

    const outputPath = path.join(__dirname, 'icons', filename);

    await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);

    console.log(`Generated: ${outputPath}`);
}

async function main() {
    // iOS icon sizes
    const sizes = [
        { size: 180, name: 'apple-touch-icon-180.png' },
        { size: 152, name: 'apple-touch-icon-152.png' },
        { size: 120, name: 'apple-touch-icon-120.png' },
        { size: 192, name: 'icon-192.png' },
        { size: 512, name: 'icon-512.png' },
        { size: 180, name: 'apple-touch-icon.png' }, // Default iOS
    ];

    for (const { size, name } of sizes) {
        await generateIcon(size, name);
    }

    console.log('All icons generated!');
}

main().catch(console.error);
