import { GameState } from '../../state/GameState';

import { DiplomacyStatus, getPlayersByDiplomacy } from '../../types/Diplomacy';

import { mergeArmies } from './mergeArmies';
import { getLands } from '../utils/getLands';
import { LandState } from '../../state/LandState';

export const performMovements = (gameState: GameState): void => {
  const turnOwner = gameState.turnOwner.id;

  const allies = getPlayersByDiplomacy(gameState, [DiplomacyStatus.ALLIANCE]).map((p) => p.id);

  const landsToBeModified: LandState[] = [];
  getLands({
    gameState: gameState,
    players: [turnOwner, ...allies],
    noArmy: false,
  })
    .filter((land) => land.army.some((a) => a.controlledBy === turnOwner && a.isMoving))
    .forEach((landState) => {
      landState.army.forEach((army) => {
        if (army.controlledBy === turnOwner && army.isMoving) {
          army.move();
          landsToBeModified.push(landState);
        }
      });
    });

  // todo refactor after Army moved into GameState from LandState
  landsToBeModified.forEach((landState) => {
    const armyToMove = landState.army.filter(
      (a) => a.controlledBy === turnOwner && a.position !== landState.mapPos
    );
    landState.army = landState.army.filter(
      (a) => a.controlledBy === turnOwner && a.position === landState.mapPos
    );
    armyToMove.forEach((a) => gameState.getLand(a.position).army.push(a));
  });

  // merge armies after all movements are performed
  mergeArmies(gameState);
};
