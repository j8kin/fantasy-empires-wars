import { GameState } from '../../types/GameState';
import { PlayerState, PlayerProfile, PREDEFINED_PLAYERS } from '../../types/PlayerState';
import { getManaSource, ManaType } from '../../types/Mana';
import { createGameStateStub } from '../utils/createGameStateStub';
import { HeroUnit, HeroUnitType } from '../../types/Army';
import { getLandById, getSpecialLandTypes, LandType } from '../../types/Land';
import { getLand, getLands } from '../../map/utils/getLands';
import { BuildingType } from '../../types/Building';
import { TestTurnManagement } from '../utils/TestTurnManagement';
import { relicts, TreasureItem } from '../../types/Treasures';

describe('Calculate Mana', () => {
  let testTurnManagement: TestTurnManagement;
  let gameStateStub: GameState;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    testTurnManagement = new TestTurnManagement();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  const expectedMana = (manaType: ManaType, mana: number, playerId: number = 0): void => {
    expect(gameStateStub.players[playerId].mana[manaType]).toBe(mana);
    Object.values(ManaType)
      .filter((m) => m !== manaType)
      .forEach((m) => {
        expect(gameStateStub.players[playerId].mana[m]).toBe(0);
      });
  };

  describe('only one initial mage', () => {
    it.each([
      [HeroUnitType.NECROMANCER, ManaType.BLACK, PREDEFINED_PLAYERS[1], 7],
      [HeroUnitType.CLERIC, ManaType.WHITE, PREDEFINED_PLAYERS[6], 6],
      [HeroUnitType.ENCHANTER, ManaType.BLUE, PREDEFINED_PLAYERS[7], 7],
      [HeroUnitType.DRUID, ManaType.GREEN, PREDEFINED_PLAYERS[12], 7],
      [HeroUnitType.PYROMANCER, ManaType.RED, PREDEFINED_PLAYERS[14], 6],
    ])(
      '%s produce only %s mana',
      (heroType: HeroUnitType, manaType: ManaType, player: PlayerProfile, inc: number) => {
        expect(player.type).toBe(heroType);

        const players = [player, PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[13]];
        gameStateStub = createGameStateStub({ gamePlayers: players });
        gameStateStub.turn = 2;
        testTurnManagement.setGameState(gameStateStub);
        testTurnManagement.startNewTurn(gameStateStub);

        testTurnManagement.waitStartPhaseComplete();

        expectedMana(manaType, inc);

        testTurnManagement.makeNTurns(1);

        expectedMana(manaType, (gameStateStub.turn - 1) * inc);
      }
    );

    describe.each([
      [HeroUnitType.NECROMANCER, ManaType.BLACK, PREDEFINED_PLAYERS[1], 7],
      [HeroUnitType.CLERIC, ManaType.WHITE, PREDEFINED_PLAYERS[6], 6],
      [HeroUnitType.ENCHANTER, ManaType.BLUE, PREDEFINED_PLAYERS[7], 7],
      [HeroUnitType.DRUID, ManaType.GREEN, PREDEFINED_PLAYERS[12], 7],
      [HeroUnitType.PYROMANCER, ManaType.RED, PREDEFINED_PLAYERS[14], 6],
    ])(
      'special land has no effect if player (%s) not own them',
      (heroType: HeroUnitType, manaType: ManaType, player: PlayerProfile, inc: number) => {
        it.each(getSpecialLandTypes())('%s not add mana in mana pool', (landType: LandType) => {
          expect(player.type).toBe(heroType);

          const players = [player, PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[13]];
          gameStateStub = createGameStateStub({ gamePlayers: players });
          const homeLand = getLands({
            gameState: gameStateStub,
            players: [gameStateStub.turnOwner],
            buildings: [BuildingType.STRONGHOLD],
          })[0];
          const specialLand = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 2 }; // outside player land
          getLand(gameStateStub, specialLand).land = getLandById(landType);
          gameStateStub.turn = 2;
          testTurnManagement.setGameState(gameStateStub);
          testTurnManagement.startNewTurn(gameStateStub);
          testTurnManagement.waitStartPhaseComplete();

          expectedMana(manaType, inc);

          testTurnManagement.makeNTurns(1);

          expectedMana(manaType, (gameStateStub.turn - 1) * inc);
        });
      }
    );

    describe.each([
      [HeroUnitType.NECROMANCER, ManaType.BLACK, PREDEFINED_PLAYERS[1], 7],
      [HeroUnitType.CLERIC, ManaType.WHITE, PREDEFINED_PLAYERS[6], 6],
      [HeroUnitType.ENCHANTER, ManaType.BLUE, PREDEFINED_PLAYERS[7], 7],
      [HeroUnitType.DRUID, ManaType.GREEN, PREDEFINED_PLAYERS[12], 7],
      [HeroUnitType.PYROMANCER, ManaType.RED, PREDEFINED_PLAYERS[14], 6],
    ])(
      'special land has no effect if other player then current (%s) own it',
      (heroType: HeroUnitType, manaType: ManaType, player: PlayerProfile, inc: number) => {
        it.each(getSpecialLandTypes())('%s not add mana in mana pool', (landType: LandType) => {
          expect(player.type).toBe(heroType);

          const players = [player, PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[13]];
          gameStateStub = createGameStateStub({ gamePlayers: players });
          const homeLandPlayer2 = getLands({
            gameState: gameStateStub,
            players: [PREDEFINED_PLAYERS[13].id],
            buildings: [BuildingType.STRONGHOLD],
          })[0];
          const specialLand = {
            row: homeLandPlayer2.mapPos.row,
            col: homeLandPlayer2.mapPos.col + 1,
          }; // player 2 land
          getLand(gameStateStub, specialLand).land = getLandById(landType);
          gameStateStub.turn = 2;
          testTurnManagement.setGameState(gameStateStub);
          testTurnManagement.startNewTurn(gameStateStub);
          testTurnManagement.waitStartPhaseComplete();

          expectedMana(manaType, inc);

          testTurnManagement.makeNTurns(1);

          expectedMana(manaType, (gameStateStub.turn - 1) * inc);
        });
      }
    );

    describe.each([
      [HeroUnitType.NECROMANCER, ManaType.BLACK, PREDEFINED_PLAYERS[1], 7],
      [HeroUnitType.CLERIC, ManaType.WHITE, PREDEFINED_PLAYERS[6], 6],
      [HeroUnitType.ENCHANTER, ManaType.BLUE, PREDEFINED_PLAYERS[7], 7],
      [HeroUnitType.DRUID, ManaType.GREEN, PREDEFINED_PLAYERS[12], 7],
      [HeroUnitType.PYROMANCER, ManaType.RED, PREDEFINED_PLAYERS[14], 6],
    ])(
      'special land has effect if player (%s) own it and has hero of the related type',
      (heroType: HeroUnitType, manaType: ManaType, player: PlayerProfile, inc: number) => {
        it.each(getSpecialLandTypes())('verify effect of %s on mana pool', (landType: LandType) => {
          expect(player.type).toBe(heroType);

          const hasEffect = getManaSource({ landType: landType })?.heroTypes.includes(player.type)!;

          const players = [player, PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[13]];
          gameStateStub = createGameStateStub({ gamePlayers: players });
          const homeLand = getLands({
            gameState: gameStateStub,
            players: [gameStateStub.turnOwner],
            buildings: [BuildingType.STRONGHOLD],
          })[0];
          const specialLand = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 }; // player land
          getLand(gameStateStub, specialLand).land = getLandById(landType);
          gameStateStub.turn = 2;
          testTurnManagement.setGameState(gameStateStub);
          testTurnManagement.startNewTurn(gameStateStub);
          testTurnManagement.waitStartPhaseComplete();

          expectedMana(manaType, inc + (hasEffect ? 1 : 0));

          testTurnManagement.makeNTurns(1);

          expectedMana(manaType, (gameStateStub.turn - 1) * (inc + (hasEffect ? 1 : 0)));
        });
      }
    );
  });

  const expectManaOnTurn = (turn: number, base: number[]): void => {
    // verifying mana for all players when player[0] is turnOwner and that is why their mana on the previous turn
    expectedMana(ManaType.BLACK, base[0] * (turn - 1), 0);
    expectedMana(ManaType.WHITE, base[1] * (turn - 2), 1);
    expectedMana(ManaType.BLUE, base[2] * (turn - 2), 2);
    expectedMana(ManaType.GREEN, base[3] * (turn - 2), 3);
    expectedMana(ManaType.RED, base[4] * (turn - 2), 4);
  };

  const baseMana = (player: PlayerState) => {
    const playerSpecialLands = getLands({
      gameState: gameStateStub,
      players: [player.playerId],
    }).filter(
      (l) =>
        (player.getType() === HeroUnitType.NECROMANCER &&
          (l.land.id === LandType.BLIGHTED_FEN || l.land.id === LandType.SHADOW_MIRE)) ||
        (player.getType() === HeroUnitType.CLERIC &&
          (l.land.id === LandType.SUN_SPIRE_PEAKS || l.land.id === LandType.GOLDEN_PLAINS)) ||
        (player.getType() === HeroUnitType.ENCHANTER &&
          (l.land.id === LandType.CRISTAL_BASIN || l.land.id === LandType.MISTY_GLADES)) ||
        (player.getType() === HeroUnitType.DRUID &&
          (l.land.id === LandType.HEARTWOOD_COVE || l.land.id === LandType.VERDANT_GLADE)) ||
        (player.getType() === HeroUnitType.PYROMANCER &&
          (l.land.id === LandType.VOLCANO || l.land.id === LandType.LAVA))
    ).length;
    const playerHero = getLands({
      gameState: gameStateStub,
      players: [player.playerId],
      noArmy: false,
    })[0].army[0].units[0] as HeroUnit;
    return (playerHero.mana || 0) + playerSpecialLands;
  };
  it('on real map with 5 mage players and verify no mana calculation deviations', () => {
    const players = [
      PREDEFINED_PLAYERS[1],
      PREDEFINED_PLAYERS[6],
      PREDEFINED_PLAYERS[7],
      PREDEFINED_PLAYERS[12],
      PREDEFINED_PLAYERS[14],
    ];
    gameStateStub = createGameStateStub({
      gamePlayers: players,
      realBattlefield: true,
      battlefieldSize: { rows: 5, cols: 30 },
    });
    // calculate baseMana per turn for each player
    const basePlayersMana = gameStateStub.players.map(baseMana);

    gameStateStub.turn = 2;
    testTurnManagement.setGameState(gameStateStub);
    testTurnManagement.startNewTurn(gameStateStub);
    testTurnManagement.waitStartPhaseComplete();

    expectManaOnTurn(gameStateStub.turn, basePlayersMana);

    for (let i = 0; i < 10; i++) {
      testTurnManagement.makeNTurns(1);
      expectManaOnTurn(gameStateStub.turn, basePlayersMana);
    }
  });

  it('mana increased by 1 per each specific land even if no such hero type when player have TreasureItem.HEARTSTONE_OF_ORRIVANE', () => {
    const players = [PREDEFINED_PLAYERS[1], PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[2]];
    gameStateStub = createGameStateStub({ gamePlayers: players });
    gameStateStub.players[0].empireTreasures.push(
      relicts.find((r) => r.id === TreasureItem.HEARTSTONE_OF_ORRIVANE)!
    );
    const homeLand = getLands({
      gameState: gameStateStub,
      players: [gameStateStub.turnOwner],
      buildings: [BuildingType.STRONGHOLD],
    })[0];

    getLand(gameStateStub, homeLand.mapPos).land = getLandById(LandType.VOLCANO); // this should add red mana to player 0
    gameStateStub.turn = 2;
    testTurnManagement.setGameState(gameStateStub);
    testTurnManagement.startNewTurn(gameStateStub);
    testTurnManagement.waitStartPhaseComplete();

    expect(gameStateStub.players[0].mana[ManaType.RED]).toBe(1);
    expect(gameStateStub.players[0].mana[ManaType.BLACK]).toBe(7);
    expect(gameStateStub.players[0].mana[ManaType.WHITE]).toBe(0);
    expect(gameStateStub.players[0].mana[ManaType.BLUE]).toBe(0);
    expect(gameStateStub.players[0].mana[ManaType.GREEN]).toBe(0);
  });
});
