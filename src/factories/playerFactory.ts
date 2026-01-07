import { Mana } from '../types/Mana';
import { HeroUnitName } from '../types/UnitType';
import { Alignment } from '../types/Alignment';
import type { PlayerState, PlayerTraits } from '../state/player/PlayerState';
import { PlayerProfile, PlayerType } from '../state/player/PlayerProfile';
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
  return {
    restrictedMagic: restrictedMagic(playerProfile),
  };
};

const restrictedMagic = (playerProfile: PlayerProfile): ManaType[] => {
  let restricted: ManaType[] = Object.values(Mana);
  if (playerProfile.type === HeroUnitName.ZEALOT || playerProfile.type === HeroUnitName.WARSMITH) {
    return restricted;
  }
  switch (playerProfile.alignment) {
    case Alignment.LAWFUL:
      restricted = [Mana.RED, Mana.BLACK];
      break;
    case Alignment.NEUTRAL:
      restricted = [Mana.WHITE, Mana.BLACK];
      break;
    case Alignment.CHAOTIC:
      restricted = [Mana.WHITE, Mana.GREEN];
      break;
    default:
      break;
  }
  switch (playerProfile.type) {
    case HeroUnitName.CLERIC:
      restricted = restricted.filter((mana) => mana !== Mana.WHITE);
      break;
    case HeroUnitName.DRUID:
      restricted = restricted.filter((mana) => mana !== Mana.GREEN);
      break;
    case HeroUnitName.ENCHANTER:
      restricted = restricted.filter((mana) => mana !== Mana.BLUE);
      break;
    case HeroUnitName.PYROMANCER:
      restricted = restricted.filter((mana) => mana !== Mana.RED);
      break;
    case HeroUnitName.NECROMANCER:
      restricted = restricted.filter((mana) => mana !== Mana.BLACK);
      break;
    default:
      break;
  }
  return restricted;
};
