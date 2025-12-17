import { getLandId } from '../state/map/land/LandId';
import { playerFactory } from '../factories/playerFactory';
import { addPlayer, setTurnOwner, incrementTurn } from './gameStateActions';
import { NO_PLAYER } from '../domain/player/playerRepository';

import type { GameState } from '../state/GameState';
import type { PlayerState } from '../state/player/PlayerState';
import type { PlayerProfile } from '../state/player/PlayerProfile';
import type { LandPosition } from '../state/map/land/LandPosition';
import type { EmpireTreasure, Item } from '../types/Treasures';

const INITIAL_VAULT = 15000;

export const addPlayerToGameState = (
  gameState: GameState,
  profile: PlayerProfile,
  type: 'human' | 'computer'
) => {
  const newPlayer = playerFactory(profile, type, INITIAL_VAULT);
  Object.assign(gameState, addPlayer(gameState, newPlayer));
  if (gameState.turnOwner === NO_PLAYER.id) {
    Object.assign(gameState, setTurnOwner(gameState, newPlayer.id));
  }
};

export const nextPlayer = (gameState: GameState): void => {
  const { players, turnOwner } = gameState;
  if (players.length === 0) return;

  const currentIdx = players.findIndex((p) => p.id === turnOwner);
  const nextIdx = (currentIdx + 1) % players.length;

  Object.assign(gameState, setTurnOwner(gameState, players[nextIdx].id));

  if (nextIdx === 0) {
    Object.assign(gameState, incrementTurn(gameState));
  }
};

export const hasLand = (state: PlayerState, landPos: LandPosition): boolean => {
  return state.landsOwned.has(getLandId(landPos));
};

// Empire treasure management functions
export const addEmpireTreasure = (state: PlayerState, treasure: EmpireTreasure): PlayerState => {
  return {
    ...state,
    empireTreasures: [...state.empireTreasures, treasure],
  };
};

export const removeEmpireTreasureItems = (state: PlayerState, treasure: Item): PlayerState => {
  return {
    ...state,
    empireTreasures: state.empireTreasures.filter((t) => t !== treasure),
  };
};
