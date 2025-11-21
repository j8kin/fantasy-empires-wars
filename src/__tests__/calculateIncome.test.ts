import { calculateIncome } from '../map/gold/calculateIncome';
import { GameState, getTurnOwner, TurnPhase } from '../state/GameState';
import { getLandId } from '../state/LandState';
import { PlayerState } from '../state/PlayerState';

import { BuildingType, getBuilding } from '../types/Building';
import { getLandById, LandType } from '../types/Land';
import { Alignment } from '../types/Alignment';

import { construct } from '../map/building/construct';

import { createGameStateStub, defaultBattlefieldSizeStub } from './utils/createGameStateStub';
import { generateMockMap } from './utils/generateMockMap';

describe('Calculate Income', () => {
  let gameStateStub: GameState;
  let lawfulPlayer: PlayerState;
  let chaoticPlayer: PlayerState;
  let neutralPlayer: PlayerState;

  beforeEach(() => {
    // clear the map before each test
    gameStateStub = createGameStateStub({ addPlayersHomeland: false });

    lawfulPlayer = gameStateStub.players[0];
    chaoticPlayer = gameStateStub.players[1];
    neutralPlayer = gameStateStub.players[2];
  });

  it('No land owned', () => {
    const income = calculateIncome(gameStateStub);
    expect(income).toBe(0);
  });

  it('Corner case: No owned strongholds', () => {
    lawfulPlayer.addLand(getLandId({ row: 5, col: 5 }));

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
      const player =
        playerAlignment === Alignment.LAWFUL
          ? lawfulPlayer
          : playerAlignment === Alignment.NEUTRAL
            ? neutralPlayer
            : chaoticPlayer;

      gameStateStub.battlefield = generateMockMap(
        defaultBattlefieldSizeStub,
        allLandsAlignment,
        100
      );
      gameStateStub.turnPhase = TurnPhase.MAIN;
      gameStateStub.turnOwner = player.id;
      // add stronghold
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
      const income = calculateIncome(gameStateStub);
      expect(income).toBe(expectedIncome);
    }
  );

  it.each([
    ['100%', 5, 100, Alignment.LAWFUL], // only one land
    ['100%', 6, 200, Alignment.LAWFUL], // the second land with 10% penalty
    ['0%', 7, 100, Alignment.LAWFUL], // the second land with 0% penalty
    ['100%', 5, 100, Alignment.NEUTRAL], // only one land
    ['100%', 6, 200, Alignment.NEUTRAL], // the second land with 0% penalty
    ['0%', 7, 100, Alignment.NEUTRAL], // the second land with 100% penalty
    ['100%', 5, 100, Alignment.CHAOTIC], // only one land
    ['80%', 6, 180, Alignment.CHAOTIC], // the second land with 20% penalty
    ['0%', 7, 100, Alignment.CHAOTIC], // the second land with 100% penalty
  ])(
    'Calculate income with penalty if it is not stronghold land (%s)',
    (penalty, landCol, expected, playerAlignment) => {
      const player =
        playerAlignment === Alignment.LAWFUL
          ? lawfulPlayer
          : playerAlignment === Alignment.NEUTRAL
            ? neutralPlayer
            : chaoticPlayer;

      gameStateStub.turnOwner = player.id;
      // stronghold
      getTurnOwner(gameStateStub)!.addLand(getLandId({ row: 5, col: 5 }));
      gameStateStub.battlefield.lands[getLandId({ row: 5, col: 5 })].goldPerTurn = 100;
      gameStateStub.battlefield.lands[getLandId({ row: 5, col: 5 })].buildings = [
        getBuilding(BuildingType.STRONGHOLD),
      ];

      // additional land (should be calculated with penalty
      player.addLand(getLandId({ row: 5, col: landCol }));
      gameStateStub.battlefield.lands[getLandId({ row: 5, col: landCol })].goldPerTurn = 100;

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
      const player =
        playerAlignment === Alignment.LAWFUL
          ? lawfulPlayer
          : playerAlignment === Alignment.NEUTRAL
            ? neutralPlayer
            : chaoticPlayer;

      gameStateStub.turnOwner = player.id;

      // add different type land in the stronghold radius to demonstrate different income calculations
      gameStateStub.battlefield.lands[getLandId({ row: 4, col: 4 })].land = getLandById(land);
      player.addLand(getLandId({ row: 4, col: 4 }));
      gameStateStub.battlefield.lands[getLandId({ row: 4, col: 4 })].goldPerTurn = 100;
      gameStateStub.battlefield.lands[getLandId({ row: 4, col: 4 })].buildings = [
        getBuilding(BuildingType.STRONGHOLD),
      ];

      const income = calculateIncome(gameStateStub);
      expect(income).toBe(expected);
    }
  );
});
