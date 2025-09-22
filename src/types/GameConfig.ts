import { BattlefieldSize } from './BattlefieldSize';
import { GamePlayer } from './GamePlayer';

export interface GameConfig {
  mapSize: BattlefieldSize;
  selectedPlayer: GamePlayer;
  playerColor: string;
  opponents?: GamePlayer[];
}
