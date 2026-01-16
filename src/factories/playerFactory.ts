import { isHeroType, isMageType } from '../domain/unit/unitTypeChecks';
import { getLandAlignment, getLandUnitsToRecruit } from '../domain/land/landRepository';
import { getAllUnitTypeByAlignment } from '../domain/unit/unitRepository';
import { Doctrine, RaceName } from '../state/player/PlayerProfile';
import { HeroUnitName, RegularUnitName, WarMachineName } from '../types/UnitType';
import { BuildingName } from '../types/Building';
import { Alignment } from '../types/Alignment';
import { LandName } from '../types/Land';
import { Mana } from '../types/Mana';
import type { PlayerState, PlayerTraits } from '../state/player/PlayerState';
import type { PlayerProfile, PlayerType } from '../state/player/PlayerProfile';
import type { RegularUnitType, WarMachineType } from '../types/UnitType';
import type { ManaType } from '../types/Mana';
import type { LandType } from '../types/Land';
import type { BuildingType } from '../types/Building';
import type { UnitType, HeroUnitType } from '../types/UnitType';

export const playerFactory = (profile: PlayerProfile, playerType: PlayerType, vault: number = 0): PlayerState => {
  return {
    id: Object.freeze(profile.id), // Fixed: was empty string before
    playerType: Object.freeze(playerType),
    playerProfile: Object.freeze(profile),
    traits: playerTraitsFactory(profile),
    landsOwned: new Set<string>(),
    diplomacy: {},
    empireTreasures: [],
    mana: {
      [Mana.WHITE]: 0,
      [Mana.BLACK]: 0,
      [Mana.GREEN]: 0,
      [Mana.BLUE]: 0,
      [Mana.RED]: 0,
    },
    effects: [],
    quests: [],
    vault: vault,
    color: profile.color,
  };
};

const playerTraitsFactory = (playerProfile: PlayerProfile): PlayerTraits => {
  const restrictedMagic = getRestrictedMagic(playerProfile);
  const recruitedUnitsPerLand = getUnitsPerLand(playerProfile, restrictedMagic);
  const recruitmentSlots = getRecruitmentSlots(playerProfile, restrictedMagic);

  return {
    restrictedMagic: restrictedMagic,
    recruitedUnitsPerLand: recruitedUnitsPerLand,
    recruitmentSlots: recruitmentSlots,
  };
};

const getRestrictedMagic = (playerProfile: PlayerProfile): Set<ManaType> => {
  const restricted: Set<ManaType> = new Set();
  Object.values(Mana).forEach((mana) => restricted.add(mana));

  switch (playerProfile.doctrine) {
    case Doctrine.MELEE:
      // only one "main" magic is available
      switch (playerProfile.type) {
        case HeroUnitName.CLERIC:
        case HeroUnitName.HAMMER_LORD:
          restricted.delete(Mana.WHITE);
          break;
        case HeroUnitName.DRUID:
        case HeroUnitName.RANGER:
          restricted.delete(Mana.GREEN);
          break;
        case HeroUnitName.ENCHANTER:
        case HeroUnitName.FIGHTER:
          restricted.delete(Mana.BLUE);
          break;
        case HeroUnitName.PYROMANCER:
        case HeroUnitName.OGR:
          restricted.delete(Mana.RED);
          break;
        case HeroUnitName.NECROMANCER:
        case HeroUnitName.SHADOW_BLADE:
          restricted.delete(Mana.BLACK);
          break;
        default:
          break;
      }
      break;
    case Doctrine.MAGIC:
      // "one primary magic" and and 2 neighboring magic are available
      switch (playerProfile.type) {
        case HeroUnitName.CLERIC:
        case HeroUnitName.HAMMER_LORD:
        case HeroUnitName.DRUID:
        case HeroUnitName.RANGER:
          restricted.delete(Mana.WHITE);
          restricted.delete(Mana.GREEN);
          restricted.delete(Mana.BLUE);
          break;
        case HeroUnitName.ENCHANTER:
        case HeroUnitName.FIGHTER:
        case HeroUnitName.OGR:
          restricted.delete(Mana.GREEN);
          restricted.delete(Mana.BLUE);
          restricted.delete(Mana.RED);
          break;
        case HeroUnitName.PYROMANCER:
        case HeroUnitName.NECROMANCER:
        case HeroUnitName.SHADOW_BLADE:
          restricted.delete(Mana.BLUE);
          restricted.delete(Mana.RED);
          restricted.delete(Mana.BLACK);
          break;
        default:
          break;
      }
      break;
    case Doctrine.PURE_MAGIC:
      // all magic is available
      restricted.clear();
      break;
    default:
      // all magic is prohibited
      break;
  }
  return restricted;
};

