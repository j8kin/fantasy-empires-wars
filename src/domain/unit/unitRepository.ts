import { HeroUnitName, RegularUnitName, WarMachineName } from '../../types/UnitType';
import { Alignment } from '../../types/Alignment';
import { BuildingName } from '../../types/Building';
import type { CombatStats, RecruitmentInfo } from '../../types/BaseUnit';
import type { UnitType } from '../../types/UnitType';
import type { HeroUnitType, RegularUnitType } from '../../types/UnitType';
import type { AlignmentType } from '../../types/Alignment';

const unitCombatStats: Record<RegularUnitType | HeroUnitType, CombatStats> = {
  [RegularUnitName.WARD_HANDS]: {
    attack: 5,
    defense: 3,
    health: 20,
    speed: 2,
  },
  [RegularUnitName.WARRIOR]: {
    attack: 8,
    defense: 6,
    health: 25,
    speed: 2,
  },
  [RegularUnitName.NULLWARDEN]: {
    attack: 8,
    defense: 6,
    health: 25,
    speed: 2,
  },
  [RegularUnitName.DWARF]: {
    attack: 12,
    defense: 20,
    health: 40,
    speed: 1,
  },
  [RegularUnitName.UNDEAD]: {
    attack: 25,
    defense: 50,
    health: 10,
    speed: 5,
  },
  [RegularUnitName.ORC]: {
    attack: 10,
    defense: 15,
    health: 30,
    speed: 2,
  },
  [RegularUnitName.HALFLING]: {
    attack: 6,
    defense: 3,
    range: 15,
    rangeDamage: 8,
    health: 15,
    speed: 4,
  },
  [RegularUnitName.ELF]: {
    attack: 15,
    defense: 4,
    range: 20,
    rangeDamage: 15,
    health: 20,
    speed: 3,
  },
  [RegularUnitName.DARK_ELF]: {
    attack: 15,
    defense: 4,
    range: 20,
    rangeDamage: 15,
    health: 20,
    speed: 3,
  },
  // HEROES
  // Human warrior hero
  [HeroUnitName.WARSMITH]: {
    attack: 30,
    defense: 3,
    range: 2,
    rangeDamage: 30,
    health: 18,
    speed: 4,
  },
  [HeroUnitName.FIGHTER]: {
    attack: 30,
    defense: 3,
    range: 2,
    rangeDamage: 30,
    health: 18,
    speed: 4,
  },
  [HeroUnitName.ZEALOT]: {
    attack: 30,
    defense: 3,
    range: 2,
    rangeDamage: 30,
    health: 18,
    speed: 4,
  },
  // Dwarf hero
  [HeroUnitName.HAMMER_LORD]: {
    attack: 40,
    defense: 3,
    range: 2,
    rangeDamage: 40,
    health: 25,
    speed: 4,
  },
  // Orc hero
  [HeroUnitName.OGR]: {
    attack: 40,
    defense: 4,
    range: 2,
    rangeDamage: 45,
    health: 30,
    speed: 3,
  },
  // Elf hero
  [HeroUnitName.SHADOW_BLADE]: {
    attack: 30,
    defense: 3,
    range: 30,
    rangeDamage: 30,
    health: 18,
    speed: 5,
  },
  [HeroUnitName.RANGER]: {
    attack: 30,
    defense: 3,
    range: 30,
    rangeDamage: 30,
    health: 18,
    speed: 5,
  },
  // Mage Heroes
  // Pyromancer - produce red mana
  [HeroUnitName.PYROMANCER]: {
    attack: 30,
    defense: 3,
    range: 30,
    rangeDamage: 30,
    health: 18,
    speed: 2,
  },
  // Cleric - produce white mana
  [HeroUnitName.CLERIC]: {
    attack: 25,
    defense: 5,
    range: 2,
    rangeDamage: 25,
    health: 20,
    speed: 2,
  },
  // Druid - produce green mana
  [HeroUnitName.DRUID]: {
    attack: 20,
    defense: 4,
    range: 2,
    rangeDamage: 20,
    health: 22,
    speed: 3,
  },
  // Enchanter - produce blue mana
  [HeroUnitName.ENCHANTER]: {
    attack: 15,
    defense: 3,
    range: 35,
    rangeDamage: 15,
    health: 16,
    speed: 2,
  },
  // Necromancer - produce black mana
  [HeroUnitName.NECROMANCER]: {
    attack: 35,
    defense: 2,
    range: 25,
    rangeDamage: 35,
    health: 15,
    speed: 2,
  },
};

