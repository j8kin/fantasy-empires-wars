export type BattlefieldSize = 'small' | 'medium' | 'large' | 'huge';
export interface BattlefieldDimensions {
  rows: number;
  cols: number;
}

export const getBattlefieldDimensions = (
  battlefieldSize: BattlefieldSize
): BattlefieldDimensions => {
  switch (battlefieldSize) {
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
