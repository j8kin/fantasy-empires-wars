import { getLand, getLandOwner, hasActiveEffect } from '../../selectors/landSelectors';
import { getTurnOwner, getUnitsAllowedToRecruit, hasTreasureByPlayer } from '../../selectors/playerSelectors';
import { hasAvailableSlotForUnit } from '../../selectors/buildingSelectors';
import { startRecruitmentInSlot, updatePlayerVault } from '../../systems/gameStateActions';
import { getRecruitInfo } from '../../domain/unit/unitRepository';

import { TreasureName } from '../../types/Treasures';
import { SpellName } from '../../types/Spell';
import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { UnitType } from '../../types/UnitType';

export const startRecruiting = (state: GameState, landPos: LandPosition, unitType: UnitType): void => {
  if (getLandOwner(state, landPos) !== state.turnOwner) {
    return; // fallback: a wrong Land Owner should never happen on real game
  }
  const land = getLand(state, landPos);
  const turnOwner = getTurnOwner(state);
  const recruitBuilding = land.buildings.find(
    (b) =>
      hasAvailableSlotForUnit(b, unitType, turnOwner.traits.recruitmentSlots[b.type]!) &&
      getUnitsAllowedToRecruit(turnOwner, land, b).includes(unitType)
  );
  if (recruitBuilding) {
    const turnOwner = getTurnOwner(state);
    const availableGold = turnOwner.vault;
    const recruitRules = getRecruitInfo(unitType);
    if (availableGold >= recruitRules.recruitCost) {
      let newState: GameState = state;
      const hasCrownOfDominion = hasTreasureByPlayer(turnOwner, TreasureName.CROWN_OF_DOMINION);

      const costReduction = hasCrownOfDominion ? Math.ceil(recruitRules.recruitCost * 0.85) : recruitRules.recruitCost;

      // Ember raid increases recruitment duration by 1 turn
      const hasEmberRaidEffect = hasActiveEffect(land, SpellName.EMBER_RAID);

      newState = updatePlayerVault(newState, turnOwner.id, -costReduction);

      // Start recruitment in the first available slot
      newState = startRecruitmentInSlot(
        newState,
        landPos,
        recruitBuilding,
        unitType,
        recruitRules.recruitTime + (hasEmberRaidEffect ? 1 : 0) + (land.corrupted ? 1 : 0) // corrupted lands add one additional turn to recruitment
      );

      Object.assign(state, newState);
    }
  }
};
