import { getLand, getLandOwner } from '../../selectors/landSelectors';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { getArmiesAtPosition } from '../../selectors/armySelectors';
import { hasLand } from '../../systems/playerActions';
import { addArmyToGameState, addRegulars, addWarMachines } from '../../systems/armyActions';
import { armyFactory } from '../../factories/armyFactory';
import { regularsFactory } from '../../factories/regularsFactory';
import { warMachineFactory } from '../../factories/warMachineFactory';
import { levelUpRegulars } from '../../systems/unitsActions';
import { UnitRank } from '../../state/army/RegularsState';
import { WarMachineName } from '../../types/UnitType';
import { RegularUnitName } from '../../types/UnitType';
import type { GameState } from '../../state/GameState';
import type { ArmyState } from '../../state/army/ArmyState';
import type { UnitRankType } from '../../state/army/RegularsState';

import { calculateAttritionPenalty } from '../../map/move-army/calculateAttritionPenalty';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';

describe('Calculate Attrition Penalty', () => {
  let randomSpy: jest.SpyInstance<number, []>;

  let gameStateStub: GameState;

  let army1: ArmyState;
  let army2: ArmyState;

  const armyLandPos = { row: 3, col: 5 };
  beforeEach(() => {
    randomSpy = jest.spyOn(Math, 'random');

    gameStateStub = createDefaultGameStateStub();

    army1 = armyFactory(getTurnOwner(gameStateStub).id, armyLandPos);
    army2 = armyFactory(getTurnOwner(gameStateStub).id, armyLandPos);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('armies on lands owned by player should not be affected', () => {
    const armyLand = getLand(gameStateStub, { row: 3, col: 4 });
    expect(hasLand(getTurnOwner(gameStateStub), armyLand.mapPos)).toBeTruthy();

    // Create armies at the actual test position
    const testArmy1 = armyFactory(getTurnOwner(gameStateStub).id, armyLand.mapPos);
    const testArmy2 = armyFactory(getTurnOwner(gameStateStub).id, armyLand.mapPos);

    // place army on land owned by player using centralized system
    Object.assign(gameStateStub, addArmyToGameState(gameStateStub, testArmy1));
    Object.assign(gameStateStub, addArmyToGameState(gameStateStub, testArmy2));

    calculateAttritionPenalty(gameStateStub);

    const currentArmies = getArmiesAtPosition(gameStateStub, armyLand.mapPos);
    expect(currentArmies).toEqual([testArmy1, testArmy2]);
  });

  it.each([
    [120, 120, 25, 25, UnitRank.REGULAR],
    [120, 120, 15, 15, UnitRank.VETERAN],
    [120, 120, 8, 8, UnitRank.ELITE],

    [120, 60, 34, 17, UnitRank.REGULAR],
    [120, 60, 20, 10, UnitRank.VETERAN],
    [120, 60, 10, 5, UnitRank.ELITE],

    [600, 600, 54, 54, UnitRank.REGULAR],
    [600, 600, 36, 36, UnitRank.VETERAN],
    [600, 600, 24, 24, UnitRank.ELITE],

    [600, 100, 54, 9, UnitRank.REGULAR],
    [600, 100, 36, 6, UnitRank.VETERAN],
    [600, 100, 24, 4, UnitRank.ELITE],

    [600, 50, 55, 5, UnitRank.REGULAR],
    [600, 50, 36, 3, UnitRank.VETERAN],
    [600, 50, 24, 2, UnitRank.ELITE],

    [10000, 10, 901, 1, UnitRank.REGULAR],
    [10000, 10, 601, 1, UnitRank.VETERAN],
    [10000, 10, 401, 1, UnitRank.ELITE],
  ])(
    'armies on lands NOT owned by player should be affected, both armies are lost units in proportion to the number of units: %s, %s, %s, %s %s',
    (
      army1Initial: number,
      army2Initial: number,
      army1Loss: number,
      army2Loss: number,
      rank: UnitRankType
    ) => {
      randomSpy.mockReturnValue(0.5); // to return the same result for all tests

      const armyLand = getLand(gameStateStub, armyLandPos);
      expect(getLandOwner(gameStateStub, armyLand.mapPos)).not.toBe(getTurnOwner(gameStateStub).id);

      const regularUnit1 = regularsFactory(RegularUnitName.WARRIOR, army1Initial);
      while (regularUnit1.rank !== rank) levelUpRegulars(regularUnit1, getTurnOwner(gameStateStub));

      const regularUnit2 = regularsFactory(RegularUnitName.WARRIOR, army2Initial);
      while (regularUnit2.rank !== rank) levelUpRegulars(regularUnit2, getTurnOwner(gameStateStub));

      // place armies using centralized system
      Object.assign(
        gameStateStub,
        addArmyToGameState(gameStateStub, addRegulars(army1, regularUnit1))
      );
      Object.assign(
        gameStateStub,
        addArmyToGameState(gameStateStub, addRegulars(army2, regularUnit2))
      );

      calculateAttritionPenalty(gameStateStub);

      const currentArmies = getArmiesAtPosition(gameStateStub, armyLand.mapPos);
      expect(currentArmies).toHaveLength(2);
      expect(currentArmies[0].regulars).toHaveLength(1);
      expect(currentArmies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(currentArmies[0].regulars[0].count).toBe(army1Initial - army1Loss);

      expect(currentArmies[1].regulars).toHaveLength(1);
      expect(currentArmies[1].regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(currentArmies[1].regulars[0].count).toBe(army2Initial - army2Loss);
    }
  );

  it('War-machines are not included in attrition penalty calculation', () => {
    randomSpy.mockReturnValue(0.5); // to return the same result for all tests

    const armyLand = getLand(gameStateStub, { row: 3, col: 5 });
    expect(getLandOwner(gameStateStub, armyLand.mapPos)).not.toBe(getTurnOwner(gameStateStub).id);

    Object.assign(army1, addRegulars(army1, regularsFactory(RegularUnitName.WARRIOR, 100)));
    Object.assign(army1, addWarMachines(army1, warMachineFactory(WarMachineName.BALLISTA)));

    // place army using centralized system
    Object.assign(gameStateStub, addArmyToGameState(gameStateStub, army1));

    calculateAttritionPenalty(gameStateStub);

    const currentArmies = getArmiesAtPosition(gameStateStub, armyLand.mapPos);
    expect(currentArmies).toHaveLength(1);
    expect(currentArmies[0].regulars).toHaveLength(1);
    expect(currentArmies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
    expect(currentArmies[0].regulars[0].count).toBe(50); // 50% of 100 warriors lost, war machines not counted
    expect(currentArmies[0].warMachines).toHaveLength(1); // ballista remains untouched in separate field
    expect(currentArmies[0].warMachines[0].type).toBe(WarMachineName.BALLISTA);
  });

  it('War-machines with multiple war machines remain separate and untouched', () => {
    randomSpy.mockReturnValue(0.5); // to return the same result for all tests

    const armyLand = getLand(gameStateStub, { row: 3, col: 5 });
    expect(getLandOwner(gameStateStub, armyLand.mapPos)).not.toBe(getTurnOwner(gameStateStub).id);

    Object.assign(army1, addRegulars(army1, regularsFactory(RegularUnitName.WARRIOR, 100)));
    Object.assign(army1, addWarMachines(army1, warMachineFactory(WarMachineName.BALLISTA)));
    Object.assign(army1, addWarMachines(army1, warMachineFactory(WarMachineName.CATAPULT)));
    Object.assign(army1, addWarMachines(army1, warMachineFactory(WarMachineName.CATAPULT)));

    // place army using centralized system
    Object.assign(gameStateStub, addArmyToGameState(gameStateStub, army1));

    calculateAttritionPenalty(gameStateStub);

    const currentArmies = getArmiesAtPosition(gameStateStub, armyLand.mapPos);
    expect(currentArmies).toHaveLength(1);
    expect(currentArmies[0].regulars).toHaveLength(1); // only warriors in regulars
    expect(currentArmies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
    expect(currentArmies[0].regulars[0].count).toBe(50); // 50% of 100 warriors lost

    // All war machines remain in separate field (grouped by type)
    expect(currentArmies[0].warMachines).toHaveLength(2);
    expect(currentArmies[0].warMachines[0].type).toBe(WarMachineName.BALLISTA);
    expect(currentArmies[0].warMachines[0].count).toBe(1);
    expect(currentArmies[0].warMachines[1].type).toBe(WarMachineName.CATAPULT);
    expect(currentArmies[0].warMachines[1].count).toBe(2); // 2 catapults grouped together
  });

  it('Army destroyed if all units killed', () => {
    randomSpy.mockReturnValue(0.5); // to return the same result for all tests

    const armyLand = getLand(gameStateStub, { row: 3, col: 5 });
    expect(getLandOwner(gameStateStub, armyLand.mapPos)).not.toBe(getTurnOwner(gameStateStub).id);

    // 40-60 minimum should be killed it means army will be destroyed
    Object.assign(army1, addRegulars(army1, regularsFactory(RegularUnitName.WARRIOR, 30)));

    // place army using centralized system
    Object.assign(gameStateStub, addArmyToGameState(gameStateStub, army1));

    calculateAttritionPenalty(gameStateStub);

    const currentArmies = getArmiesAtPosition(gameStateStub, armyLand.mapPos);
    expect(currentArmies).toHaveLength(0);
  });
});
