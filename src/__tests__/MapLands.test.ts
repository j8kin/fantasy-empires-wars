import { generateMockMap } from './utils/generateMockMap';
import { getLands } from '../map/utils/mapLands';
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
        getLands(mockMap.lands, undefined, undefined, undefined, undefined, undefined).length
      ).toEqual(nTiles5x5);
    });

    describe('Get lands with LandType', () => {
      it('should return only related lands based on LandType', () => {
        const mockMap: BattlefieldMap = generateMockMap(battlefieldSize);

        mockMap.lands['0-0'].land = getLandById(LAND_TYPE.VOLCANO);
        mockMap.lands['0-1'].land = getLandById(LAND_TYPE.LAVA);
        mockMap.lands['0-1'].controlledBy = player.id;
        expect(getLands(mockMap.lands, undefined, LAND_TYPE.VOLCANO).length).toEqual(1);
        expect(getLands(mockMap.lands, [player], LAND_TYPE.LAVA).length).toEqual(1);
        expect(getLands(mockMap.lands, undefined, LAND_TYPE.PLAINS).length).toEqual(nTiles5x5 - 2);
        expect(getLands(mockMap.lands, [player], LAND_TYPE.PLAINS).length).toEqual(0);
      });
    });

    describe('Get lands with Land Alignment', () => {
      it('should return only related lands based on Land Alignment', () => {
        const mockMap: BattlefieldMap = generateMockMap(battlefieldSize);

        mockMap.lands['0-0'].land = getLandById(LAND_TYPE.VOLCANO);
        mockMap.lands['0-1'].land = getLandById(LAND_TYPE.LAVA);

        expect(getLands(mockMap.lands, undefined, undefined, Alignment.CHAOTIC).length).toEqual(2);
        expect(getLands(mockMap.lands, undefined, undefined, Alignment.LAWFUL).length).toEqual(0); // Plants have NEUTRAL alignment
        expect(getLands(mockMap.lands, undefined, undefined, Alignment.NEUTRAL).length).toEqual(
          nTiles5x5 - 2
        );
      });

      it('should return only related lands based on Land Alignment & Building', () => {
        const gameStateStub = createDefaultGameStateStub();

        expect(
          getLands(gameStateStub.battlefield.lands, undefined, undefined, Alignment.NEUTRAL, [
            BuildingType.STRONGHOLD,
          ]).length
        ).toEqual(3); // in createDefaultStubGameState there are 3 players are placed on the map
      });

      it('should return only related lands based on Land Alignment & No Building', () => {
        const stubGameState = createGameStateStub({ nPlayers: 1 });

        expect(
          getLands(stubGameState.battlefield.lands, undefined, undefined, Alignment.NEUTRAL, [])
            .length
        ).toEqual(nTiles10x20 - 1);
      });
    });

    describe('Get lands with buildings', () => {
      let stubGameState: GameState;

      beforeEach(() => {
        stubGameState = createDefaultGameStateStub();
      });

      it('should return the lands of the owner', () => {
        const playerLands = getLands(stubGameState.battlefield.lands, [player]);
        expect(playerLands.length).toEqual(nTilesInRadius2);
      });

      it('should return the lands without owner', () => {
        const playerLands = getLands(stubGameState.battlefield.lands, []);
        expect(playerLands.length).toEqual(nTiles10x20 - nTilesInRadius2 * 3); // 3 players are placed on the map in createDefaultStubGameState
      });

      it('should return the lands of the owner without stronghold', () => {
        const playerLands = getLands(
          stubGameState.battlefield.lands,
          [player],
          undefined,
          undefined,
          []
        );
        expect(playerLands.length).toEqual(nTilesInRadius2 - 1);
      });

      it('should return the lands of the owner with stronghold', () => {
        construct(player, BuildingType.BARRACKS, { row: 1, col: 2 }, stubGameState);
        let playerLands = getLands(
          stubGameState.battlefield.lands,
          [player],
          undefined,
          undefined,
          [BuildingType.STRONGHOLD]
        );
        expect(playerLands.length).toEqual(1);
        playerLands = getLands(stubGameState.battlefield.lands, [player], undefined, undefined, [
          BuildingType.STRONGHOLD,
          BuildingType.BARRACKS,
        ]);
        expect(playerLands.length).toEqual(2);
      });
    });

    describe('Get lands with Army', () => {
      it('should return the lands with heroes and without (1 player on map)', () => {
        const stubGameState = createGameStateStub({ nPlayers: 1 });

        expect(
          getLands(
            stubGameState.battlefield.lands,
            undefined,
            undefined,
            undefined,
            undefined,
            false
          ).length
        ).toEqual(1);
        expect(
          getLands(
            stubGameState.battlefield.lands,
            undefined,
            undefined,
            undefined,
            undefined,
            true
          ).length
        ).toEqual(nTiles10x20 - 1);
      });

      it('should return the lands with heroes and without (3 player on map)', () => {
        const stubGameState = createDefaultGameStateStub();

        expect(
          getLands(
            stubGameState.battlefield.lands,
            undefined,
            undefined,
            undefined,
            undefined,
            false
          ).length
        ).toEqual(3);
        expect(
          getLands(
            stubGameState.battlefield.lands,
            [player],
            undefined,
            undefined,
            undefined,
            false
          ).length
        ).toEqual(1);
        expect(
          getLands(
            stubGameState.battlefield.lands,
            undefined,
            undefined,
            undefined,
            undefined,
            true
          ).length
        ).toEqual(nTiles10x20 - 3);
      });
    });
  });
});
