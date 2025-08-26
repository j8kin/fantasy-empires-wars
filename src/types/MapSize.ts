export type MapSize = 'small' | 'medium' | 'large' | 'huge';

export const getMapDimensions = (mapSize: MapSize): { rows: number; cols: number } => {
  switch (mapSize) {
    case 'small':
      return { rows: 6, cols: 13 };
    case 'medium':
      return { rows: 9, cols: 18 };
    case 'large':
      return { rows: 11, cols: 23 };
    case 'huge':
      return { rows: 15, cols: 31 };
    default:
      return { rows: 9, cols: 18 };
  }
};
