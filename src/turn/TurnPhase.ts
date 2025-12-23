export const TurnPhase = {
  START: 'START',
  MAIN: 'MAIN',
  END: 'END',
} as const;

export type TurnPhaseType = (typeof TurnPhase)[keyof typeof TurnPhase];
