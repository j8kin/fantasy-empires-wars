import { GameState } from '../../state/GameState';
import { getPlayerLands, getTurnOwner, hasTreasureByPlayer } from '../../selectors/playerSelectors';
import { getAllHeroes } from '../../selectors/armySelectors';
import { updatePlayerMana } from '../../systems/gameStateActions';
import { getManaSource } from '../../domain/mana/manaSource';
import { getSpecialLandTypes } from '../../domain/land/landQueries';
import { TreasureType } from '../../types/Treasures';

export const calculateMana = (gameState: GameState): GameState => {
  const turnOwner = getTurnOwner(gameState);

  const allHeroes = getAllHeroes(gameState, true);

  const hasHeartStone = hasTreasureByPlayer(turnOwner, TreasureType.HEARTSTONE_OF_ORRIVANE);

  let updatedState = gameState;

  allHeroes.forEach((mage) => {
    const manaSource = getManaSource({ heroType: mage.type })!;
    updatedState = updatePlayerMana(updatedState, turnOwner.id, manaSource.type, mage.mana || 0);
  });

  getPlayerLands(updatedState)
    .filter((land) => getSpecialLandTypes().includes(land.land.id))
    .forEach((land) => {
      const manaSource = getManaSource({ landType: land.land.id })!;
      if (allHeroes.some((h) => manaSource.heroTypes.includes(h.type))) {
        updatedState = updatePlayerMana(updatedState, turnOwner.id, manaSource.type, 1); // each special land gives 1 mana of a related type
      }
      if (hasHeartStone) {
        updatedState = updatePlayerMana(updatedState, turnOwner.id, manaSource.type, 1); // add mana even if there are no heroes of a related type
      }
    });

  return updatedState;
};
