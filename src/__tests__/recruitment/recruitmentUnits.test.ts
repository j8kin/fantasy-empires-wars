import { TurnManager, TurnManagerCallbacks } from '../../turn/TurnManager';
import { GameState, getTurnOwner, LandState, TurnPhase } from '../../types/GameState';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { BuildingType } from '../../types/Building';
import { startRecruiting } from '../../map/army/startRecruiting';
import { RegularUnit, RegularUnitType } from '../../types/Army';
import { construct } from '../../map/building/construct';
import { getLand, getLands } from '../../map/utils/getLands';

describe('Recruitment', () => {
  let randomSpy: jest.SpyInstance<number, []>;

  let turnManager: TurnManager;
  let mockCallbacks: jest.Mocked<TurnManagerCallbacks>;

  let gameStateStub: GameState;

  let homeLand: LandState;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockCallbacks = {
      onTurnPhaseChange: jest.fn(),
      onGameOver: jest.fn(),
      onStartProgress: jest.fn(),
      onHideProgress: jest.fn(),
      onComputerMainTurn: jest.fn(),
    };

    turnManager = new TurnManager(mockCallbacks);
    randomSpy = jest.spyOn(Math, 'random');

    gameStateStub = createDefaultGameStateStub();
    gameStateStub.turn = 2;
    turnManager.startNewTurn(gameStateStub);

    waitStartPhaseComplete();
    // createDefaultGameStateStub place Homeland Stronghold by default
    homeLand = getLands({
      lands: gameStateStub.battlefield.lands,
      players: [getTurnOwner(gameStateStub)!],
      buildings: [BuildingType.STRONGHOLD],
    })[0];
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
    randomSpy.mockRestore();
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
  describe('Recruit regular units', () => {
    let barracksLand: LandState;

    beforeEach(() => {
      const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
      construct(gameStateStub, BuildingType.BARRACKS, barracksPos);
      barracksLand = getLand(gameStateStub, barracksPos);
    });

    it.each([
      [RegularUnitType.WARRIOR, 1],
      [RegularUnitType.DWARF, 1],
      [RegularUnitType.ORC, 1],
      [RegularUnitType.ELF, 2],
      [RegularUnitType.DARK_ELF, 2],
      [RegularUnitType.CATAPULT, 3],
      [RegularUnitType.BALLISTA, 3],
    ])(
      'Regular unit (%s) should be start recruited in (%s) turns in Barracks',
      (unitType: RegularUnitType, nTurns: number) => {
        expect(gameStateStub.turn).toBe(2);
        expect(gameStateStub.turnPhase).toBe(TurnPhase.MAIN);

        expect(barracksLand).toBeDefined();
        expect(barracksLand.army.length).toBe(0);
        expect(barracksLand.buildings[0].numberOfSlots).toBe(3);
        expect(barracksLand.buildings[0].slots?.length).toBe(0);

        startRecruiting(unitType, barracksLand.mapPos, gameStateStub);

        expect(barracksLand.army.length).toBe(0); // no units are placed on the map yet
        expect(barracksLand.buildings[0].slots?.length).toBe(1);
        expect(barracksLand.buildings[0].slots![0].unit).toBe(unitType);
        expect(barracksLand.buildings[0].slots![0].turnsRemaining).toBe(nTurns);
      }
    );
    it.each([
      [20, RegularUnitType.WARRIOR, 1],
      [20, RegularUnitType.DWARF, 1],
      [20, RegularUnitType.ORC, 1],
      [20, RegularUnitType.ELF, 2],
      [20, RegularUnitType.DARK_ELF, 2],
      [1, RegularUnitType.CATAPULT, 3],
      [1, RegularUnitType.BALLISTA, 3],
    ])(
      '%s units (%s) should be start recruited in (%s) turns in Barracks',
      (nUnits: number, unitType: RegularUnitType, nTurns: number) => {
        expect(gameStateStub.turn).toBe(2);
        expect(gameStateStub.turnPhase).toBe(TurnPhase.MAIN);

        expect(barracksLand).toBeDefined();
        expect(barracksLand.army.length).toBe(0);
        expect(barracksLand.buildings[0].slots?.length).toBe(0);

        startRecruiting(unitType, barracksLand.mapPos, gameStateStub);

        expect(barracksLand.buildings[0].slots?.length).toBe(1);
        expect(barracksLand.buildings[0].slots![0].unit).toBe(unitType);
        expect(barracksLand.buildings[0].slots![0].turnsRemaining).toBe(nTurns);

        makeNTurns(nTurns);

        expect(barracksLand.buildings[0].slots?.length).toBe(0); // no units in recruitment queue

        // check that all units are placed on the map
        expect(barracksLand.army.length).toBe(1);
        expect(barracksLand.army[0].unit.id).toBe(unitType);

        const recruitedUnit = barracksLand.army[0].unit as RegularUnit;
        expect(recruitedUnit.id).toBe(unitType);
        expect(recruitedUnit.count).toBe(nUnits);
        expect(recruitedUnit.level).toBe('regular');
      }
    );
  });
});
