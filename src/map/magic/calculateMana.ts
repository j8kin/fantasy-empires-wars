import { GameState } from '../../state/GameState';
import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import { getAllHeroes } from '../utils/armyUtils';
import { getManaSource } from '../../types/Mana';
import { getSpecialLandTypes } from '../../types/Land';
import { TreasureItem } from '../../types/Treasures';

export const calculateMana = (gameState: GameState): void => {
  const turnOwner = getTurnOwner(gameState);

  const allHeroes = getAllHeroes(gameState, true);

  // HEARTSTONE_OF_ORRIVANE
  const hasHeartstone = turnOwner.empireTreasures.some(
    (t) => t.id === TreasureItem.HEARTSTONE_OF_ORRIVANE
  );

  allHeroes.forEach(
    (mage) => (turnOwner.mana[getManaSource({ heroType: mage.type })!.type] += mage.mana || 0)
  );

  getPlayerLands(gameState)
    .filter((land) => getSpecialLandTypes().includes(land.land.id))
    .forEach((land) => {
      const manaSource = getManaSource({ landType: land.land.id })!;
      if (allHeroes.some((h) => manaSource.heroTypes.includes(h.type))) {
        turnOwner.mana[manaSource.type] += 1; // each special land gives 1 mana of a related type
      }
      if (hasHeartstone) turnOwner.mana[manaSource.type] += 1; // add mana even if there are no heroes of a related type
    });
};
