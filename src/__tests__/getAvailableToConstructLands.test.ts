import { GameState, getTurnOwner } from '../types/GameState';
import { generateMockMap } from './utils/generateMockMap';
import { PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { getAvailableToConstructLands } from '../map/building/getAvailableToConstructLands';
import { BuildingType } from '../types/Building';
import { construct } from '../map/building/construct';
import { toGamePlayer } from './utils/toGamePlayer';
import { createGameStateStub, defaultBattlefieldSizeStub } from './utils/createGameStateStub';

describe('getAvailableLands', () => {
  const gameStateStub: GameState = createGameStateStub({ addPlayersHomeland: false });

  beforeEach(() => {
    gameStateStub.battlefield = generateMockMap(defaultBattlefieldSizeStub);
  });

  it('should return no available lands for non-stronghold building when player has no lands under control', () => {
    const availableLands = getAvailableToConstructLands(
      BuildingType.BARRACKS,
      getTurnOwner(gameStateStub)!,
      gameStateStub
    );
    expect(availableLands.length).toBe(0);
  });

  it('should return all available lands for non-stronghold building where there are no buildings', () => {
    construct(
      getTurnOwner(gameStateStub)!,
      BuildingType.STRONGHOLD,
      { row: 3, col: 3 },
      gameStateStub
    );

    const availableLands = getAvailableToConstructLands(
      BuildingType.BARRACKS,
      getTurnOwner(gameStateStub)!,
      gameStateStub
    );

    expect(availableLands.length).toBe(18); // number of lands without stronghold
    // row 1
    expect(availableLands).toContain('1-2');
    expect(availableLands).toContain('1-3');
    expect(availableLands).toContain('1-4');
    // row 2
    expect(availableLands).toContain('2-2');
    expect(availableLands).toContain('2-3');
    expect(availableLands).toContain('2-4');
    expect(availableLands).toContain('2-5');
    // row 3
    expect(availableLands).toContain('3-1');
    expect(availableLands).toContain('3-2');
    // Land 3-3 is occupied by stronghold
    expect(availableLands).toContain('3-4');
    expect(availableLands).toContain('3-5');
    // row 4
    expect(availableLands).toContain('4-2');
    expect(availableLands).toContain('4-3');
    expect(availableLands).toContain('4-4');
    expect(availableLands).toContain('4-5');
    // row 5
    expect(availableLands).toContain('5-2');
    expect(availableLands).toContain('5-3');
    expect(availableLands).toContain('5-4');
  });

  it('should return all available lands for stronghold building where there are no buildings', () => {
    construct(
      getTurnOwner(gameStateStub)!,
      BuildingType.STRONGHOLD,
      { row: 3, col: 3 },
      gameStateStub
    );

    const availableLands = getAvailableToConstructLands(
      BuildingType.STRONGHOLD,
      getTurnOwner(gameStateStub)!,
      gameStateStub
    );

    expect(availableLands.length).toBe(12); // number of lands outside radius 1 from stronghold
    // row 1
    expect(availableLands).toContain('1-2');
    expect(availableLands).toContain('1-3');
    expect(availableLands).toContain('1-4');
    // row 2
    expect(availableLands).toContain('2-2');
    // 2-3 and 2-4 are in radius 1 from the stronghold and should not be returned
    expect(availableLands).toContain('2-5');
    // row 3
    expect(availableLands).toContain('3-1');
    // 3-2, 3-3, 3-4 are in radius 1 from stronghold and should not be returned
    expect(availableLands).toContain('3-5');
    // row 4
    expect(availableLands).toContain('4-2');
    // 4-3 and 4-4 are in radius 1 from the stronghold and should not be returned
    expect(availableLands).toContain('4-5');
    // row 5
    expect(availableLands).toContain('5-2');
    expect(availableLands).toContain('5-3');
    expect(availableLands).toContain('5-4');
  });

  it('should return only border lands if user wants to construct the wall', () => {
    construct(
      getTurnOwner(gameStateStub)!,
      BuildingType.STRONGHOLD,
      { row: 3, col: 3 },
      gameStateStub
    );

    const availableLands = getAvailableToConstructLands(
      BuildingType.WALL,
      getTurnOwner(gameStateStub)!,
      gameStateStub
    );

    expect(availableLands.length).toBe(12); // number of lands outside radius 1 from stronghold
    // row 1
    expect(availableLands).toContain('1-2');
    expect(availableLands).toContain('1-3');
    expect(availableLands).toContain('1-4');
    // row 2
    expect(availableLands).toContain('2-2');
    // 2-3 and 2-4 are in radius 1 from the stronghold and should not be returned
    expect(availableLands).toContain('2-5');
    // row 3
    expect(availableLands).toContain('3-1');
    // 3-2, 3-3, 3-4 are in radius 1 from stronghold and should not be returned
    expect(availableLands).toContain('3-5');
    // row 4
    expect(availableLands).toContain('4-2');
    // 4-3 and 4-4 are in radius 1 from the stronghold and should not be returned
    expect(availableLands).toContain('4-5');
    // row 5
    expect(availableLands).toContain('5-2');
    expect(availableLands).toContain('5-3');
    expect(availableLands).toContain('5-4');
  });

  it('should return only border lands even with building if user wants to construct the wall', () => {
    construct(
      getTurnOwner(gameStateStub)!,
      BuildingType.STRONGHOLD,
      { row: 3, col: 3 },
      gameStateStub
    );

    construct(
      getTurnOwner(gameStateStub)!,
      BuildingType.BARRACKS,
      { row: 1, col: 2 },
      gameStateStub
    );

    const availableLands = getAvailableToConstructLands(
      BuildingType.WALL,
      getTurnOwner(gameStateStub)!,
      gameStateStub
    );

    expect(availableLands.length).toBe(12); // number of lands outside radius 1 from stronghold
    // row 1
    expect(gameStateStub.battlefield.lands['1-2'].buildings[0].id).toEqual(BuildingType.BARRACKS);
    expect(availableLands).toContain('1-2'); // land with barrack
    expect(availableLands).toContain('1-3');
    expect(availableLands).toContain('1-4');
    // row 2
    expect(availableLands).toContain('2-2');
    // 2-3 and 2-4 are in radius 1 from the stronghold and should not be returned
    expect(availableLands).toContain('2-5');
    // row 3
    expect(availableLands).toContain('3-1');
    // 3-2, 3-3, 3-4 are in radius 1 from stronghold and should not be returned
    expect(availableLands).toContain('3-5');
    // row 4
    expect(availableLands).toContain('4-2');
    // 4-3 and 4-4 are in radius 1 from the stronghold and should not be returned
    expect(availableLands).toContain('4-5');
    // row 5
    expect(availableLands).toContain('5-2');
    expect(availableLands).toContain('5-3');
    expect(availableLands).toContain('5-4');
  });

  it('should return only border lands land with wall should be excluded if user wants to construct the wall', () => {
    construct(
      getTurnOwner(gameStateStub)!,
      BuildingType.STRONGHOLD,
      { row: 3, col: 3 },
      gameStateStub
    );

    construct(
      getTurnOwner(gameStateStub)!,
      BuildingType.BARRACKS,
      { row: 1, col: 2 },
      gameStateStub
    );

    construct(getTurnOwner(gameStateStub)!, BuildingType.WALL, { row: 1, col: 2 }, gameStateStub);

    const availableLands = getAvailableToConstructLands(
      BuildingType.WALL,
      getTurnOwner(gameStateStub)!,
      gameStateStub
    );

    expect(availableLands.length).toBe(11); // number of lands outside radius 1 from stronghold
    // row 1
    expect(gameStateStub.battlefield.lands['1-2'].buildings[0].id).toEqual(BuildingType.BARRACKS);
    expect(gameStateStub.battlefield.lands['1-2'].buildings[1].id).toEqual(BuildingType.WALL);
    // land 1-2 is not available for construction
    expect(availableLands).toContain('1-3');
    expect(availableLands).toContain('1-4');
    // row 2
    expect(availableLands).toContain('2-2');
    // 2-3 and 2-4 are in radius 1 from the stronghold and should not be returned
    expect(availableLands).toContain('2-5');
    // row 3
    expect(availableLands).toContain('3-1');
    // 3-2, 3-3, 3-4 are in radius 1 from stronghold and should not be returned
    expect(availableLands).toContain('3-5');
    // row 4
    expect(availableLands).toContain('4-2');
    // 4-3 and 4-4 are in radius 1 from the stronghold and should not be returned
    expect(availableLands).toContain('4-5');
    // row 5
    expect(availableLands).toContain('5-2');
    expect(availableLands).toContain('5-3');
    expect(availableLands).toContain('5-4');
  });

  it('should return all barder lands when have a border with other plyer', () => {
    construct(
      getTurnOwner(gameStateStub)!,
      BuildingType.STRONGHOLD,
      { row: 3, col: 3 },
      gameStateStub
    );
    construct(
      toGamePlayer(PREDEFINED_PLAYERS[1]), // other player
      BuildingType.STRONGHOLD,
      { row: 3, col: 6 },
      gameStateStub
    );

    const availableLands = getAvailableToConstructLands(
      BuildingType.WALL,
      getTurnOwner(gameStateStub)!,
      gameStateStub
    );

    expect(availableLands.length).toBe(12); // number of lands outside radius 1 from stronghold
    // row 1
    // land 1-2 is not available for construction
    expect(availableLands).toContain('1-2');
    expect(availableLands).toContain('1-3');
    expect(availableLands).toContain('1-4');
    // row 2
    expect(availableLands).toContain('2-2');
    // 2-3 is inner Land
    expect(availableLands).toContain('2-4');
    // row 3
    expect(availableLands).toContain('3-1');
    // 3-5 under control of other player that is why 3-4 is used
    expect(availableLands).toContain('3-4');
    // row 4
    expect(availableLands).toContain('4-2');
    // 4-5 is under control of other player that is why 4-4 is used
    expect(availableLands).toContain('4-4');
    // row 5
    expect(availableLands).toContain('5-2');
    expect(availableLands).toContain('5-3');
    expect(availableLands).toContain('5-4');
  });

  it('should return land with WALL for non-wall build request', () => {
    construct(
      getTurnOwner(gameStateStub)!,
      BuildingType.STRONGHOLD,
      { row: 3, col: 3 },
      gameStateStub
    );

    construct(getTurnOwner(gameStateStub)!, BuildingType.WALL, { row: 1, col: 2 }, gameStateStub);

    const availableLands = getAvailableToConstructLands(
      BuildingType.BARRACKS,
      getTurnOwner(gameStateStub)!,
      gameStateStub
    );

    expect(availableLands.length).toBe(18); // number of lands without stronghold
    // row 1
    // border lnd with wall should be also available for construction
    expect(gameStateStub.battlefield.lands['1-2'].buildings[0].id).toEqual(BuildingType.WALL);
    expect(availableLands).toContain('1-2');
    expect(availableLands).toContain('1-3');
    expect(availableLands).toContain('1-4');
    // row 2
    expect(availableLands).toContain('2-2');
    expect(availableLands).toContain('2-3');
    expect(availableLands).toContain('2-4');
    expect(availableLands).toContain('2-5');
    // row 3
    expect(availableLands).toContain('3-1');
    expect(availableLands).toContain('3-2');
    // Land 3-3 is occupied by stronghold
    expect(availableLands).toContain('3-4');
    expect(availableLands).toContain('3-5');
    // row 4
    expect(availableLands).toContain('4-2');
    expect(availableLands).toContain('4-3');
    expect(availableLands).toContain('4-4');
    expect(availableLands).toContain('4-5');
    // row 5
    expect(availableLands).toContain('5-2');
    expect(availableLands).toContain('5-3');
    expect(availableLands).toContain('5-4');
  });

  it('should return land with WALL for stronghold build request', () => {
    construct(
      getTurnOwner(gameStateStub)!,
      BuildingType.STRONGHOLD,
      { row: 3, col: 3 },
      gameStateStub
    );

    construct(getTurnOwner(gameStateStub)!, BuildingType.WALL, { row: 1, col: 2 }, gameStateStub);

    const availableLands = getAvailableToConstructLands(
      BuildingType.STRONGHOLD,
      getTurnOwner(gameStateStub)!,
      gameStateStub
    );

    expect(availableLands.length).toBe(12); // number of lands outside radius 1 from stronghold
    // row 1
    // border lnd with wall should be also available for construction
    expect(gameStateStub.battlefield.lands['1-2'].buildings[0].id).toEqual(BuildingType.WALL);
    expect(availableLands).toContain('1-2');
    expect(availableLands).toContain('1-3');
    expect(availableLands).toContain('1-4');
    // row 2
    expect(availableLands).toContain('2-2');
    // 2-3 and 2-4 are in radius 1 from the stronghold and should not be returned
    expect(availableLands).toContain('2-5');
    // row 3
    expect(availableLands).toContain('3-1');
    // 3-2, 3-3, 3-4 are in radius 1 from stronghold and should not be returned
    expect(availableLands).toContain('3-5');
    // row 4
    expect(availableLands).toContain('4-2');
    // 4-3 and 4-4 are in radius 1 from the stronghold and should not be returned
    expect(availableLands).toContain('4-5');
    // row 5
    expect(availableLands).toContain('5-2');
    expect(availableLands).toContain('5-3');
    expect(availableLands).toContain('5-4');
  });
});
