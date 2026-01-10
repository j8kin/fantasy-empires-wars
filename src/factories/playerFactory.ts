import { isHeroType, isMageType } from '../domain/unit/unitTypeChecks';
import { getLandById } from '../domain/land/landRepository';
import { getAllUnitTypeByAlignment } from '../domain/unit/unitRepository';
import { RaceName } from '../state/player/PlayerProfile';
import { HeroUnitName, RegularUnitName, WarMachineName } from '../types/UnitType';
import { Alignment } from '../types/Alignment';
import { LandName } from '../types/Land';
import { Mana } from '../types/Mana';
import type { PlayerState, PlayerTraits } from '../state/player/PlayerState';
import type { PlayerProfile, PlayerType } from '../state/player/PlayerProfile';
import type { ManaType } from '../types/Mana';
import type { LandType } from '../types/Land';
import type { UnitType, HeroUnitType } from '../types/UnitType';

export const playerFactory = (
  profile: PlayerProfile,
  playerType: PlayerType,
  vault: number = 0
): PlayerState => {
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

  return {
    restrictedMagic: restrictedMagic,
    recruitedUnitsPerLand: recruitedUnitsPerLand,
  };
};

const getRestrictedMagic = (playerProfile: PlayerProfile): Set<ManaType> => {
  const restricted: Set<ManaType> = new Set();
  Object.values(Mana).forEach((mana) => restricted.add(mana));

  switch (playerProfile.alignment) {
    case Alignment.LAWFUL:
      restricted.delete(Mana.WHITE);
      restricted.delete(Mana.GREEN);
      restricted.delete(Mana.BLUE);
      break;
    case Alignment.NEUTRAL:
      restricted.delete(Mana.GREEN);
      restricted.delete(Mana.BLUE);
      restricted.delete(Mana.RED);
      break;
    case Alignment.CHAOTIC:
      restricted.delete(Mana.BLUE);
      restricted.delete(Mana.RED);
      restricted.delete(Mana.BLACK);
      break;
    default:
      break;
  }
  switch (playerProfile.type) {
    case HeroUnitName.CLERIC:
      restricted.delete(Mana.WHITE);
      break;
    case HeroUnitName.DRUID:
      restricted.delete(Mana.GREEN);
      break;
    case HeroUnitName.ENCHANTER:
      restricted.delete(Mana.BLUE);
      break;
    case HeroUnitName.PYROMANCER:
      restricted.delete(Mana.RED);
      break;
    case HeroUnitName.NECROMANCER:
      restricted.delete(Mana.BLACK);
      break;

    // non-magic Players
    case HeroUnitName.ZEALOT:
    case HeroUnitName.WARSMITH:
      restricted.add(Mana.WHITE);
      restricted.add(Mana.GREEN);
      restricted.add(Mana.BLUE);
      restricted.add(Mana.RED);
      restricted.add(Mana.BLACK);
      break;
    default:
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
  const chaoticUnitType = getAllUnitTypeByAlignment(Alignment.CHAOTIC).filter(
    (unit) => !isMageType(unit)
  );
  const lawfulUnitType = getAllUnitTypeByAlignment(Alignment.LAWFUL).filter(
    (unit) => !isMageType(unit)
  );

  Object.values(LandName)
    .filter((land) => land !== LandName.NONE)
    .forEach((landType) => {
      const land = getLandById(landType);
      // add WarMachines
      if (landType === LandName.DESERT) {
        // for lack of resources only BATTERING_RAM is available from all war-machines
        unitsPerLand[landType].add(WarMachineName.BATTERING_RAM);
      } else {
        Object.values(WarMachineName).forEach((warMachine) =>
          unitsPerLand[landType].add(warMachine)
        );
      }

      // add other units depending on player type and alignment and land type
      switch (playerProfile.type) {
        case HeroUnitName.WARSMITH:
          if (playerProfile.undead) {
            unitsPerLand[landType].add(HeroUnitName.WARSMITH);
            unitsPerLand[landType].add(RegularUnitName.UNDEAD);
          } else {
            unitsPerLand[landType].add(HeroUnitName.WARSMITH);
            if (land.alignment !== Alignment.LAWFUL) {
              land.unitsToRecruit
                .filter((unit) => !isHeroType(unit))
                .forEach((unit) => unitsPerLand[landType].add(unit));
            }
          }
          break;
        case HeroUnitName.ZEALOT:
          unitsPerLand[landType].add(HeroUnitName.ZEALOT);
          unitsPerLand[landType].add(RegularUnitName.NULLWARDEN);
          break;
        default:
          land.unitsToRecruit.forEach((unit) => unitsPerLand[landType].add(unit));
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
          land.unitsToRecruit.forEach((unit) => unitsPerLand[landType].add(unit));
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
          }
          break;
        case RaceName.ORC:
          land.unitsToRecruit.forEach((unit) => unitsPerLand[landType].add(unit));
          // elves hate orcs and ogres and never fight in one army
          unitsPerLand[landType].delete(RegularUnitName.ELF);
          unitsPerLand[landType].delete(RegularUnitName.DARK_ELF);
          unitsPerLand[landType].delete(HeroUnitName.RANGER);
          unitsPerLand[landType].delete(HeroUnitName.SHADOW_BLADE);
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
