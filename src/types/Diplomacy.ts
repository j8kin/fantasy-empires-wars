import { GameState } from '../state/GameState';
import { PlayerState } from '../state/PlayerState';

export enum DiplomacyStatus {
  NO_TREATY = 'No Treaty',
  PEACE = 'Peace',
  WAR = 'War',
  ALLIANCE = 'Alliance',
}

export type Diplomacy = Record<string, DiplomacyStatus>;

export const getPlayersByDiplomacy = (
  gameState: GameState,
  statuses: DiplomacyStatus[]
): PlayerState[] =>
  gameState.allPlayers.filter(
    (p) => p.id !== gameState.turnOwner.id && statuses.includes(p.diplomacy[gameState.turnOwner.id])
  );
