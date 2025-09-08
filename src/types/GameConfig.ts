import { BattlefieldSize } from './BattlefieldSize';
import { GamePlayer } from './GamePlayer';

export interface GameConfig {
  mapSize: BattlefieldSize;
  selectedPlayer: GamePlayer;
  playerColor: string;
  numberOfOpponents: number /* todo: refactor to use opponents.length */;
  opponents?: GamePlayer[];
}
