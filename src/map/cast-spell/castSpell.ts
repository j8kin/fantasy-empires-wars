import { Spell } from '../../types/Spell';
import { LandPosition } from '../utils/mapLands';
import { battlefieldLandId, GameState } from '../../types/GameState';

// todo implement spells
export const castSpell = (spell: Spell, affectedLand: LandPosition, gameState: GameState) => {
  const landId = battlefieldLandId(affectedLand);
  console.log(`Casting ${spell} on ${landId}`);
};