const unitsAlignment: Record<UnitType, AlignmentType> = {
  [RegularUnitName.DWARF]: Alignment.LAWFUL,
  [RegularUnitName.ELF]: Alignment.LAWFUL,
  [RegularUnitName.NULLWARDEN]: Alignment.LAWFUL,
  [HeroUnitName.ZEALOT]: Alignment.LAWFUL,
  [HeroUnitName.HAMMER_LORD]: Alignment.LAWFUL,
  [HeroUnitName.RANGER]: Alignment.LAWFUL,
  [HeroUnitName.CLERIC]: Alignment.LAWFUL,
  [HeroUnitName.DRUID]: Alignment.LAWFUL,

  [RegularUnitName.WARD_HANDS]: Alignment.NEUTRAL,
  [RegularUnitName.HALFLING]: Alignment.NEUTRAL,
  [RegularUnitName.WARRIOR]: Alignment.NEUTRAL,
  [WarMachineName.BALLISTA]: Alignment.NEUTRAL,
  [WarMachineName.CATAPULT]: Alignment.NEUTRAL,
  [WarMachineName.BATTERING_RAM]: Alignment.NEUTRAL,
  [WarMachineName.SIEGE_TOWER]: Alignment.NEUTRAL,
  [HeroUnitName.FIGHTER]: Alignment.NEUTRAL,
  [HeroUnitName.ENCHANTER]: Alignment.NEUTRAL,

  [RegularUnitName.ORC]: Alignment.CHAOTIC,
  [RegularUnitName.DARK_ELF]: Alignment.CHAOTIC,
  [RegularUnitName.UNDEAD]: Alignment.CHAOTIC,
  [HeroUnitName.WARSMITH]: Alignment.CHAOTIC,
  [HeroUnitName.OGR]: Alignment.CHAOTIC,
  [HeroUnitName.SHADOW_BLADE]: Alignment.CHAOTIC,
  [HeroUnitName.PYROMANCER]: Alignment.CHAOTIC,
  [HeroUnitName.NECROMANCER]: Alignment.CHAOTIC,
};

