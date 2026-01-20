export type PlayerColorName =
  | 'white' // use for neutral Lands which no one controls
  | 'perl-white'
  | 'blue'
  | 'red'
  | 'green'
  | 'orange'
  | 'purple'
  | 'yellow'
  | 'gray'
  | 'burgundy'
  | 'darkSlateGray'
  | 'obsidian'
  | 'cinderRust';

export interface PlayerColor {
  name: PlayerColorName;
  value: string;
  displayName: string;
}

export const PLAYER_COLORS: PlayerColor[] = [
  { name: 'blue', value: '#4A90E2', displayName: 'Blue' },
  { name: 'perl-white', value: '#BB9981', displayName: 'Perl White' },
  { name: 'red', value: '#C0392B', displayName: 'Red' },
  { name: 'green', value: '#27AE60', displayName: 'Green' },
  { name: 'orange', value: '#E67E22', displayName: 'Orange' },
  { name: 'purple', value: '#8B4A9C', displayName: 'Purple' },
  { name: 'yellow', value: '#F1C40F', displayName: 'Yellow' },
  { name: 'gray', value: '#95A5A6', displayName: 'Gray' },
  { name: 'burgundy', value: '#8B1538', displayName: 'Bloody Burgundy' },
  { name: 'darkSlateGray', value: '#2F4F4F', displayName: 'Dark Slate Gray' },
  { name: 'obsidian', value: '#3a2f41', displayName: 'Black Obsidian' },
  { name: 'cinderRust', value: '#7A2E1C', displayName: 'Cinder Rust' },
];
