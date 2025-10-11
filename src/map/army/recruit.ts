import { Unit } from '../../types/Army';
import { LandState } from '../../types/GameState';

export const recruitHero = (unit: Unit, tile: LandState): void => {
  tile.army.push({ unit: unit, count: 1 });
};

export const recruitWarriors = (unit: Unit, tile: LandState): void => {
  tile.army.push({ unit: unit, count: 20 }); // todo: probably based on unit type/owner/alignment count could be a different
};
