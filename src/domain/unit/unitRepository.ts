import { HeroUnitName, RegularUnitName, WarMachineName } from '../../types/UnitType';
import { Alignment } from '../../types/Alignment';
import { BuildingName } from '../../types/Building';
import type { BaseUnitStats } from '../../types/BaseUnit';
import type { UnitType } from '../../types/UnitType';

const unitStats: Record<UnitType, Partial<BaseUnitStats>> = {
  [RegularUnitName.WARD_HANDS]: {
    attack: 5,
    defense: 3,
    health: 20,
    speed: 2,
    alignment: Alignment.NEUTRAL,
    recruitCost: 300,
    maintainCost: 2,
    recruitedIn: BuildingName.BARRACKS,
  },
  [RegularUnitName.WARRIOR]: {
    attack: 8,
    defense: 6,
    health: 25,
    speed: 2,
    alignment: Alignment.NEUTRAL,
    recruitCost: 500,
    maintainCost: 4,
    recruitedIn: BuildingName.BARRACKS,
  },
  [RegularUnitName.DWARF]: {
    attack: 12,
    defense: 20,
    health: 40,
    speed: 1,
    alignment: Alignment.LAWFUL,
    recruitCost: 800,
    maintainCost: 5,
    recruitedIn: BuildingName.BARRACKS,
  },
  [RegularUnitName.UNDEAD]: {
    attack: 25,
    defense: 50,
    health: 10,
    speed: 5,
    alignment: Alignment.CHAOTIC,
    recruitCost: 800,
    maintainCost: 7,
    recruitedIn: BuildingName.BARRACKS,
  },
  [RegularUnitName.ORC]: {
    attack: 10,
    defense: 15,
    health: 30,
    speed: 2,
    alignment: Alignment.CHAOTIC,
    recruitCost: 600,
    maintainCost: 4.5,
    recruitedIn: BuildingName.BARRACKS,
  },
  [RegularUnitName.HALFLING]: {
    attack: 6,
    defense: 3,
    range: 15,
    rangeDamage: 8,
    health: 15,
    speed: 4,
    alignment: Alignment.NEUTRAL,
    recruitCost: 700,
    maintainCost: 3,
    recruitedIn: BuildingName.BARRACKS,
  },
  [RegularUnitName.ELF]: {
    attack: 15,
    defense: 4,
    range: 20,
    rangeDamage: 15,
    health: 20,
    speed: 3,
    alignment: Alignment.LAWFUL,
    recruitCost: 2500,
    maintainCost: 5,
    recruitedIn: BuildingName.BARRACKS,
  },
  [RegularUnitName.DARK_ELF]: {
    attack: 15,
    defense: 4,
    range: 20,
    rangeDamage: 15,
    health: 20,
    speed: 3,
    alignment: Alignment.CHAOTIC,
    recruitCost: 2500,
    maintainCost: 5,
    recruitedIn: BuildingName.BARRACKS,
  },
  // War Machines
  // Catapult do not damage anything only destroy buildings/walls
  [WarMachineName.BALLISTA]: {
    attack: 0,
    defense: 0,
    range: 35,
    rangeDamage: 25,
    health: 150,
    speed: 0,
    alignment: Alignment.NEUTRAL,
    recruitCost: 1500,
    maintainCost: 150,
    recruitedIn: BuildingName.BARRACKS,
  },
  [WarMachineName.CATAPULT]: {
    attack: 0,
    defense: 0,
    health: 200,
    speed: 0,
    alignment: Alignment.NEUTRAL,
    recruitCost: 1000,
    maintainCost: 250,
    recruitedIn: BuildingName.BARRACKS,
  },
  [WarMachineName.BATTERING_RAM]: {
    attack: 0,
    defense: 0,
    health: 20,
    speed: 0,
    alignment: Alignment.NEUTRAL,
    recruitCost: 700,
    maintainCost: 50,
    recruitedIn: BuildingName.BARRACKS,
  },
  [WarMachineName.SIEGE_TOWER]: {
    attack: 0,
    defense: 0,
    health: 30,
    speed: 0,
    alignment: Alignment.NEUTRAL,
    recruitCost: 1000,
    maintainCost: 250,
    recruitedIn: BuildingName.BARRACKS,
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
    alignment: Alignment.CHAOTIC,
    recruitCost: 1500,
    maintainCost: 100,
    recruitedIn: BuildingName.BARRACKS,
  },
  [HeroUnitName.FIGHTER]: {
    attack: 30,
    defense: 3,
    range: 2,
    rangeDamage: 30,
    health: 18,
    speed: 4,
    alignment: Alignment.LAWFUL,
    recruitCost: 1500,
    maintainCost: 100,
    recruitedIn: BuildingName.BARRACKS,
  },
  [HeroUnitName.ZEALOT]: {
    attack: 30,
    defense: 3,
    range: 2,
    rangeDamage: 30,
    health: 18,
    speed: 4,
    alignment: Alignment.LAWFUL,
    recruitCost: 1500,
    maintainCost: 100,
    recruitedIn: BuildingName.BARRACKS,
  },
  // Dwarf hero
  [HeroUnitName.HAMMER_LORD]: {
    attack: 40,
    defense: 3,
    range: 2,
    rangeDamage: 40,
    health: 25,
    speed: 4,
    alignment: Alignment.LAWFUL,
    recruitCost: 1500,
    maintainCost: 100,
    recruitedIn: BuildingName.BARRACKS,
  },
  // Orc hero
  [HeroUnitName.OGR]: {
    attack: 40,
    defense: 4,
    range: 2,
    rangeDamage: 45,
    health: 30,
    speed: 3,
    alignment: Alignment.CHAOTIC,
    recruitCost: 1500,
    maintainCost: 100,
    recruitedIn: BuildingName.BARRACKS,
  },
  // Elf hero
  [HeroUnitName.SHADOW_BLADE]: {
    attack: 30,
    defense: 3,
    range: 30,
    rangeDamage: 30,
    health: 18,
    speed: 5,
    alignment: Alignment.CHAOTIC,
    recruitCost: 1500,
    maintainCost: 100,
    recruitedIn: BuildingName.BARRACKS,
  },
  [HeroUnitName.RANGER]: {
    attack: 30,
    defense: 3,
    range: 30,
    rangeDamage: 30,
    health: 18,
    speed: 5,
    alignment: Alignment.LAWFUL,
    recruitCost: 1500,
    maintainCost: 100,
    recruitedIn: BuildingName.BARRACKS,
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
    alignment: Alignment.CHAOTIC,
    recruitCost: 2500,
    maintainCost: 100,
    recruitedIn: BuildingName.RED_MAGE_TOWER,
  },
  // Cleric - produce white mana
  [HeroUnitName.CLERIC]: {
    attack: 25,
    defense: 5,
    range: 2,
    rangeDamage: 25,
    health: 20,
    speed: 2,
    alignment: Alignment.LAWFUL,
    recruitCost: 2500,
    maintainCost: 100,
    recruitedIn: BuildingName.WHITE_MAGE_TOWER,
  },
  // Druid - produce green mana
  [HeroUnitName.DRUID]: {
    attack: 20,
    defense: 4,
    range: 2,
    rangeDamage: 20,
    health: 22,
    speed: 3,
    alignment: Alignment.LAWFUL,
    recruitCost: 2500,
    maintainCost: 100,
    recruitedIn: BuildingName.GREEN_MAGE_TOWER,
  },
  // Enchanter - produce blue mana
  [HeroUnitName.ENCHANTER]: {
    attack: 15,
    defense: 3,
    range: 35,
    rangeDamage: 15,
    health: 16,
    speed: 2,
    alignment: Alignment.NEUTRAL,
    recruitCost: 2500,
    maintainCost: 100,
    recruitedIn: BuildingName.BLUE_MAGE_TOWER,
  },
  // Necromancer - produce black mana
  [HeroUnitName.NECROMANCER]: {
    attack: 35,
    defense: 2,
    range: 25,
    rangeDamage: 35,
    health: 15,
    speed: 2,
    alignment: Alignment.CHAOTIC,
    recruitCost: 2500,
    maintainCost: 100,
    recruitedIn: BuildingName.BLACK_MAGE_TOWER,
  },
};

const descriptions: Record<UnitType, string> = {
  // REGULARS
  [RegularUnitName.WARD_HANDS]:
    'Local hands risen in necessity, their resolve rough but unbroken against Orrivane’s growing dread.',
  [RegularUnitName.WARRIOR]:
    'Hardened veterans of countless skirmishes, these soldiers fight for gold, glory, or the fragile peace that follows both.',
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

const getDescription = (unitType: UnitType): string => {
  return descriptions[unitType];
};

export const unitsBaseStats = (unitType: UnitType): BaseUnitStats => {
  const stats = unitStats[unitType];

  return {
    ...stats,
    description: getDescription(unitType),
  } as BaseUnitStats;
};
