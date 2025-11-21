import { getLandId, GameState, getTurnOwner, LandState } from '../../state/GameState';
import { NO_PLAYER } from '../../state/PlayerState';
import { getDefaultUnit, HeroUnit } from '../../types/Army';
import { getLand, getLands } from '../utils/getLands';
import { construct } from '../building/construct';
import { BuildingType, getBuilding } from '../../types/Building';
import { Alignment } from '../../types/Alignment';
import { getTilesInRadius } from '../utils/mapAlgorithms';
import { getRandomElement } from '../../types/getRandomElement';
import { levelUpHero } from '../recruiting/levelUpHero';

const assignPlayerHero = (homeland: LandState, gameState: GameState) => {
  const player = getTurnOwner(gameState)!;
  const hero = getDefaultUnit(player.getType()) as HeroUnit;
  hero.name = player.getName();
  hero.level = player.getLevel() - 1; // levelUpHero will increment level
  // increment characteristics
  levelUpHero(hero, player);
  // initial Hero immediately available in normal game it turn 3 turn to recruit#
  getLand(gameState, homeland.mapPos).army.push({ units: [hero], controlledBy: player.playerId });
};

export const placeHomeland = (gameState: GameState) => {
  const owner = getTurnOwner(gameState)!;

  let homeland: LandState;

  const existingPlayersHomelands = getLands({
    gameState: gameState,
    buildings: [BuildingType.STRONGHOLD],
  });

  // get all lands which are not in radius 4 from any player's homeland'
  let freeToBuildLands = Object.keys(gameState.battlefield.lands).filter(
    (landId) =>
      // exclude border lands
      !landId.startsWith('0-') &&
      !landId.startsWith('1-') &&
      !landId.startsWith(`${gameState.battlefield.dimensions.rows - 1}-`) &&
      !landId.startsWith(`${gameState.battlefield.dimensions.rows - 2}-`) &&
      !existingPlayersHomelands
        .flatMap((h) => getTilesInRadius(gameState.battlefield.dimensions, h.mapPos, 4, false))
        .map((tola) => getLandId(tola))
        .includes(landId)
  );

  if (freeToBuildLands.length === 0) {
    freeToBuildLands = Object.keys(gameState.battlefield.lands).filter(
      (landId) =>
        // exclude border lands
        !landId.startsWith('0-') &&
        !landId.startsWith('1-') &&
        !landId.startsWith(`${gameState.battlefield.dimensions.rows - 1}-`) &&
        !landId.startsWith(`${gameState.battlefield.dimensions.rows - 2}-`) &&
        !existingPlayersHomelands
          .flatMap((h) => getTilesInRadius(gameState.battlefield.dimensions, h.mapPos, 3, false))
          .map((tola) => getLandId(tola))
          .includes(landId)
    );
  }

  let possibleHomelands = freeToBuildLands
    .map((key) => gameState.battlefield.lands[key])
    .filter((land) => land.land.alignment === owner.getAlignment());

  if (possibleHomelands.length === 0) {
    possibleHomelands = freeToBuildLands
      .map((key) => gameState.battlefield.lands[key])
      .filter((land) => land.land.alignment === Alignment.NEUTRAL);
  }

  if (possibleHomelands == null || possibleHomelands.length === 0) {
    // fallback to any land if no alignment match in radius 3 and 4
    if (freeToBuildLands.length === 0) {
      homeland = getRandomElement(
        getLands({
          gameState: gameState,
          players: [NO_PLAYER.id],
          landAlignment: owner.getAlignment(),
        })
      );
    } else {
      homeland = gameState.battlefield.lands[getRandomElement(freeToBuildLands)];
    }
  } else {
    homeland = getRandomElement(possibleHomelands);
  }

  // add money to able construct base STRONGHOLD and BARRACKS
  getTurnOwner(gameState)!.vault +=
    getBuilding(BuildingType.STRONGHOLD).buildCost + getBuilding(BuildingType.BARRACKS).buildCost;
  // Place Strong into homeland first
  construct(gameState, BuildingType.STRONGHOLD, homeland.mapPos);

  // Place Barracks on the same alignment land except homeland
  let possibleBarracksLands = getLands({
    gameState: gameState,
    players: [gameState.turnOwner],
    landAlignment: owner.getAlignment(),
    buildings: [],
  });
  if (possibleBarracksLands.length === 0) {
    // fall back to any land if no alignment match
    possibleBarracksLands = getLands({
      gameState: gameState,
      players: [gameState.turnOwner],
      buildings: [],
    });
  }
  construct(gameState, BuildingType.BARRACKS, getRandomElement(possibleBarracksLands).mapPos);

  assignPlayerHero(homeland, gameState!);
};
