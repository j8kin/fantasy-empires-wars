export const BuildingName = {
  STRONGHOLD: 'Stronghold',
  BARRACKS: 'Barracks',
  MAGE_TOWER: 'Mage Tower',
  WATCH_TOWER: 'Watch Tower',
  OUTPOST: 'Outpost',
  WALL: 'Castle Wall',
  DEMOLITION: 'Building Demolition',
} as const;

export type BuildingType = (typeof BuildingName)[keyof typeof BuildingName];
