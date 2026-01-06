import { getLandId } from '../../state/map/land/LandId';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { getPlayerLands, getTilesInRadius, hasBuilding } from '../../selectors/landSelectors';
import { hasLand } from '../../systems/playerActions';
import { levelUpHero } from '../../systems/unitsActions';
import { addArmyToGameState } from '../../systems/armyActions';
import { armyFactory } from '../../factories/armyFactory';
import { heroFactory } from '../../factories/heroFactory';
import { getRandomElement } from '../../domain/utils/random';
import { construct } from '../building/construct';
import { getMapDimensions } from '../../utils/screenPositionUtils';
import { BuildingName } from '../../types/Building';
import { Alignment } from '../../types/Alignment';
import type { GameState } from '../../state/GameState';
import type { LandState } from '../../state/map/land/LandState';
import type { MapDimensions } from '../../state/map/MapDimensions';

const assignPlayerHero = (homeland: LandState, gameState: GameState) => {
  const player = getTurnOwner(gameState);
  const playerProfile = player.playerProfile;
  const hero = heroFactory(playerProfile.type, playerProfile.name);
  while (hero.level < playerProfile.level) levelUpHero(hero, playerProfile.alignment);
  // initial Hero immediately available. In a normal game it tacks 3 turns to recruit
  const heroArmy = armyFactory(player.id, homeland.mapPos, { heroes: [hero] });
  Object.assign(gameState, addArmyToGameState(gameState, heroArmy));
};

const isNotBorderLand = (landId: string, dimensions: MapDimensions): boolean => {
  return (
    !landId.startsWith('0-') &&
    !landId.startsWith('1-') &&
    !landId.startsWith(`${dimensions.rows - 1}-`) &&
    !landId.startsWith(`${dimensions.rows - 2}-`) &&
    !landId.endsWith('-0') &&
    !landId.endsWith('-1') &&
    !landId.endsWith(`-${dimensions.cols - 1}`) &&
    !landId.endsWith(`-${dimensions.cols - 2}`)
  );
};

export const placeHomeland = (gameState: GameState) => {
  const turnOwner = getTurnOwner(gameState);
  const playerProfile = turnOwner.playerProfile;

  let homeland: LandState;

  const existingPlayersHomelands = gameState.players
    .flatMap((p) => getPlayerLands(gameState, p.id))
    .filter((l) => hasBuilding(l, BuildingName.STRONGHOLD));

  // get all lands which are not in radius 4 from any player's homeland'
  let freeToBuildLands = Object.keys(gameState.map.lands).filter(
    (landId) =>
      // exclude border lands
      isNotBorderLand(landId, getMapDimensions(gameState)) &&
      !existingPlayersHomelands
        .flatMap((h) => getTilesInRadius(getMapDimensions(gameState), h.mapPos, 4, false))
        .map((tola) => getLandId(tola))
        .includes(landId)
  );

  if (freeToBuildLands.length === 0) {
    freeToBuildLands = Object.keys(gameState.map.lands).filter(
      (landId) =>
        // exclude border lands
        isNotBorderLand(landId, getMapDimensions(gameState)) &&
        !existingPlayersHomelands
          .flatMap((h) => getTilesInRadius(getMapDimensions(gameState), h.mapPos, 3, false))
          .map((tola) => getLandId(tola))
          .includes(landId)
    );
  }

  let possibleHomelands = freeToBuildLands
    .map((key) => gameState.map.lands[key])
    .filter((land) => land.land.alignment === playerProfile.alignment);

  if (possibleHomelands.length === 0) {
    possibleHomelands = freeToBuildLands
      .map((key) => gameState.map.lands[key])
      .filter((land) => land.land.alignment === Alignment.NEUTRAL);
  }

  if (possibleHomelands == null || possibleHomelands.length === 0) {
    // fallback to any land if no alignment match in radius 3 and 4
    if (freeToBuildLands.length === 0) {
      homeland = getRandomElement(
        Object.values(gameState.map.lands).filter(
          (l) =>
            gameState.players.every((p) => !hasLand(p, l.mapPos)) &&
            l.land.alignment === playerProfile.alignment
        )
      );
    } else {
      homeland = gameState.map.lands[getRandomElement(freeToBuildLands)];
    }
  } else {
    homeland = getRandomElement(possibleHomelands);
  }

  // Place Strong into homeland first
  construct(gameState, BuildingName.STRONGHOLD, homeland.mapPos);

  // Place Barracks on the same alignment land except homeland
  let possibleBarracksLands = getPlayerLands(gameState).filter(
    (l) => l.land.alignment === playerProfile.alignment && l.buildings.length === 0
  );
  if (possibleBarracksLands.length === 0) {
    // fall back to any land if no alignment match
    possibleBarracksLands = getPlayerLands(gameState).filter((l) => l.buildings.length === 0);
  }
  construct(gameState, BuildingName.BARRACKS, getRandomElement(possibleBarracksLands).mapPos);

  assignPlayerHero(homeland, gameState!);
};
