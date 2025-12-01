export enum DiplomacyStatus {
  NO_TREATY = 'No Treaty',
  PEACE = 'Peace',
  WAR = 'War',
  ALLIANCE = 'Alliance',
}

export type Diplomacy = Record<string, DiplomacyStatus>;
