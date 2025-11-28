import { ArmyState, ArmyBriefInfo } from '../state/army/ArmyState';
import { LandPosition } from '../state/map/land/LandPosition';

export const briefInfo = (state: ArmyState): ArmyBriefInfo => {
  return {
    heroes: state.heroes.map((h) => ({ name: h.name, type: h.type, level: h.level })),
    regulars: state.regulars.map((u) => ({ id: u.type, rank: u.rank, count: u.count })),
  };
};

export const isMoving = (state: ArmyState): boolean => {
  return state.movement.path.length !== 1;
};

export const getPosition = (state: ArmyState): LandPosition =>
  state.movement.path[state.movement.progress];