const MANA_TO_MAGE: Record<ManaType, HeroUnitType> = {
  [Mana.WHITE]: HeroUnitName.CLERIC,
  [Mana.GREEN]: HeroUnitName.DRUID,
  [Mana.BLUE]: HeroUnitName.ENCHANTER,
  [Mana.RED]: HeroUnitName.PYROMANCER,
  [Mana.BLACK]: HeroUnitName.NECROMANCER,
};

const getUnitsPerLand = (
  playerProfile: PlayerProfile,
  restrictedMagic: Set<ManaType>
): Record<LandType, Set<UnitType>> => {
  const unitsPerLand: Record<LandType, Set<UnitType>> = Object.fromEntries(
    Object.values(LandName).map((land) => [land, new Set<UnitType>()])
  ) as Record<LandType, Set<UnitType>>;

  // mages are available for all lands and managed by constructed Mage Tower which also depends on Restricted Magic
  const chaoticUnitType = getAllUnitTypeByAlignment(Alignment.CHAOTIC).filter((unit) => !isMageType(unit));
  const lawfulUnitType = getAllUnitTypeByAlignment(Alignment.LAWFUL).filter((unit) => !isMageType(unit));

  Object.values(LandName)
    .filter((land) => land !== LandName.NONE)
    .forEach((landType) => {
      // add WarMachines
      if (landType === LandName.DESERT) {
        // for lack of resources only BATTERING_RAM is available from all war-machines
        unitsPerLand[landType].add(WarMachineName.BATTERING_RAM);
      } else {
        Object.values(WarMachineName).forEach((warMachine) => unitsPerLand[landType].add(warMachine));
      }

      // add other units depending on player type and alignment and land type
      switch (playerProfile.type) {
        case HeroUnitName.WARSMITH:
          if (playerProfile.doctrine === Doctrine.UNDEAD) {
            unitsPerLand[landType].add(HeroUnitName.WARSMITH);
            unitsPerLand[landType].add(RegularUnitName.UNDEAD);
          } else {
            unitsPerLand[landType].add(HeroUnitName.WARSMITH);
            if (getLandAlignment(landType) !== Alignment.LAWFUL) {
              getLandUnitsToRecruit(landType, false)
                .filter((unit) => !isHeroType(unit))
                .forEach((unit) => unitsPerLand[landType].add(unit));
            }
          }
          break;
        case HeroUnitName.ZEALOT:
          unitsPerLand[landType].add(HeroUnitName.ZEALOT);
          getLandUnitsToRecruit(landType, false).forEach((unit) => {
            if (!isHeroType(unit) && unit !== RegularUnitName.HALFLING && unit !== RegularUnitName.WARD_HANDS) {
              unitsPerLand[landType].add(unit);
            }
          });
          break;
        default:
          getLandUnitsToRecruit(landType, false).forEach((unit) => unitsPerLand[landType].add(unit));
          // lawful units are not available for chaotic players
          if (playerProfile.alignment === Alignment.CHAOTIC) {
            lawfulUnitType.forEach((unit) => unitsPerLand[landType].delete(unit));
          }
          // chaotic units are not available for lawful players
          if (playerProfile.alignment === Alignment.LAWFUL) {
            chaoticUnitType.forEach((unit) => unitsPerLand[landType].delete(unit));
          }
          break;
      }

      // add some restriction based on Race
      switch (playerProfile.race) {
        case RaceName.ELF:
          // elves hate orcs and ogres
          unitsPerLand[landType].delete(RegularUnitName.ORC);
          unitsPerLand[landType].delete(HeroUnitName.OGR);
          // do not allow to recruit opposite alignment units only neutral elves could recruit both type of units
          if (playerProfile.alignment === Alignment.CHAOTIC) {
            unitsPerLand[landType].delete(RegularUnitName.ELF);
            unitsPerLand[landType].delete(HeroUnitName.RANGER);
          }
          if (playerProfile.alignment === Alignment.LAWFUL) {
            unitsPerLand[landType].delete(RegularUnitName.DARK_ELF);
            unitsPerLand[landType].delete(HeroUnitName.SHADOW_BLADE);
            // also filter out any other chaotic units that might have been re-added or were there
            chaoticUnitType.forEach((unit) => unitsPerLand[landType].delete(unit));
          }
          break;
        case RaceName.ORC:
          // elves hate orcs and ogres and never fight in one army
          unitsPerLand[landType].delete(RegularUnitName.ELF);
          unitsPerLand[landType].delete(RegularUnitName.DARK_ELF);
          unitsPerLand[landType].delete(HeroUnitName.RANGER);
          unitsPerLand[landType].delete(HeroUnitName.SHADOW_BLADE);
          if (playerProfile.alignment === Alignment.CHAOTIC) {
            lawfulUnitType.forEach((unit) => unitsPerLand[landType].delete(unit));
          }
          break;
        default:
          break;
      }
    });

  const allowedMages = Object.entries(MANA_TO_MAGE)
    .filter(([mana]) => !restrictedMagic.has(mana as ManaType))
    .map(([, mage]) => mage);

  Object.values(LandName)
    .filter((landType) => landType !== LandName.NONE)
    .forEach((landType) => {
      allowedMages.forEach((mage) => unitsPerLand[landType].add(mage));
    });

  return unitsPerLand;
};

