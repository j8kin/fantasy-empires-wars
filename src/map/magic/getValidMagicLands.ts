import { getLandId } from '../../state/map/land/LandId';
import { hasActiveEffectByPlayer } from '../../selectors/playerSelectors';
import { getArmiesByPlayer, getPosition } from '../../selectors/armySelectors';
import { getSpellById } from '../../selectors/spellSelectors';
import {
  getLand,
  getLandOwner,
  getPlayerLands,
  getTilesInRadius,
  hasActiveEffect,
  hasBuilding,
} from '../../selectors/landSelectors';
import { getRegularLandKinds } from '../../domain/land/landRelationships';
import { getMapDimensions } from '../../utils/screenPositionUtils';
import { getItem } from '../../domain/treasure/treasureRepository';

import { SpellName } from '../../types/Spell';
import { TreasureName } from '../../types/Treasures';
import { MagicTarget } from '../../types/MagicTarget';
import { EffectTarget } from '../../types/Effect';
import { BuildingName } from '../../types/Building';
import { LandName } from '../../types/Land';
import { Alignment } from '../../types/Alignment';
import { NO_PLAYER } from '../../domain/player/playerRepository';
import type { GameState } from '../../state/GameState';
import type { LandState } from '../../state/map/land/LandState';
import type { Spell, SpellType } from '../../types/Spell';
import type { Treasure, TreasureType } from '../../types/Treasures';

export const getValidMagicLands = (
  gameState: GameState,
  magicSource: SpellType | TreasureType
): string[] => {
  const magic: Spell | Treasure = Object.values(SpellName).includes(magicSource as SpellType)
    ? getSpellById(magicSource as SpellType)
    : getItem(magicSource as TreasureType);

  if (magic.type === SpellName.CORRUPTION) {
    const affectedLands = new Set<string>();

    getPlayerLands(gameState)
      .filter(
        (l) =>
          hasBuilding(l, BuildingName.BLACK_MAGE_TOWER) ||
          hasBuilding(l, BuildingName.OUTPOST) ||
          hasBuilding(l, BuildingName.STRONGHOLD)
      )
      .forEach((land) => {
        const isStronghold = hasBuilding(land, BuildingName.STRONGHOLD);
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

  if (magic.type === TreasureName.DEED_OF_RECLAMATION) {
    const affectedLands = new Set<string>();
    getPlayerLands(gameState)
      .filter(
        (l) => hasBuilding(l, BuildingName.OUTPOST) || hasBuilding(l, BuildingName.STRONGHOLD)
      )
      .forEach((land) => {
        getTilesInRadius(getMapDimensions(gameState), land.mapPos, 3).forEach((l) => {
          if (getLandOwner(gameState, l) === NO_PLAYER.id) {
            affectedLands.add(getLandId(l));
          }
        });
      });
    return Array.from(affectedLands);
  }

  if (magic.target === MagicTarget.PLAYER) {
    if (magic.rules?.target === EffectTarget.ARMY) {
      return getArmiesByPlayer(gameState)
        .filter((army) => !army.effects.some((e) => e.sourceId === magicSource))
        .flatMap((a) => getLandId(getPosition(a)));
    }
    return getPlayerLands(gameState)
      .filter((l) => !hasActiveEffect(l, magicSource))
      .flatMap((l) => getLandId(l.mapPos));
  }

  const playerFiltered =
    magic.target === MagicTarget.OPPONENT
      ? gameState.players.filter((p) => p.id !== gameState.turnOwner)
      : gameState.players;

  return playerFiltered
    .filter((p) => !hasActiveEffectByPlayer(p, magicSource))
    .flatMap((p) => getPlayerLands(gameState, p.id))
    .filter((l) => !hasActiveEffect(l, magicSource))
    .flatMap((l) => getLandId(l.mapPos));
};

const canBeCorrupted = (land: LandState): boolean => {
  return (
    land.land.alignment !== Alignment.CHAOTIC &&
    land.land.id !== LandName.DESERT &&
    !land.corrupted &&
    getRegularLandKinds().includes(land.land.id)
  );
};
