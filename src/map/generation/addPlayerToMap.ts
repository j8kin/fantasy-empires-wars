import { BattlefieldMap, GameState, LandState } from '../../types/GameState';
import { GamePlayer, NO_PLAYER } from '../../types/GamePlayer';
import { getUnit } from '../../types/Army';
import { recruitHero } from '../army/recruit';
import { getLands, LandPosition } from '../utils/mapLands';
import { construct } from '../building/construct';
import { BuildingType } from '../../types/Building';
import { LAND_TYPE } from '../../types/Land';
import { Alignment } from '../../types/Alignment';
import { calculateHexDistance } from '../utils/mapAlgorithms';

const findSuitableHomeland = (
  battlefield: BattlefieldMap,
  player: GamePlayer,
  existingPlayerPositions: LandPosition[]
): LandState | undefined => {
  let candidates: LandState[] = [];

  // For Necromancer (Undead race), look for the volcano first
  if (player.race === 'Undead') {
    candidates = Object.values(battlefield.lands).filter(
      (tile) => tile.land.id === LAND_TYPE.VOLCANO && tile.controlledBy === NO_PLAYER.id
    );
  }

  // If no volcano found for Necromancer or other players, look for alignment-matching lands
  if (candidates.length === 0) {
    candidates = Object.values(battlefield.lands).filter(
      (tile) =>
        tile.controlledBy === NO_PLAYER.id &&
        tile.land.alignment === player.alignment &&
        tile.land.id !== LAND_TYPE.NONE &&
        tile.land.id !== LAND_TYPE.VOLCANO &&
        tile.land.id !== LAND_TYPE.LAVA &&
        // deserts are having a very lack of resources avoid to place home land there
        tile.land.id !== LAND_TYPE.DESERT &&
        // do not place homeland on the edge of the battlefield
        tile.mapPos.row >= 2 &&
        tile.mapPos.row <= battlefield.dimensions.rows - 2 &&
        tile.mapPos.col >= 2 &&
        tile.mapPos.col <= battlefield.dimensions.cols - 2
    );
  }

  // If no alignment match, use neutral lands
  if (candidates.length === 0) {
    candidates = Object.values(battlefield.lands).filter(
      (tile) =>
        tile.controlledBy === NO_PLAYER.id &&
        tile.land.alignment === Alignment.NEUTRAL &&
        tile.land.id !== LAND_TYPE.NONE &&
        tile.land.id !== LAND_TYPE.VOLCANO &&
        tile.land.id !== LAND_TYPE.LAVA
    );
  }

  // Filter by distance constraints
  const validCandidates = candidates.filter((candidate) => {
    return existingPlayerPositions.every((pos) => {
      const distance = calculateHexDistance(battlefield.dimensions, candidate.mapPos, pos);
      return distance >= 4; // Try radius 4 first
    });
  });

  // If no candidates with radius 4, try radius 3
  if (validCandidates.length === 0) {
    const radius3Candidates = candidates.filter((candidate) => {
      return existingPlayerPositions.every((pos) => {
        const distance = calculateHexDistance(battlefield.dimensions, candidate.mapPos, pos);
        return distance >= 3;
      });
    });

    if (radius3Candidates.length > 0) {
      const randomIndex = Math.floor(Math.random() * radius3Candidates.length);
      return radius3Candidates[randomIndex];
    }
  }

  if (validCandidates.length > 0) {
    const randomIndex = Math.floor(Math.random() * validCandidates.length);
    return validCandidates[randomIndex];
  }

  // Fallback: any suitable land if distance constraints can't be met
  if (candidates.length > 0) {
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }

  return undefined; // No suitable homeland found. Should never reach here
};

const assignPlayerHero = (homeland: LandState, player: GamePlayer) => {
  const hero = getUnit(player.type);
  hero.name = player.name;
  hero.level = player.level;
  // todo increment characteristics (attack, defence etc based on Player Level)
  recruitHero(hero, homeland);
};

const addPlayer = (
  player: GamePlayer,
  existingPlayersPositions: LandPosition[],
  gameState: GameState
) => {
  const homeland = findSuitableHomeland(gameState.battlefield, player, existingPlayersPositions);
  if (!homeland) return; // should never reach here

  homeland.controlledBy = player.id;
  construct(player, BuildingType.STRONGHOLD, homeland.mapPos, gameState);

  // construct one barrack on the same alignment land except homeland
  let playerLands = getLands(
    gameState.battlefield.lands,
    [player],
    homeland.land.id === LAND_TYPE.VOLCANO ? LAND_TYPE.LAVA : undefined,
    player.alignment,
    []
  );
  const barrackLand = playerLands[Math.floor(Math.random() * playerLands.length)];
  if (barrackLand != null) {
    construct(player, BuildingType.BARRACKS, barrackLand.mapPos, gameState);
  } else {
    // if no lands with the same alignment try to build on neutral land
    playerLands = getLands(gameState.battlefield.lands, [player], undefined, Alignment.NEUTRAL, []);
    construct(
      player,
      BuildingType.BARRACKS,
      playerLands[Math.floor(Math.random() * playerLands.length)].mapPos,
      gameState
    );
  }

  existingPlayersPositions.push(homeland.mapPos);

  // add player's Hero
  assignPlayerHero(homeland, player);
};

export const addPlayerToMap = (gameState: GameState) => {
  const { selectedPlayer, opponents } = gameState;
  const allyPlayers = [selectedPlayer, ...opponents];
  const playerPositions: LandPosition[] = [];

  // Place Necromancer on volcano first if necromancer is present
  const necromancer = allyPlayers.find((player) => player.race === 'Undead');
  if (necromancer != null) {
    addPlayer(necromancer, playerPositions, gameState);
  }

  allyPlayers
    .filter((player) => player.id !== necromancer?.id)
    .forEach((player) => {
      addPlayer(player, playerPositions, gameState);
    });
};
