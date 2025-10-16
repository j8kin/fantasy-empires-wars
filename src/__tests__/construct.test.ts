import { GamePlayer, PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { battlefieldLandId, BattlefieldLands } from '../types/GameState';
import { generateMockMap } from './utils/generateMockMap';
import { construct } from '../map/building/construct';
import { BuildingType } from '../types/Building';
import { BattlefieldSize } from '../types/BattlefieldSize';
import { getLands } from '../map/utils/mapLands';

describe('Construct Buildings', () => {
  const player1: GamePlayer = PREDEFINED_PLAYERS[0];
  const player2: GamePlayer = PREDEFINED_PLAYERS[1];
  const mapSize: BattlefieldSize = 'huge';
  let lands: BattlefieldLands;

  beforeEach(() => {
    lands = generateMockMap(6, 12);
  });

  it('Build one Stronghold', () => {
    construct(player1, BuildingType.STRONGHOLD, { row: 3, col: 3 }, lands, mapSize);
    const player1Lands = getLands(lands, [player1]).map((land) => battlefieldLandId(land.mapPos));

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
    construct(player1, BuildingType.STRONGHOLD, { row: 3, col: 3 }, lands, mapSize);
    construct(player2, BuildingType.STRONGHOLD, { row: 3, col: 8 }, lands, mapSize);

    const player1Lands = getLands(lands, [player1]).map((land) => battlefieldLandId(land.mapPos));
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

    const player2Lands = getLands(lands, [player2]).map((land) => battlefieldLandId(land.mapPos));
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
    construct(player1, BuildingType.STRONGHOLD, { row: 3, col: 3 }, lands, mapSize);
    construct(player2, BuildingType.STRONGHOLD, { row: 3, col: 7 }, lands, mapSize);

    const player1Lands = getLands(lands, [player1]).map((land) => battlefieldLandId(land.mapPos));
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

    const player2Lands = getLands(lands, [player2]).map((land) => battlefieldLandId(land.mapPos));
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
    construct(player1, BuildingType.STRONGHOLD, { row: 3, col: 3 }, lands, mapSize);
    construct(player2, BuildingType.STRONGHOLD, { row: 3, col: 6 }, lands, mapSize);

    const player1Lands = getLands(lands, [player1]).map((land) => battlefieldLandId(land.mapPos));
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

    const player2Lands = getLands(lands, [player2]).map((land) => battlefieldLandId(land.mapPos));
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
        construct(player1, BuildingType.STRONGHOLD, { row: 3, col: 3 }, lands, mapSize);
        construct(player1, BuildingType.BARRACKS, { row: 3, col: 5 }, lands, mapSize);
        construct(player2, BuildingType.STRONGHOLD, { row: 3, col: 6 }, lands, mapSize);

        const player1Lands = getLands(lands, [player1]).map((land) => battlefieldLandId(land.mapPos));
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

        const player2Lands = getLands(lands, [player2]).map((land) => battlefieldLandId(land.mapPos));
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
