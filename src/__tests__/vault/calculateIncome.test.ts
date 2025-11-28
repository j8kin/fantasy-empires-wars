import { calculateIncome } from '../../map/vault/calculateIncome';
import { GameState } from '../../state/GameState';

import { addLand, addPlayer } from '../../systems/playerActions';
import { getTurnOwner } from '../../selectors/playerSelectors';

import { BuildingType, getBuilding } from '../../types/Building';
import { getLandById, LandType } from '../../types/Land';
import { Alignment } from '../../types/Alignment';

import { construct } from '../../map/building/construct';

import { createGameStateStub, defaultBattlefieldSizeStub } from '../utils/createGameStateStub';
import { generateMockMap } from '../utils/generateMockMap';
import { PREDEFINED_PLAYERS } from '../../data/players/predefinedPlayers';
import { PlayerProfile } from '../../state/player/PlayerProfile';
import { getLandId } from '../../state/map/land/LandId';
import { gameStateFactory } from '../../factories/gameStateFactory';

describe('Calculate Income', () => {
  let gameStateStub: GameState;

  const getPlayer = (alignment: Alignment): PlayerProfile => {
    switch (alignment) {
      case Alignment.LAWFUL:
        return PREDEFINED_PLAYERS[0]; // Alaric - LAWFUL
      case Alignment.NEUTRAL:
        return PREDEFINED_PLAYERS[2]; // Morgana - CHAOTIC
      case Alignment.CHAOTIC:
        return PREDEFINED_PLAYERS[1]; // Thorin - NEUTRAL
    }
  };
  beforeEach(() => {
    // clear the map before each test
    gameStateStub = createGameStateStub({ addPlayersHomeland: false, nPlayers: 0 });
  });

  it('No land owned', () => {
    addPlayer(gameStateStub, PREDEFINED_PLAYERS[0], 'human');
    const income = calculateIncome(gameStateStub);
    expect(income).toBe(0);
  });

  it('Corner case: No owned strongholds', () => {
    addPlayer(gameStateStub, PREDEFINED_PLAYERS[0], 'human');
    addLand(getTurnOwner(gameStateStub), { row: 5, col: 5 });

    const income = calculateIncome(gameStateStub);
    expect(income).toBe(0);
  });

  it.each([
    [Alignment.CHAOTIC, Alignment.CHAOTIC, 1160],
    [Alignment.CHAOTIC, Alignment.NEUTRAL, 580],
    [Alignment.CHAOTIC, Alignment.LAWFUL, 290],
    [Alignment.NEUTRAL, Alignment.CHAOTIC, 700],
    [Alignment.NEUTRAL, Alignment.NEUTRAL, 700],
    [Alignment.NEUTRAL, Alignment.LAWFUL, 700],
    [Alignment.LAWFUL, Alignment.CHAOTIC, 560],
    [Alignment.LAWFUL, Alignment.NEUTRAL, 700],
    [Alignment.LAWFUL, Alignment.LAWFUL, 910],
  ])(
    'Calculate income for player with alignment %s in %s land alignment',
    (playerAlignment: Alignment, allLandsAlignment: Alignment, expectedIncome: number) => {
      const player = getPlayer(playerAlignment);

      gameStateStub = gameStateFactory(
        generateMockMap(defaultBattlefieldSizeStub, allLandsAlignment, 100)
      );
      addPlayer(gameStateStub, player, 'human');
      // add stronghold
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
      const income = calculateIncome(gameStateStub);
      expect(income).toBe(expectedIncome);
    }
  );

  it.each([
    ['100%', Alignment.LAWFUL, 5, 100], // only one land
    ['100%', Alignment.LAWFUL, 6, 200], // the second land with 10% penalty
    ['0%', Alignment.LAWFUL, 7, 100], // the second land with 0% penalty
    ['100%', Alignment.NEUTRAL, 5, 100], // only one land
    ['100%', Alignment.NEUTRAL, 6, 200], // the second land with 0% penalty
    ['0%', Alignment.NEUTRAL, 7, 100], // the second land with 100% penalty
    ['100%', Alignment.CHAOTIC, 5, 100], // only one land
    ['80%', Alignment.CHAOTIC, 6, 180], // the second land with 20% penalty
    ['0%', Alignment.CHAOTIC, 7, 100], // the second land with 100% penalty
  ])(
    'Calculate income with penalty (%s) if it is not stronghold land and Player has %s alignment',
    (penalty: string, playerAlignment: Alignment, landCol: number, expected: number) => {
      const player = getPlayer(playerAlignment);

      addPlayer(gameStateStub, player, 'human');

      // stronghold
      addLand(getTurnOwner(gameStateStub), { row: 5, col: 5 });
      gameStateStub.map.lands[getLandId({ row: 5, col: 5 })].goldPerTurn = 100;
      gameStateStub.map.lands[getLandId({ row: 5, col: 5 })].buildings = [
        getBuilding(BuildingType.STRONGHOLD),
      ];

      // additional land (should be calculated with penalty
      addLand(getTurnOwner(gameStateStub), { row: 5, col: landCol });
      gameStateStub.map.lands[getLandId({ row: 5, col: landCol })].goldPerTurn = 100;

      const income = calculateIncome(gameStateStub);

      expect(income).toBe(expected);
    }
  );

  it.each([
    [Alignment.LAWFUL, LandType.PLAINS, 100],
    [Alignment.LAWFUL, LandType.VOLCANO, 80],
    [Alignment.LAWFUL, LandType.MOUNTAINS, 130],
    [Alignment.CHAOTIC, LandType.PLAINS, 100],
    [Alignment.CHAOTIC, LandType.VOLCANO, 200],
    [Alignment.CHAOTIC, LandType.MOUNTAINS, 50],
    [Alignment.NEUTRAL, LandType.PLAINS, 100],
    [Alignment.NEUTRAL, LandType.VOLCANO, 100],
    [Alignment.NEUTRAL, LandType.MOUNTAINS, 100],
  ])(
    `Calculate income with land alignment penalty based on player's alignment`,
    (playerAlignment: Alignment, land, expected) => {
      const player = getPlayer(playerAlignment);

      addPlayer(gameStateStub, player, 'human');

      // add different type land in the stronghold radius to demonstrate different income calculations
      gameStateStub.map.lands[getLandId({ row: 4, col: 4 })].land = getLandById(land);
      addLand(getTurnOwner(gameStateStub), { row: 4, col: 4 });
      gameStateStub.map.lands[getLandId({ row: 4, col: 4 })].goldPerTurn = 100;
      gameStateStub.map.lands[getLandId({ row: 4, col: 4 })].buildings = [
        getBuilding(BuildingType.STRONGHOLD),
      ];

      const income = calculateIncome(gameStateStub);
      expect(income).toBe(expected);
    }
  );
});
