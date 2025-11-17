import { GameState, getTurnOwner } from '../../types/GameState';

import { getLands } from '../utils/getLands';

import { BuildingType } from '../../types/Building';
import { Alignment } from '../../types/Alignment';
import { calculateHexDistance } from '../utils/mapAlgorithms';

export const calculateIncome = (gameState: GameState): number => {
  const { battlefield } = gameState;
  const player = getTurnOwner(gameState);

  if (player == null) return 0;

  const playerLands = getLands({ gameState: gameState, players: [gameState.turnOwner] });

  return playerLands.reduce((acc, land) => {
    const playerStrongholds = getLands({
      gameState: gameState,
      players: [gameState.turnOwner],
      buildings: [BuildingType.STRONGHOLD],
    }).map((land) => land.mapPos);

    const distanceToStronghold = Math.min(
      ...playerStrongholds.map((stronghold) =>
        calculateHexDistance(battlefield.dimensions, land.mapPos, stronghold)
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
      player.alignment === Alignment.CHAOTIC
    ) {
      landIncome = land.goldPerTurn * 0.8;
    }

    // https://github.com/j8kin/fantasy-empires-wars/wiki/Lands
    if (player.alignment === Alignment.LAWFUL) {
      if (land.land.alignment === Alignment.LAWFUL) {
        landIncome = landIncome * 1.3;
      }
      if (land.land.alignment === Alignment.CHAOTIC) {
        landIncome = landIncome * 0.8;
      }
    }
    if (player.alignment === Alignment.CHAOTIC) {
      if (land.land.alignment === Alignment.CHAOTIC) {
        landIncome = landIncome * 2;
      }
      if (land.land.alignment === Alignment.LAWFUL) {
        landIncome = landIncome * 0.5;
      }
    }

    return Math.ceil(acc + landIncome);
  }, 0);
};
