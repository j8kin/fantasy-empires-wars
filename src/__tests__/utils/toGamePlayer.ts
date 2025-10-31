import { GamePlayer, PlayerInfo } from '../../types/GamePlayer';
import { ManaType } from '../../types/Mana';

export const toGamePlayer = (
  player: PlayerInfo,
  playerType: 'human' | 'computer' = 'human'
): GamePlayer => {
  return {
    ...player,
    mana: {
      [ManaType.WHITE]: 0,
      [ManaType.BLACK]: 0,
      [ManaType.GREEN]: 0,
      [ManaType.BLUE]: 0,
      [ManaType.RED]: 0,
    },
    money: 200000, // default for testing to be able to buy buildings and units in tests by default
    income: 0, // recalculated at the START phase of the turn
    diplomacy: {},
    playerType: playerType,
    quests: [], // no heroes are send to quests
    empireTreasures: [],
  };
};
