import { GameState } from '../../types/GameState';
import { PlayerInfo, PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import { getManaSource, ManaType } from '../../types/Mana';
import { createGameStateStub } from '../utils/createGameStateStub';
import { HeroUnitType } from '../../types/Army';
import { getLandById, getSpecialLandTypes, LAND_TYPE } from '../../types/Land';
import { getLand, getLands } from '../../map/utils/getLands';
import { BuildingType } from '../../types/Building';
import { TestTurnManagement } from '../utils/TestTurnManagement';

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

  describe('only one initial mage', () => {
    const expectedMana = (manaType: ManaType, mana: number): void => {
      expect(gameStateStub.players[0].mana[manaType]).toBe(mana);
      Object.values(ManaType)
        .filter((m) => m !== manaType)
        .forEach((m) => expect(gameStateStub.players[0].mana[m]).toBe(0));
    };

    it.each([
      [HeroUnitType.NECROMANCER, ManaType.BLACK, PREDEFINED_PLAYERS[1], 7],
      [HeroUnitType.CLERIC, ManaType.WHITE, PREDEFINED_PLAYERS[6], 6],
      [HeroUnitType.ENCHANTER, ManaType.BLUE, PREDEFINED_PLAYERS[7], 7],
      [HeroUnitType.DRUID, ManaType.GREEN, PREDEFINED_PLAYERS[12], 7],
      [HeroUnitType.PYROMANCER, ManaType.RED, PREDEFINED_PLAYERS[14], 6],
    ])(
      '%s produce only %s mana',
      (heroType: HeroUnitType, manaType: ManaType, player: PlayerInfo, inc: number) => {
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
      (heroType: HeroUnitType, manaType: ManaType, player: PlayerInfo, inc: number) => {
        it.each(getSpecialLandTypes())('%s not add mana in mana pool', (landType: LAND_TYPE) => {
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
      (heroType: HeroUnitType, manaType: ManaType, player: PlayerInfo, inc: number) => {
        it.each(getSpecialLandTypes())('%s not add mana in mana pool', (landType: LAND_TYPE) => {
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
      (heroType: HeroUnitType, manaType: ManaType, player: PlayerInfo, inc: number) => {
        it.each(getSpecialLandTypes())(
          'verify effect of %s on mana pool',
          (landType: LAND_TYPE) => {
            expect(player.type).toBe(heroType);

            const hasEffect = getManaSource({ landType: landType })?.heroTypes.includes(
              player.type
            )!;

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
          }
        );
      }
    );
  });
});
