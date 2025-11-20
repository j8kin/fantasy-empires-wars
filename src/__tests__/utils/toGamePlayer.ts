import { PlayerState, PlayerProfile, createPlayerState } from '../../types/GamePlayer';

/**
 * Test method only.
 * @param player
 * @param playerType
 */
export const toGamePlayer = (
  player: PlayerProfile,
  playerType: 'human' | 'computer' = 'human'
): PlayerState => {
  return { ...createPlayerState(player, playerType), vault: 200000 };
};
