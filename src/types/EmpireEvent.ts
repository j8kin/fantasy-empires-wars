export const EmpireEventKind = {
  Negative: 'negative',
  Success: 'success',
  Neutral: 'neutral',
  Minor: 'minor',
  Positive: 'positive',
  Legendary: 'legendary',
} as const;

export type EmpireEventType = (typeof EmpireEventKind)[keyof typeof EmpireEventKind];

export interface EmpireEvent {
  status: EmpireEventType;
  message: string;
}
