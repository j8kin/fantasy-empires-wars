import { GameState } from '../../state/GameState';
import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import { getAllHeroes } from '../../selectors/armySelectors';
import { getManaSource } from '../../domain/mana/manaSource';
import { getSpecialLandTypes } from '../../domain/land/landQueries';
import { TreasureItem } from '../../types/Treasures';
import { updatePlayerMana } from '../../systems/gameStateActions';

export const calculateMana = (gameState: GameState): void => {
  const turnOwner = getTurnOwner(gameState);

  const allHeroes = getAllHeroes(gameState, true);

  // HEARTSTONE_OF_ORRIVANE
  const hasHeartstone = turnOwner.empireTreasures.some(
    (t) => t.id === TreasureItem.HEARTSTONE_OF_ORRIVANE
  );

  allHeroes.forEach((mage) => {
    const manaSource = getManaSource({ heroType: mage.type })!;
    Object.assign(
      gameState,
      updatePlayerMana(gameState, turnOwner.id, manaSource.type, mage.mana || 0)
    );
  });

  getPlayerLands(gameState)
    .filter((land) => getSpecialLandTypes().includes(land.land.id))
    .forEach((land) => {
      const manaSource = getManaSource({ landType: land.land.id })!;
      if (allHeroes.some((h) => manaSource.heroTypes.includes(h.type))) {
        Object.assign(gameState, updatePlayerMana(gameState, turnOwner.id, manaSource.type, 1)); // each special land gives 1 mana of a related type
      }
      if (hasHeartstone) {
        Object.assign(gameState, updatePlayerMana(gameState, turnOwner.id, manaSource.type, 1)); // add mana even if there are no heroes of a related type
      }
    });
};
