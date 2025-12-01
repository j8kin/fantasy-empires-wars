import { GameState } from '../state/GameState';
import { PlayerState } from '../state/player/PlayerState';
import { PlayerProfile } from '../state/player/PlayerProfile';
import { LandPosition } from '../state/map/land/LandPosition';
import { getLandId } from '../state/map/land/LandId';

import { playerFactory } from '../factories/playerFactory';

import { NO_PLAYER } from '../domain/player/playerRepository';

const INITIAL_VAULT = 15000;

export const addPlayer = (
  gameState: GameState,
  profile: PlayerProfile,
  type: 'human' | 'computer'
) => {
  const newPlayer = playerFactory(profile, type, INITIAL_VAULT);
  gameState.players.push(newPlayer);
  if (gameState.turnOwner === NO_PLAYER.id) {
    gameState.turnOwner = newPlayer.id;
  }
};

export const removePlayer = (gameState: GameState, playerId: string) => {
  if (gameState.turnOwner === playerId) {
    nextPlayer(gameState);
  }
  gameState.players = gameState.players.filter((p) => p.id !== playerId);
};

export const nextPlayer = (gameState: GameState): void => {
  const { players, turnOwner } = gameState;
  if (players.length === 0) return;

  const currentIdx = players.findIndex((p) => p.id === turnOwner);
  const nextIdx = (currentIdx + 1) % players.length;

  gameState.turnOwner = players[nextIdx].id;

  if (nextIdx === 0) {
    gameState.turn += 1;
  }
};

export const addLand = (state: PlayerState, landPos: LandPosition): void => {
  state.landsOwned.add(getLandId(landPos));
};

export const removeLand = (state: PlayerState, landPos: LandPosition): void => {
  state.landsOwned.delete(getLandId(landPos));
};

export const hasLand = (state: PlayerState, landPos: LandPosition): boolean => {
  return state.landsOwned.has(getLandId(landPos));
};
