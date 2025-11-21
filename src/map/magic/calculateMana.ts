import { GameState, getTurnOwner, TurnPhase } from '../../state/GameState';
import { getAllHeroes } from '../utils/getAllHeroes';
import { getManaSource } from '../../types/Mana';
import { getLands } from '../utils/getLands';
import { getSpecialLandTypes } from '../../types/Land';
import { TreasureItem } from '../../types/Treasures';

export const calculateMana = (gameState: GameState): void => {
  if (gameState.turnPhase !== TurnPhase.START) return;

  const turnOwner = getTurnOwner(gameState)!;

  const allHeroes = getAllHeroes(gameState, true);

  // HEARTSTONE_OF_ORRIVANE
  const hasHeartstone = turnOwner.empireTreasures.some(
    (t) => t.id === TreasureItem.HEARTSTONE_OF_ORRIVANE
  );

  allHeroes.forEach(
    (mage) => (turnOwner.mana[getManaSource({ heroType: mage.id })!.type] += mage.mana || 0)
  );

  getLands({
    gameState: gameState,
    players: [turnOwner.id],
    landTypes: getSpecialLandTypes(),
  }).forEach((land) => {
    const manaSource = getManaSource({ landType: land.land.id })!;
    if (allHeroes.some((h) => manaSource.heroTypes.includes(h.id))) {
      turnOwner.mana[manaSource.type] += 1; // each special land gives 1 mana of a related type
    }
    if (hasHeartstone) turnOwner.mana[manaSource.type] += 1; // add mana even if there are no heroes of a related type
  });
};
