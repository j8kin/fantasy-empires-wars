export const DiplomacyStatus = {
  NO_TREATY: 'No Treaty',
  PEACE: 'Peace',
  WAR: 'War',
  ALLIANCE: 'Alliance',
} as const;

export type DiplomacyStatusType = (typeof DiplomacyStatus)[keyof typeof DiplomacyStatus];
export interface DiplomacyType {
  status: DiplomacyStatusType;
  /** Last Updated Turn **/
  lastUpdated: number;
}
