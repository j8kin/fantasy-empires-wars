import { GamePlayer, PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { battlefieldLandId, GameState } from '../types/GameState';
import { generateMockMap } from './utils/generateMockMap';
import { construct } from '../map/building/construct';
import { BuildingType } from '../types/Building';
import { getLands, LandPosition } from '../map/utils/mapLands';
import { recruitWarriors } from '../map/army/recruit';
import { getUnit, UnitType } from '../types/Army';

describe('Construct Buildings', () => {
  const player1: GamePlayer = PREDEFINED_PLAYERS[0];
  const player2: GamePlayer = PREDEFINED_PLAYERS[1];
  let mockGameState: GameState;

  beforeEach(() => {
    mockGameState = {
      battlefieldLands: generateMockMap(6, 12),
      mapSize: 'huge',
      turn: 1,
      selectedPlayer: player1,
      opponents: [player2],
    };
  });

  describe('Constructing a building', () => {
    it('Build one Stronghold', () => {
      construct(player1, BuildingType.STRONGHOLD, { row: 3, col: 3 }, mockGameState);
      const player1Lands = getLands(mockGameState.battlefieldLands, [player1]).map((land) =>
        battlefieldLandId(land.mapPos)
      );

      // row 1
      expect(player1Lands).toContain('1-2');
      expect(player1Lands).toContain('1-3');
      expect(player1Lands).toContain('1-4');
      // row 2
      expect(player1Lands).toContain('2-2');
      expect(player1Lands).toContain('2-3');
      expect(player1Lands).toContain('2-4');
      expect(player1Lands).toContain('2-5');
      // row 3
      expect(player1Lands).toContain('3-1');
      expect(player1Lands).toContain('3-2');
      expect(player1Lands).toContain('3-3');
      expect(player1Lands).toContain('3-4');
      expect(player1Lands).toContain('3-5');
      // row 4
      expect(player1Lands).toContain('4-2');
      expect(player1Lands).toContain('4-3');
      expect(player1Lands).toContain('4-4');
      expect(player1Lands).toContain('4-5');
      // row 5
      expect(player1Lands).toContain('5-2');
      expect(player1Lands).toContain('5-3');
      expect(player1Lands).toContain('5-4');

      // no other lands should be in the player's land's
      expect(player1Lands.length).toBe(19);
    });

    it('Build two Strongholds for two players, no intersection', () => {
      construct(player1, BuildingType.STRONGHOLD, { row: 3, col: 3 }, mockGameState);
      construct(player2, BuildingType.STRONGHOLD, { row: 3, col: 8 }, mockGameState);

      const player1Lands = getLands(mockGameState.battlefieldLands, [player1]).map((land) =>
        battlefieldLandId(land.mapPos)
      );
      // row 1
      expect(player1Lands).toContain('1-2');
      expect(player1Lands).toContain('1-3');
      expect(player1Lands).toContain('1-4');
      // row 2
      expect(player1Lands).toContain('2-2');
      expect(player1Lands).toContain('2-3');
      expect(player1Lands).toContain('2-4');
      expect(player1Lands).toContain('2-5');
      // row 3
      expect(player1Lands).toContain('3-1');
      expect(player1Lands).toContain('3-2');
      expect(player1Lands).toContain('3-3');
      expect(player1Lands).toContain('3-4');
      expect(player1Lands).toContain('3-5');
      // row 4
      expect(player1Lands).toContain('4-2');
      expect(player1Lands).toContain('4-3');
      expect(player1Lands).toContain('4-4');
      expect(player1Lands).toContain('4-5');
      // row 5
      expect(player1Lands).toContain('5-2');
      expect(player1Lands).toContain('5-3');
      expect(player1Lands).toContain('5-4');
      // no other lands should be in the player's land's

      expect(player1Lands.length).toBe(19);

      const player2Lands = getLands(mockGameState.battlefieldLands, [player2]).map((land) =>
        battlefieldLandId(land.mapPos)
      );
      // row 1
      expect(player2Lands).toContain('1-7');
      expect(player2Lands).toContain('1-8');
      expect(player2Lands).toContain('1-9');
      // row 2
      expect(player2Lands).toContain('2-7');
      expect(player2Lands).toContain('2-8');
      expect(player2Lands).toContain('2-9');
      expect(player2Lands).toContain('2-10');
      // row 3
      expect(player2Lands).toContain('3-6');
      expect(player2Lands).toContain('3-7');
      expect(player2Lands).toContain('3-8');
      expect(player2Lands).toContain('3-9');
      expect(player2Lands).toContain('3-10');
      // row 4
      expect(player2Lands).toContain('4-7');
      expect(player2Lands).toContain('4-8');
      expect(player2Lands).toContain('4-9');
      expect(player2Lands).toContain('4-10');
      // row 5
      expect(player2Lands).toContain('5-7');
      expect(player2Lands).toContain('5-8');
      expect(player2Lands).toContain('5-9');
      // no other lands should be in the player's land's

      expect(player2Lands.length).toBe(19);
    });

    it('Build two Strongholds for two players, has intersection radius 1 no building on intersection', () => {
      construct(player1, BuildingType.STRONGHOLD, { row: 3, col: 3 }, mockGameState);
      construct(player2, BuildingType.STRONGHOLD, { row: 3, col: 7 }, mockGameState);

      const player1Lands = getLands(mockGameState.battlefieldLands, [player1]).map((land) =>
        battlefieldLandId(land.mapPos)
      );
      // row 1
      expect(player1Lands).toContain('1-2');
      expect(player1Lands).toContain('1-3');
      expect(player1Lands).toContain('1-4');
      // row 2
      expect(player1Lands).toContain('2-2');
      expect(player1Lands).toContain('2-3');
      expect(player1Lands).toContain('2-4');
      expect(player1Lands).toContain('2-5');
      // row 3
      expect(player1Lands).toContain('3-1');
      expect(player1Lands).toContain('3-2');
      expect(player1Lands).toContain('3-3');
      expect(player1Lands).toContain('3-4');
      // land 5 on row 3 owned by player 2
      // row 4
      expect(player1Lands).toContain('4-2');
      expect(player1Lands).toContain('4-3');
      expect(player1Lands).toContain('4-4');
      expect(player1Lands).toContain('4-5');
      // row 5
      expect(player1Lands).toContain('5-2');
      expect(player1Lands).toContain('5-3');
      expect(player1Lands).toContain('5-4');

      //no other lands should be in the player's land's
      expect(player1Lands.length).toBe(18);

      const player2Lands = getLands(mockGameState.battlefieldLands, [player2]).map((land) =>
        battlefieldLandId(land.mapPos)
      );
      // row 1
      expect(player2Lands).toContain('1-6');
      expect(player2Lands).toContain('1-7');
      expect(player2Lands).toContain('1-8');
      // row 2
      expect(player2Lands).toContain('2-6');
      expect(player2Lands).toContain('2-7');
      expect(player2Lands).toContain('2-8');
      expect(player2Lands).toContain('2-9');
      // row 3
      expect(player2Lands).toContain('3-5');
      expect(player2Lands).toContain('3-6');
      expect(player2Lands).toContain('3-7');
      expect(player2Lands).toContain('3-8');
      expect(player2Lands).toContain('3-9');
      // row 4
      expect(player2Lands).toContain('4-6');
      expect(player2Lands).toContain('4-7');
      expect(player2Lands).toContain('4-8');
      expect(player2Lands).toContain('4-9');
      // row 5
      expect(player2Lands).toContain('5-6');
      expect(player2Lands).toContain('5-7');
      expect(player2Lands).toContain('5-8');
      // no other lands should be in the player's land's

      expect(player2Lands.length).toBe(19);
    });

    it('Build two Strongholds for two players, has intersection radius 2 no building on intersection', () => {
      construct(player1, BuildingType.STRONGHOLD, { row: 3, col: 3 }, mockGameState);
      construct(player2, BuildingType.STRONGHOLD, { row: 3, col: 6 }, mockGameState);

      const player1Lands = getLands(mockGameState.battlefieldLands, [player1]).map((land) =>
        battlefieldLandId(land.mapPos)
      );
      // row 1
      expect(player1Lands).toContain('1-2');
      expect(player1Lands).toContain('1-3');
      expect(player1Lands).toContain('1-4');
      // row 2
      expect(player1Lands).toContain('2-2');
      expect(player1Lands).toContain('2-3');
      expect(player1Lands).toContain('2-4');
      // land 5 on row 2 owned by player 2 since it is in radius 2 from player 1 stronghold (3-3)
      // row 3
      expect(player1Lands).toContain('3-1');
      expect(player1Lands).toContain('3-2');
      expect(player1Lands).toContain('3-3');
      expect(player1Lands).toContain('3-4');
      // land 5 on row 3 owned by player 2 since it is in radius 2 from player 1 stronghold (3-3)
      // row 4
      expect(player1Lands).toContain('4-2');
      expect(player1Lands).toContain('4-3');
      expect(player1Lands).toContain('4-4');
      // land 5 on row 4 owned by player 2 since it is in radius 2 from player 1 stronghold (3-3)
      // row 5
      expect(player1Lands).toContain('5-2');
      expect(player1Lands).toContain('5-3');
      expect(player1Lands).toContain('5-4');

      //no other lands should be in the player's land's
      expect(player1Lands.length).toBe(16);

      const player2Lands = getLands(mockGameState.battlefieldLands, [player2]).map((land) =>
        battlefieldLandId(land.mapPos)
      );
      // row 1
      expect(player2Lands).toContain('1-5');
      expect(player2Lands).toContain('1-6');
      expect(player2Lands).toContain('1-7');
      // row 2
      expect(player2Lands).toContain('2-5');
      expect(player2Lands).toContain('2-6');
      expect(player2Lands).toContain('2-7');
      expect(player2Lands).toContain('2-8');
      // row 3
      // land 4 on row 3 owned by player 1 since it is in radius 1 from player 1 stronghold (3-3)
      expect(player2Lands).toContain('3-5');
      expect(player2Lands).toContain('3-6');
      expect(player2Lands).toContain('3-7');
      expect(player2Lands).toContain('3-8');
      // row 4
      expect(player2Lands).toContain('4-5');
      expect(player2Lands).toContain('4-6');
      expect(player2Lands).toContain('4-7');
      expect(player2Lands).toContain('4-8');
      // row 5
      expect(player2Lands).toContain('5-5');
      expect(player2Lands).toContain('5-6');
      expect(player2Lands).toContain('5-7');
      // no other lands should be in the player's land's

      expect(player2Lands.length).toBe(18);
    });

    it('Build two Strongholds for two players, has intersection radius 2 with building on intersection', () => {
      construct(player1, BuildingType.STRONGHOLD, { row: 3, col: 3 }, mockGameState);
      construct(player1, BuildingType.BARRACKS, { row: 3, col: 5 }, mockGameState);
      construct(player2, BuildingType.STRONGHOLD, { row: 3, col: 6 }, mockGameState);

      const player1Lands = getLands(mockGameState.battlefieldLands, [player1]).map((land) =>
        battlefieldLandId(land.mapPos)
      );
      // row 1
      expect(player1Lands).toContain('1-2');
      expect(player1Lands).toContain('1-3');
      expect(player1Lands).toContain('1-4');
      // row 2
      expect(player1Lands).toContain('2-2');
      expect(player1Lands).toContain('2-3');
      expect(player1Lands).toContain('2-4');
      // land 5 on row 2 owned by player 2 since it is in radius 2 from player 1 stronghold (3-3)
      // row 3
      expect(player1Lands).toContain('3-1');
      expect(player1Lands).toContain('3-2');
      expect(player1Lands).toContain('3-3');
      expect(player1Lands).toContain('3-4');
      expect(player1Lands).toContain('3-5'); // building on intersection
      // row 4
      expect(player1Lands).toContain('4-2');
      expect(player1Lands).toContain('4-3');
      expect(player1Lands).toContain('4-4');
      // land 5 on row 4 owned by player 2 since it is in radius 2 from player 1 stronghold (3-3)
      // row 5
      expect(player1Lands).toContain('5-2');
      expect(player1Lands).toContain('5-3');
      expect(player1Lands).toContain('5-4');

      //no other lands should be in the player's land's
      expect(player1Lands.length).toBe(17);

      const player2Lands = getLands(mockGameState.battlefieldLands, [player2]).map((land) =>
        battlefieldLandId(land.mapPos)
      );
      // row 1
      expect(player2Lands).toContain('1-5');
      expect(player2Lands).toContain('1-6');
      expect(player2Lands).toContain('1-7');
      // row 2
      expect(player2Lands).toContain('2-5');
      expect(player2Lands).toContain('2-6');
      expect(player2Lands).toContain('2-7');
      expect(player2Lands).toContain('2-8');
      // row 3
      // land 4 on row 3 owned by player 1 since it is in radius 1 from player 1 stronghold (3-3)
      // building on intersection 3-5 (still owned by player 1
      expect(player2Lands).toContain('3-6');
      expect(player2Lands).toContain('3-7');
      expect(player2Lands).toContain('3-8');
      // row 4
      expect(player2Lands).toContain('4-5');
      expect(player2Lands).toContain('4-6');
      expect(player2Lands).toContain('4-7');
      expect(player2Lands).toContain('4-8');
      // row 5
      expect(player2Lands).toContain('5-5');
      expect(player2Lands).toContain('5-6');
      expect(player2Lands).toContain('5-7');
      // no other lands should be in the player's land's

      expect(player2Lands.length).toBe(17);
    });
  });

  describe('Demolition building', () => {
    const strongholdPos: LandPosition = { row: 3, col: 3 };
    const buildingPos: LandPosition = { row: 3, col: 4 };

    it('Build one Stronghold and one Demolition', () => {
      construct(player1, BuildingType.STRONGHOLD, strongholdPos, mockGameState);
      construct(player1, BuildingType.DEMOLITION, strongholdPos, mockGameState);

      expect(
        mockGameState.battlefieldLands[battlefieldLandId(strongholdPos)].buildings.length
      ).toBe(0);

      const player1Lands = getLands(mockGameState.battlefieldLands, [player1]);
      expect(player1Lands.length).toBe(0);
    });

    it('Demolition non-stronghold', () => {
      construct(player1, BuildingType.STRONGHOLD, strongholdPos, mockGameState);
      construct(player1, BuildingType.BARRACKS, buildingPos, mockGameState);
      construct(player1, BuildingType.DEMOLITION, buildingPos, mockGameState);

      // stronghold is not destroyed
      expect(mockGameState.battlefieldLands[battlefieldLandId(strongholdPos)].buildings[0].id).toBe(
        BuildingType.STRONGHOLD
      );

      // barracks is destroyed
      expect(mockGameState.battlefieldLands[battlefieldLandId(buildingPos)].buildings.length).toBe(
        0
      );

      // no player lands destroyed
      const player1Lands = getLands(mockGameState.battlefieldLands, [player1]);
      expect(player1Lands.length).toBe(19);
    });

    it('Demolition not destroy buildings on other lands', () => {
      construct(player1, BuildingType.STRONGHOLD, strongholdPos, mockGameState);
      construct(player1, BuildingType.BARRACKS, buildingPos, mockGameState);
      construct(player1, BuildingType.DEMOLITION, strongholdPos, mockGameState);

      // stronghold is destroyed
      expect(
        mockGameState.battlefieldLands[battlefieldLandId(strongholdPos)].buildings.length
      ).toBe(0);

      // barracks is not destroyed
      expect(mockGameState.battlefieldLands[battlefieldLandId(buildingPos)].buildings[0].id).toBe(
        BuildingType.BARRACKS
      );

      // no player lands exist
      const player1Lands = getLands(mockGameState.battlefieldLands, [player1]);
      expect(player1Lands.length).toBe(0);
    });

    it('When stronghold destroyed lands with army not lost players control', () => {
      construct(player1, BuildingType.STRONGHOLD, strongholdPos, mockGameState);
      construct(player1, BuildingType.BARRACKS, buildingPos, mockGameState);
      recruitWarriors(
        getUnit(UnitType.FIGHTER),
        mockGameState.battlefieldLands[battlefieldLandId(buildingPos)]
      );
      construct(player1, BuildingType.DEMOLITION, strongholdPos, mockGameState);

      // stronghold is destroyed
      expect(
        mockGameState.battlefieldLands[battlefieldLandId(strongholdPos)].buildings.length
      ).toBe(0);

      // barracks is not destroyed
      expect(mockGameState.battlefieldLands[battlefieldLandId(buildingPos)].buildings[0].id).toBe(
        BuildingType.BARRACKS
      );
      // army is not lost
      expect(mockGameState.battlefieldLands[battlefieldLandId(buildingPos)].army.length).toBe(1);

      // no player lands exist
      const player1Lands = getLands(mockGameState.battlefieldLands, [player1]);
      expect(player1Lands.length).toBe(1);
      expect(battlefieldLandId(player1Lands[0].mapPos)).toBe(battlefieldLandId(buildingPos));
    });

    it('When stronghold destroyed land could change owner', () => {
      construct(player1, BuildingType.STRONGHOLD, { row: 3, col: 3 }, mockGameState);
      construct(player2, BuildingType.STRONGHOLD, { row: 3, col: 6 }, mockGameState);

      let player1Lands = getLands(mockGameState.battlefieldLands, [player1]);
      expect(player1Lands.length).toBe(16);
      let player2Lands = getLands(mockGameState.battlefieldLands, [player2]);
      expect(player2Lands.length).toBe(18);
      expect(mockGameState.battlefieldLands['3-4'].controlledBy).toBe(player1.id);

      // DEMOLITION
      construct(player1, BuildingType.DEMOLITION, strongholdPos, mockGameState);

      // no player lands exist
      player1Lands = getLands(mockGameState.battlefieldLands, [player1]);
      expect(player1Lands.length).toBe(0);
      // player2 lands increased
      player2Lands = getLands(mockGameState.battlefieldLands, [player2]);
      expect(player2Lands.length).toBe(19);

      expect(mockGameState.battlefieldLands['3-4'].controlledBy).toBe(player2.id); // now controlled by player 2
    });

    it('When stronghold destroyed land not change owner if another stronghold of the same owner is near', () => {
      construct(player1, BuildingType.STRONGHOLD, { row: 3, col: 3 }, mockGameState);
      construct(player1, BuildingType.STRONGHOLD, { row: 1, col: 5 }, mockGameState); // stronghold of player 1 near destroyed land
      construct(player2, BuildingType.STRONGHOLD, { row: 3, col: 6 }, mockGameState);

      let player1Lands = getLands(mockGameState.battlefieldLands, [player1]);
      expect(player1Lands.length).toBe(24);
      let player2Lands = getLands(mockGameState.battlefieldLands, [player2]);
      expect(player2Lands.length).toBe(14);

      expect(mockGameState.battlefieldLands['3-4'].controlledBy).toBe(player1.id); // under player 1 control before destruction

      // DEMOLITION
      construct(player1, BuildingType.DEMOLITION, strongholdPos, mockGameState);

      // no player lands exist
      player1Lands = getLands(mockGameState.battlefieldLands, [player1]);
      expect(player1Lands.length).toBe(12);
      expect(mockGameState.battlefieldLands['3-4'].controlledBy).toBe(player1.id); // still owned by player 1

      // player2 lands increased
      player2Lands = getLands(mockGameState.battlefieldLands, [player2]);
      expect(player2Lands.length).toBe(14); // not changed
    });
  });
});
