import { generateMockMap } from './utils/generateMockMap';
import { getLands } from '../map/utils/mapLands';
import { construct } from '../map/building/construct';
import { GamePlayer, PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { LandPosition } from '../map/utils/mapLands';
import { BuildingType } from '../types/Building';
import { BattlefieldMap, battlefieldLandId, GameState } from '../types/GameState';
import { getLandById, LAND_TYPE } from '../types/Land';
import { Alignment } from '../types/Alignment';
import { recruitHero } from '../map/army/recruit';
import { Unit } from '../types/Army';

describe('MapLands', () => {
  const nTiles5x5 = 5 * 3 + 4 * 2;
  const nTilesInRadius2 = 3 * 2 + 4 * 2 + 5;
  const player: GamePlayer = PREDEFINED_PLAYERS[0];

  const homeland: LandPosition = { row: 2, col: 2 };

  describe('Get lands', () => {
    it('should return all lands', () => {
      const mockMap: BattlefieldMap = generateMockMap(5, 5);

      expect(
        getLands(mockMap.lands, undefined, undefined, undefined, undefined, undefined).length
      ).toEqual(nTiles5x5);
    });

    describe('Get lands with LandType', () => {
      it('should return only related lands based on LandType', () => {
        const mockMap: BattlefieldMap = generateMockMap(5, 5);

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
        const mockMap: BattlefieldMap = generateMockMap(5, 5);

        mockMap.lands['0-0'].land = getLandById(LAND_TYPE.VOLCANO);
        mockMap.lands['0-1'].land = getLandById(LAND_TYPE.LAVA);

        expect(getLands(mockMap.lands, undefined, undefined, Alignment.CHAOTIC).length).toEqual(2);
        expect(getLands(mockMap.lands, undefined, undefined, Alignment.LAWFUL).length).toEqual(0); // Plants have NEUTRAL alignment
        expect(getLands(mockMap.lands, undefined, undefined, Alignment.NEUTRAL).length).toEqual(
          nTiles5x5 - 2
        );
      });

      it('should return only related lands based on Land Alignment & Building', () => {
        const mockMap: BattlefieldMap = generateMockMap(5, 5);
        const mockGameState: GameState = {
          battlefield: mockMap,
          mapSize: 'small',
          selectedPlayer: player,
          opponents: [],
          turn: 1,
        };

        construct(player, BuildingType.STRONGHOLD, homeland, mockGameState);
        expect(
          getLands(mockMap.lands, undefined, undefined, Alignment.NEUTRAL, [
            BuildingType.STRONGHOLD,
          ]).length
        ).toEqual(1);
      });

      it('should return only related lands based on Land Alignment & No Building', () => {
        const mockMap: BattlefieldMap = generateMockMap(5, 5);
        const mockGameState: GameState = {
          battlefield: mockMap,
          mapSize: 'small',
          selectedPlayer: player,
          opponents: [],
          turn: 1,
        };

        construct(player, BuildingType.STRONGHOLD, homeland, mockGameState);
        expect(getLands(mockMap.lands, undefined, undefined, Alignment.NEUTRAL, []).length).toEqual(
          nTiles5x5 - 1
        );
      });
    });

    describe('Get lands with buildings', () => {
      let mockMap: BattlefieldMap;
      let mockGameState: GameState;

      beforeEach(() => {
        mockMap = generateMockMap(5, 5);
        mockGameState = {
          battlefield: mockMap,
          mapSize: 'small',
          selectedPlayer: player,
          opponents: [],
          turn: 1,
        };
      });

      it('should return the lands of the owner', () => {
        construct(player, BuildingType.STRONGHOLD, homeland, mockGameState);
        const playerLands = getLands(mockMap.lands, [player]);
        expect(playerLands.length).toEqual(nTilesInRadius2);
      });

      it('should return the lands without owner', () => {
        construct(player, BuildingType.STRONGHOLD, homeland, mockGameState);
        const playerLands = getLands(mockMap.lands, []);
        expect(playerLands.length).toEqual(nTiles5x5 - nTilesInRadius2);
      });

      it('should return the lands of the owner without stronghold', () => {
        construct(player, BuildingType.STRONGHOLD, homeland, mockGameState);
        const playerLands = getLands(mockMap.lands, [player], undefined, undefined, []);
        expect(playerLands.length).toEqual(nTilesInRadius2 - 1);
      });

      it('should return the lands of the owner with stronghold', () => {
        construct(player, BuildingType.STRONGHOLD, homeland, mockGameState);
        construct(player, BuildingType.BARRACKS, { row: 1, col: 2 }, mockGameState);
        let playerLands = getLands(mockMap.lands, [player], undefined, undefined, [
          BuildingType.STRONGHOLD,
        ]);
        expect(playerLands.length).toEqual(1);
        playerLands = getLands(mockMap.lands, [player], undefined, undefined, [
          BuildingType.STRONGHOLD,
          BuildingType.BARRACKS,
        ]);
        expect(playerLands.length).toEqual(2);
      });
    });

    describe('Get lands with Army', () => {
      const mockMap: BattlefieldMap = generateMockMap(5, 5);

      const unit: Unit = {
        attack: 10,
        defense: 10,
        maintainCost: 10,
        health: 10,
        hero: true,
        id: 'mockHero',
        level: 1,
        movement: 10,
        name: 'Mock Hero',
      };
      recruitHero(unit, mockMap.lands[battlefieldLandId(homeland)]);
      expect(
        getLands(mockMap.lands, undefined, undefined, undefined, undefined, false).length
      ).toEqual(1);
      expect(
        getLands(mockMap.lands, undefined, undefined, undefined, undefined, true).length
      ).toEqual(nTiles5x5 - 1);
    });
  });
});
