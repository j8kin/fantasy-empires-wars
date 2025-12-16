import { GameState } from '../state/GameState';
import { PlayerState } from '../state/player/PlayerState';
import { PlayerProfile } from '../state/player/PlayerProfile';
import { LandPosition } from '../state/map/land/LandPosition';
import { getLandId } from '../state/map/land/LandId';
import { EmpireTreasure, Item } from '../types/Treasures';

import { playerFactory } from '../factories/playerFactory';
import {
  addPlayer as addPlayerToGameState,
  removePlayer as removePlayerFromGameState,
  setTurnOwner,
  incrementTurn,
  addPlayerLand,
  removePlayerLand,
} from './gameStateActions';

import { NO_PLAYER } from '../domain/player/playerRepository';

const INITIAL_VAULT = 15000;

export const addPlayer = (
  gameState: GameState,
  profile: PlayerProfile,
  type: 'human' | 'computer'
) => {
  const newPlayer = playerFactory(profile, type, INITIAL_VAULT);
  Object.assign(gameState, addPlayerToGameState(gameState, newPlayer));
  if (gameState.turnOwner === NO_PLAYER.id) {
    Object.assign(gameState, setTurnOwner(gameState, newPlayer.id));
  }
};

export const removePlayer = (gameState: GameState, playerId: string) => {
  if (gameState.turnOwner === playerId) {
    nextPlayer(gameState);
  }
  Object.assign(gameState, removePlayerFromGameState(gameState, playerId));
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

// Legacy functions - use addPlayerLand/removePlayerLand from gameStateActions for new code
export const addLand = (state: PlayerState, landPos: LandPosition): void => {
  state.landsOwned.add(getLandId(landPos));
};

export const removeLand = (state: PlayerState, landPos: LandPosition): void => {
  state.landsOwned.delete(getLandId(landPos));
};

// GameState-level land ownership functions
export const addLandToPlayer = (
  gameState: GameState,
  playerId: string,
  landPos: LandPosition
): void => {
  Object.assign(gameState, addPlayerLand(gameState, playerId, landPos));
};

export const removeLandFromPlayer = (
  gameState: GameState,
  playerId: string,
  landPos: LandPosition
): void => {
  Object.assign(gameState, removePlayerLand(gameState, playerId, landPos));
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