const descriptions: Record<UnitType, string> = {
  // REGULARS
  [RegularUnitName.WARD_HANDS]:
    'Local hands risen in necessity, their resolve rough but unbroken against Orrivane’s growing dread.',
  [RegularUnitName.WARRIOR]:
    'Hardened veterans of countless skirmishes, these soldiers fight for gold, glory, or the fragile peace that follows both.',
  [RegularUnitName.NULLWARDEN]:
    'Soldiers sworn to law alone, conditioned to endure sorcery through discipline, denial and without yielding.',
  [RegularUnitName.DWARF]:
    'Clad in runed steel and bound by oath, Dwarves hold the line like mountains given form—unyielding, proud, and slow to fall.',
  [RegularUnitName.UNDEAD]:
    'Raised beyond fear and freed from breath, the Undead march in silence—enduring not by life, but refusal to fall.',
  [RegularUnitName.ORC]:
    'Forged in chaos and fire, Orcs live for the clash of steel—each battle a hymn to their untamed hunger for conquest.',
  [RegularUnitName.HALFLING]:
    'Small in stature, stubborn in spirit—halfling slingers pelt foes with stones and startling courage.',
  [RegularUnitName.ELF]:
    'Silent as moonlight and swift as wind through leaves, Elven archers strike before their foes even sense the bowstring’s whisper.',
  [RegularUnitName.DARK_ELF]:
    'Born beneath shadowed groves, Dark Elves blend beauty with cruelty—their arrows carry both poison and pride.',
  // WAR MACHINES
  [WarMachineName.BALLISTA]:
    'Ancient engines of precision death, Ballista pierce armor and arrogance alike with thunderous finality.',
  [WarMachineName.CATAPULT]:
    'Stone-flingers of ruin, Catapults reduce fortresses to dust and kings to memory—patient, implacable, and deaf to mercy.',
  [WarMachineName.BATTERING_RAM]:
    'Crushing behemoths of war, Battering Rams smash through walls and armies alike, their charge a testament to brute force and determination.',
  [WarMachineName.SIEGE_TOWER]:
    'Fortress crushers of war, Siege Towers breach defenses with relentless might, their siege engines a symbol of siege warfare’s brutal efficiency.',
  // HEROES
  [HeroUnitName.WARSMITH]:
    'Forged in the fires of rebellion, Warsmiths temper chaos into strategy—each strike a protest against tyranny and weakness.',
  [HeroUnitName.FIGHTER]:
    'Champions of the common folk, Fighters carry the banners of law and honor into every battle, their courage as sharp as their blades.',
  [HeroUnitName.ZEALOT]:
    'Sworn to silence the arcane, Nullwardens fight not for faith, but for a world unchained from magic.',
  [HeroUnitName.HAMMER_LORD]:
    'Bearing hammers that have shattered both stone and legend, Hammerlords are dwarven paragons of strength and unyielding resolve.',
  [HeroUnitName.OGR]:
    'Once feared as destroyers, the Ogr champions now fight with grim purpose—seeking to silence all who dare wield the arcane.',
  [HeroUnitName.SHADOW_BLADE]:
    'A silent killer born of twilight, where loyalty is as thin as moonlight.',
  [HeroUnitName.RANGER]:
    'Keepers of forgotten groves, Rangers walk unseen between root and shadow, striking swiftly to preserve the wild balance of Orrivane.',
  [HeroUnitName.PYROMANCER]:
    'Born of embers and fury, Pyromancers command the flames of creation—each spell a hymn to passion and ruin.',
  [HeroUnitName.CLERIC]:
    'Guided by celestial whispers, Clerics mend the wounds of body and spirit alike, their faith a shield against the growing dark.',
  [HeroUnitName.DRUID]:
    'Bound to the heartbeat of the wild, Druids channel Orrivane’s living breath—healing, nurturing, and unleashing nature’s wrath.',
  [HeroUnitName.ENCHANTER]:
    'Masters of unseen threads, Enchanters weave illusions and insight from pure thought, bending truth like light through a prism.',
  [HeroUnitName.NECROMANCER]:
    'Whisperers of death’s secrets, Necromancers blur the line between decay and command, binding restless souls to their grim will.',
};

export const unitsBaseCombatStats = (unitType: RegularUnitType | HeroUnitType): CombatStats => {
  return { ...unitCombatStats[unitType] };
};

export const getAllUnitTypeByAlignment = (alignment: AlignmentType): UnitType[] => {
  return Object.entries(unitsAlignment)
    .filter(([_, unitAlignment]) => unitAlignment === alignment)
    .map(([unitType]) => unitType);
};

