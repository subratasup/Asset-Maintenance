/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Simple deterministic pseudo-random QR matrix generator as SVG to draw a beautiful, pixel-perfect barcode/QR layout.
export function generateQRsvg(content: string, size = 120): string {
  // Hash content to make the QR grid deterministic for the same asset tag
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = content.charCodeAt(i) + ((hash << 5) - hash);
  }

  const matrixSize = 21; // 21x21 grid (QR Version 1)
  const rects: string[] = [];
  const padding = size * 0.08;
  const activeArea = size - padding * 2;
  const cellSize = activeArea / matrixSize;

  // Draw alignment finder patterns
  const drawFinder = (x: number, y: number) => {
    // Outer 7x7 box
    rects.push(`<rect x="${x * cellSize + padding}" y="${y * cellSize + padding}" width="${7 * cellSize}" height="${7 * cellSize}" fill="black" />`);
    // Inner 5x5 white box
    rects.push(`<rect x="${(x + 1) * cellSize + padding}" y="${(y + 1) * cellSize + padding}" width="${5 * cellSize}" height="${5 * cellSize}" fill="white" />`);
    // Center 3x3 solid box
    rects.push(`<rect x="${(x + 2) * cellSize + padding}" y="${(y + 2) * cellSize + padding}" width="${3 * cellSize}" height="${3 * cellSize}" fill="black" />`);
  };

  // Top-Left Finder
  drawFinder(0, 0);
  // Top-Right Finder
  drawFinder(matrixSize - 7, 0);
  // Bottom-Left Finder
  drawFinder(0, matrixSize - 7);

  // Small alignment pattern on Bottom-Right
  rects.push(`<rect x="${(matrixSize - 6) * cellSize + padding}" y="${(matrixSize - 6) * cellSize + padding}" width="${2 * cellSize}" height="${2 * cellSize}" fill="black" />`);

  // Randomize other cells based on hash
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Skip finder pattern zones
      if (r < 8 && c < 8) continue;
      if (r < 8 && c >= matrixSize - 8) continue;
      if (r >= matrixSize - 8 && c < 8) continue;

      // Deterministic noise
      const pseudoVal = Math.abs(Math.sin(hash + r * 13 + c * 37));
      if (pseudoVal > 0.46) {
        rects.push(`<rect x="${c * cellSize + padding}" y="${r * cellSize + padding}" width="${cellSize + 0.2}" height="${cellSize + 0.2}" fill="black" />`);
      }
    }
  }

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg" style="background: white;">
      <rect width="${size}" height="${size}" rx="${size * 0.08}" fill="white" />
      ${rects.join('\n')}
    </svg>
  `;
}
