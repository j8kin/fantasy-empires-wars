import { getTurnOwner, hasTreasureByPlayer } from '../../selectors/playerSelectors';
import { getAllHeroes } from '../../selectors/armySelectors';
import { updatePlayerMana } from '../../systems/gameStateActions';
import { getManaSource } from '../../domain/mana/manaSource';
import { getSpecialLandKinds } from '../../domain/land/landRelationships';
import { getRealmLands } from '../../selectors/landSelectors';
import { Doctrine } from '../../state/player/PlayerProfile';
import { TreasureName } from '../../types/Treasures';
import { Mana } from '../../types/Mana';
import type { GameState } from '../../state/GameState';

export const calculateMana = (gameState: GameState): GameState => {
  const turnOwner = getTurnOwner(gameState);

  const allHeroes = getAllHeroes(gameState, true);

  const hasHeartStone = hasTreasureByPlayer(turnOwner, TreasureName.HEARTSTONE_OF_ORRIVANE);

  let updatedState = gameState;

  allHeroes.forEach((mage) => {
    const manaSource = getManaSource({ heroType: mage.type })!;
    updatedState = updatePlayerMana(updatedState, turnOwner.id, manaSource.type, mage.mana ?? 0);
    if (turnOwner.playerProfile.doctrine === Doctrine.PURE_MAGIC) {
      // mages from pure magic produce 10% of the main mage mana in all other mana schools
      Object.values(Mana)
        .filter((m) => m !== manaSource.type)
        .forEach((m) => {
          updatedState = updatePlayerMana(updatedState, turnOwner.id, m, (mage.mana ?? 0) * 0.1);
        });
    }
  });

  getRealmLands(updatedState)
    .filter((land) => getSpecialLandKinds().includes(land.type))
    .forEach((land) => {
      const manaSource = getManaSource({ landKind: land.type })!;
      // Special Lands generate mana only if the player is Pure Magic or has a hero of a related type
      if (
        turnOwner.playerProfile.doctrine === Doctrine.PURE_MAGIC ||
        allHeroes.some((h) => manaSource.heroTypes.includes(h.type))
      ) {
        updatedState = updatePlayerMana(updatedState, turnOwner.id, manaSource.type, 1);
      }
      // add ADDITIONAL mana even if there are no heroes of a related type
      if (hasHeartStone) {
        updatedState = updatePlayerMana(updatedState, turnOwner.id, manaSource.type, 1);
      }
    });

  return updatedState;
};
