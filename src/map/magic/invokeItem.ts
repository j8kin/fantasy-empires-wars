import { getPlayerLands, getTreasureItemById, getTurnOwner } from '../../selectors/playerSelectors';
import { getSpellById } from '../../selectors/spellSelectors';
import { getLand, getLandOwner } from '../../selectors/landSelectors';
import {
  addPlayerLand,
  removeLandEffect,
  updateLandEffect,
  updatePlayer,
} from '../../systems/gameStateActions';
import { decrementItemCharges, removeEmpireTreasureItem } from '../../systems/playerActions';
import { effectFactory } from '../../factories/effectFactory';
import { applyArmyCasualtiesAtPosition } from './applyArmyCasualties';
import { NO_PLAYER } from '../../domain/player/playerRepository';

import { TreasureType } from '../../types/Treasures';
import { RegularUnitType } from '../../types/UnitType';
import { SpellName } from '../../types/Spell';
import { EffectType } from '../../types/Effect';
import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';

export const invokeItem = (state: GameState, itemId: string, landPos: LandPosition) => {
  const turnOwner = getTurnOwner(state);
  const treasureItem = getTreasureItemById(turnOwner, itemId);

  if (!treasureItem) return; // fallback should never happen

  if (treasureItem.charge === 0) {
    // remove item from player inventory when user trying to use it after all charges are used
    // it will be a surprise for the user: instead of using item the item scramble it dust and lost forever
    // cover this message in useItemDialog
    Object.assign(
      state,
      updatePlayer(state, turnOwner.id, removeEmpireTreasureItem(turnOwner, treasureItem))
    );
    return;
  }

  let updatedState: GameState = state;
  switch (treasureItem.treasure.type) {
    case TreasureType.WAND_OF_TURN_UNDEAD:
      updatedState = applyArmyCasualtiesAtPosition(
        updatedState,
        // penalty should be the same but without CLERIC bonuses
        getSpellById(SpellName.TURN_UNDEAD).penalty!,
        landPos,
        [RegularUnitType.UNDEAD]
      );
      break;

    case TreasureType.ORB_OF_STORM:
      updatedState = applyArmyCasualtiesAtPosition(
        updatedState,
        // penalty should be the same but without ENCHANTER bonuses
        getSpellById(SpellName.TORNADO).penalty!,
        landPos
      );
      break;

    case TreasureType.RESTORE_BUILDING:
      // todo implement after battle outcome implemented
      break;

    case TreasureType.AEGIS_SHARD:
      updatedState = updateLandEffect(
        updatedState,
        landPos,
        effectFactory(treasureItem.treasure.type, state.turnOwner)
      );
      break;

    case TreasureType.RESURRECTION:
      // todo implement after battle outcome implemented
      break;

    case TreasureType.STONE_OF_RENEWAL:
      // remove one negative effect from the land
      const effectToCancel = getLand(updatedState, landPos).effects.find(
        (e) => e.rules.type === EffectType.NEGATIVE
      );
      if (effectToCancel) {
        updatedState = removeLandEffect(updatedState, landPos, effectToCancel.id);
      }
      break;

    case TreasureType.COMPASS_OF_DOMINION:
      const allPlayerLands = getPlayerLands(updatedState, getLandOwner(updatedState, landPos));

      allPlayerLands.forEach((land) => {
        updatedState = updateLandEffect(
          updatedState,
          land.mapPos,
          effectFactory(treasureItem.treasure.type, state.turnOwner)
        );
      });
      break;

    case TreasureType.DEED_OF_RECLAMATION:
      // own neutral land
      if (getLandOwner(updatedState, landPos) === NO_PLAYER.id) {
        updatedState = addPlayerLand(updatedState, updatedState.turnOwner, landPos);
        updatedState = updateLandEffect(
          updatedState,
          landPos,
          effectFactory(treasureItem.treasure.type, updatedState.turnOwner)
        );
      }
      break;

    case TreasureType.HOURGLASS_OF_DELAY:
      updatedState = updateLandEffect(
        updatedState,
        landPos,
        effectFactory(TreasureType.HOURGLASS_OF_DELAY, updatedState.turnOwner)
      );
      break;

    // MERCY_OF_ORRIVANE has permanent effect, and it is not necessary to activate it
  }

  // decrement charges
  updatedState = updatePlayer(
    updatedState,
    turnOwner.id,
    decrementItemCharges(getTurnOwner(updatedState), treasureItem)
  );

  Object.assign(state, updatedState);
};
