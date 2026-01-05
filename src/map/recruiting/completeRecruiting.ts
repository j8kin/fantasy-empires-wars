import { isMoving, getArmiesAtPosition } from '../../selectors/armySelectors';
import { getPlayerLands } from '../../selectors/landSelectors';
import { addHero, addRegulars, addWarMachines } from '../../systems/armyActions';
import {
  decrementPlayerRecruitmentSlots,
  freePlayerCompletedRecruitmentSlots,
} from '../../systems/gameStateActions';
import { armyFactory } from '../../factories/armyFactory';
import { heroFactory } from '../../factories/heroFactory';
import { regularsFactory } from '../../factories/regularsFactory';
import { isHeroType, isWarMachine } from '../../domain/unit/unitTypeChecks';
import { generateHeroName } from './heroNameGeneration';
import { heroRecruitingMessage } from './heroRecruitingMessage';

import { EmpireEventKind } from '../../types/EmpireEvent';
import type { EmpireEvent } from '../../types/EmpireEvent';
import type { GameState } from '../../state/GameState';
import type { ArmyState } from '../../state/army/ArmyState';
import { warMachineFactory } from '../../factories/warMachineFactory';

export const completeRecruiting = (gameState: GameState): EmpireEvent[] => {
  const recruitEvents: EmpireEvent[] = [];
  const { turnOwner } = gameState;

  // Step 1: Decrement recruitment slot counters immutably
  let updatedState = decrementPlayerRecruitmentSlots(gameState, turnOwner);

  // Step 2: Find all completed recruitment slots and collect updates
  const playerLands = getPlayerLands(updatedState);
  const landsWithRecruitment = playerLands.filter(
    (l) => l.buildings.length > 0 && l.buildings.some((b) => b.slots.length > 0)
  );

  // Track which armies need to be updated or added
  const armiesToUpdate = new Map<string, ArmyState>();
  const newArmies: ArmyState[] = [];

  landsWithRecruitment.forEach((l) =>
    l.buildings.forEach((b) => {
      if (b.slots.length > 0) {
        // Find completed slots (after decrement, so 0 means just completed and isOccupied)
        const completedSlots = b.slots.filter((s) => s.isOccupied && s.turnsRemaining === 0);

        completedSlots.forEach((s) => {
          const armiesAtPosition = getArmiesAtPosition(updatedState, l.mapPos);
          const stationedArmy = armiesAtPosition.find(
            (a) => !isMoving(a) && a.controlledBy === turnOwner
          );

          if (isHeroType(s.unit)) {
            const newHero = heroFactory(s.unit, generateHeroName(s.unit));
            recruitEvents.push({
              status: EmpireEventKind.Success,
              message: heroRecruitingMessage(newHero),
            });

            if (stationedArmy) {
              // Get the latest version of this army (might have been updated already)
              const currentArmy = armiesToUpdate.get(stationedArmy.id) || stationedArmy;
              const updatedArmy = addHero(currentArmy, newHero);
              armiesToUpdate.set(stationedArmy.id, updatedArmy);
            } else {
              const newArmy = armyFactory(turnOwner, l.mapPos, [newHero]);
              newArmies.push(newArmy);
            }
          } else {
            if (isWarMachine(s.unit)) {
              const newWarMachine = warMachineFactory(s.unit);
              if (stationedArmy) {
                const currentArmy = armiesToUpdate.get(stationedArmy.id) || stationedArmy;
                const updatedArmy = addWarMachines(currentArmy, newWarMachine);
                armiesToUpdate.set(stationedArmy.id, updatedArmy);
              } else {
                newArmies.push(
                  armyFactory(turnOwner, l.mapPos, undefined, undefined, [newWarMachine])
                );
              }
            } else {
              const newRegulars = regularsFactory(s.unit);

              if (stationedArmy) {
                // Get the latest version of this army (might have been updated already)
                const currentArmy = armiesToUpdate.get(stationedArmy.id) || stationedArmy;
                const updatedArmy = addRegulars(currentArmy, newRegulars);
                armiesToUpdate.set(stationedArmy.id, updatedArmy);
              } else {
                newArmies.push(armyFactory(turnOwner, l.mapPos, undefined, [newRegulars]));
              }
            }
          }
        });
      }
    })
  );

  // Step 3: Apply all army updates in a single state transition
  updatedState = {
    ...updatedState,
    armies: [
      ...updatedState.armies.map((army) => armiesToUpdate.get(army.id) || army),
      ...newArmies,
    ],
  };

  // Step 4: Free all completed recruitment slots
  updatedState = freePlayerCompletedRecruitmentSlots(updatedState, turnOwner);

  // Step 5: Apply final state
  Object.assign(gameState, updatedState);

  return recruitEvents;
};
