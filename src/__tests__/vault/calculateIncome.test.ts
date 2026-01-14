import { getLandId } from '../../state/map/land/LandId';
import { addPlayerToGameState } from '../../systems/playerActions';
import { addPlayerEmpireTreasure, addPlayerLand } from '../../systems/gameStateActions';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { buildingFactory } from '../../factories/buildingFactory';
import { getLandById } from '../../domain/land/landRepository';
import { construct } from '../../map/building/construct';
import { calculateIncome } from '../../map/vault/calculateIncome';
import { getMapDimensions } from '../../utils/screenPositionUtils';
import { itemFactory } from '../../factories/treasureFactory';
import { invokeItem } from '../../map/magic/invokeItem';
import { calculateHexDistance, getLandOwner, getPlayerLands } from '../../selectors/landSelectors';
import { NO_PLAYER, PREDEFINED_PLAYERS } from '../../domain/player/playerRepository';
import { BuildingName } from '../../types/Building';
import { LandName } from '../../types/Land';
import { Alignment } from '../../types/Alignment';
import { TreasureName } from '../../types/Treasures';
import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { PlayerProfile } from '../../state/player/PlayerProfile';
import type { AlignmentType } from '../../types/Alignment';

import { createGameStateStub } from '../utils/createGameStateStub';
import { generateMockMap } from '../utils/generateMockMap';

describe('Calculate Income', () => {
  let gameStateStub: GameState;

  const getPlayer = (alignment: AlignmentType): PlayerProfile => {
    switch (alignment) {
      case Alignment.LAWFUL:
        return PREDEFINED_PLAYERS[0]; // Alaric - LAWFUL
      case Alignment.NEUTRAL:
        return PREDEFINED_PLAYERS[2]; // Morgana - CHAOTIC
      case Alignment.CHAOTIC:
        return PREDEFINED_PLAYERS[1]; // Thorin - NEUTRAL
      default:
        throw new Error('Invalid player alignment');
    }
  };
  beforeEach(() => {
    // clear the map before each test
    gameStateStub = createGameStateStub({ addPlayersHomeland: false, nPlayers: 0 });
  });

  it.each([
    [Alignment.CHAOTIC, Alignment.CHAOTIC, 1102], //(1*1*100 + 6*0.8*100)*1.9 = 1102
    [Alignment.CHAOTIC, Alignment.NEUTRAL, 580], //(1*1*100 + 6*0.8*100)*1 = 640
    [Alignment.CHAOTIC, Alignment.LAWFUL, 290], //(1*1*100 + 6*0.8*100)*0.5 = 320
    [Alignment.NEUTRAL, Alignment.NEUTRAL, 700], // 7*100 = 700
    [Alignment.NEUTRAL, Alignment.LAWFUL, 700], // Neutral players don't have neither benefits
    [Alignment.NEUTRAL, Alignment.CHAOTIC, 700], //  nor penalties from alignment
    [Alignment.LAWFUL, Alignment.CHAOTIC, 560], //(7*1*100)*0.8 = 560
    [Alignment.LAWFUL, Alignment.NEUTRAL, 700], //(7*1*100)*1 = 700
    [Alignment.LAWFUL, Alignment.LAWFUL, 980], //(7*1*100)*1.4 = 980
  ])(
    'Calculate income for player with alignment %s in %s land alignment',
    (playerAlignment: AlignmentType, allLandsAlignment: AlignmentType, expectedIncome: number) => {
      gameStateStub.map = generateMockMap(getMapDimensions(gameStateStub), allLandsAlignment, 100);
      addPlayerToGameState(gameStateStub, getPlayer(playerAlignment), 'human');
      gameStateStub.players[0].vault = 1000000;
      construct(gameStateStub, BuildingName.STRONGHOLD, { row: 3, col: 3 });

      expect(getPlayerLands(gameStateStub)).toHaveLength(7);
      expect(calculateIncome(gameStateStub)).toBe(expectedIncome);
    }
  );

  it.each([
    [Alignment.LAWFUL, 598, 578], // CORRUPTED has negative effect
    [Alignment.NEUTRAL, 598, 598], // CORRUPTED has NO effect
    [Alignment.CHAOTIC, 502, 592], // CORRUPTED has positive effect
  ])(
    'CORRUPTED Land treated as CHAOTIC Land type and has affect for %s player',
    (pAlignment: AlignmentType, incomeBefore: number, incomeAfter: number) => {
      const player = getPlayer(pAlignment);
      addPlayerToGameState(gameStateStub, player, 'human');
      gameStateStub.map.lands[getLandId({ row: 4, col: 4 })].land = getLandById(LandName.PLAINS);
      Object.assign(gameStateStub, addPlayerLand(gameStateStub, getTurnOwner(gameStateStub).id, { row: 4, col: 4 }));
      gameStateStub.map.lands[getLandId({ row: 4, col: 4 })].goldPerTurn = 100;

      gameStateStub.map.lands[getLandId({ row: 4, col: 4 })].buildings = [buildingFactory(BuildingName.STRONGHOLD)];

      let income = calculateIncome(gameStateStub);
      expect(income).toBe(incomeBefore);

      // set land to CORRUPTED
      gameStateStub.map.lands[getLandId({ row: 4, col: 4 })].corrupted = true;

      income = calculateIncome(gameStateStub);
      expect(income).toBe(incomeAfter); // treated as CHAOTIC Land type
    }
  );

  it('Land with DEED_OF_RECLAMATION effect treated as players land and generate income', () => {
    const homeLand: LandPosition = { row: 3, col: 3 };
    gameStateStub.map = generateMockMap(getMapDimensions(gameStateStub), Alignment.NEUTRAL, 100);
    addPlayerToGameState(gameStateStub, getPlayer(Alignment.NEUTRAL), 'human');
    gameStateStub.players[0].vault = 1000000;
    construct(gameStateStub, BuildingName.STRONGHOLD, homeLand);

    expect(getPlayerLands(gameStateStub)).toHaveLength(7);
    /********** VERIFY INCOME ************/
    expect(calculateIncome(gameStateStub)).toBe(700);
    /************************************/

    const deedOfReclamation = itemFactory(TreasureName.DEED_OF_RECLAMATION);
    Object.assign(gameStateStub, addPlayerEmpireTreasure(gameStateStub, gameStateStub.turnOwner, deedOfReclamation));
    const farLand: LandPosition = { row: 0, col: 3 };
    expect(getLandOwner(gameStateStub, farLand)).toBe(NO_PLAYER.id);
    expect(calculateHexDistance(getMapDimensions(gameStateStub), homeLand, farLand)).toBe(3);
    invokeItem(gameStateStub, deedOfReclamation.id, farLand);

    /********** VERIFY INCOME ************/
    expect(calculateIncome(gameStateStub)).toBe(700 + 100);
    /************************************/
  });

  describe('Corner cases', () => {
    it('No land owned', () => {
      addPlayerToGameState(gameStateStub, PREDEFINED_PLAYERS[0], 'human');
      expect(getPlayerLands(gameStateStub)).toHaveLength(0);
      expect(calculateIncome(gameStateStub)).toBe(0);
    });

    it('No owned strongholds', () => {
      addPlayerToGameState(gameStateStub, PREDEFINED_PLAYERS[0], 'human');
      Object.assign(gameStateStub, addPlayerLand(gameStateStub, getTurnOwner(gameStateStub).id, { row: 5, col: 5 }));
      expect(getPlayerLands(gameStateStub)).toHaveLength(1);

      expect(calculateIncome(gameStateStub)).toBe(0);
    });
  });
});
