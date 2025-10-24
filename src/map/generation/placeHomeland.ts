import { battlefieldLandId, GameState, getTurnOwner, LandState } from '../../types/GameState';
import { GamePlayer } from '../../types/GamePlayer';
import { getUnit } from '../../types/Army';
import { getLands } from '../utils/getLands';
import { construct } from '../building/construct';
import { BuildingType } from '../../types/Building';
import { Alignment } from '../../types/Alignment';
import { getTilesInRadius } from '../utils/mapAlgorithms';

const assignPlayerHero = (homeland: LandState, player: GamePlayer) => {
  const hero = getUnit(player.type);
  hero.name = player.name;
  hero.level = player.level;
  // todo increment characteristics (attack, defence etc based on Player Level)
  // initial Hero immediately available in normal game it turn 3 turn to recruit
  homeland.army.push({ unit: hero, quantity: 1, moveInTurn: 0 });
};

const randomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const placeHomeland = (gameState: GameState) => {
  const owner = getTurnOwner(gameState)!;

  let homeland: LandState;

  const existingPlayersHomelands = getLands({
    lands: gameState.battlefield.lands,
    buildings: [BuildingType.STRONGHOLD],
  });

  // get all lands which are not in radius 4 from any player's homeland'
  const freeToBuildLands = Object.keys(gameState.battlefield.lands).filter(
    (landId) =>
      // exclude border lands
      !landId.startsWith('0-') &&
      !landId.startsWith('1-') &&
      !landId.startsWith(`${gameState.battlefield.dimensions.rows - 1}-`) &&
      !landId.startsWith(`${gameState.battlefield.dimensions.rows - 2}-`) &&
      !existingPlayersHomelands
        .flatMap((h) => getTilesInRadius(gameState.battlefield.dimensions, h.mapPos, 4, false))
        .map((tola) => battlefieldLandId(tola))
        .includes(landId)
  );

  let possibleHomelands = freeToBuildLands
    .map((key) => gameState.battlefield.lands[key])
    .filter((land) => land.land.alignment === owner.alignment);

  if (possibleHomelands.length === 0) {
    possibleHomelands = freeToBuildLands
      .map((key) => gameState.battlefield.lands[key])
      .filter((land) => land.land.alignment === Alignment.NEUTRAL);
  }

  if (possibleHomelands.length === 0) {
    // fallback to any land if no alignment match
    homeland = gameState.battlefield.lands[randomElement(freeToBuildLands)];
  } else {
    homeland = randomElement(possibleHomelands);
  }

  // Place Strong into homeland first
  construct(gameState, BuildingType.STRONGHOLD, homeland.mapPos);

  // Place Barracks on the same alignment land except homeland
  let possibleBarracksLands = getLands({
    lands: gameState.battlefield.lands,
    players: [owner],
    landAlignment: owner.alignment,
    buildings: [],
  });
  if (possibleBarracksLands.length === 0) {
    // fall back to any land if no alignment match
    possibleBarracksLands = getLands({
      lands: gameState.battlefield.lands,
      players: [owner],
      buildings: [],
    });
  }
  construct(gameState, BuildingType.BARRACKS, randomElement(possibleBarracksLands).mapPos);

  assignPlayerHero(homeland, getTurnOwner(gameState)!);
};