const getRecruitmentSlots = (
  playerProfile: PlayerProfile,
  restrictedMagic: Set<ManaType>
): Partial<Record<BuildingType, Record<number, Set<UnitType>>>> => {
  const buildingTraits: Partial<Record<BuildingType, Record<number, Set<UnitType>>>> = {};
  const allowedMages = Object.values(Mana)
    .filter((m) => !restrictedMagic.has(m))
    .map((mana) => MANA_TO_MAGE[mana]);
  if (allowedMages.length > 0) {
    buildingTraits[BuildingName.MAGE_TOWER] = { 0: new Set(allowedMages) };
  }

  const allRegularUnits: RegularUnitType[] = Object.values(RegularUnitName).filter((u) => u !== RegularUnitName.UNDEAD);
  const allWarMachines: WarMachineType[] = Object.values(WarMachineName);
  const allMightHeroes: HeroUnitType[] = Object.values(HeroUnitName).filter(
    (unit) => !isMageType(unit) && unit !== HeroUnitName.WARSMITH && unit !== HeroUnitName.ZEALOT
  );

  switch (playerProfile.doctrine) {
    case Doctrine.UNDEAD:
      buildingTraits[BuildingName.BARRACKS] = {
        0: new Set([RegularUnitName.UNDEAD, ...allWarMachines, HeroUnitName.WARSMITH]),
        1: new Set([RegularUnitName.UNDEAD, ...allWarMachines, HeroUnitName.WARSMITH]),
        2: new Set([...allWarMachines, HeroUnitName.WARSMITH]),
      };
      break;
    case Doctrine.ANTI_MAGIC:
      buildingTraits[BuildingName.BARRACKS] = {
        0: new Set([...allRegularUnits]),
        1: new Set([...allWarMachines]),
        2: new Set([HeroUnitName.ZEALOT]),
      };
      break;
    default:
      buildingTraits[BuildingName.BARRACKS] = {
        0: new Set([...allRegularUnits, ...allWarMachines, ...allMightHeroes]),
        1: new Set([...allRegularUnits, ...allWarMachines, ...allMightHeroes]),
        2: new Set([...allRegularUnits, ...allWarMachines, ...allMightHeroes]),
      };
      break;
  }
  return buildingTraits;
};
