import { GameState } from '../../state/GameState';
import { getTurnOwner } from '../../selectors/playerSelectors';

import { Spell } from '../../types/Spell';
import { TreasureItem } from '../../types/Treasures';
import { ManaType } from '../../types/Mana';
import { LandPosition } from '../../state/map/land/LandPosition';
import { getLandId } from '../../state/map/land/LandId';
import { updatePlayerMana } from '../../systems/gameStateActions';

export const castSpell = (spell: Spell, affectedLand: LandPosition, gameState: GameState) => {
  const turnOwner = getTurnOwner(gameState);
  // first get treasures that have affect on spell casting
  // https://github.com/j8kin/fantasy-empires-wars/wiki/Heroes’-Quests
  const hasVerdantIdol = turnOwner.empireTreasures?.some((t) => t.id === TreasureItem.VERDANT_IDOL);

  if (spell.manaType === ManaType.GREEN && hasVerdantIdol) {
    Object.assign(
      gameState,
      updatePlayerMana(gameState, turnOwner.id, spell.manaType, -spell.manaCost * 0.85)
    );
  } else {
    Object.assign(
      gameState,
      updatePlayerMana(gameState, turnOwner.id, spell.manaType, -spell.manaCost)
    );
  }
  const landId = getLandId(affectedLand);
  console.log(`Casting ${spell} on ${landId}`);

  // todo implement spell casting logic
  // https://github.com/j8kin/fantasy-empires-wars/wiki/Magic
};
