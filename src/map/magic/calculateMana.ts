import { getTurnOwner, hasTreasureByPlayer } from '../../selectors/playerSelectors';
import { getAllHeroes } from '../../selectors/armySelectors';
import { updatePlayerMana } from '../../systems/gameStateActions';
import { getManaSource } from '../../domain/mana/manaSource';
import { getSpecialLandKinds } from '../../domain/land/landRelationships';
import { getRealmLands } from '../../selectors/landSelectors';
import { TreasureName } from '../../types/Treasures';
import type { GameState } from '../../state/GameState';

export const calculateMana = (gameState: GameState): GameState => {
  const turnOwner = getTurnOwner(gameState);

  const allHeroes = getAllHeroes(gameState, true);

  const hasHeartStone = hasTreasureByPlayer(turnOwner, TreasureName.HEARTSTONE_OF_ORRIVANE);

  let updatedState = gameState;

  allHeroes.forEach((mage) => {
    const manaSource = getManaSource({ heroType: mage.type })!;
    updatedState = updatePlayerMana(updatedState, turnOwner.id, manaSource.type, mage.mana || 0);
  });

  getRealmLands(updatedState)
    .filter((land) => getSpecialLandKinds().includes(land.type))
    .forEach((land) => {
      const manaSource = getManaSource({ landKind: land.type })!;
      if (allHeroes.some((h) => manaSource.heroTypes.includes(h.type))) {
        updatedState = updatePlayerMana(updatedState, turnOwner.id, manaSource.type, 1); // each special land gives 1 mana of a related type
      }
      if (hasHeartStone) {
        updatedState = updatePlayerMana(updatedState, turnOwner.id, manaSource.type, 1); // add mana even if there are no heroes of a related type
      }
    });

  return updatedState;
};
