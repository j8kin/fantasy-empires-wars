import { getLands } from '../utils/getLands';
import { battlefieldLandId, GameState, getPlayerById, getTurnOwner } from '../../types/GameState';
import { BuildingType } from '../../types/Building';
import { getTilesInRadius } from '../utils/mapAlgorithms';
import { DiplomacyStatus } from '../../types/GamePlayer';
import { isHero, RegularUnit, RegularUnitType, Unit, UnitRank } from '../../types/Army';

// The equivalent number of units per war machine to calculate the attrition penalty.
const WAR_MACHINE_PER_UNIT = 20;

/**
 * find armies controlled by the turn owner and apply attrition penalty
 *   out of radius 1 from any owner stronghold or not in ally's land
 *
 * Attrition penalty:
 * | Unit Type        | Attrition Penalty                           |
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
  if (gameState == null) return; // fallback should never happen
  if (gameState.turnPhase !== 'START') return; // apply only at the start of the turn

  const turnOwner = getTurnOwner(gameState)!;

  const allStrongholds = getLands({
    lands: gameState.battlefield.lands,
    players: [turnOwner],
    buildings: [BuildingType.STRONGHOLD],
  });
  const controlledLands = allStrongholds
    .flatMap((s) => getTilesInRadius(gameState.battlefield.dimensions, s.mapPos, 1))
    .map((l) => battlefieldLandId(l));

  const armiesOnHostileLand = getLands({
    lands: gameState.battlefield.lands,
    noArmy: false,
  }).filter(
    (land) =>
      !(
        controlledLands.includes(battlefieldLandId(land.mapPos)) ||
        getPlayerById(gameState, land.controlledBy)?.diplomacy[turnOwner.id] ===
          DiplomacyStatus.ALLIANCE
      ) && land.army.some((a) => a.controlledBy === turnOwner.id)
  );

  armiesOnHostileLand.forEach((land) => {
    // get all units from the land
    const units = land.army.flatMap((a) => a.units);
    const loss = rollAttritionLoss(units);

    land.army.forEach((army) => {
      Object.values(UnitRank).forEach((rank) => {
        const nUnits = calculateNumberOfRegularUnits(army.units, rank);
        // Apply deaths to units
        let remainingToDie = Math.ceil((nUnits / loss[rank].total) * loss[rank].loss);

        // First, handle war machines (ballista and catapult)
        const warMachines = army.units.filter(
          (unit) =>
            !isHero(unit) &&
            unit.level === rank &&
            (unit.id === RegularUnitType.BALLISTA || unit.id === RegularUnitType.CATAPULT)
        );

        remainingToDie = warMachines.reduce((remaining, warMachine) => {
          if (remaining <= 0) return remaining;

          const warMachinesToKill = Math.min(
            Math.floor(remaining / WAR_MACHINE_PER_UNIT),
            (warMachine as RegularUnit).count
          );

          (warMachine as RegularUnit).count -= warMachinesToKill;
          return remaining - warMachinesToKill * WAR_MACHINE_PER_UNIT;
        }, remainingToDie);

        // Then handle regular units
        const regularUnits = army.units.filter(
          (unit) =>
            !isHero(unit) &&
            unit.level === rank &&
            unit.id !== RegularUnitType.BALLISTA &&
            unit.id !== RegularUnitType.CATAPULT
        );

        regularUnits.reduce((remaining, unit) => {
          if (remaining <= 0) return remaining;

          const unitsToKill = Math.min(remaining, (unit as RegularUnit).count);
          (unit as RegularUnit).count -= unitsToKill;
          return remaining - unitsToKill;
        }, remainingToDie);

        // Remove units with zero units count
        army.units = army.units.filter((unit) => isHero(unit) || (unit as RegularUnit).count > 0);
      });
    });

    // Remove armies with no units
    land.army = land.army.filter((army) => army.units.length > 0);
  });
};

const calculateNumberOfRegularUnits = (units: Unit[], unitRank: UnitRank) => {
  return units
    .filter((u) => !isHero(u) && u.level === unitRank)
    .reduce((acc, unit) => {
      if (unit.id === RegularUnitType.BALLISTA || unit.id === RegularUnitType.CATAPULT) {
        return acc + unit.count * WAR_MACHINE_PER_UNIT;
      }
      return acc + (unit as RegularUnit).count;
    }, 0);
};

const rollAttritionLoss = (units: Unit[]): Record<UnitRank, { total: number; loss: number }> => {
  // calculate the number of units based on unit type (regular, veteran, elite)
  const regularUnits = calculateNumberOfRegularUnits(units, UnitRank.REGULAR);
  const veteranUnits = calculateNumberOfRegularUnits(units, UnitRank.VETERAN);
  const eliteUnits = calculateNumberOfRegularUnits(units, UnitRank.ELITE);

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
