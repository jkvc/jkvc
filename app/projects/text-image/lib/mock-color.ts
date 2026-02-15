/**
 * Samples pixels from the original image to extract dominant color per region.
 * This mock actually produces realistic colors since it reads real pixel data.
 *
 * TODO: Replace with proper k-means color clustering for more accurate results.
 */
export function mockDominantColor(
  imageData: ImageData,
  regions: {
    bbox: { x: number; y: number; width: number; height: number };
    mask: boolean[][];
  }[]
): [number, number, number][] {
  const { data, width } = imageData;

  return regions.map((region) => {
    let r = 0,
      g = 0,
      b = 0,
      count = 0;
    const { x: bx, y: by, width: bw, height: bh } = region.bbox;

    for (let row = 0; row < bh; row += 4) {
      for (let col = 0; col < bw; col += 4) {
        if (!region.mask[row]?.[col]) continue;
        const px = bx + col;
        const py = by + row;
        const idx = (py * width + px) * 4;
        r += data[idx];
        g += data[idx + 1];
        b += data[idx + 2];
        count++;
      }
    }

    if (count === 0) return [128, 128, 128] as [number, number, number];
    return [
      Math.round(r / count),
      Math.round(g / count),
      Math.round(b / count),
    ] as [number, number, number];
  });
}
