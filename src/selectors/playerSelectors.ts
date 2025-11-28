import { GameState } from '../state/GameState';
import { PlayerState } from '../state/player/PlayerState';

export const getPlayer = (state: GameState, id: string): PlayerState =>
  state.players.find((p) => p.id === id)!;

export const getTurnOwner = (state: GameState): PlayerState => getPlayer(state, state.turnOwner);
