import { getLands } from '../map/utils/getLands';
import { construct } from '../map/building/construct';
import { PlayerState, PREDEFINED_PLAYERS } from '../state/PlayerState';
import { BuildingType } from '../types/Building';
import { BattlefieldMap, GameState, BattlefieldDimensions } from '../state/GameState';
import { getLandById, LandType } from '../types/Land';
import { Alignment } from '../types/Alignment';
import { toGamePlayer } from './utils/toGamePlayer';
import { createDefaultGameStateStub, createGameStateStub } from './utils/createGameStateStub';

describe('MapLands', () => {
  const nTiles10x20 = 5 * 20 + 5 * 19;
  const nTiles5x5 = 5 * 3 + 4 * 2;
  const nTilesInRadius1 = 2 * 2 + 3;
  const player: PlayerState = toGamePlayer(PREDEFINED_PLAYERS[0]);
  const battlefieldSize: BattlefieldDimensions = { rows: 5, cols: 5 };

  describe('Get lands', () => {
    it('should return all lands', () => {
      const gameStateStub = createGameStateStub({ battlefieldSize: battlefieldSize, nPlayers: 1 });

      expect(
        getLands({
          gameState: gameStateStub,
          players: undefined,
          landTypes: undefined,
          landAlignment: undefined,
          buildings: undefined,
          noArmy: undefined,
        }).length
      ).toBe(nTiles5x5);
    });

    describe('Get lands with LandType', () => {
      it('should return only related lands based on LandType', () => {
        const gameStateStub = createGameStateStub({
          battlefieldSize: battlefieldSize,
          nPlayers: 1,
          addPlayersHomeland: false,
        });
        const mockMap: BattlefieldMap = gameStateStub.battlefield;

        mockMap.lands['0-0'].land = getLandById(LandType.VOLCANO);
        mockMap.lands['0-1'].land = getLandById(LandType.LAVA);
        mockMap.lands['0-1'].controlledBy = gameStateStub.turnOwner;
        expect(getLands({ gameState: gameStateStub, landTypes: [LandType.VOLCANO] }).length).toBe(
          1
        );
        expect(
          getLands({
            gameState: gameStateStub,
            players: [player.playerId],
            landTypes: [LandType.LAVA],
          }).length
        ).toBe(1);
        expect(getLands({ gameState: gameStateStub, landTypes: [LandType.PLAINS] }).length).toBe(
          nTiles5x5 - 2
        );
        expect(
          getLands({
            gameState: gameStateStub,
            players: [gameStateStub.turnOwner],
            landTypes: [LandType.PLAINS],
          }).length
        ).toBe(0);
      });
    });

    describe('Get lands with Land Alignment', () => {
      it('should return only related lands based on Land Alignment', () => {
        const gameStateStub = createGameStateStub({
          battlefieldSize: battlefieldSize,
          nPlayers: 1,
        });
        const mockMap: BattlefieldMap = gameStateStub.battlefield;

        mockMap.lands['0-0'].land = getLandById(LandType.VOLCANO);
        mockMap.lands['0-1'].land = getLandById(LandType.LAVA);

        expect(
          getLands({ gameState: gameStateStub, landAlignment: Alignment.CHAOTIC }).length
        ).toBe(2);
        expect(getLands({ gameState: gameStateStub, landAlignment: Alignment.LAWFUL }).length).toBe(
          0
        ); // Plants have NEUTRAL alignment
        expect(
          getLands({ gameState: gameStateStub, landAlignment: Alignment.NEUTRAL }).length
        ).toBe(nTiles5x5 - 2);
      });

      it('should return only related lands based on Land Alignment & Building', () => {
        const gameStateStub = createDefaultGameStateStub();

        expect(
          getLands({
            gameState: gameStateStub,
            landAlignment: Alignment.NEUTRAL,
            buildings: [BuildingType.STRONGHOLD],
          }).length
        ).toBe(3); // in createDefaultStubGameState there are 3 players are placed on the map
      });

      it('should return only related lands based on Land Alignment & No Building', () => {
        const stubGameState = createGameStateStub({ nPlayers: 1 });

        expect(
          getLands({
            gameState: stubGameState,
            landAlignment: Alignment.NEUTRAL,
            buildings: [],
          }).length
        ).toBe(nTiles10x20 - 1);
      });
    });

    describe('Get lands with buildings', () => {
      let stubGameState: GameState;

      beforeEach(() => {
        stubGameState = createDefaultGameStateStub();
      });

      it('should return the lands of the owner', () => {
        const playerLands = getLands({
          gameState: stubGameState,
          players: [player.playerId],
        });
        expect(playerLands.length).toBe(nTilesInRadius1);
      });

      it('should return the lands without owner', () => {
        const playerLands = getLands({ gameState: stubGameState, players: [] });
        expect(playerLands.length).toBe(nTiles10x20 - nTilesInRadius1 * 3); // 3 players are placed on the map in createDefaultStubGameState
      });

      it('should return the lands of the owner without stronghold', () => {
        const playerLands = getLands({
          gameState: stubGameState,
          players: [player.playerId],
          buildings: [],
        });
        expect(playerLands.length).toBe(nTilesInRadius1 - 1);
      });

      it('should return the lands of the owner with stronghold', () => {
        construct(stubGameState, BuildingType.BARRACKS, { row: 3, col: 4 });
        let playerLands = getLands({
          gameState: stubGameState,
          players: [player.playerId],
          buildings: [BuildingType.STRONGHOLD],
        });
        expect(playerLands.length).toBe(1);
        playerLands = getLands({
          gameState: stubGameState,
          players: [player.playerId],
          buildings: [BuildingType.STRONGHOLD, BuildingType.BARRACKS],
        });
        expect(playerLands.length).toBe(2);
      });
    });

    describe('Get lands with Army', () => {
      it('should return the lands with heroes and without (1 player on map)', () => {
        const stubGameState = createGameStateStub({ nPlayers: 1 });

        expect(getLands({ gameState: stubGameState, noArmy: false }).length).toBe(1);
        expect(getLands({ gameState: stubGameState, noArmy: true }).length).toBe(nTiles10x20 - 1);
      });

      it('should return the lands with heroes and without (3 player on map)', () => {
        const stubGameState = createDefaultGameStateStub();

        expect(getLands({ gameState: stubGameState, noArmy: false }).length).toBe(3);
        expect(
          getLands({ gameState: stubGameState, players: [player.playerId], noArmy: false }).length
        ).toBe(1);
        expect(getLands({ gameState: stubGameState, noArmy: true }).length).toBe(nTiles10x20 - 3);
      });
    });
  });
});
