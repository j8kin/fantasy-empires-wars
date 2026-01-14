import { getLandId } from '../state/map/land/LandId';
import { playerFactory } from '../factories/playerFactory';
import { addPlayer, setTurnOwner, incrementTurn } from './gameStateActions';
import { NO_PLAYER } from '../domain/player/playerRepository';
import { DiplomacyStatus } from '../types/Diplomacy';
import type { GameState } from '../state/GameState';
import type { LandPosition } from '../state/map/land/LandPosition';
import type { PlayerState } from '../state/player/PlayerState';
import type { PlayerProfile, PlayerType } from '../state/player/PlayerProfile';
import type { EmpireTreasure, Item } from '../types/Treasures';
import type { DiplomacyStatusType, DiplomacyType } from '../types/Diplomacy';

const INITIAL_VAULT = 15000;

export const addPlayerToGameState = (gameState: GameState, profile: PlayerProfile, type: PlayerType) => {
  const newPlayer = playerFactory(profile, type, INITIAL_VAULT);

  // Add the player and potentially update turn owner
  let updatedState = addPlayer(gameState, newPlayer);

  if (gameState.turnOwner === NO_PLAYER.id) {
    updatedState = setTurnOwner(updatedState, newPlayer.id);
  }

  // Initialize bilateral diplomacy with existing players
  const finalizedState = gameState.players.reduce((state, existingPlayer) => {
    return setDiplomacyStatus(state, newPlayer.id, existingPlayer.id, DiplomacyStatus.NO_TREATY);
  }, updatedState);

  Object.assign(gameState, finalizedState);
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

export const removeEmpireTreasureItem = (state: PlayerState, treasure: Item): PlayerState => {
  return {
    ...state,
    empireTreasures: state.empireTreasures.filter((t) => t.id !== treasure.id),
  };
};

export const decrementItemCharges = (state: PlayerState, treasure: Item): PlayerState => {
  return {
    ...state,
    empireTreasures: state.empireTreasures.map((t) =>
      t.id === treasure.id ? { ...t, charge: treasure.charge - 1 } : t
    ),
  };
};

export const setDiplomacyStatus = (
  state: GameState,
  playerId: string,
  opponentId: string,
  newStatus: DiplomacyStatusType
): GameState => {
  const diplomacyEntry: DiplomacyType = {
    status: newStatus,
    lastUpdated: state.turn,
  };

  return {
    ...state,
    players: state.players.map((player) => {
      if (player.id === playerId) {
        return {
          ...player,
          diplomacy: { ...player.diplomacy, [opponentId]: diplomacyEntry },
        };
      }
      if (player.id === opponentId) {
        return {
          ...player,
          diplomacy: { ...player.diplomacy, [playerId]: diplomacyEntry },
        };
      }
      return player;
    }),
  };
};
