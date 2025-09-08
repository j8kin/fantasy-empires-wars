export type PlayerColorName =
  | 'blue'
  | 'red'
  | 'green'
  | 'orange'
  | 'purple'
  | 'yellow'
  | 'gray'
  | 'darkSlateGray';

export interface PlayerColor {
  name: PlayerColorName;
  value: string;
  displayName: string;
}

export const PLAYER_COLORS: PlayerColor[] = [
  { name: 'blue', value: '#4A90E2', displayName: 'Blue' },
  { name: 'red', value: '#C0392B', displayName: 'Red' },
  { name: 'green', value: '#27AE60', displayName: 'Green' },
  { name: 'orange', value: '#E67E22', displayName: 'Orange' },
  { name: 'purple', value: '#8B4A9C', displayName: 'Purple' },
  { name: 'yellow', value: '#F1C40F', displayName: 'Yellow' },
  { name: 'gray', value: '#95A5A6', displayName: 'Gray' },
  { name: 'darkSlateGray', value: '#2F4F4F', displayName: 'Dark Slate Gray' },
];

// Convenience array of just the color values for backward compatibility
PLAYER_COLORS.map((color) => color.value);
// Helper functions
