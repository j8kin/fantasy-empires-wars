import { GameState } from '../../state/GameState';
import { LandState } from '../../state/map/land/LandState';

import { getLand } from '../../selectors/landSelectors';
import { getPosition, isMoving } from '../../selectors/armySelectors';

import { DiplomacyStatus, getPlayersByDiplomacy } from '../../types/Diplomacy';

import { mergeArmiesOld } from './mergeArmiesOld';
import { getLands } from '../utils/getLands';
import { moveArmy } from '../../systems/armyActions';

export const performMovements = (gameState: GameState): void => {
  const turnOwner = gameState.turnOwner;

  const allies = getPlayersByDiplomacy(gameState, [DiplomacyStatus.ALLIANCE]).map((p) => p.id);

  const landsToBeModified: LandState[] = [];
  getLands({
    gameState: gameState,
    players: [turnOwner, ...allies],
    noArmy: false,
  })
    .filter((land) => land.army.some((a) => a.controlledBy === turnOwner && isMoving(a)))
    .forEach((landState) => {
      landState.army.forEach((army) => {
        if (army.controlledBy === turnOwner && isMoving(army)) {
          moveArmy(army);
          landsToBeModified.push(landState);
        }
      });
    });

  // todo refactor after Army moved into GameState from LandState
  landsToBeModified.forEach((landState) => {
    const armyToMove = landState.army.filter(
      (a) => a.controlledBy === turnOwner && getPosition(a) !== landState.mapPos
    );
    landState.army = landState.army.filter(
      (a) => a.controlledBy === turnOwner && getPosition(a) === landState.mapPos
    );
    armyToMove.forEach((a) => getLand(gameState, getPosition(a)).army.push(a));
  });

  // merge armies after all movements are performed
  mergeArmiesOld(gameState);
};
