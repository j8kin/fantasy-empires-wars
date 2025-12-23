import { ManaKind } from '../types/Mana';

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
      [ManaKind.WHITE]: 0,
      [ManaKind.BLACK]: 0,
      [ManaKind.GREEN]: 0,
      [ManaKind.BLUE]: 0,
      [ManaKind.RED]: 0,
    },
    effects: [],
    quests: [],
    vault: vault,
    color: profile.color,
  };
};
