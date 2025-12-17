import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import { hasActiveEffect } from '../../selectors/landSelectors';
import { calculateHexDistance } from '../utils/mapAlgorithms';

import { BuildingType } from '../../types/Building';
import { Alignment } from '../../types/Alignment';
import { SpellName } from '../../types/Spell';
import type { GameState } from '../../state/GameState';

export const calculateIncome = (gameState: GameState): number => {
  const map = gameState.map;
  const turnOwner = getTurnOwner(gameState);
  const playerProfile = turnOwner.playerProfile;

  const playerLands = getPlayerLands(gameState);
  const playerStrongholds = playerLands
    .filter((l) => l.buildings.some((b) => b.id === BuildingType.STRONGHOLD))
    .map((land) => land.mapPos);

  return playerLands.reduce((acc, land) => {
    const distanceToStronghold = Math.min(
      ...playerStrongholds.map((stronghold) =>
        calculateHexDistance(map.dimensions, land.mapPos, stronghold)
      )
    );

    if (distanceToStronghold > 1) {
      // lands outside the stronghold control area are not increase income
      // for example this could be land just invaded by the army
      return acc;
    }

    // https://github.com/j8kin/fantasy-empires-wars/wiki/Lands
    let landIncome = land.goldPerTurn;

    // https://github.com/j8kin/fantasy-empires-wars/wiki/Buildings#stronghold
    if (
      !land.buildings.some((b) => b.id === BuildingType.STRONGHOLD) &&
      playerProfile.alignment === Alignment.CHAOTIC
    ) {
      landIncome = land.goldPerTurn * 0.8;
    }

    // https://github.com/j8kin/fantasy-empires-wars/wiki/Lands
    if (playerProfile.alignment === Alignment.LAWFUL) {
      if (land.land.alignment === Alignment.LAWFUL && !land.corrupted) {
        landIncome = landIncome * 1.3;
      }
      if (land.land.alignment === Alignment.CHAOTIC || land.corrupted) {
        landIncome = landIncome * 0.8;
      }
    }
    if (playerProfile.alignment === Alignment.CHAOTIC) {
      if (land.land.alignment === Alignment.CHAOTIC || land.corrupted) {
        landIncome = landIncome * 2;
      }
      if (land.land.alignment === Alignment.LAWFUL && !land.corrupted) {
        landIncome = landIncome * 0.5;
      }
    }

    // add FERTILE LAND Bonus
    if (hasActiveEffect(land, SpellName.FERTILE_LAND, turnOwner.id)) {
      landIncome = landIncome * 1.5;
    }

    return Math.ceil(acc + landIncome);
  }, 0);
};
