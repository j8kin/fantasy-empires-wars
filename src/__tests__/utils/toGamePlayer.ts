import { PlayerState, PlayerProfile, createPlayerState } from '../../state/PlayerState';

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
