import { calculateIncome } from '../map/gold/calculateIncome';
import { battlefieldLandId, GameState, TurnPhase } from '../types/GameState';
import { generateMockMap } from './utils/generateMockMap';
import { BuildingType, getBuilding } from '../types/Building';
import { getLandById, LandType } from '../types/Land';
import { createGameStateStub, defaultBattlefieldSizeStub } from './utils/createGameStateStub';
import { Alignment } from '../types/Alignment';
import { PlayerState } from '../types/GamePlayer';
import { construct } from '../map/building/construct';

describe('Calculate Income', () => {
  const gameStateStub: GameState = createGameStateStub({ addPlayersHomeland: false });
  const lawfulPlayer = gameStateStub.players[0];
  const chaoticPlayer = gameStateStub.players[1];
  const neutralPlayer = gameStateStub.players[2];

  beforeEach(() => {
    // clear the map before each test
    gameStateStub.battlefield = generateMockMap(defaultBattlefieldSizeStub);
  });

  it('No land owned', () => {
    const income = calculateIncome(gameStateStub);
    expect(income).toBe(0);
  });

  it('Corner case: No owned strongholds', () => {
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 5 })].controlledBy =
      lawfulPlayer.playerId;

    const income = calculateIncome(gameStateStub);
    expect(income).toBe(0);
  });

  // ... existing code ...
  const testCaseMap: [PlayerState, Alignment, number][] = [
    [chaoticPlayer, Alignment.CHAOTIC, 1160],
    [chaoticPlayer, Alignment.NEUTRAL, 580],
    [chaoticPlayer, Alignment.LAWFUL, 290],
    [neutralPlayer, Alignment.CHAOTIC, 700],
    [neutralPlayer, Alignment.NEUTRAL, 700],
    [neutralPlayer, Alignment.LAWFUL, 700],
    [lawfulPlayer, Alignment.CHAOTIC, 560],
    [lawfulPlayer, Alignment.NEUTRAL, 700],
    [lawfulPlayer, Alignment.LAWFUL, 910],
  ];

  it.each(
    testCaseMap.map(([player, allLandsAlignment, expectedIncome]) => ({
      player,
      allLandsAlignment,
      expectedIncome,
      name: `Calculate income for player with alignment ${player.getAlignment()} in ${allLandsAlignment} land alignment`,
    }))
  )(
    '$name', // Use the pre-generated test name
    ({ player, allLandsAlignment, expectedIncome }) => {
      gameStateStub.battlefield = generateMockMap(
        defaultBattlefieldSizeStub,
        allLandsAlignment,
        100
      );
      gameStateStub.turnPhase = TurnPhase.MAIN;
      gameStateStub.turnOwner = player.playerId;
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

      gameStateStub.turnOwner = player.playerId;
      // stronghold
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 5 })].controlledBy =
        player.playerId;
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 5 })].goldPerTurn = 100;
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 5 })].buildings = [
        getBuilding(BuildingType.STRONGHOLD),
      ];

      // additional land (should be calculated with penalty
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: landCol })].controlledBy =
        player.playerId;
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: landCol })].goldPerTurn =
        100;

      const income = calculateIncome(gameStateStub);

      expect(income).toBe(expected);
    }
  );

  it.each([
    [lawfulPlayer, LandType.PLAINS, 100],
    [lawfulPlayer, LandType.VOLCANO, 80],
    [lawfulPlayer, LandType.MOUNTAINS, 130],
    [chaoticPlayer, LandType.PLAINS, 100],
    [chaoticPlayer, LandType.VOLCANO, 200],
    [chaoticPlayer, LandType.MOUNTAINS, 50],
    [neutralPlayer, LandType.PLAINS, 100],
    [neutralPlayer, LandType.VOLCANO, 100],
    [neutralPlayer, LandType.MOUNTAINS, 100],
  ])(
    `Calculate income with land alignment penalty based on player's alignment`,
    (player, land, expected) => {
      gameStateStub.turnOwner = player.playerId;

      // add different type land in the stronghold radius to demonstrate different income calculations
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 4, col: 4 })].land =
        getLandById(land);
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 4, col: 4 })].controlledBy =
        player.playerId;
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 4, col: 4 })].goldPerTurn = 100;
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 4, col: 4 })].buildings = [
        getBuilding(BuildingType.STRONGHOLD),
      ];

      const income = calculateIncome(gameStateStub);
      expect(income).toBe(expected);
    }
  );
});
