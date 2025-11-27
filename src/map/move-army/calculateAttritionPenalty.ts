import { GameState } from '../../state/GameState';
import { RegularUnit, UnitRank } from '../../types/RegularUnit';
import { Army } from '../../types/Army';
import { isWarMachine } from '../../types/UnitType';

import { getHostileLands } from '../utils/getHostileLands';

// The equivalent number of units per war machine to calculate the attrition penalty.
const WARMACHINE_TO_UNIT = 20;

/**
 * find armies controlled by the turn owner and apply attrition penalty
 *   out of radius 1 from any owner stronghold or not in ally's land
 *
 * Attrition penalty:
 * | RegularUnit Type        | Attrition Penalty                           |
 * |------------------|---------------------------------------------|
 * | Regular          | 8-10%, not less than 40-60 units            |
 * | Veteran          | 5-7%, not less than 20-40 units             |
 * | Elite            | 3-5%, not less than 10-20 units             |
 * | Hero below lvl 8 | die                                         |
 * |------------------|---------------------------------------------|
 * | Hero above lvl 8 | Could be moved only on owner or ally's land |
 * |                  | if stronghold is not constructed immediately|
 * |------------------|---------------------------------------------|
 *
 * penalty applied from above till bellow, for example, if there are 70 regular units, 10 veteran etc.,
 *   then only 40-60 units will be affected by attrition penalty
 * @param gameState
 */
export const calculateAttritionPenalty = (gameState: GameState): void => {
  getHostileLands(gameState).forEach((land) => {
    const allArmies = land.army.filter((a) => a.controlledBy === gameState.turnOwner.id);
    const unitsPerArmyNormalized = allArmies.map((a) => normalizeArmyUnits(a.regulars));
    const loss = rollAttritionLoss(unitsPerArmyNormalized);

    allArmies.forEach((a) => {
      const normNumUnits = normalizeArmyUnits(a.regulars);
      attritionPenalty(a, {
        [UnitRank.REGULAR]:
          loss.regular.total !== 0
            ? Math.ceil((normNumUnits.regular * loss.regular.loss) / loss.regular.total)
            : 0,
        [UnitRank.VETERAN]:
          loss.veteran.total !== 0
            ? Math.ceil((normNumUnits.veteran * loss.veteran.loss) / loss.veteran.total)
            : 0,
        [UnitRank.ELITE]:
          loss.elite.total !== 0
            ? Math.ceil((normNumUnits.elite * loss.elite.loss) / loss.elite.total)
            : 0,
      });
    });
    // Remove armies with no units
    land.army = land.army.filter((army) => army.regulars.length > 0 || army.heroes.length > 0);
  });
};

const attritionPenalty = (army: Army, unitsToLoss: Record<UnitRank, number>): void => {
  Object.values(UnitRank).forEach((rank) => {
    const regUnitsWithRank = army.regulars.filter((u) => u.rank === rank && !isWarMachine(u.id));
    const warMachUnitsWithRank = army.regulars.filter((u) => u.rank === rank && isWarMachine(u.id));
    const toKill = unitsToLoss[rank];
    const maxWarmachinesToKill = Math.min(
      warMachUnitsWithRank.reduce((acc, m) => acc + m.count, 0),
      Math.floor(toKill / WARMACHINE_TO_UNIT)
    );

    const regularsToKill = unitsToLoss[rank] - maxWarmachinesToKill * WARMACHINE_TO_UNIT;

    let rest = maxWarmachinesToKill;
    while (rest > 0) {
      for (let i = 0; i < warMachUnitsWithRank.length && rest > 0; i++) {
        if (rest > 0) {
          const toDelete = Math.min(warMachUnitsWithRank[i].count, rest);
          army.getRegulars(warMachUnitsWithRank[i].id, warMachUnitsWithRank[i].rank, toDelete);
          rest -= toDelete;
        }
      }
    }
    rest = regularsToKill;
    while (rest > 0) {
      for (let i = 0; i < regUnitsWithRank.length && rest > 0; i++) {
        if (rest > 0) {
          const toDelete = Math.min(regUnitsWithRank[i].count, rest);
          army.getRegulars(regUnitsWithRank[i].id, regUnitsWithRank[i].rank, toDelete);
          rest -= toDelete;
        }
      }
    }
  });
};

const normalizeArmyUnits = (units: RegularUnit[]): Record<UnitRank, number> => {
  const packs: Record<UnitRank, number> = {
    [UnitRank.REGULAR]: 0,
    [UnitRank.VETERAN]: 0,
    [UnitRank.ELITE]: 0,
  };

  Object.values(UnitRank).forEach((rank) => {
    const rankUnits = units.filter((u) => u.rank === rank);
    const warMachines = rankUnits
      .filter((u) => isWarMachine(u.id))
      .reduce((acc, unit) => acc + unit.count, 0);
    const regularUnits = rankUnits
      .filter((u) => !isWarMachine(u.id))
      .reduce((acc, unit) => acc + unit.count, 0);
    packs[rank] = warMachines * WARMACHINE_TO_UNIT + regularUnits;
  });
  return packs;
};

const rollAttritionLoss = (
  normalizedUnits: Record<UnitRank, number>[]
): Record<UnitRank, { total: number; loss: number }> => {
  // calculate the number of units based on unit type (regular, veteran, elite)
  const regularUnits = normalizedUnits.reduce((acc, u) => acc + u.regular, 0);
  const veteranUnits = normalizedUnits.reduce((acc, u) => acc + u.veteran, 0);
  const eliteUnits = normalizedUnits.reduce((acc, u) => acc + u.elite, 0);

  const roll = (
    minPct: number,
    maxPct: number,
    minAbs: number,
    maxAbs: number,
    count: number
  ): number =>
    Math.max(
      Math.ceil(count * (Math.random() * (maxPct - minPct) + minPct)),
      Math.ceil(Math.random() * (maxAbs - minAbs) + minAbs)
    );

  const regularLoss = roll(0.08, 0.1, 40, 60, regularUnits);
  const veteranLoss = roll(0.05, 0.07, 20, 40, veteranUnits);
  const eliteLoss = roll(0.03, 0.05, 10, 20, eliteUnits);

  return {
    [UnitRank.REGULAR]: { total: regularUnits, loss: regularLoss },
    [UnitRank.VETERAN]: { total: veteranUnits, loss: veteranLoss },
    [UnitRank.ELITE]: { total: eliteUnits, loss: eliteLoss },
  };
};
