import { calculateIncome } from '../map/gold/calculateIncome';
import { battlefieldLandId, GameState, TurnPhase } from '../types/GameState';
import { generateMockMap } from './utils/generateMockMap';
import { BuildingType, getBuilding } from '../types/Building';
import { getLandById, LAND_TYPE } from '../types/Land';
import { createGameStateStub, defaultBattlefieldSizeStub } from './utils/createGameStateStub';
import { Alignment } from '../types/Alignment';
import { GamePlayer } from '../types/GamePlayer';
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
      lawfulPlayer.id;

    const income = calculateIncome(gameStateStub);
    expect(income).toBe(0);
  });

  // ... existing code ...
  const testCaseMap: [GamePlayer, Alignment, number][] = [
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
      name: `Calculate income for player with alignment ${player.alignment} in ${allLandsAlignment} land alignment`,
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
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 5 })].controlledBy =
        player.id;
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 5 })].goldPerTurn = 100;
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 5 })].buildings = [
        getBuilding(BuildingType.STRONGHOLD),
      ];

      // additional land (should be calculated with penalty
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: landCol })].controlledBy =
        player.id;
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: landCol })].goldPerTurn =
        100;

      const income = calculateIncome(gameStateStub);

      expect(income).toBe(expected);
    }
  );

  it.each([
    [lawfulPlayer, LAND_TYPE.PLAINS, 100],
    [lawfulPlayer, LAND_TYPE.VOLCANO, 80],
    [lawfulPlayer, LAND_TYPE.MOUNTAINS, 130],
    [chaoticPlayer, LAND_TYPE.PLAINS, 100],
    [chaoticPlayer, LAND_TYPE.VOLCANO, 200],
    [chaoticPlayer, LAND_TYPE.MOUNTAINS, 50],
    [neutralPlayer, LAND_TYPE.PLAINS, 100],
    [neutralPlayer, LAND_TYPE.VOLCANO, 100],
    [neutralPlayer, LAND_TYPE.MOUNTAINS, 100],
  ])(
    `Calculate income with land alignment penalty based on player's alignment`,
    (player, land, expected) => {
      gameStateStub.turnOwner = player.id;

      // add different type land in the stronghold radius to demonstrate different income calculations
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 4, col: 4 })].land =
        getLandById(land);
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 4, col: 4 })].controlledBy =
        player.id;
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 4, col: 4 })].goldPerTurn = 100;
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 4, col: 4 })].buildings = [
        getBuilding(BuildingType.STRONGHOLD),
      ];

      const income = calculateIncome(gameStateStub);
      expect(income).toBe(expected);
    }
  );
});
