import { TurnManager, TurnManagerCallbacks } from '../../turn/TurnManager';
import { GameState, TurnPhase } from '../../types/GameState';
import { PlayerInfo, PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import { getManaSource, ManaType } from '../../types/Mana';
import { createGameStateStub } from '../utils/createGameStateStub';
import { HeroUnitType } from '../../types/Army';
import { getLandById, getSpecialLandTypes, LAND_TYPE } from '../../types/Land';
import { getLand, getLands } from '../../map/utils/getLands';
import { BuildingType } from '../../types/Building';

describe('Calculate Mana', () => {
  let turnManager: TurnManager;
  let mockCallbacks: jest.Mocked<TurnManagerCallbacks>;

  let gameStateStub: GameState;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockCallbacks = {
      onTurnPhaseChange: jest.fn(),
      onGameOver: jest.fn(),
      onStartProgress: jest.fn(),
      onHideProgress: jest.fn(),
      onComputerMainTurn: jest.fn(),
      onHeroOutcomeResult: jest.fn(),
    };

    turnManager = new TurnManager(mockCallbacks);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  const clickEndOfTurn = (): void => {
    expect(gameStateStub.turnPhase).toBe(TurnPhase.MAIN);

    turnManager.endCurrentTurn(gameStateStub);
    expect(gameStateStub.turnPhase).toBe(TurnPhase.END);

    jest.advanceTimersByTime(500);
    expect(gameStateStub.turnPhase).toBe(TurnPhase.START);
  };

  const waitStartPhaseComplete = (): void => {
    expect(gameStateStub.turnPhase).toBe(TurnPhase.START);
    jest.advanceTimersByTime(1000);
    expect(gameStateStub.turnPhase).toBe(TurnPhase.MAIN);
  };

  const performAiTurns = (owner: string): void => {
    const cTurn = gameStateStub.turn;
    const newOwnerIdx =
      (gameStateStub.players.findIndex((p) => p.id === gameStateStub.turnOwner) + 1) %
      gameStateStub.players.length;
    expect(gameStateStub.turnOwner).toBe(owner);

    // computer players turns
    expect(gameStateStub.turnPhase).toBe(TurnPhase.START);
    jest.advanceTimersByTime(1000);
    expect(gameStateStub.turnPhase).toBe(TurnPhase.MAIN);
    jest.advanceTimersByTime(2000);
    expect(gameStateStub.turnPhase).toBe(TurnPhase.END);
    jest.advanceTimersByTime(500);

    // new Owner's turn
    expect(gameStateStub.turnPhase).toBe(TurnPhase.START);
    expect(gameStateStub.turnOwner).toBe(gameStateStub.players[newOwnerIdx].id);
    expect(gameStateStub.turn).toBe(newOwnerIdx === 0 ? cTurn + 1 : cTurn);
  };

  const makeNTurns = (turns: number): void => {
    const cTurn = gameStateStub.turn;
    for (let i = 0; i < turns; i++) {
      expect(gameStateStub.turnPhase).toBe(TurnPhase.MAIN);

      clickEndOfTurn();
      // computer players turns
      while (gameStateStub.turnOwner !== gameStateStub.players[0].id) {
        performAiTurns(gameStateStub.turnOwner);
      }

      expect(gameStateStub.turn).toBe(cTurn + i + 1); // new turn

      waitStartPhaseComplete();
    }
  };

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
        turnManager.startNewTurn(gameStateStub);

        waitStartPhaseComplete();

        expectedMana(manaType, inc);

        makeNTurns(1);

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
          turnManager.startNewTurn(gameStateStub);
          waitStartPhaseComplete();

          expectedMana(manaType, inc);

          makeNTurns(1);

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
          turnManager.startNewTurn(gameStateStub);
          waitStartPhaseComplete();

          expectedMana(manaType, inc);

          makeNTurns(1);

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
            turnManager.startNewTurn(gameStateStub);
            waitStartPhaseComplete();

            expectedMana(manaType, inc + (hasEffect ? 1 : 0));

            makeNTurns(1);

            expectedMana(manaType, (gameStateStub.turn - 1) * (inc + (hasEffect ? 1 : 0)));
          }
        );
      }
    );
  });
});
