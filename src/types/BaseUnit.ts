import { HeroUnitType, isHeroType, RegularUnitType, UnitType } from './UnitType';
import { Alignment } from './Alignment';

interface BaseUnitStats {
  attack: number;
  defense: number;
  range?: number;
  rangeDamage?: number;
  health: number;
  speed: number;
  alignment: Alignment;
  recruitCost: number;
  maintainCost: number;
  description: string;
}

export const getRecruitDuration = (unitType: UnitType): number => {
  if (isHeroType(unitType)) return 3;

  switch (unitType) {
    case RegularUnitType.CATAPULT:
    case RegularUnitType.BALLISTA:
      return 3;
    case RegularUnitType.HALFLING:
    case RegularUnitType.ELF:
    case RegularUnitType.DARK_ELF:
      return 2;
    default:
      return 1;
  }
};

export const getBaseUnitStats = (unitType: UnitType): BaseUnitStats => {
  switch (unitType) {
    case RegularUnitType.WARD_HANDS:
      return {
        attack: 5,
        defense: 3,
        health: 20,
        speed: 2,
        alignment: Alignment.NEUTRAL,
        recruitCost: 300,
        maintainCost: 2,
        description:
          'Local hands risen in necessity, their resolve rough but unbroken against Orrivane’s growing dread.',
      };
    case RegularUnitType.WARRIOR:
      return {
        attack: 8,
        defense: 6,
        health: 25,
        speed: 2,
        alignment: Alignment.NEUTRAL,
        recruitCost: 500,
        maintainCost: 4,
        description:
          'Hardened veterans of countless skirmishes, these soldiers fight for gold, glory, or the fragile peace that follows both.',
      };
    case RegularUnitType.DWARF:
      return {
        attack: 12,
        defense: 20,
        health: 40,
        speed: 1,
        alignment: Alignment.LAWFUL,
        recruitCost: 800,
        maintainCost: 5,
        description:
          'Clad in runed steel and bound by oath, Dwarves hold the line like mountains given form—unyielding, proud, and slow to fall.',
      };
    case RegularUnitType.ORC:
      return {
        attack: 10,
        defense: 15,
        health: 30,
        speed: 2,
        alignment: Alignment.CHAOTIC,
        recruitCost: 600,
        maintainCost: 4.5,
        description:
          'Forged in chaos and fire, Orcs live for the clash of steel—each battle a hymn to their untamed hunger for conquest.',
      };
    case RegularUnitType.HALFLING:
      return {
        attack: 6,
        defense: 3,
        range: 15,
        rangeDamage: 8,
        health: 15,
        speed: 4,
        alignment: Alignment.NEUTRAL,
        recruitCost: 700,
        maintainCost: 3,
        description:
          'Small in stature, stubborn in spirit—halfling slingers pelt foes with stones and startling courage.',
      };
    case RegularUnitType.ELF:
    case RegularUnitType.DARK_ELF:
      return {
        attack: 15,
        defense: 4,
        range: 20,
        rangeDamage: 15,
        health: 20,
        speed: 3,
        alignment: unitType === RegularUnitType.ELF ? Alignment.LAWFUL : Alignment.CHAOTIC,
        recruitCost: 2500,
        maintainCost: 5,
        description:
          unitType === RegularUnitType.ELF
            ? 'Silent as moonlight and swift as wind through leaves, Elven archers strike before their foes even sense the bowstring’s whisper.'
            : 'Born beneath shadowed groves, Dark Elves blend beauty with cruelty—their arrows carry both poison and pride.',
      };
    // War Machines
    // Catapult do not damage anything only destroy buildings/walls
    case RegularUnitType.BALLISTA:
      return {
        attack: 0,
        defense: 0,
        range: 35,
        rangeDamage: 25,
        health: 15,
        speed: 0,
        alignment: Alignment.NEUTRAL,
        recruitCost: 1500,
        maintainCost: 150,
        description:
          'Ancient engines of precision death, Ballistae pierce armor and arrogance alike with thunderous finality.',
      };
    case RegularUnitType.CATAPULT:
      return {
        attack: 0,
        defense: 0,
        health: 30,
        speed: 0,
        alignment: Alignment.NEUTRAL,
        recruitCost: 1000,
        maintainCost: 50,
        description:
          'Stone-flingers of ruin, Catapults reduce fortresses to dust and kings to memory—patient, implacable, and deaf to mercy.',
      };
    // HEROES
    // Human warrior hero
    case HeroUnitType.WARSMITH:
    case HeroUnitType.FIGHTER:
      return {
        attack: 30,
        defense: 3,
        range: 2,
        rangeDamage: 30,
        health: 18,
        speed: 4,
        alignment: unitType === HeroUnitType.WARSMITH ? Alignment.CHAOTIC : Alignment.LAWFUL,
        recruitCost: 1500,
        maintainCost: 100,
        description:
          unitType === HeroUnitType.FIGHTER
            ? 'Champions of the common folk, Fighters carry the banners of law and honor into every battle, their courage as sharp as their blades.'
            : 'Forged in the fires of rebellion, Warsmiths temper chaos into strategy—each strike a protest against tyranny and weakness.',
      };
    // Dwarf hero
    case HeroUnitType.HAMMER_LORD:
      return {
        attack: 40,
        defense: 3,
        range: 2,
        rangeDamage: 40,
        health: 25,
        speed: 4,
        alignment: Alignment.LAWFUL,
        recruitCost: 1500,
        maintainCost: 100,
        description:
          'Bearing hammers that have shattered both stone and legend, Hammerlords are dwarven paragons of strength and unyielding resolve.',
      };
    // Orc hero
    case HeroUnitType.OGR:
      return {
        attack: 40,
        defense: 4,
        range: 2,
        rangeDamage: 45,
        health: 30,
        speed: 3,
        alignment: Alignment.CHAOTIC,
        recruitCost: 1500,
        maintainCost: 100,
        description:
          'Once feared as destroyers, the Ogr champions now fight with grim purpose—seeking to silence all who dare wield the arcane.',
      };
    // Elf hero
    case HeroUnitType.SHADOW_BLADE:
    case HeroUnitType.RANGER:
      return {
        attack: 30,
        defense: 3,
        range: 30,
        rangeDamage: 30,
        health: 18,
        speed: 5,
        alignment: unitType === HeroUnitType.RANGER ? Alignment.LAWFUL : Alignment.CHAOTIC,
        recruitCost: 1500,
        maintainCost: 100,
        description:
          unitType === HeroUnitType.RANGER
            ? 'Keepers of forgotten groves, Rangers walk unseen between root and shadow, striking swiftly to preserve the wild balance of Orrivane.'
            : 'A silent killer born of twilight, where loyalty is as thin as moonlight.',
      };
    // Mage Heroes
    // Pyromancer - produce red mana
    case HeroUnitType.PYROMANCER:
      return {
        attack: 30,
        defense: 3,
        range: 30,
        rangeDamage: 30,
        health: 18,
        speed: 2,
        alignment: Alignment.CHAOTIC,
        recruitCost: 2500,
        maintainCost: 100,
        description:
          'Born of embers and fury, Pyromancers command the flames of creation—each spell a hymn to passion and ruin.',
      };
    // Cleric - produce white mana
    case HeroUnitType.CLERIC:
      return {
        attack: 25,
        defense: 5,
        range: 2,
        rangeDamage: 25,
        health: 20,
        speed: 2,
        alignment: Alignment.LAWFUL,
        recruitCost: 2500,
        maintainCost: 100,
        description:
          'Guided by celestial whispers, Clerics mend the wounds of body and spirit alike, their faith a shield against the growing dark.',
      };
    // Druid - produce green mana
    case HeroUnitType.DRUID:
      return {
        attack: 20,
        defense: 4,
        range: 2,
        rangeDamage: 20,
        health: 22,
        speed: 3,
        alignment: Alignment.LAWFUL,
        recruitCost: 2500,
        maintainCost: 100,
        description:
          'Bound to the heartbeat of the wild, Druids channel Orrivane’s living breath—healing, nurturing, and unleashing nature’s wrath.',
      };
    // Enchanter - produce blue mana
    case HeroUnitType.ENCHANTER:
      return {
        attack: 15,
        defense: 3,
        range: 35,
        rangeDamage: 15,
        health: 16,
        speed: 2,
        alignment: Alignment.NEUTRAL,
        recruitCost: 2500,
        maintainCost: 100,
        description:
          'Masters of unseen threads, Enchanters weave illusions and insight from pure thought, bending truth like light through a prism.',
      };
    // Necromancer - produce black mana
    case HeroUnitType.NECROMANCER:
      return {
        attack: 35,
        defense: 2,
        range: 25,
        rangeDamage: 35,
        health: 15,
        speed: 2,
        alignment: Alignment.CHAOTIC,
        recruitCost: 2500,
        maintainCost: 100,
        description:
          'Whisperers of death’s secrets, Necromancers blur the line between decay and command, binding restless souls to their grim will.',
      };
  }
};
