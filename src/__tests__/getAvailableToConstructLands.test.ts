import { GameState, getTurnOwner } from '../types/GameState';
import { generateMockMap } from './utils/generateMockMap';
import { getAvailableToConstructLands } from '../map/building/getAvailableToConstructLands';
import { BuildingType } from '../types/Building';
import { construct } from '../map/building/construct';
import { createGameStateStub, defaultBattlefieldSizeStub } from './utils/createGameStateStub';
import { placeUnitsOnMap } from './utils/placeUnitsOnMap';
import { getDefaultUnit, HeroUnitType } from '../types/Army';

describe('getAvailableLands', () => {
  const gameStateStub: GameState = createGameStateStub({ addPlayersHomeland: false });

  beforeEach(() => {
    gameStateStub.battlefield = generateMockMap(defaultBattlefieldSizeStub);
    gameStateStub.turnOwner = gameStateStub.players[0].id;
  });

  it('should return no available lands for non-stronghold building when player has no lands under control', () => {
    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingType.BARRACKS);
    expect(availableLands.length).toBe(0);
  });

  it('should return all available lands for non-stronghold building where there are no buildings', () => {
    construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });

    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingType.BARRACKS);

    expect(availableLands.length).toBe(6); // number of lands without stronghold
    // row 1
    expect(availableLands).toContain('2-3');
    expect(availableLands).toContain('2-4');
    // row 2
    expect(availableLands).toContain('3-2');
    // Land 3-3 is occupied by stronghold
    expect(availableLands).toContain('3-4');
    // row 3
    expect(availableLands).toContain('4-3');
    expect(availableLands).toContain('4-4');
  });

  it('should return all available lands for stronghold building where there are no buildings', () => {
    construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });

    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingType.STRONGHOLD);

    expect(availableLands.length).toBe(0); // No lands available for construction
  });

  it('should return all available lands for stronghold building which controlled by army', () => {
    construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
    placeUnitsOnMap(getDefaultUnit(HeroUnitType.FIGHTER), gameStateStub, { row: 3, col: 5 });
    gameStateStub.battlefield.lands['3-5'].controlledBy = gameStateStub.turnOwner;

    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingType.STRONGHOLD);

    expect(availableLands.length).toBe(1); // one land available for construction
    expect(availableLands).toContain('3-5');
  });

  it('should return only border lands if user wants to construct the wall', () => {
    construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });

    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingType.WALL);

    expect(availableLands.length).toBe(6); // number of border lands
    // row 1
    expect(availableLands).toContain('2-3');
    expect(availableLands).toContain('2-4');
    // row 2
    expect(availableLands).toContain('3-2');
    // Land 3-3 is occupied by stronghold
    expect(availableLands).toContain('3-4');
    // row 3
    expect(availableLands).toContain('4-3');
    expect(availableLands).toContain('4-4');
  });

  it('should return only border lands even with building if user wants to construct the wall', () => {
    construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
    construct(gameStateStub, BuildingType.BARRACKS, { row: 2, col: 3 });

    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingType.WALL);

    expect(availableLands.length).toBe(6); // number of border lands
    // row 1
    expect(gameStateStub.battlefield.lands['2-3'].buildings[0].id).toEqual(BuildingType.BARRACKS);
    expect(availableLands).toContain('2-3');
    expect(availableLands).toContain('2-4');
    // row 2
    expect(availableLands).toContain('3-2');
    // Land 3-3 is occupied by stronghold
    expect(availableLands).toContain('3-4');
    // row 3
    expect(availableLands).toContain('4-3');
    expect(availableLands).toContain('4-4');
  });

  it('should return only border lands land with wall should be excluded if user wants to construct the wall', () => {
    construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
    construct(gameStateStub, BuildingType.BARRACKS, { row: 2, col: 3 });
    construct(gameStateStub, BuildingType.WALL, { row: 2, col: 3 });

    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingType.WALL);

    expect(availableLands.length).toBe(5); // number of lands outside radius 1 from stronghold
    // row 1
    expect(gameStateStub.battlefield.lands['2-3'].buildings[0].id).toEqual(BuildingType.BARRACKS);
    expect(gameStateStub.battlefield.lands['2-3'].buildings[1].id).toEqual(BuildingType.WALL);
    // land 2-3 is not available for construction
    expect(availableLands).toContain('2-4');
    // row 2
    expect(availableLands).toContain('3-2');
    // Land 3-3 is occupied by stronghold
    expect(availableLands).toContain('3-4');
    // row 3
    expect(availableLands).toContain('4-3');
    expect(availableLands).toContain('4-4');
  });

  it('should return all border lands when have a border with other player', () => {
    construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
    gameStateStub.turnOwner = gameStateStub.players[1].id;
    construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 6 }); // other player

    gameStateStub.turnOwner = gameStateStub.players[0].id;
    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingType.WALL);

    expect(availableLands.length).toBe(6); // number of lands outside radius 1 from stronghold
    // row 1
    expect(availableLands).toContain('2-3');
    expect(availableLands).toContain('2-4');
    // row 2
    expect(availableLands).toContain('3-2');
    // Land 3-3 is occupied by stronghold
    expect(availableLands).toContain('3-4');
    // row 3
    expect(availableLands).toContain('4-3');
    expect(availableLands).toContain('4-4');
  });

  it('should return land with WALL for non-wall build request', () => {
    construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
    construct(gameStateStub, BuildingType.WALL, { row: 2, col: 3 });

    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingType.BARRACKS);

    expect(availableLands.length).toBe(6); // number of lands without stronghold
    // row 1
    // border land with wall should be also available for construction
    expect(gameStateStub.battlefield.lands['2-3'].buildings[0].id).toEqual(BuildingType.WALL);
    expect(availableLands).toContain('2-3');
    expect(availableLands).toContain('2-4');
    // row 2
    expect(availableLands).toContain('3-2');
    // Land 3-3 is occupied by stronghold
    expect(availableLands).toContain('3-4');
    // row 3
    expect(availableLands).toContain('4-3');
    expect(availableLands).toContain('4-4');
  });

  it('should return land with Any Buildings for DEMOLITION request', () => {
    construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
    construct(gameStateStub, BuildingType.WALL, { row: 2, col: 3 });

    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingType.DEMOLITION);

    expect(availableLands.length).toBe(2); // number of lands buildings
  });
});
