import { GameState } from './GameState';
import { PlayerState } from './PlayerState';

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
  gameState.players.filter(
    (p) => p.playerId !== gameState.turnOwner && statuses.includes(p.diplomacy[gameState.turnOwner])
  );
