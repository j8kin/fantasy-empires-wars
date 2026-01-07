import { getBuildingInfo } from '../domain/building/buildingRepository';
import { Mana } from '../types/Mana';
import { HeroUnitName } from '../types/UnitType';
import { Alignment } from '../types/Alignment';
import { BuildingName } from '../types/Building';
import type { PlayerState, PlayerTraits } from '../state/player/PlayerState';
import type { PlayerProfile, PlayerType } from '../state/player/PlayerProfile';
import type { BuildingInfo } from '../domain/building/buildingRepository';
import type { BuildingType } from '../types/Building';
import type { ManaType } from '../types/Mana';

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
  const availableBuildings = getAvailableBuildings(restrictedMagic);

  return {
    restrictedMagic: restrictedMagic,
    availableBuildings: availableBuildings,
  };
};

const MANA_TO_MAGE_TOWER: Partial<Record<BuildingType, ManaType>> = {
  [BuildingName.WHITE_MAGE_TOWER]: Mana.WHITE,
  [BuildingName.GREEN_MAGE_TOWER]: Mana.GREEN,
  [BuildingName.BLUE_MAGE_TOWER]: Mana.BLUE,
  [BuildingName.RED_MAGE_TOWER]: Mana.RED,
  [BuildingName.BLACK_MAGE_TOWER]: Mana.BLACK,
};

const getAvailableBuildings = (restrictedMagic: Set<ManaType>): Set<BuildingInfo> => {
  return new Set(
    Object.values(BuildingName)
      .filter(
        (building) =>
          MANA_TO_MAGE_TOWER[building] == null || !restrictedMagic.has(MANA_TO_MAGE_TOWER[building])
      )
      .map(getBuildingInfo)
  );
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
