import { GameState } from '../../types/GameState';

import { getLands } from '../utils/mapLands';
import { calculateHexDistance } from '../utils/mapAlgorithms';

import { BuildingType } from '../../types/Building';
import { Alignment } from '../../types/Alignment';
import { PlayerInfo } from '../../types/GamePlayer';

export const calculateIncome = (gameState: GameState, player: PlayerInfo) => {
  const { battlefield } = gameState;

  const playerLands = getLands(battlefield.lands, [player]);
  const playerStrongholds = getLands(battlefield.lands, [player], undefined, undefined, [
    BuildingType.STRONGHOLD,
  ]).map((land) => land.mapPos);

  return playerLands.reduce((acc, land) => {
    // https://github.com/j8kin/fantasy-empires-wars/wiki/Lands
    if (player.alignment === Alignment.CHAOTIC && land.land.alignment === Alignment.LAWFUL)
      return acc;

    const landPos = land.mapPos;
    const distanceToStronghold = Math.min(
      ...playerStrongholds.map((stronghold) =>
        calculateHexDistance(battlefield.dimensions, landPos, stronghold)
      )
    );

    let landIncome = land.goldPerTurn;

    // https://github.com/j8kin/fantasy-empires-wars/wiki/Buildings#stronghold
    switch (distanceToStronghold) {
      case 0:
        landIncome = land.goldPerTurn;
        break;
      case 1:
        landIncome = land.goldPerTurn * 0.9;
        break;
      case 2:
        landIncome = land.goldPerTurn * 0.8;
        break;
      default:
        return acc;
    }

    // https://github.com/j8kin/fantasy-empires-wars/wiki/Lands
    if (player.alignment === Alignment.LAWFUL) {
      if (land.land.alignment === Alignment.LAWFUL) {
        landIncome = landIncome * 1.3;
      }
      if (land.land.alignment === Alignment.CHAOTIC) {
        landIncome = landIncome * 0.9;
      }
    }
    if (player.alignment === Alignment.CHAOTIC) {
      if (land.land.alignment === Alignment.CHAOTIC) {
        landIncome = landIncome * 2;
      }
    }

    return Math.ceil(acc + landIncome);
  }, 0);
};
