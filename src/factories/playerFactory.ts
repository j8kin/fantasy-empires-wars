import { Mana } from '../types/Mana';

import type { PlayerState } from '../state/player/PlayerState';
import type { PlayerProfile } from '../state/player/PlayerProfile';
import type { PlayerType } from '../state/player/PlayerType';

export const playerFactory = (
  profile: PlayerProfile,
  playerType: PlayerType,
  vault: number = 0
): PlayerState => {
  return {
    id: Object.freeze(profile.id), // Fixed: was empty string before
    playerType: Object.freeze(playerType),
    playerProfile: Object.freeze(profile),
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
