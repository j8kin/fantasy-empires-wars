import { generateMockMap } from './utils/generateMockMap';
import { getLands } from '../map/utils/getLands';
import { construct } from '../map/building/construct';
import { GamePlayer, PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { BuildingType } from '../types/Building';
import { BattlefieldMap, GameState, BattlefieldDimensions } from '../types/GameState';
import { getLandById, LAND_TYPE } from '../types/Land';
import { Alignment } from '../types/Alignment';
import { toGamePlayer } from './utils/toGamePlayer';
import { createDefaultGameStateStub, createGameStateStub } from './utils/createGameStateStub';

describe('MapLands', () => {
  const nTiles10x20 = 5 * 20 + 5 * 19;
  const nTiles5x5 = 5 * 3 + 4 * 2;
  const nTilesInRadius2 = 3 * 2 + 4 * 2 + 5;
  const player: GamePlayer = toGamePlayer(PREDEFINED_PLAYERS[0]);
  const battlefieldSize: BattlefieldDimensions = { rows: 5, cols: 5 };

  describe('Get lands', () => {
    it('should return all lands', () => {
      const mockMap: BattlefieldMap = generateMockMap(battlefieldSize);

      expect(
        getLands({
          lands: mockMap.lands,
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
        const mockMap: BattlefieldMap = generateMockMap(battlefieldSize);

        mockMap.lands['0-0'].land = getLandById(LAND_TYPE.VOLCANO);
        mockMap.lands['0-1'].land = getLandById(LAND_TYPE.LAVA);
        mockMap.lands['0-1'].controlledBy = player.id;
        expect(getLands({ lands: mockMap.lands, landTypes: [LAND_TYPE.VOLCANO] }).length).toBe(1);
        expect(
          getLands({ lands: mockMap.lands, players: [player], landTypes: [LAND_TYPE.LAVA] }).length
        ).toBe(1);
        expect(getLands({ lands: mockMap.lands, landTypes: [LAND_TYPE.PLAINS] }).length).toBe(
          nTiles5x5 - 2
        );
        expect(
          getLands({ lands: mockMap.lands, players: [player], landTypes: [LAND_TYPE.PLAINS] })
            .length
        ).toBe(0);
      });
    });

    describe('Get lands with Land Alignment', () => {
      it('should return only related lands based on Land Alignment', () => {
        const mockMap: BattlefieldMap = generateMockMap(battlefieldSize);

        mockMap.lands['0-0'].land = getLandById(LAND_TYPE.VOLCANO);
        mockMap.lands['0-1'].land = getLandById(LAND_TYPE.LAVA);

        expect(getLands({ lands: mockMap.lands, landAlignment: Alignment.CHAOTIC }).length).toBe(2);
        expect(getLands({ lands: mockMap.lands, landAlignment: Alignment.LAWFUL }).length).toBe(0); // Plants have NEUTRAL alignment
        expect(getLands({ lands: mockMap.lands, landAlignment: Alignment.NEUTRAL }).length).toBe(
          nTiles5x5 - 2
        );
      });

      it('should return only related lands based on Land Alignment & Building', () => {
        const gameStateStub = createDefaultGameStateStub();

        expect(
          getLands({
            lands: gameStateStub.battlefield.lands,
            landAlignment: Alignment.NEUTRAL,
            buildings: [BuildingType.STRONGHOLD],
          }).length
        ).toBe(3); // in createDefaultStubGameState there are 3 players are placed on the map
      });

      it('should return only related lands based on Land Alignment & No Building', () => {
        const stubGameState = createGameStateStub({ nPlayers: 1 });

        expect(
          getLands({
            lands: stubGameState.battlefield.lands,
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
        const playerLands = getLands({ lands: stubGameState.battlefield.lands, players: [player] });
        expect(playerLands.length).toBe(nTilesInRadius2);
      });

      it('should return the lands without owner', () => {
        const playerLands = getLands({ lands: stubGameState.battlefield.lands, players: [] });
        expect(playerLands.length).toBe(nTiles10x20 - nTilesInRadius2 * 3); // 3 players are placed on the map in createDefaultStubGameState
      });

      it('should return the lands of the owner without stronghold', () => {
        const playerLands = getLands({
          lands: stubGameState.battlefield.lands,
          players: [player],
          buildings: [],
        });
        expect(playerLands.length).toBe(nTilesInRadius2 - 1);
      });

      it('should return the lands of the owner with stronghold', () => {
        construct(stubGameState, BuildingType.BARRACKS, { row: 1, col: 2 });
        let playerLands = getLands({
          lands: stubGameState.battlefield.lands,
          players: [player],
          buildings: [BuildingType.STRONGHOLD],
        });
        expect(playerLands.length).toBe(1);
        playerLands = getLands({
          lands: stubGameState.battlefield.lands,
          players: [player],
          buildings: [BuildingType.STRONGHOLD, BuildingType.BARRACKS],
        });
        expect(playerLands.length).toBe(2);
      });
    });

    describe('Get lands with Army', () => {
      it('should return the lands with heroes and without (1 player on map)', () => {
        const stubGameState = createGameStateStub({ nPlayers: 1 });

        expect(getLands({ lands: stubGameState.battlefield.lands, noArmy: false }).length).toBe(1);
        expect(getLands({ lands: stubGameState.battlefield.lands, noArmy: true }).length).toBe(
          nTiles10x20 - 1
        );
      });

      it('should return the lands with heroes and without (3 player on map)', () => {
        const stubGameState = createDefaultGameStateStub();

        expect(getLands({ lands: stubGameState.battlefield.lands, noArmy: false }).length).toBe(3);
        expect(
          getLands({ lands: stubGameState.battlefield.lands, players: [player], noArmy: false })
            .length
        ).toBe(1);
        expect(getLands({ lands: stubGameState.battlefield.lands, noArmy: true }).length).toBe(
          nTiles10x20 - 3
        );
      });
    });
  });
});
