import { GameState } from '../state/GameState';
import { PlayerState } from '../state/player/PlayerState';
import { PlayerProfile } from '../state/player/PlayerProfile';
import { LandPosition } from '../state/map/land/LandPosition';
import { getLandId } from '../state/map/land/LandId';

import { playerFactory } from '../factories/playerFactory';
import { addPlayer as addPlayerToGameState, setTurnOwner, incrementTurn } from './gameStateActions';

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
