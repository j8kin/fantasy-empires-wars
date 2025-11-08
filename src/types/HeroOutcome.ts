export enum HeroOutcomeType {
  Negative = 'negative',
  Success = 'success',
  Neutral = 'neutral',
  Minor = 'minor',
  Positive = 'positive',
  Legendary = 'legendary',
}

export interface HeroOutcome {
  status: HeroOutcomeType;
  message: string;
}
