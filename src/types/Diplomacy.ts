import { GameState } from './GameState';
import { GamePlayer } from './GamePlayer';

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
): GamePlayer[] =>
  gameState.players.filter(
    (p) => p.id !== gameState.turnOwner && statuses.includes(p.diplomacy[gameState.turnOwner])
  );