export const getRecruitInfo = (unitType: UnitType): RecruitmentInfo => {
  switch (unitType) {
    // Melee units
    case RegularUnitName.WARD_HANDS:
      return {
        maintainCost: 2,
        recruitCost: 300,
        recruitTime: 1,
        recruitedIn: BuildingName.BARRACKS,
        recruitedUnits: 30,
        description: descriptions[unitType],
      };
    case RegularUnitName.NULLWARDEN:
    case RegularUnitName.WARRIOR:
      return {
        maintainCost: 4,
        recruitCost: 500,
        recruitTime: 1,
        recruitedIn: BuildingName.BARRACKS,
        recruitedUnits: 20,
        description: descriptions[unitType],
      };
    case RegularUnitName.DWARF:
      return {
        maintainCost: 5,
        recruitCost: 800,
        recruitTime: 1,
        recruitedIn: BuildingName.BARRACKS,
        recruitedUnits: 20,
        description: descriptions[unitType],
      };
    case RegularUnitName.UNDEAD:
      return {
        maintainCost: 7,
        recruitCost: 800,
        recruitTime: 1,
        recruitedIn: BuildingName.BARRACKS,
        recruitedUnits: 20,
        description: descriptions[unitType],
      };
    case RegularUnitName.ORC:
      return {
        maintainCost: 4.5,
        recruitCost: 600,
        recruitTime: 1,
        recruitedIn: BuildingName.BARRACKS,
        recruitedUnits: 20,
        description: descriptions[unitType],
      };
    // range units
    case RegularUnitName.HALFLING:
      return {
        maintainCost: 3,
        recruitCost: 700,
        recruitTime: 2,
        recruitedIn: BuildingName.BARRACKS,
        recruitedUnits: 25,
        description: descriptions[unitType],
      };
    case RegularUnitName.ELF:
    case RegularUnitName.DARK_ELF:
      return {
        maintainCost: 5,
        recruitCost: 2500,
        recruitTime: 2,
        recruitedIn: BuildingName.BARRACKS,
        recruitedUnits: 20,
        description: descriptions[unitType],
      };
    // war-machines
    case WarMachineName.BALLISTA:
      return {
        maintainCost: 150,
        recruitCost: 1500,
        recruitTime: 3,
        recruitedIn: BuildingName.BARRACKS,
        recruitedUnits: 1,
        description: descriptions[unitType],
      };
    case WarMachineName.CATAPULT:
      return {
        maintainCost: 250,
        recruitCost: 1000,
        recruitTime: 3,
        recruitedIn: BuildingName.BARRACKS,
        recruitedUnits: 1,
        description: descriptions[unitType],
      };
    case WarMachineName.BATTERING_RAM:
      return {
        maintainCost: 50,
        recruitCost: 700,
        recruitTime: 1,
        recruitedIn: BuildingName.BARRACKS,
        recruitedUnits: 1,
        description: descriptions[unitType],
      };
    case WarMachineName.SIEGE_TOWER:
      return {
        maintainCost: 250,
        recruitCost: 1000,
        recruitTime: 2,
        recruitedIn: BuildingName.BARRACKS,
        recruitedUnits: 1,
        description: descriptions[unitType],
      };
    // heroes
    // non-mages
    case HeroUnitName.FIGHTER:
    case HeroUnitName.WARSMITH:
    case HeroUnitName.ZEALOT:
    case HeroUnitName.HAMMER_LORD:
    case HeroUnitName.OGR:
    case HeroUnitName.SHADOW_BLADE:
    case HeroUnitName.RANGER:
      return {
        maintainCost: 100,
        recruitCost: 1500,
        recruitTime: 3,
        recruitedIn: BuildingName.BARRACKS,
        recruitedUnits: 1,
        description: descriptions[unitType],
      };
    // mages
    case HeroUnitName.CLERIC:
    case HeroUnitName.DRUID:
    case HeroUnitName.ENCHANTER:
    case HeroUnitName.PYROMANCER:
    case HeroUnitName.NECROMANCER:
      return {
        maintainCost: 100,
        recruitCost: 2500,
        recruitTime: 3,
        recruitedIn: BuildingName.MAGE_TOWER,
        recruitedUnits: 1,
        description: descriptions[unitType],
      };
    default:
      throw new Error(`Unknown unit type ${unitType}`);
  }
};
