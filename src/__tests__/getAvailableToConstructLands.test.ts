import type { GameState } from '../state/GameState';
import { getTurnOwner } from '../selectors/playerSelectors';
import { nextPlayer } from '../systems/playerActions';
import { addPlayerLand } from '../systems/gameStateActions';
import { heroFactory } from '../factories/heroFactory';
import { getAvailableToConstructLands } from '../map/building/getAvailableToConstructLands';
import { construct } from '../map/building/construct';
import { BuildingName } from '../types/Building';
import { HeroUnitName } from '../types/UnitType';

import { createGameStateStub } from './utils/createGameStateStub';
import { placeUnitsOnMap } from './utils/placeUnitsOnMap';

describe('getAvailableLands', () => {
  let gameStateStub: GameState;

  beforeEach(() => {
    gameStateStub = createGameStateStub({ nPlayers: 2, addPlayersHomeland: false });
  });

  it('should return no available lands for non-stronghold building when player has no lands under control', () => {
    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingName.BARRACKS);
    expect(availableLands).toHaveLength(0);
  });

  it('should return all available lands for non-stronghold building where there are no buildings', () => {
    construct(gameStateStub, BuildingName.STRONGHOLD, { row: 3, col: 3 });

    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingName.BARRACKS);

    expect(availableLands).toHaveLength(6); // number of lands without stronghold
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
    construct(gameStateStub, BuildingName.STRONGHOLD, { row: 3, col: 3 });

    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingName.STRONGHOLD);

    expect(availableLands).toHaveLength(0); // No lands available for construction
  });

  it('should return all available lands for stronghold building which controlled by army', () => {
    construct(gameStateStub, BuildingName.STRONGHOLD, { row: 3, col: 3 });
    placeUnitsOnMap(heroFactory(HeroUnitName.FIGHTER, 'Hero 1'), gameStateStub, {
      row: 3,
      col: 5,
    });
    Object.assign(gameStateStub, addPlayerLand(gameStateStub, getTurnOwner(gameStateStub).id, { row: 3, col: 5 }));
    //gameStateStub.battlefield.lands['3-5'].controlledBy = gameStateStub.turnOwner;

    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingName.STRONGHOLD);

    expect(availableLands).toHaveLength(1); // one land available for construction
    expect(availableLands).toContain('3-5');
  });

  it('should return only border lands if user wants to construct the wall', () => {
    construct(gameStateStub, BuildingName.STRONGHOLD, { row: 3, col: 3 });

    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingName.WALL);

    expect(availableLands).toHaveLength(6); // number of border lands
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
    construct(gameStateStub, BuildingName.STRONGHOLD, { row: 3, col: 3 });
    construct(gameStateStub, BuildingName.BARRACKS, { row: 2, col: 3 });

    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingName.WALL);

    expect(availableLands).toHaveLength(6); // number of border lands
    // row 1
    expect(gameStateStub.map.lands['2-3'].buildings[0].type).toEqual(BuildingName.BARRACKS);
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
    construct(gameStateStub, BuildingName.STRONGHOLD, { row: 3, col: 3 });
    construct(gameStateStub, BuildingName.BARRACKS, { row: 2, col: 3 });
    construct(gameStateStub, BuildingName.WALL, { row: 2, col: 3 });

    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingName.WALL);

    expect(availableLands).toHaveLength(5); // number of lands outside radius 1 from stronghold
    // row 1
    expect(gameStateStub.map.lands['2-3'].buildings[0].type).toEqual(BuildingName.BARRACKS);
    expect(gameStateStub.map.lands['2-3'].buildings[1].type).toEqual(BuildingName.WALL);
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
    construct(gameStateStub, BuildingName.STRONGHOLD, { row: 3, col: 3 });
    nextPlayer(gameStateStub);
    construct(gameStateStub, BuildingName.STRONGHOLD, { row: 3, col: 6 }); // other player

    nextPlayer(gameStateStub);
    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingName.WALL);

    expect(availableLands).toHaveLength(6); // number of lands outside radius 1 from stronghold
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
    construct(gameStateStub, BuildingName.STRONGHOLD, { row: 3, col: 3 });
    construct(gameStateStub, BuildingName.WALL, { row: 2, col: 3 });

    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingName.BARRACKS);

    expect(availableLands).toHaveLength(6); // number of lands without stronghold
    // row 1
    // border land with wall should be also available for construction
    expect(gameStateStub.map.lands['2-3'].buildings[0].type).toEqual(BuildingName.WALL);
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
    construct(gameStateStub, BuildingName.STRONGHOLD, { row: 3, col: 3 });
    construct(gameStateStub, BuildingName.WALL, { row: 2, col: 3 });

    const availableLands = getAvailableToConstructLands(gameStateStub, BuildingName.DEMOLITION);

    expect(availableLands).toHaveLength(2); // number of lands buildings
  });
});
