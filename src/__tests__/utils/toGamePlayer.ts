import { GamePlayer, PlayerInfo } from '../../types/GamePlayer';
import { ManaType } from '../../types/Mana';

export const toGamePlayer = (player: PlayerInfo): GamePlayer => {
  return {
    ...player,
    mana: {
      [ManaType.WHITE]: 0,
      [ManaType.BLACK]: 0,
      [ManaType.GREEN]: 0,
      [ManaType.BLUE]: 0,
      [ManaType.RED]: 0,
    },
    money: 0,
    income: 0,
    diplomacy: {},
    playerType: 'human',
  };
};
