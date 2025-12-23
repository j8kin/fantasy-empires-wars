import { getLandId } from '../../state/map/land/LandId';
import { getPlayerLands, hasActiveEffectByPlayer } from '../../selectors/playerSelectors';
import { getArmiesByPlayer, getPosition } from '../../selectors/armySelectors';
import { getSpellById } from '../../selectors/spellSelectors';
import { getLand, getTilesInRadius, hasActiveEffect } from '../../selectors/landSelectors';
import { getRegularLandKinds } from '../../domain/land/landQueries';
import { getMapDimensions } from '../../utils/screenPositionUtils';

import { SpellName, SpellTarget } from '../../types/Spell';
import { EffectTarget } from '../../types/Effect';
import { BuildingKind } from '../../types/Building';
import { LandKind } from '../../types/Land';
import { Alignment } from '../../types/Alignment';
import type { GameState } from '../../state/GameState';
import type { LandState } from '../../state/map/land/LandState';
import type { SpellType } from '../../types/Spell';

export const getAvailableToCastSpellLands = (
  gameState: GameState,
  spellName: SpellType
): string[] => {
  const spell = getSpellById(spellName);

  if (spell.id === SpellName.CORRUPTION) {
    const affectedLands = new Set<string>();

    getPlayerLands(gameState)
      .filter((l) =>
        l.buildings.some(
          (b) =>
            b.type === BuildingKind.BLACK_MAGE_TOWER ||
            b.type === BuildingKind.OUTPOST ||
            b.type === BuildingKind.STRONGHOLD
        )
      )
      .forEach((land) => {
        const isStronghold = land.buildings.some((b) => b.type === BuildingKind.STRONGHOLD);
        getTilesInRadius(
          getMapDimensions(gameState),
          land.mapPos,
          isStronghold ? 2 : 3,
          false
        ).forEach((l) => {
          if (canBeCorrupted(getLand(gameState, l))) {
            affectedLands.add(getLandId(l));
          }
        });
      });

    return Array.from(affectedLands);
  }

  if (spell.apply === SpellTarget.PLAYER) {
    if (spell.rules?.target === EffectTarget.ARMY) {
      return getArmiesByPlayer(gameState)
        .filter((army) => !army.effects.some((e) => e.sourceId === spellName))
        .flatMap((a) => getLandId(getPosition(a)));
    }
    return getPlayerLands(gameState)
      .filter((l) => !hasActiveEffect(l, spellName))
      .flatMap((l) => getLandId(l.mapPos));
  }

  const playerFiltered =
    spell.apply === SpellTarget.OPPONENT
      ? gameState.players.filter((p) => p.id !== gameState.turnOwner)
      : gameState.players;

  return playerFiltered
    .filter((p) => !hasActiveEffectByPlayer(p, spellName))
    .flatMap((p) => getPlayerLands(gameState, p.id))
    .filter((l) => !hasActiveEffect(l, spellName))
    .flatMap((l) => getLandId(l.mapPos));
};

const canBeCorrupted = (land: LandState): boolean => {
  return (
    land.land.alignment !== Alignment.CHAOTIC &&
    land.land.id !== LandKind.DESERT &&
    !land.corrupted &&
    getRegularLandKinds().includes(land.land.id)
  );
};
