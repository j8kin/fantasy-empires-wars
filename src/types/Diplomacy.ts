import { GameState } from './GameState';
import { PlayerState } from './GamePlayer';

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
    (p) => p.id !== gameState.turnOwner && statuses.includes(p.diplomacy[gameState.turnOwner])
  );
