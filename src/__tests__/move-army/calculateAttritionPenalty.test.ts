import { GameState } from '../../state/GameState';
import { RegularsState, UnitRank } from '../../state/army/RegularsState';
import { ArmyState } from '../../state/army/ArmyState';

import { getLand, getLandOwner } from '../../selectors/landSelectors';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { getArmiesAtPosition } from '../../selectors/armySelectors';
import { hasLand } from '../../systems/playerActions';
import { addRegulars } from '../../systems/armyActions';
import { addArmyToGameState } from '../../systems/armyActions';

import { armyFactory } from '../../factories/armyFactory';
import { regularsFactory } from '../../factories/regularsFactory';

import { RegularUnitType } from '../../types/UnitType';

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

  const testCreateRegularUnit = (
    unit: RegularUnitType,
    count: number = 20,
    level: UnitRank = UnitRank.REGULAR
  ): RegularsState => ({
    ...regularsFactory(unit),
    rank: level,
    count,
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
      rank: UnitRank
    ) => {
      randomSpy.mockReturnValue(0.5); // to return the same result for all tests

      const armyLand = getLand(gameStateStub, armyLandPos);
      expect(getLandOwner(gameStateStub, armyLand.mapPos)).not.toBe(getTurnOwner(gameStateStub).id);

      addRegulars(army1, testCreateRegularUnit(RegularUnitType.WARRIOR, army1Initial, rank));
      addRegulars(army2, testCreateRegularUnit(RegularUnitType.WARRIOR, army2Initial, rank));

      // place armies using centralized system
      Object.assign(gameStateStub, addArmyToGameState(gameStateStub, army1));
      Object.assign(gameStateStub, addArmyToGameState(gameStateStub, army2));

      calculateAttritionPenalty(gameStateStub);

      const currentArmies = getArmiesAtPosition(gameStateStub, armyLand.mapPos);
      expect(currentArmies.length).toBe(2);
      expect(currentArmies[0].regulars.length).toBe(1);
      expect(currentArmies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(currentArmies[0].regulars[0].count).toBe(army1Initial - army1Loss);

      expect(currentArmies[1].regulars.length).toBe(1);
      expect(currentArmies[1].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(currentArmies[1].regulars[0].count).toBe(army2Initial - army2Loss);
    }
  );

  it('War-machines counted as 20 units', () => {
    randomSpy.mockReturnValue(0.5); // to return the same result for all tests

    const armyLand = getLand(gameStateStub, { row: 3, col: 5 });
    expect(getLandOwner(gameStateStub, armyLand.mapPos)).not.toBe(getTurnOwner(gameStateStub).id);

    addRegulars(army1, testCreateRegularUnit(RegularUnitType.WARRIOR, 100, UnitRank.REGULAR));
    addRegulars(army1, testCreateRegularUnit(RegularUnitType.BALLISTA, 1, UnitRank.REGULAR));

    // place army using centralized system
    Object.assign(gameStateStub, addArmyToGameState(gameStateStub, army1));

    calculateAttritionPenalty(gameStateStub);

    const currentArmies = getArmiesAtPosition(gameStateStub, armyLand.mapPos);
    expect(currentArmies.length).toBe(1);
    expect(currentArmies[0].regulars.length).toBe(1); // no ballista unit in the army
    expect(currentArmies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
    expect(currentArmies[0].regulars[0].count).toBe(100 - 30); // -30 instead of 50 because of the ballista
  });

  it('War-machines counted as 20 units, 3 war-machines totally on land', () => {
    randomSpy.mockReturnValue(0.5); // to return the same result for all tests

    const armyLand = getLand(gameStateStub, { row: 3, col: 5 });
    expect(getLandOwner(gameStateStub, armyLand.mapPos)).not.toBe(getTurnOwner(gameStateStub).id);

    addRegulars(army1, testCreateRegularUnit(RegularUnitType.WARRIOR, 100, UnitRank.REGULAR));
    addRegulars(army1, testCreateRegularUnit(RegularUnitType.BALLISTA, 1, UnitRank.REGULAR));
    addRegulars(army1, testCreateRegularUnit(RegularUnitType.CATAPULT, 2, UnitRank.REGULAR));

    // place army using centralized system
    Object.assign(gameStateStub, addArmyToGameState(gameStateStub, army1));

    calculateAttritionPenalty(gameStateStub);

    const currentArmies = getArmiesAtPosition(gameStateStub, armyLand.mapPos);
    expect(currentArmies.length).toBe(1);
    expect(currentArmies[0].regulars.length).toBe(2); // no ballista unit in the army
    expect(currentArmies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
    expect(currentArmies[0].regulars[0].count).toBe(100 - 10); // -30 instead of 50 because of the ballista and catapult

    expect(currentArmies[0].regulars[1].type).toBe(RegularUnitType.CATAPULT);
    expect(currentArmies[0].regulars[1].count).toBe(1); // 2 catapults are destroyed
  });

  it('Army destroyed if all units killed', () => {
    randomSpy.mockReturnValue(0.5); // to return the same result for all tests

    const armyLand = getLand(gameStateStub, { row: 3, col: 5 });
    expect(getLandOwner(gameStateStub, armyLand.mapPos)).not.toBe(getTurnOwner(gameStateStub).id);

    // 40-60 minimum should be killed it means army will be destroyed
    addRegulars(army1, testCreateRegularUnit(RegularUnitType.WARRIOR, 30, UnitRank.REGULAR));

    // place army using centralized system
    Object.assign(gameStateStub, addArmyToGameState(gameStateStub, army1));

    calculateAttritionPenalty(gameStateStub);

    const currentArmies = getArmiesAtPosition(gameStateStub, armyLand.mapPos);
    expect(currentArmies.length).toBe(0);
  });
});
