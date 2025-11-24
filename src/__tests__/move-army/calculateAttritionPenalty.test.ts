import { GameState } from '../../state/GameState';
import { getLandId } from '../../state/LandState';

import { Army } from '../../types/Army';
import { RegularUnitType } from '../../types/UnitType';
import { createRegularUnit, RegularUnit, UnitRank } from '../../types/RegularUnit';
import { Movements } from '../../types/Movements';

import { calculateAttritionPenalty } from '../../map/move-army/calculateAttritionPenalty';

import { createDefaultGameStateStub } from '../utils/createGameStateStub';

describe('Calculate Attrition Penalty', () => {
  let randomSpy: jest.SpyInstance<number, []>;

  let gameStateStub: GameState;

  let army1: Army;
  let army2: Army;

  beforeEach(() => {
    randomSpy = jest.spyOn(Math, 'random');

    gameStateStub = createDefaultGameStateStub();

    army1 = {
      controlledBy: gameStateStub.turnOwner.id,
      units: [testCreateRegularUnit(RegularUnitType.WARRIOR, 120)],
      movements: createDummyMovements(),
    };

    army2 = {
      controlledBy: gameStateStub.turnOwner.id,
      units: [testCreateRegularUnit(RegularUnitType.WARRIOR, 120)],
      movements: createDummyMovements(),
    };
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  const testCreateRegularUnit = (
    unit: RegularUnitType,
    count: number = 20,
    level: UnitRank = UnitRank.REGULAR
  ): RegularUnit => ({
    ...createRegularUnit(unit),
    level,
    count,
  });

  const createDummyMovements = (): Movements => ({
    mp: 0,
    from: {
      row: 0,
      col: 0,
    },
    to: {
      row: 0,
      col: 0,
    },
    path: [],
  });

  it('armies on lands owned by player should not be affected', () => {
    const armyLand = gameStateStub.getLand({ row: 3, col: 4 });
    expect(gameStateStub.turnOwner.hasLand(getLandId(armyLand.mapPos))).toBeTruthy();

    // place army on land owned by player
    gameStateStub.map.lands[getLandId(armyLand.mapPos)] = {
      ...armyLand,
      army: [army1, army2],
    };
    calculateAttritionPenalty(gameStateStub);

    expect(gameStateStub.map.lands[getLandId(armyLand.mapPos)].army).toEqual([army1, army2]);
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

      const armyLand = gameStateStub.getLand({ row: 3, col: 5 });
      expect(gameStateStub.getLandOwner(armyLand.mapPos)).not.toBe(gameStateStub.turnOwner.id);

      army1.units = [testCreateRegularUnit(RegularUnitType.WARRIOR, army1Initial, rank)];
      army2.units = [testCreateRegularUnit(RegularUnitType.WARRIOR, army2Initial, rank)];
      // place army on land owned by player
      gameStateStub.map.lands[getLandId(armyLand.mapPos)] = {
        ...armyLand,
        army: [army1, army2],
      };
      calculateAttritionPenalty(gameStateStub);

      const currentArmies = gameStateStub.map.lands[getLandId(armyLand.mapPos)].army;
      expect(currentArmies.length).toBe(2);
      expect(currentArmies[0].units.length).toBe(1);
      expect(currentArmies[0].units[0].id).toBe(RegularUnitType.WARRIOR);
      expect((currentArmies[0].units[0] as RegularUnit).count).toBe(army1Initial - army1Loss);

      expect(currentArmies[1].units.length).toBe(1);
      expect(currentArmies[1].units[0].id).toBe(RegularUnitType.WARRIOR);
      expect((currentArmies[1].units[0] as RegularUnit).count).toBe(army2Initial - army2Loss);
    }
  );

  it('War-machines counted as 20 units', () => {
    randomSpy.mockReturnValue(0.5); // to return the same result for all tests

    const armyLand = gameStateStub.getLand({ row: 3, col: 5 });
    expect(gameStateStub.getLandOwner(armyLand.mapPos)).not.toBe(gameStateStub.turnOwner.id);

    army1.units = [
      testCreateRegularUnit(RegularUnitType.WARRIOR, 100, UnitRank.REGULAR),
      testCreateRegularUnit(RegularUnitType.BALLISTA, 1, UnitRank.REGULAR),
    ];
    // place army on land owned by player
    gameStateStub.map.lands[getLandId(armyLand.mapPos)] = {
      ...armyLand,
      army: [army1],
    };
    calculateAttritionPenalty(gameStateStub);

    const currentArmies = gameStateStub.map.lands[getLandId(armyLand.mapPos)].army;
    expect(currentArmies.length).toBe(1);
    expect(currentArmies[0].units.length).toBe(1); // no ballista unit in the army
    expect(currentArmies[0].units[0].id).toBe(RegularUnitType.WARRIOR);
    expect((currentArmies[0].units[0] as RegularUnit).count).toBe(100 - 30); // -30 instead of 50 because of the ballista
  });

  it('War-machines counted as 20 units, 3 war-machines totally on land', () => {
    randomSpy.mockReturnValue(0.5); // to return the same result for all tests

    const armyLand = gameStateStub.getLand({ row: 3, col: 5 });
    expect(gameStateStub.getLandOwner(armyLand.mapPos)).not.toBe(gameStateStub.turnOwner.id);

    army1.units = [
      testCreateRegularUnit(RegularUnitType.WARRIOR, 100, UnitRank.REGULAR),
      testCreateRegularUnit(RegularUnitType.BALLISTA, 1, UnitRank.REGULAR),
      testCreateRegularUnit(RegularUnitType.CATAPULT, 2, UnitRank.REGULAR),
    ];
    // place army on land owned by player
    gameStateStub.map.lands[getLandId(armyLand.mapPos)] = {
      ...armyLand,
      army: [army1],
    };
    calculateAttritionPenalty(gameStateStub);

    const currentArmies = gameStateStub.map.lands[getLandId(armyLand.mapPos)].army;
    expect(currentArmies.length).toBe(1);
    expect(currentArmies[0].units.length).toBe(2); // no ballista unit in the army
    expect(currentArmies[0].units[0].id).toBe(RegularUnitType.WARRIOR);
    expect((currentArmies[0].units[0] as RegularUnit).count).toBe(100 - 10); // -30 instead of 50 because of the ballista and catapult

    expect(currentArmies[0].units[1].id).toBe(RegularUnitType.CATAPULT);
    expect((currentArmies[0].units[1] as RegularUnit).count).toBe(1); // 2 catapults are destroyed
  });

  it('Army destroyed if all units killed', () => {
    randomSpy.mockReturnValue(0.5); // to return the same result for all tests

    const armyLand = gameStateStub.getLand({ row: 3, col: 5 });
    expect(gameStateStub.getLandOwner(armyLand.mapPos)).not.toBe(gameStateStub.turnOwner.id);

    // 40-60 minimum should be killed it means army will be destroyed
    army1.units = [testCreateRegularUnit(RegularUnitType.WARRIOR, 30, UnitRank.REGULAR)];
    // place army on land owned by player
    gameStateStub.map.lands[getLandId(armyLand.mapPos)] = {
      ...armyLand,
      army: [army1],
    };
    calculateAttritionPenalty(gameStateStub);

    const currentArmies = gameStateStub.map.lands[getLandId(armyLand.mapPos)].army;
    expect(currentArmies.length).toBe(0);
  });
});
