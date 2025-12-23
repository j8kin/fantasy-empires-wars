export const ButtonName = {
  CANCEL: 'Cancel',
  OK: 'Ok',
  NEW: 'New game',
  LOAD: 'Load game',
  SAVE: 'Save game',
  START: 'Start game',
  BUILD: 'Construct Buildings',
  CAST: 'Cast spell',
  MOVE: 'Move army',
  QUEST: 'Hero quest',
  RECRUIT: 'Recruit amy',
  TURN: 'End of turn',
  ITEMS: 'Use Item',
} as const;

export type ButtonType = (typeof ButtonName)[keyof typeof ButtonName];
