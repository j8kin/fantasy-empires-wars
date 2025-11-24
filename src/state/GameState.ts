import { createPlayerState, NO_PLAYER, PlayerProfile, PlayerState } from './PlayerState';
import { LandState } from './LandState';

export interface BattlefieldDimensions {
  rows: number;
  cols: number;
}

export type BattlefieldLands = Record<string, LandState>;

export type BattlefieldMap = {
  dimensions: BattlefieldDimensions;
  lands: BattlefieldLands;
};

export enum TurnPhase {
  START = 'START',
  MAIN = 'MAIN',
  END = 'END',
}
const INITIAL_VAULT = 15000;

export interface GameState {
  addPlayer(profile: PlayerProfile, type: 'human' | 'computer'): void;
  removePlayer(id: string): void;
  getPlayer(id: string): PlayerState;
  get allPlayers(): PlayerState[]; // todo probably get all players lands
  get nPlayers(): number; // todo investigate and remove if necessary

  get map(): BattlefieldMap;
  getLand(landId: string): LandState;
  getLandOwner(landId: string): string;

  get turn(): number;
  get turnOwner(): PlayerState;
  get turnPhase(): TurnPhase;
  nextPhase(): void;
  nextPlayer(): void;
  set turnPhase(phase: TurnPhase); // todo refactor to use turnPhase setter
}

export const createGameState = (map: BattlefieldMap): GameState => {
  let turnOwner: string = NO_PLAYER.id;
  let turn: number = 1;
  let turnPhase: TurnPhase = TurnPhase.START;

  const battlefield: BattlefieldMap = map;
  const players: PlayerState[] = [];

  return {
    get nPlayers(): number {
      return players.length;
    },
    get map() {
      return battlefield;
    },
    getLand: function (landId: string): LandState {
      return battlefield.lands[landId];
    },
    getLandOwner: function (landId: string): string {
      return players.find((p) => p.hasLand(landId))?.id || NO_PLAYER.id;
    },

    /**** Players related methods *****/
    addPlayer: function (profile: PlayerProfile, type: 'human' | 'computer'): void {
      if (turn !== 1) return;
      players.push(createPlayerState(profile, type, INITIAL_VAULT));
      if (turnOwner === NO_PLAYER.id) {
        turnOwner = players[0].id;
      }
    },

    removePlayer: function (playerId: string) {
      players.splice(
        players.findIndex((p) => p.id === playerId),
        1
      );
    },

    getPlayer: function (id: string): PlayerState {
      return players.find((p) => p.id === id)!;
    },

    get allPlayers(): PlayerState[] {
      return players;
    },

    /**** Turn related methods *****/
    get turn(): number {
      return turn;
    },
    get turnOwner(): PlayerState {
      return players.find((p) => p.id === turnOwner)!;
    },
    get turnPhase(): TurnPhase {
      return turnPhase;
    },

    set turnPhase(newTurnPhase: TurnPhase) {
      turnPhase = newTurnPhase;
    },

    /**
     * @deprecated Use TurnManager for phase transitions instead of calling this directly.
     * This method is kept for backward compatibility with tests and legacy code.
     */
    nextPhase: function (): void {
      switch (turnPhase) {
        case TurnPhase.START:
          turnPhase = turn === 1 ? TurnPhase.END : TurnPhase.MAIN;
          break;
        case TurnPhase.MAIN:
          turnPhase = TurnPhase.END;
          break;
        case TurnPhase.END:
          this.nextPlayer();
          turnPhase = TurnPhase.START;
          break;
      }
    },

    nextPlayer: function () {
      const nextPlayerIdx = (players.findIndex((p) => p.id === turnOwner) + 1) % players.length;
      turnOwner = players[nextPlayerIdx].id;
      if (nextPlayerIdx === 0) turn++;
    },
  };
};
