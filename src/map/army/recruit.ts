import { Unit } from '../../types/Army';
import { LandState } from '../../types/GameState';

export const recruitHero = (unit: Unit, tile: LandState): void => {
  tile.army.push({ unit: unit, isMoving: false });
};

export const recruitRegulars = (unit: Unit, tile: LandState): void => {
  tile.army.push({ unit: unit, isMoving: false }); // todo: probably based on unit type/owner/alignment count could be a different
};
