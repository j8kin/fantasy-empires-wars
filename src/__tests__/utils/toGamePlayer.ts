import { GamePlayer, PlayerInfo } from '../../types/GamePlayer';

export const toGamePlayer = (player: PlayerInfo): GamePlayer => {
  return { ...player, mana: {}, money: 0, income: 0, diplomacy: {} };
};
