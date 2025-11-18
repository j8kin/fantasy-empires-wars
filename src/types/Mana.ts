export const MAX_MANA = 200;

export enum ManaType {
  WHITE = 'white',
  BLACK = 'black',
  GREEN = 'green',
  BLUE = 'blue',
  RED = 'red',
}

export type Mana = Record<ManaType, number>;

export const getManaColor = (mana: ManaType): string =>
  ({ white: '#f5f1e8', black: '#3a2f41', green: '#30c46d', blue: '#2daefc', red: '#e64426' })[mana];

/**
 * Converts hex color to RGB values
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Darkens a hex color by a given factor
 */
const darkenColor = (hex: string, factor: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.max(0, Math.floor(rgb.r * factor));
  const g = Math.max(0, Math.floor(rgb.g * factor));
  const b = Math.max(0, Math.floor(rgb.b * factor));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Returns gradient colors for mana type
 * Returns [baseColor, darkerColor] for linear gradient
 */
export const getManaGradient = (mana: ManaType): [string, string] => {
  const baseColor = getManaColor(mana);
  const darkerColor = darkenColor(baseColor, 0.25);
  return [baseColor, darkerColor];
};
