import { v4 as uuid } from 'uuid';
import { getRandomInt } from '../domain/utils/random';
import { artifacts, items, relicts } from '../domain/treasure/treasureRepository';
import { TreasureName } from '../types/Treasures';
import { Alignment } from '../types/Alignment';
import { MagicTarget } from '../types/MagicTarget';
import type { Artifact, EmpireTreasure, Relic, TreasureType } from '../types/Treasures';
import type { AlignmentType } from '../types/Alignment';

export const artifactFactory = (treasureType: TreasureType, level: number): Artifact => {
  return {
    id: Object.freeze(uuid()),
    level: Object.freeze(level),
    treasure: Object.freeze(artifacts.find((artifact) => artifact.type === treasureType)!),
  };
};

export const itemFactory = (treasureType: TreasureType): EmpireTreasure => {
  const item = items.find((item) => item.type === treasureType)!;
  return {
    id: Object.freeze(uuid()),
    charge: getCharge(treasureType),
    treasure: Object.freeze(item),
    target: Object.freeze(item.target ?? MagicTarget.ALL),
  };
};

export const relictFactory = (treasureType: TreasureType): Relic => {
  return {
    id: Object.freeze(uuid()),
    alignment: Object.freeze(getRelicAlignment(treasureType)),
    treasure: Object.freeze(relicts.find((item) => item.type === treasureType)!),
  };
};

export const getRelicAlignment = (relicType: TreasureType): AlignmentType => {
  switch (relicType) {
    case TreasureName.STARWELL_PRISM:
      return Alignment.NEUTRAL;
    case TreasureName.VERDANT_IDOL:
      return Alignment.LAWFUL;
    case TreasureName.OBSIDIAN_CHALICE:
      return Alignment.CHAOTIC;
    default:
      return Alignment.NONE;
  }
};

const getCharge = (itemType: TreasureType): number => {
  switch (itemType) {
    case TreasureName.SEED_OF_RENEWAL:
    case TreasureName.AEGIS_SHARD:
    case TreasureName.RESURRECTION:
    case TreasureName.MERCY_OF_ORRIVANE:
      return 1;
    case TreasureName.COMPASS_OF_DOMINION:
    case TreasureName.DEED_OF_RECLAMATION:
    case TreasureName.HOURGLASS_OF_DELAY:
      return 2;
    case TreasureName.GLYPH_OF_SEVERANCE:
      return 3;
    default:
      return getRandomInt(6, 10);
  }
};
