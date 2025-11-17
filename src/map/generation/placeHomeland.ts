import { battlefieldLandId, GameState, getTurnOwner, LandState } from '../../types/GameState';
import { NO_PLAYER } from '../../types/GamePlayer';
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
  const hero = getDefaultUnit(player.type) as HeroUnit;
  hero.name = player.name;
  hero.level = player.level - 1; // levelUpHero will increment level
  // increment characteristics
  levelUpHero(hero, player);
  // initial Hero immediately available in normal game it turn 3 turn to recruit#
  getLand(gameState, homeland.mapPos).army.push({ units: [hero], controlledBy: player.id });
};

export const placeHomeland = (gameState: GameState) => {
  const owner = getTurnOwner(gameState)!;

  let homeland: LandState;

  const existingPlayersHomelands = getLands({
    lands: gameState.battlefield.lands,
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
        .map((tola) => battlefieldLandId(tola))
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
          .map((tola) => battlefieldLandId(tola))
          .includes(landId)
    );
  }

  let possibleHomelands = freeToBuildLands
    .map((key) => gameState.battlefield.lands[key])
    .filter((land) => land.land.alignment === owner.alignment);

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
          lands: gameState.battlefield.lands,
          players: [NO_PLAYER.id],
          landAlignment: owner.alignment,
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
    lands: gameState.battlefield.lands,
    players: [gameState.turnOwner],
    landAlignment: owner.alignment,
    buildings: [],
  });
  if (possibleBarracksLands.length === 0) {
    // fall back to any land if no alignment match
    possibleBarracksLands = getLands({
      lands: gameState.battlefield.lands,
      players: [gameState.turnOwner],
      buildings: [],
    });
  }
  construct(gameState, BuildingType.BARRACKS, getRandomElement(possibleBarracksLands).mapPos);

  assignPlayerHero(homeland, gameState!);
};
