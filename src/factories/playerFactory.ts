import { ManaType } from '../types/Mana';
import { PlayerState } from '../state/player/PlayerState';
import { PlayerProfile } from '../state/player/PlayerProfile';
import { PlayerType } from '../state/player/PlayerType';

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
      [ManaType.WHITE]: 0,
      [ManaType.BLACK]: 0,
      [ManaType.GREEN]: 0,
      [ManaType.BLUE]: 0,
      [ManaType.RED]: 0,
    },
    quests: [],
    vault: vault,
    color: profile.color,
  };
};
