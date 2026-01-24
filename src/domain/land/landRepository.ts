import { not } from '../../utils/hooks';
import { isMageType } from '../unit/unitTypeChecks';
import { LandName } from '../../types/Land';
import { Alignment } from '../../types/Alignment';
import { HeroUnitName, RegularUnitName, WarMachineName } from '../../types/UnitType';
import type { LandType } from '../../types/Land';
import type { UnitType } from '../../types/UnitType';
import type { AlignmentType } from '../../types/Alignment';

interface LandRecordType {
  alignment: AlignmentType;
  unitsToRecruit: UnitType[];
  goldPerTurn: { min: number; max: number };
  description: string;
}

const allWarMachines = Object.values(WarMachineName);
const allMageHeroes = Object.values(HeroUnitName).filter(isMageType);
const allMightHeroes = Object.values(HeroUnitName).filter(not(isMageType));

const defaultUnitsToRecruit = [RegularUnitName.WARD_HANDS, HeroUnitName.WARSMITH];
const landRepository: Record<LandType, LandRecordType> = {
  [LandName.PLAINS]: {
    alignment: Alignment.NEUTRAL,
    unitsToRecruit: [
      ...defaultUnitsToRecruit,
      RegularUnitName.WARRIOR,
      RegularUnitName.GOLEM, // only for Driven Doctrine
      ...allWarMachines,
      HeroUnitName.FIGHTER,
      ...allMageHeroes,
    ],
    goldPerTurn: { min: 650, max: 1000 },
    description: 'Wide open fields where wind carries old war songs, and wanderers vanish beneath endless sky.',
  },
  [LandName.MOUNTAINS]: {
    alignment: Alignment.LAWFUL,
    unitsToRecruit: [
      ...defaultUnitsToRecruit,
      RegularUnitName.DWARF,
      RegularUnitName.GARGOYLE, // only for Driven Doctrine
      ...allWarMachines,
      HeroUnitName.HAMMER_LORD,
      ...allMageHeroes,
    ],
    goldPerTurn: { min: 900, max: 1150 },
    description: 'Stone giants forged in ancient upheaval; their frozen peaks guard secrets older than kingdoms.',
  },
  [LandName.GREEN_FOREST]: {
    alignment: Alignment.LAWFUL,
    unitsToRecruit: [
      ...defaultUnitsToRecruit,
      RegularUnitName.ELF,
      RegularUnitName.DENDRITE, // only for Driven Doctrine
      ...allWarMachines,
      HeroUnitName.RANGER,
      ...allMageHeroes,
    ],
    goldPerTurn: { min: 800, max: 950 },
    description: 'Sunlit woods where gentle spirits linger, guiding hunters, wanderers, and the lost.',
  },
  [LandName.DARK_FOREST]: {
    alignment: Alignment.CHAOTIC,
    unitsToRecruit: [
      ...defaultUnitsToRecruit,
      RegularUnitName.DARK_ELF,
      RegularUnitName.DENDRITE, // only for Driven Doctrine
      ...allWarMachines,
      HeroUnitName.SHADOW_BLADE,
      ...allMageHeroes,
    ],
    goldPerTurn: { min: 800, max: 950 },
    description: 'A brooding woodland where moonlight falters, and unseen things watch from between twisted boughs.',
  },
  [LandName.HILLS]: {
    alignment: Alignment.NEUTRAL,
    unitsToRecruit: [
      ...defaultUnitsToRecruit,
      RegularUnitName.HALFLING,
      RegularUnitName.GARGOYLE, // only for Driven Doctrine
      ...allWarMachines,
      HeroUnitName.FIGHTER,
      ...allMageHeroes,
    ],
    goldPerTurn: { min: 500, max: 700 },
    description: 'Rolling highlands shaped by time and storms, favored by scouts who read stories in every ridge.',
  },
  [LandName.SWAMP]: {
    alignment: Alignment.CHAOTIC,
    unitsToRecruit: [
      ...defaultUnitsToRecruit,
      RegularUnitName.ORC,
      RegularUnitName.GOLEM, // only for Driven Doctrine
      ...allWarMachines,
      HeroUnitName.OGR,
      ...allMageHeroes,
    ],
    goldPerTurn: { min: 350, max: 550 },
    description: 'Murk and moss entwine here, where each step sinks into whispers of forgotten, half-drowned tales.',
  },
  [LandName.DESERT]: {
    alignment: Alignment.NEUTRAL,
    unitsToRecruit: [...defaultUnitsToRecruit, RegularUnitName.GOLEM, WarMachineName.BATTERING_RAM, ...allMightHeroes],
    goldPerTurn: { min: 150, max: 270 },
    description: 'Endless dunes scorched by merciless suns, hiding relics swallowed by empires long fallen.',
  },
  // special lands
  [LandName.SUN_SPIRE_PEAKS]: {
    alignment: Alignment.LAWFUL,
    unitsToRecruit: [
      ...defaultUnitsToRecruit,
      RegularUnitName.DWARF,
      RegularUnitName.GARGOYLE, // only for Driven Doctrine
      ...allWarMachines,
      HeroUnitName.HAMMER_LORD,
      HeroUnitName.CLERIC,
    ],
    goldPerTurn: { min: 1000, max: 1000 },
    description: 'Radiant heights bathed in celestial fire, said to echo with the hymns of the first dawn.',
  },
  [LandName.GOLDEN_PLAINS]: {
    alignment: Alignment.LAWFUL,
    unitsToRecruit: [
      ...defaultUnitsToRecruit,
      RegularUnitName.WARRIOR,
      RegularUnitName.DWARF,
      RegularUnitName.GOLEM, // only for Driven Doctrine
      ...allWarMachines,
      HeroUnitName.FIGHTER,
      HeroUnitName.CLERIC,
      HeroUnitName.DRUID,
      HeroUnitName.ENCHANTER,
    ],
    goldPerTurn: { min: 500, max: 600 },
    description: "Grasses shimmer like sun-forged metal, nurturing harvests blessed by the land's ancient warmth.",
  },
  [LandName.HEARTWOOD_GROVE]: {
    alignment: Alignment.LAWFUL,
    unitsToRecruit: [
      ...defaultUnitsToRecruit,
      RegularUnitName.ELF,
      RegularUnitName.DENDRITE, // only for Driven Doctrine
      ...allWarMachines,
      HeroUnitName.RANGER,
      HeroUnitName.DRUID,
    ],
    goldPerTurn: { min: 1000, max: 1000 },
    description: 'The cradle of living forests, where colossal trees whisper the pulse of Orrivane itself.',
  },
  [LandName.VERDANT_GLADE]: {
    alignment: Alignment.LAWFUL,
    unitsToRecruit: [
      ...defaultUnitsToRecruit,
      RegularUnitName.ELF,
      RegularUnitName.DENDRITE, // only for Driven Doctrine
      ...allWarMachines,
      HeroUnitName.RANGER,
      HeroUnitName.CLERIC,
      HeroUnitName.DRUID,
      HeroUnitName.ENCHANTER,
    ],
    goldPerTurn: { min: 500, max: 600 },
    description: 'A lush sanctuary bursting with wild growth, where nature unfurls in joyous, untamed abundance.',
  },
  [LandName.CRISTAL_BASIN]: {
    alignment: Alignment.NEUTRAL,
    unitsToRecruit: [
      ...defaultUnitsToRecruit,
      RegularUnitName.WARRIOR,
      RegularUnitName.GOLEM, // only for Driven Doctrine
      ...allWarMachines,
      HeroUnitName.FIGHTER,
      HeroUnitName.ENCHANTER,
    ],
    goldPerTurn: { min: 1000, max: 1000 },
    description: 'A hollow of shimmering crystal veins that catch stray moonlight, bending it into spectral hues.',
  },
  [LandName.MISTY_GLADES]: {
    alignment: Alignment.NEUTRAL,
    unitsToRecruit: [
      ...defaultUnitsToRecruit,
      RegularUnitName.WARRIOR,
      RegularUnitName.GOLEM, // only for Driven Doctrine
      ...allWarMachines,
      HeroUnitName.FIGHTER,
      HeroUnitName.DRUID,
      HeroUnitName.ENCHANTER,
      HeroUnitName.PYROMANCER,
    ],
    goldPerTurn: { min: 500, max: 600 },
    description: 'Cool lowlands veiled in drifting blue mist, where sound softens and time feels strangely thin.',
  },
  [LandName.VOLCANO]: {
    alignment: Alignment.CHAOTIC,
    unitsToRecruit: [
      ...defaultUnitsToRecruit,
      RegularUnitName.ORC,
      RegularUnitName.GARGOYLE, // only for Driven Doctrine
      ...allWarMachines,
      HeroUnitName.OGR,
      HeroUnitName.PYROMANCER,
    ],
    goldPerTurn: { min: 1000, max: 1000 },
    description: 'A furious mountain whose molten heart roars beneath the world, hungry for offerings of stone.',
  },
  [LandName.LAVA]: {
    alignment: Alignment.CHAOTIC,
    unitsToRecruit: [
      ...defaultUnitsToRecruit,
      RegularUnitName.ORC,
      RegularUnitName.GARGOYLE, // only for Driven Doctrine
      ...allWarMachines,
      HeroUnitName.OGR,
      HeroUnitName.ENCHANTER,
      HeroUnitName.PYROMANCER,
      HeroUnitName.NECROMANCER,
    ],
    goldPerTurn: { min: 500, max: 600 },
    description: "A seething river of fire where earth's skin tears open, leaving only heat, ruin, and trembling air.",
  },
  [LandName.SHADOW_MIRE]: {
    alignment: Alignment.CHAOTIC,
    unitsToRecruit: [
      ...defaultUnitsToRecruit,
      RegularUnitName.ORC,
      RegularUnitName.GOLEM, // only for Driven Doctrine
      ...allWarMachines,
      HeroUnitName.OGR,
      HeroUnitName.NECROMANCER,
    ],
    goldPerTurn: { min: 1000, max: 1000 },
    description: 'A stagnant bog where shadows cling to the water, feeding on fear as readily as decay.',
  },
  [LandName.BLIGHTED_FEN]: {
    alignment: Alignment.CHAOTIC,
    unitsToRecruit: [
      ...defaultUnitsToRecruit,
      RegularUnitName.ORC,
      RegularUnitName.GOLEM, // only for Driven Doctrine
      ...allWarMachines,
      HeroUnitName.OGR,
      HeroUnitName.ENCHANTER,
      HeroUnitName.PYROMANCER,
      HeroUnitName.NECROMANCER,
    ],
    goldPerTurn: { min: 500, max: 600 },
    description: 'Rot-soaked marshland cursed by old sorcery, where every root and reed seems to wither in despair.',
  },
  // used on map generation
  [LandName.NONE]: {
    alignment: Alignment.NEUTRAL,
    unitsToRecruit: [],
    goldPerTurn: { min: 0, max: 0 },
    description: '',
  },
};

export const getLandAlignment = (landType: LandType): AlignmentType => landRepository[landType].alignment;

export const getLandGoldPerTurn = (landType: LandType): { min: number; max: number } =>
  landRepository[landType].goldPerTurn;

export const getLandUnitsToRecruit = (landType: LandType, isCorrupted: boolean): UnitType[] => {
  if (!isCorrupted) return landRepository[landType].unitsToRecruit;

  const corruptedLandUnits = [RegularUnitName.ORC, ...allWarMachines, HeroUnitName.OGR, ...allMageHeroes];
  if (landType === LandName.GREEN_FOREST) {
    corruptedLandUnits.push(RegularUnitName.DARK_ELF);
    corruptedLandUnits.push(HeroUnitName.SHADOW_BLADE);
  }
  return corruptedLandUnits;
};
