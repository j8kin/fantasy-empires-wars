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

const restrictedMagic = (playerProfile: PlayerProfile): Set<ManaType> => {
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
