import { getLandId } from '../state/map/land/LandId';
import { getPlayerLands } from '../selectors/playerSelectors';
import { getHostileLands, getLandOwner } from '../selectors/landSelectors';
import { heroFactory } from '../factories/heroFactory';
import { NO_PLAYER } from '../domain/player/playerRepository';

import { BuildingType } from '../types/Building';
import { HeroUnitType } from '../types/UnitType';
import { DiplomacyStatus } from '../types/Diplomacy';
import type { GameState } from '../state/GameState';
import type { LandPosition } from '../state/map/land/LandPosition';

import { placeUnitsOnMap } from './utils/placeUnitsOnMap';
import { createGameStateStub } from './utils/createGameStateStub';

describe('getHostileLands', () => {
  let gameStateStub: GameState;
  let homeLand: LandPosition;

  beforeEach(() => {
    gameStateStub = createGameStateStub({ nPlayers: 2 });
    homeLand = getPlayerLands(gameStateStub).find((l) =>
      l.buildings.some((b) => b.type === BuildingType.STRONGHOLD)
    )!.mapPos;
  });
  it('return no hostile lans when all armies are near strongholds', () => {
    expect(getHostileLands(gameStateStub)).toHaveLength(0);
  });

  it('return hostile lands when armies are not near strongholds', () => {
    const hostileLand = { row: homeLand.row + 2, col: homeLand.col + 2 };
    expect(getLandOwner(gameStateStub, hostileLand)).toBe(NO_PLAYER.id);
    placeUnitsOnMap(heroFactory(HeroUnitType.FIGHTER, 'Hero 1'), gameStateStub, hostileLand);

    /** SUT **/
    const hostileLands = getHostileLands(gameStateStub);

    expect(hostileLands).toHaveLength(1);
    expect(hostileLands[0].mapPos.row).toBe(hostileLand.row);
    expect(hostileLands[0].mapPos.col).toBe(hostileLand.col);
  });

  it('non-ally land treated as hostile land', () => {
    const hostileLand = getPlayerLands(gameStateStub, gameStateStub.players[1].id)[0].mapPos;
    expect(getLandOwner(gameStateStub, hostileLand)).toBe(gameStateStub.players[1].id);
    placeUnitsOnMap(heroFactory(HeroUnitType.FIGHTER, 'Hero 1'), gameStateStub, hostileLand);

    /** SUT **/
    const hostileLands = getHostileLands(gameStateStub);

    expect(hostileLands).toHaveLength(1);
    expect(hostileLands[0].mapPos.row).toBe(hostileLand.row);
    expect(hostileLands[0].mapPos.col).toBe(hostileLand.col);
  });

  it('ally land is not treated as hostile land', () => {
    gameStateStub.players[0].diplomacy[gameStateStub.players[1].id] = DiplomacyStatus.ALLIANCE;
    gameStateStub.players[1].diplomacy[gameStateStub.players[0].id] = DiplomacyStatus.ALLIANCE;

    const hostileLand = getPlayerLands(gameStateStub, gameStateStub.players[1].id)[0].mapPos;
    placeUnitsOnMap(heroFactory(HeroUnitType.FIGHTER, 'Hero 1'), gameStateStub, hostileLand);

    /** SUT **/
    const hostileLands = getHostileLands(gameStateStub);

    expect(hostileLands).toHaveLength(0);
  });

  it('lands too far from strongholds trod as hostile lands even if they are owned by player and have an army there', () => {
    const hostileLand = { row: homeLand.row + 2, col: homeLand.col + 2 };
    expect(getLandOwner(gameStateStub, hostileLand)).toBe(NO_PLAYER.id);
    gameStateStub.players[0].landsOwned.add(getLandId(hostileLand));
    expect(getLandOwner(gameStateStub, hostileLand)).toBe(gameStateStub.players[0].id);

    placeUnitsOnMap(heroFactory(HeroUnitType.FIGHTER, 'Hero 1'), gameStateStub, hostileLand);

    /** SUT **/
    const hostileLands = getHostileLands(gameStateStub);

    expect(hostileLands).toHaveLength(1);
    expect(hostileLands[0].mapPos.row).toBe(hostileLand.row);
    expect(hostileLands[0].mapPos.col).toBe(hostileLand.col);
  });

  it('lands too far from strongholds trod as hostile lands even if they are owned by player and have no army there', () => {
    const hostileLand = { row: homeLand.row + 2, col: homeLand.col + 2 };
    expect(getLandOwner(gameStateStub, hostileLand)).toBe(NO_PLAYER.id);
    gameStateStub.players[0].landsOwned.add(getLandId(hostileLand));
    expect(getLandOwner(gameStateStub, hostileLand)).toBe(gameStateStub.players[0].id);

    /** SUT **/
    const hostileLands = getHostileLands(gameStateStub);

    expect(hostileLands).toHaveLength(1);
    expect(hostileLands[0].mapPos.row).toBe(hostileLand.row);
    expect(hostileLands[0].mapPos.col).toBe(hostileLand.col);
  });
});
