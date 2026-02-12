import type { HexCell, HexLevelSpec } from "./types";

const HEX_AREA_FACTOR = (3 * Math.sqrt(3)) / 2;

export function hexAreaFromSide(sideMeters: number): number {
  return HEX_AREA_FACTOR * sideMeters * sideMeters;
}

export function hexSideFromArea(areaM2: number): number {
  return Math.sqrt(areaM2 / HEX_AREA_FACTOR);
}

export function axialToWorld(q: number, r: number, sizeMeters: number) {
  const x = sizeMeters * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = sizeMeters * (1.5 * r);
  return { x, y };
}

export function generateHexGrid(radius: number, level = 0): HexCell[] {
  const cells: HexCell[] = [];
  for (let q = -radius; q <= radius; q += 1) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r += 1) {
      cells.push({ q, r, level, flags: 0 });
    }
  }
  return cells;
}

export function buildHexLevels(options: {
  topAreaKm2?: number;
  minAreaM2?: number;
  levels?: number;
} = {}): HexLevelSpec[] {
  const topAreaKm2 = options.topAreaKm2 ?? 1000;
  const minAreaM2 = options.minAreaM2 ?? 10;
  const levels = Math.max(2, options.levels ?? 6);
  const topAreaM2 = topAreaKm2 * 1_000_000;
  const ratio = Math.pow(topAreaM2 / minAreaM2, 1 / (levels - 1));

  const specs: HexLevelSpec[] = [];
  for (let level = 0; level < levels; level += 1) {
    const areaM2 = topAreaM2 / Math.pow(ratio, level);
    const sideMeters = hexSideFromArea(areaM2);
    specs.push({
      level,
      areaM2,
      sideMeters,
      acrossFlatsMeters: sideMeters * Math.sqrt(3),
    });
  }
  return specs;
}
