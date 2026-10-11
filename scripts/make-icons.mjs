// Uygulama ikonlarını tek bir SVG'den üretir: npm run icons
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const paw = `
  <g fill="#fffdfb">
    <ellipse cx="256" cy="318" rx="92" ry="78"/>
    <ellipse cx="150" cy="232" rx="40" ry="50"/>
    <ellipse cx="218" cy="170" rx="40" ry="52"/>
    <ellipse cx="294" cy="170" rx="40" ry="52"/>
    <ellipse cx="362" cy="232" rx="40" ry="50"/>
  </g>`
const svg = (radius, scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${radius}" fill="#b8a1e3"/>
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">${paw}</g>
</svg>`

writeFileSync('public/favicon.svg', svg(112, 1))
const out = [
  ['public/icon-192.png', 192, svg(112, 1)],
  ['public/icon-512.png', 512, svg(112, 1)],
  ['public/icon-maskable.png', 512, svg(0, 0.72)],
  ['public/apple-touch-icon.png', 180, svg(0, 0.86)],
]
for (const [file, size, source] of out) {
  await sharp(Buffer.from(source)).resize(size, size).png().toFile(file)
}
