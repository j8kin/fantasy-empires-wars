import { v4 as uuid } from 'uuid';
import { getRandomInt } from '../domain/utils/random';
import { artifacts, items, relicts } from '../domain/treasure/treasureRepository';

import { TreasureType } from '../types/Treasures';
import { Alignment } from '../types/Alignment';
import type { Artifact, EmpireTreasure, Relic } from '../types/Treasures';

export const artifactFactory = (treasureType: TreasureType, level: number): Artifact => {
  return {
    id: Object.freeze(uuid()),
    level: Object.freeze(level),
    treasure: Object.freeze(artifacts.find((artifact) => artifact.type === treasureType)!),
  };
};

export const itemFactory = (treasureType: TreasureType): EmpireTreasure => {
  return {
    id: Object.freeze(uuid()),
    charge: getCharge(treasureType),
    treasure: Object.freeze(items.find((item) => item.type === treasureType)!),
  };
};

export const relictFactory = (treasureType: TreasureType): Relic => {
  return {
    id: Object.freeze(uuid()),
    alignment: getRelicAlignment(treasureType),
    treasure: Object.freeze(relicts.find((item) => item.type === treasureType)!),
  };
};

export const getRelicAlignment = (relicType: TreasureType): Alignment => {
  switch (relicType) {
    case TreasureType.STARWELL_PRISM:
      return Alignment.NEUTRAL;
    case TreasureType.VERDANT_IDOL:
      return Alignment.LAWFUL;
    case TreasureType.OBSIDIAN_CHALICE:
      return Alignment.CHAOTIC;
    default:
      return Alignment.NONE;
  }
};

const getCharge = (itemType: TreasureType): number => {
  switch (itemType) {
    case TreasureType.RESTORE_BUILDING:
    case TreasureType.AEGIS_SHARD:
    case TreasureType.RESURRECTION:
    case TreasureType.MERCY_OF_ORRIVANE:
      return 1;
    case TreasureType.COMPASS_OF_DOMINION:
    case TreasureType.DEED_OF_RECLAMATION:
    case TreasureType.HOURGLASS_OF_DELAY:
      return 2;
    case TreasureType.STONE_OF_RENEWAL:
      return 3;
    default:
      return getRandomInt(6, 10);
  }
};
