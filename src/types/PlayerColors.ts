export type PlayerColorName =
  | 'white' // use for neutral Lands which no one controls
  | 'blue'
  | 'red'
  | 'green'
  | 'orange'
  | 'purple'
  | 'yellow'
  | 'gray'
  | 'burgundy'
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
  { name: 'burgundy', value: '#8B1538', displayName: 'Bloody Burgundy' },
  { name: 'darkSlateGray', value: '#2F4F4F', displayName: 'Dark Slate Gray' },
];

// Convenience array of just the color values for backward compatibility
PLAYER_COLORS.map((color) => color.value);

// Helper functions
export const getPlayerColorValue = (colorName: PlayerColorName): string => {
  const color = PLAYER_COLORS.find((c) => c.name === colorName);
  return color?.value || '#FFFFFF'; // Default to white if color not found
};
