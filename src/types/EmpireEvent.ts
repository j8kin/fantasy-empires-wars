export enum EmpireEventType {
  Negative = 'negative',
  Success = 'success',
  Neutral = 'neutral',
  Minor = 'minor',
  Positive = 'positive',
  Legendary = 'legendary',
}

export interface EmpireEvent {
  status: EmpireEventType;
  message: string;
}
