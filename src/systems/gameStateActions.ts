import { GameState } from '../state/GameState';
import { nextPlayer } from './playerActions';
import { TurnPhase } from '../turn/TurnPhase';
import { ArmyState } from '../state/army/ArmyState';

export const nextTurnPhase = (state: GameState): void => {
  switch (state.turnPhase) {
    case TurnPhase.START:
      state.turnPhase = state.turn === 1 ? TurnPhase.END : TurnPhase.MAIN;
      break;
    case TurnPhase.MAIN:
      state.turnPhase = TurnPhase.END;
      break;
    case TurnPhase.END:
      nextPlayer(state);
      state.turnPhase = TurnPhase.START;
      break;
  }
};

export const removeArmy = (state: GameState, army: ArmyState): void => {
  // todo implement
};
