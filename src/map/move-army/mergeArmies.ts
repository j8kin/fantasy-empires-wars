import { GameState, getTurnOwner, TurnPhase } from '../../types/GameState';
import { getLands } from '../utils/getLands';
import { Army, isHero, RegularUnit } from '../../types/Army';

export const mergeArmies = (gameState: GameState): void => {
  if (gameState == null || gameState.turnPhase === TurnPhase.MAIN) return;

  const player = getTurnOwner(gameState)!;
  getLands({ lands: gameState.battlefield.lands, players: [player], noArmy: false })
    .filter(
      (land) =>
        land.army.length > 1 &&
        land.army.filter((a) => a.controlledBy === gameState.turnOwner && a.movements == null)
          .length > 1
    )
    .forEach((land) => {
      // merge armies of the same type and turnsUntilReady === 0 in one unit with summary quantity
      // Heroes should never be merged since they are unique individuals
      const stationedArmy = land.army.filter(
        (a) => a.movements == null && a.controlledBy === gameState.turnOwner
      );
      const movingArmy = land.army.filter(
        (a) => a.movements != null && a.controlledBy === gameState.turnOwner
      );
      const otherPlayersArmies = land.army.filter((a) => a.controlledBy !== gameState.turnOwner);

      const mergedRegularUnits = stationedArmy.reduce(
        (acc: Army, army) => {
          for (const unit of army.units) {
            if (!isHero(unit)) {
              const existing = acc.units.find(
                // merge units the same type and level (regular/veteran and elite units should not merge with each other)
                (a) => !isHero(a) && a.id === unit.id && a.level === unit.level
              );
              if (existing) {
                (existing as RegularUnit).count += (unit as RegularUnit).count;
              } else {
                acc.units.push(unit);
              }
            } else {
              acc.units.push(unit);
            }
          }
          return acc;
        },
        { units: [], controlledBy: gameState.turnOwner }
      );

      land.army = [mergedRegularUnits, ...movingArmy, ...otherPlayersArmies];
    });
};
