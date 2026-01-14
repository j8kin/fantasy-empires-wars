import { getRegulars } from '../../systems/armyActions';
import { UnitRank } from '../../state/army/RegularsState';
import type { ArmyState } from '../../state/army/ArmyState';
import type { RegularsState, UnitRankType } from '../../state/army/RegularsState';
import type { RegularUnitType } from '../../types/UnitType';

export interface PenaltyConfig {
  regular: { minPct: number; maxPct: number; minAbs: number; maxAbs: number };
  veteran: { minPct: number; maxPct: number; minAbs: number; maxAbs: number };
  elite: { minPct: number; maxPct: number; minAbs: number; maxAbs: number };
}

export interface NormalizedUnits {
  regular: number;
  veteran: number;
  elite: number;
}

export interface PenaltyLoss {
  regular: { total: number; loss: number };
  veteran: { total: number; loss: number };
  elite: { total: number; loss: number };
}

/**
 * Normalizes army units by counting regular units
 * @param units Array of regular units
 * @param unitTypesFilter Optional array of unit types to include in the calculation
 * @returns Normalized unit counts by rank
 */
export const normalizeArmyUnits = (units: RegularsState[], unitTypesFilter?: RegularUnitType[]): NormalizedUnits => {
  const packs: NormalizedUnits = {
    [UnitRank.REGULAR]: 0,
    [UnitRank.VETERAN]: 0,
    [UnitRank.ELITE]: 0,
  };

  Object.values(UnitRank).forEach((rank) => {
    let rankUnits = units.filter((u) => u.rank === rank);

    // Apply unit type filter if provided
    if (unitTypesFilter && unitTypesFilter.length > 0) {
      rankUnits = rankUnits.filter((u) => unitTypesFilter.includes(u.type));
    }

    packs[rank] = rankUnits.reduce((acc, unit) => acc + unit.count, 0);
  });
  return packs;
};

/**
 * Calculates penalty losses based on configuration and normalized unit counts
 * @param normalizedUnits Array of normalized unit counts for multiple armies
 * @param config Penalty configuration with min/max percentages and absolute values
 * @returns Calculated losses by unit rank
 */
const calculatePenaltyLoss = (normalizedUnits: NormalizedUnits[], config: PenaltyConfig): PenaltyLoss => {
  // Calculate total units across all armies by rank
  const regularUnits = normalizedUnits.reduce((acc, u) => acc + u.regular, 0);
  const veteranUnits = normalizedUnits.reduce((acc, u) => acc + u.veteran, 0);
  const eliteUnits = normalizedUnits.reduce((acc, u) => acc + u.elite, 0);

  const rollLoss = (minPct: number, maxPct: number, minAbs: number, maxAbs: number, count: number): number =>
    Math.max(
      Math.ceil(count * (Math.random() * (maxPct - minPct) + minPct)),
      Math.ceil(Math.random() * (maxAbs - minAbs) + minAbs)
    );

  const regularLoss = rollLoss(
    config.regular.minPct,
    config.regular.maxPct,
    config.regular.minAbs,
    config.regular.maxAbs,
    regularUnits
  );
  const veteranLoss = rollLoss(
    config.veteran.minPct,
    config.veteran.maxPct,
    config.veteran.minAbs,
    config.veteran.maxAbs,
    veteranUnits
  );
  const eliteLoss = rollLoss(
    config.elite.minPct,
    config.elite.maxPct,
    config.elite.minAbs,
    config.elite.maxAbs,
    eliteUnits
  );

  return {
    regular: { total: regularUnits, loss: regularLoss },
    veteran: { total: veteranUnits, loss: veteranLoss },
    elite: { total: eliteUnits, loss: eliteLoss },
  };
};

/**
 * Applies calculated penalty losses to an army
 * @param army The army to apply penalties to
 * @param unitsToLoss Number of units to remove by rank
 * @param unitTypesInvolved Optional array of specific unit types to target for penalties
 * @returns Updated army with penalties applied
 */
export const applyArmyPenalty = (
  army: ArmyState,
  unitsToLoss: Record<UnitRankType, number>,
  unitTypesInvolved?: RegularUnitType[]
): ArmyState => {
  let updatedArmy = army;

  Object.values(UnitRank).forEach((rank) => {
    let regUnitsWithRank = updatedArmy.regulars.filter((u) => u.rank === rank);

    // Apply unit type filter if provided
    if (unitTypesInvolved && unitTypesInvolved.length > 0) {
      regUnitsWithRank = regUnitsWithRank.filter((u) => unitTypesInvolved.includes(u.type));
    }

    // Remove regular units
    let rest = unitsToLoss[rank];
    while (rest > 0) {
      for (let i = 0; i < regUnitsWithRank.length && rest > 0; i++) {
        if (rest > 0) {
          const toDelete = Math.min(regUnitsWithRank[i].count, rest);
          const result = getRegulars(updatedArmy, regUnitsWithRank[i].type, regUnitsWithRank[i].rank, toDelete);
          if (result) {
            updatedArmy = result.updatedArmy;
          }
          rest -= toDelete;
        }
      }
    }
  });

  return updatedArmy;
};

const calcLoss = (
  normUnits: number,
  lossAbs: {
    total: number;
    loss: number;
  },
  hasShardOfTheSilentAnvil: boolean
) => {
  return Math.ceil(((hasShardOfTheSilentAnvil ? 0.65 : 1) * (normUnits * lossAbs.loss)) / lossAbs.total);
};

/**
 * Calculates and applies penalties to multiple armies based on configuration
 * @param armies Array of armies to apply penalties to
 * @param config Penalty configuration
 * @param hasShardOfTheSilentAnvil player has Shard Of The Silent Anvil in treasure which reduce spell loss by 35%
 * @param unitTypesInvolved Optional array of specific unit types to target for penalties
 * @returns Array of updated armies with penalties applied
 */
export const calculateAndApplyArmyPenalties = (
  armies: ArmyState[],
  config: PenaltyConfig,
  hasShardOfTheSilentAnvil: boolean = false,
  unitTypesInvolved?: RegularUnitType[]
): ArmyState[] => {
  const normalizedUnits = armies.map((army) => normalizeArmyUnits(army.regulars, unitTypesInvolved));
  const loss = calculatePenaltyLoss(normalizedUnits, config);

  return armies.map((army) => {
    const normUnits = normalizeArmyUnits(army.regulars, unitTypesInvolved);
    const unitsToLoss: Record<UnitRankType, number> = {
      [UnitRank.REGULAR]:
        loss.regular.total !== 0 ? calcLoss(normUnits.regular, loss.regular, hasShardOfTheSilentAnvil) : 0,
      [UnitRank.VETERAN]:
        loss.veteran.total !== 0 ? calcLoss(normUnits.veteran, loss.veteran, hasShardOfTheSilentAnvil) : 0,
      [UnitRank.ELITE]: loss.elite.total !== 0 ? calcLoss(normUnits.elite, loss.elite, hasShardOfTheSilentAnvil) : 0,
    };

    return applyArmyPenalty(army, unitsToLoss, unitTypesInvolved);
  });
};
