import { RegularUnitType } from '../../types/UnitType';
import { getDefaultUnit, RegularUnit, UnitRank } from '../../types/Unit';
import { calcMaxMove } from '../../map/move-army/calcMaxMove';

describe('calcMaxMove', () => {
  it.each([
    [UnitRank.REGULAR, 20, 1], // min 1 turn even if they could all die (less than 60)
    [UnitRank.REGULAR, 120, 2],
    [UnitRank.REGULAR, 220, 3],
    [UnitRank.REGULAR, 310, 4],
    [UnitRank.REGULAR, 500, 4],
    [UnitRank.VETERAN, 10, 1], // min 1 turn even if they could all die
    [UnitRank.VETERAN, 70, 2],
    [UnitRank.VETERAN, 140, 3],
    [UnitRank.VETERAN, 210, 4],
    [UnitRank.VETERAN, 270, 4],
    [UnitRank.ELITE, 10, 1], // min 1 turn even if they could all die
    [UnitRank.ELITE, 50, 2],
    [UnitRank.ELITE, 70, 3],
    [UnitRank.ELITE, 110, 4],
    [UnitRank.ELITE, 140, 4],
  ])('%s units: %s -> %s moves', (unitRank: UnitRank, num: number, expTurns: number) => {
    const unit = getDefaultUnit(RegularUnitType.WARRIOR) as RegularUnit;
    unit.level = unitRank;
    unit.count = num;

    const moves = calcMaxMove([unit]);
    expect(moves).toBe(expTurns);
  });
});
