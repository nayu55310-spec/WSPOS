import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, drawFn) {
  const bytesPerPixel = 4;
  const scanlineLength = width * bytesPerPixel + 1;
  const rawBuffer = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawBuffer[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      rawBuffer[pixelOffset] = r;
      rawBuffer[pixelOffset + 1] = g;
      rawBuffer[pixelOffset + 2] = b;
      rawBuffer[pixelOffset + 3] = a;
    }
  }

  const deflatedData = zlib.deflateSync(rawBuffer);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression method: 0
  ihdrData[11] = 0; // Filter method: 0
  ihdrData[12] = 0; // Interlace method: 0
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = createChunk('IDAT', deflatedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcTarget = chunk.subarray(4, 8 + length);
  const crc = crc32(crcTarget);
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 table & calculation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Draw standard icon with rounded rect and store/register graphics
function drawWSPOS(x, y, w, h, isMaskable = false) {
  const nx = x / w;
  const ny = y / h;

  // Background: dark charcoal slate with subtle amber gradient
  // #121214 -> #1f1b14
  const bgR = Math.round(18 + nx * 12);
  const bgG = Math.round(18 + ny * 8);
  const bgB = Math.round(20);

  // Center coordinates:
  const cx = 0.5;
  const cy = 0.46;
  const dx = nx - cx;
  const dy = ny - cy;

  // Draw gold/amber rounded square container in center
  // Center box:
  const boxW = isMaskable ? 0.38 : 0.44;
  const boxH = isMaskable ? 0.38 : 0.44;
  const cornerR = isMaskable ? 0.09 : 0.11;

  // Check if inside box
  const qx = Math.abs(dx) - (boxW - cornerR);
  const qy = Math.abs(dy) - (boxH - cornerR);
  const dist = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - cornerR;

  if (dist <= 0) {
    // Inside the amber icon container
    // Gradient from amber-400 (#fbbf24) to amber-500 (#f59e0b) to amber-600 (#d97706)
    const factor = (ny - (cy - boxH)) / (boxH * 2);
    const ir = Math.round(251 - factor * 35);
    const ig = Math.round(191 - factor * 70);
    const ib = Math.round(36 - factor * 30);

    // Inner Store roof & pillar graphics
    // Awning / Store roof at top of box: cy - 0.18 to cy - 0.05
    const roofY = ny - cy;
    const roofX = dx;

    // Awning triangle / roof
    if (roofY >= -0.20 && roofY <= -0.08 && Math.abs(roofX) <= 0.24) {
      // Store Roof / Awning
      const roofProgress = (roofY - (-0.20)) / 0.12;
      const roofSlope = 0.24 * roofProgress;
      if (Math.abs(roofX) <= roofSlope + 0.04) {
        return [18, 18, 20, 255]; // Dark charcoal icon cutout
      }
    }

    // Pillars / Storefront: cy - 0.05 to cy + 0.14
    if (roofY > -0.06 && roofY <= 0.16 && Math.abs(roofX) <= 0.20) {
      // Left pillar, Right pillar, or Counter
      const inLeftPillar = roofX >= -0.18 && roofX <= -0.10;
      const inRightPillar = roofX >= 0.10 && roofX <= 0.18;
      const inCenterDoor = roofX >= -0.05 && roofX <= 0.05 && roofY >= 0.02;
      const inCounter = roofY >= 0.12 && roofY <= 0.16;

      if (inLeftPillar || inRightPillar || inCounter || inCenterDoor) {
        return [18, 18, 20, 255]; // Dark charcoal icon cutout
      }
    }

    return [ir, ig, ib, 255];
  }

  // Outside container - draw dark background
  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192
const p192 = createPng(192, 192, (x, y, w, h) => drawWSPOS(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), p192);

// Generate 512x512
const p512 = createPng(512, 512, (x, y, w, h) => drawWSPOS(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), p512);

// Generate maskable 512x512 with safe zone padding
const pMaskable = createPng(512, 512, (x, y, w, h) => drawWSPOS(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pMaskable);

// Generate 180x180 for Apple touch icon
const pApple = createPng(180, 180, (x, y, w, h) => drawWSPOS(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pApple);

// Generate 64x64 favicon
const pFavicon = createPng(64, 64, (x, y, w, h) => drawWSPOS(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), pFavicon);

console.log('Successfully generated PWA icon assets in public/');
