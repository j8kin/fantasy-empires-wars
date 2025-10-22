import { calculateIncome } from '../map/gold/calculateIncome';
import { battlefieldLandId, GameState } from '../types/GameState';
import { generateMockMap } from './utils/generateMockMap';
import { BuildingType, getBuilding } from '../types/Building';
import { getLandById, LAND_TYPE } from '../types/Land';
import { createGameStateStub, defaultBattlefieldSizeStub } from './utils/createGameStateStub';

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

  it.each([
    ['100%', 5, 100], // only one land
    ['90%', 6, 190], // the second land with 10% penalty
    ['80%', 7, 180], // the second land with 20% penalty
    ['0%', 8, 100], // the second land with 100% penalty
  ])(
    'Calculate income with penalty if it is not stronghold land (%s)',
    (penalty, landCol, expected) => {
      // stronghold
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 5 })].controlledBy =
        lawfulPlayer.id;
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 5 })].goldPerTurn = 100;
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 5 })].buildings = [
        getBuilding(BuildingType.STRONGHOLD),
      ];

      // additional land (should be calculated with penalty
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: landCol })].controlledBy =
        lawfulPlayer.id;
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: landCol })].goldPerTurn =
        100;

      const income = calculateIncome(gameStateStub);

      expect(income).toBe(expected);
    }
  );

  it('2 lands with strongholds', () => {
    // stronghold 1
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 5 })].controlledBy =
      lawfulPlayer.id;
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 5 })].goldPerTurn = 100;
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 5 })].buildings = [
      getBuilding(BuildingType.STRONGHOLD),
    ];

    // stronghold 2 - penalty from this one should be applied
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 8 })].controlledBy =
      lawfulPlayer.id;
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 8 })].goldPerTurn = 100;
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 8 })].buildings = [
      getBuilding(BuildingType.STRONGHOLD),
    ];

    const income = calculateIncome(gameStateStub);
    expect(income).toBe(200);
  });

  it('Calculate income based on nearest stronghold', () => {
    // land without stronghold
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 7 })].controlledBy =
      lawfulPlayer.id;
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 7 })].goldPerTurn = 100;

    // stronghold 1
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 5 })].controlledBy =
      lawfulPlayer.id;
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 5 })].goldPerTurn = 100;
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 5 })].buildings = [
      getBuilding(BuildingType.STRONGHOLD),
    ];

    // stronghold 2 - penalty from this one should be applied
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 8 })].controlledBy =
      lawfulPlayer.id;
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 8 })].goldPerTurn = 100;
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 5, col: 8 })].buildings = [
      getBuilding(BuildingType.STRONGHOLD),
    ];

    const income = calculateIncome(gameStateStub);
    expect(income).toBe(290);
  });

  it.each([
    [lawfulPlayer, LAND_TYPE.PLAINS, 100],
    [lawfulPlayer, LAND_TYPE.VOLCANO, 90],
    [lawfulPlayer, LAND_TYPE.MOUNTAINS, 130],
    [chaoticPlayer, LAND_TYPE.PLAINS, 100],
    [chaoticPlayer, LAND_TYPE.VOLCANO, 200],
    [chaoticPlayer, LAND_TYPE.MOUNTAINS, 0],
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

  it.each([
    [lawfulPlayer, LAND_TYPE.PLAINS, 190],
    [lawfulPlayer, LAND_TYPE.VOLCANO, 181],
    [lawfulPlayer, LAND_TYPE.MOUNTAINS, 217],
    [chaoticPlayer, LAND_TYPE.PLAINS, 190],
    [chaoticPlayer, LAND_TYPE.VOLCANO, 280],
    [chaoticPlayer, LAND_TYPE.MOUNTAINS, 100],
    // no alignment penalty for neutral player
    [neutralPlayer, LAND_TYPE.PLAINS, 190],
    [neutralPlayer, LAND_TYPE.VOLCANO, 190],
    [neutralPlayer, LAND_TYPE.MOUNTAINS, 190],
  ])(`Both penalties are taking in acount`, (player, land, expected) => {
    gameStateStub.turnOwner = player.id;

    // add different type land in the stronghold radius to demonstrate different income calculations
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 4, col: 4 })].controlledBy = player.id;
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 4, col: 4 })].goldPerTurn = 100;
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 4, col: 4 })].buildings = [
      getBuilding(BuildingType.STRONGHOLD),
    ];
    // additionl land with different type of Lands and both penalties should be applied
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 4, col: 5 })].land = getLandById(land);
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 4, col: 5 })].goldPerTurn = 100;
    gameStateStub.battlefield.lands[battlefieldLandId({ row: 4, col: 5 })].controlledBy = player.id;

    const income = calculateIncome(gameStateStub);
    expect(income).toBe(expected);
  });
});
