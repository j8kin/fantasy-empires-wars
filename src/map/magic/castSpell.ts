import { Spell } from '../../types/Spell';
import { LandPosition } from '../utils/getLands';
import { getLandId, GameState, getTurnOwner, TurnPhase } from '../../state/GameState';
import { TreasureItem } from '../../types/Treasures';
import { ManaType } from '../../types/Mana';

export const castSpell = (spell: Spell, affectedLand: LandPosition, gameState: GameState) => {
  if (gameState == null || gameState.turnPhase !== TurnPhase.MAIN) return; // fallback should not be reached
  const spellOwner = getTurnOwner(gameState)!;
  // first get treasures that have affect on spell casting
  // https://github.com/j8kin/fantasy-empires-wars/wiki/Heroes’-Quests
  const hasVerdantIdol = spellOwner.empireTreasures?.some(
    (t) => t.id === TreasureItem.VERDANT_IDOL
  );

  if (spell.manaType === ManaType.GREEN && hasVerdantIdol) {
    spellOwner.mana[spell.manaType] -= spell.manaCost * 0.85;
  } else {
    spellOwner.mana[spell.manaType] -= spell.manaCost;
  }
  const landId = getLandId(affectedLand);
  console.log(`Casting ${spell} on ${landId}`);

  // todo implement spell casting logic
  // https://github.com/j8kin/fantasy-empires-wars/wiki/Magic
};
