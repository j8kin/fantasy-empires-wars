import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { TurnManager, TurnManagerCallbacks } from '../../turn/TurnManager';
import {
  battlefieldLandId,
  GameState,
  getTurnOwner,
  LandState,
  TurnPhase,
} from '../../types/GameState';
import {
  getDefaultUnit,
  HeroUnit,
  HeroUnitType,
  RegularUnit,
  RegularUnitType,
  Unit,
} from '../../types/Army';
import { getLand, getLands, LandPosition } from '../../map/utils/getLands';
import { BuildingType } from '../../types/Building';
import { construct } from '../../map/building/construct';
import { startRecruiting } from '../../map/recruiting/startRecruiting';
import { startMovement } from '../../map/move-army/startMovement';
import { NO_PLAYER } from '../../types/GamePlayer';

describe('Move Army', () => {
  let randomSpy: jest.SpyInstance<number, []>;

  let turnManager: TurnManager;
  let mockCallbacks: jest.Mocked<TurnManagerCallbacks>;

  let gameStateStub: GameState;

  let homeLand: LandState;
  let barracksLand: LandState;

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
    randomSpy = jest.spyOn(Math, 'random');

    randomSpy.mockReturnValue(0.01); // to return the same value on any random function call

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

    const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
    construct(gameStateStub, BuildingType.BARRACKS, barracksPos);
    barracksLand = getLand(gameStateStub, barracksPos);

    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
    startRecruiting(HeroUnitType.FIGHTER, barracksLand.mapPos, gameStateStub);

    makeNTurns(1);

    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);

    makeNTurns(1);

    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);

    makeNTurns(1);

    expect(barracksLand.army.length).toBe(1);
    expect(barracksLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
    expect(barracksLand.army[0].movements).toBeUndefined();
    expect(barracksLand.army[0].units.length).toBe(2); // 1 hero and 120 warriors
    expect(barracksLand.army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
    expect((barracksLand.army[0].units[0] as RegularUnit).count).toBe(120);
    expect(barracksLand.army[0].units[1].id).toBe(HeroUnitType.FIGHTER);
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

  describe('Start Movements', () => {
    // barack land is 3,4
    it.each([
      [{ row: 3, col: 5 }, 2, ['3-4', '3-5']],
      [{ row: 2, col: 4 }, 2, ['3-4', '2-4']],
      [{ row: 3, col: 6 }, 3, ['3-4', '3-5', '3-6']],
      [{ row: 6, col: 6 }, 4, ['3-4', '4-5', '5-5', '6-6']],
      [{ row: 5, col: 7 }, 5, ['3-4', '3-5', '3-6', '4-7', '5-7']],
    ])(
      'new Army with movement should be created into %s with pathLength: %s',
      (to: LandPosition, pathLength: number, path: string[]) => {
        const from = barracksLand.mapPos;
        const unitsToMove: Unit[] = [getDefaultUnit(RegularUnitType.WARRIOR)];

        startMovement(from, to, unitsToMove, gameStateStub);

        expect(barracksLand.army.length).toBe(2);
        // "old" army"
        expect(barracksLand.army[0].units.length).toBe(2);
        expect(barracksLand.army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
        expect((barracksLand.army[0].units[0] as RegularUnit).count).toBe(100);
        expect(barracksLand.army[0].units[1].id).toBe(HeroUnitType.FIGHTER);
        expect(barracksLand.army[0].movements).toBeUndefined();

        // "new" army
        expect((barracksLand.army[1].units[0] as RegularUnit).count).toBe(20);
        expect(barracksLand.army[1].movements).toBeDefined();
        expect(barracksLand.army[1].movements?.from).toBe(from);
        expect(barracksLand.army[1].movements?.to).toBe(to);
        expect(barracksLand.army[1].movements?.path.length).toBe(pathLength);
        barracksLand.army[1].movements?.path.forEach((p, i) => {
          expect(battlefieldLandId(p)).toBe(path[i]);
        });
      }
    );

    it('move all regular units', () => {
      const from = barracksLand.mapPos;
      const to = { row: 3, col: 5 };
      const unitsToMove: Unit[] = [getDefaultUnit(RegularUnitType.WARRIOR)];
      (unitsToMove[0] as RegularUnit).count = 120;

      startMovement(from, to, unitsToMove, gameStateStub);

      // only hero remains in the army
      expect(barracksLand.army.length).toBe(2);
      expect(barracksLand.army[0].units.length).toBe(1);
      expect(barracksLand.army[0].units[0].id).toBe(HeroUnitType.FIGHTER);
      expect(barracksLand.army[0].movements).toBeUndefined();

      expect((barracksLand.army[1].units[0] as RegularUnit).count).toBe(120);
      expect(barracksLand.army[1].movements).toBeDefined();
      expect(barracksLand.army[1].movements?.from).toBe(from);
      expect(barracksLand.army[1].movements?.to).toBe(to);
      expect(barracksLand.army[1].movements?.path.length).toBe(2);
    });

    it('Heroes are not able to move on hostile territory only without regular units', () => {
      const from = barracksLand.mapPos;
      const to = { row: 3, col: 5 };
      const unitsToMove: Unit[] = [barracksLand.army[0].units[1]];

      startMovement(from, to, unitsToMove, gameStateStub);

      // All army stays the same
      expect(barracksLand.army.length).toBe(1);
      expect(barracksLand.army[0].movements).toBeUndefined();
    });

    it('Heroes are able to move on hostile territory only with regular units.', () => {
      const from = barracksLand.mapPos;
      const to = { row: 3, col: 5 };
      const unitsToMove: Unit[] = [
        barracksLand.army[0].units[1],
        getDefaultUnit(RegularUnitType.WARRIOR),
      ];

      startMovement(from, to, unitsToMove, gameStateStub);

      // only regular remains in the army
      expect(barracksLand.army.length).toBe(2);
      expect(barracksLand.army[0].units.length).toBe(1);
      expect(barracksLand.army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
      expect((barracksLand.army[0].units[0] as RegularUnit).count).toBe(100);
      expect(barracksLand.army[0].movements).toBeUndefined();

      expect(barracksLand.army[1].units.length).toBe(2);
      expect(barracksLand.army[1].movements).toBeDefined();
      expect(barracksLand.army[1].movements?.from).toBe(from);
      expect(barracksLand.army[1].movements?.to).toBe(to);
      expect(barracksLand.army[1].movements?.path.length).toBe(2);

      expect(barracksLand.army[1].units[0].id).toBe(HeroUnitType.FIGHTER);
      expect((barracksLand.army[1].units[0] as HeroUnit).name).toBe('Cedric Brightshield');
      expect(barracksLand.army[1].units[1].id).toBe(RegularUnitType.WARRIOR);
      expect((barracksLand.army[1].units[1] as RegularUnit).count).toBe(20);
    });

    it('move all units', () => {
      const from = barracksLand.mapPos;
      const to = { row: 3, col: 5 };
      const unitsToMove: Unit[] = [getDefaultUnit(RegularUnitType.WARRIOR)];
      (unitsToMove[0] as RegularUnit).count = 120;
      unitsToMove.push(barracksLand.army[0].units[1]);

      startMovement(from, to, unitsToMove, gameStateStub);

      // only new army remains
      expect(barracksLand.army.length).toBe(1);
      expect(barracksLand.army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
      expect((barracksLand.army[0].units[0] as RegularUnit).count).toBe(120);
      expect(barracksLand.army[0].units[1].id).toBe(HeroUnitType.FIGHTER);
      expect((barracksLand.army[0].units[1] as HeroUnit).name).toBe('Cedric Brightshield');
      expect(barracksLand.army[0].movements).toBeDefined();
      expect(barracksLand.army[0].movements?.from).toBe(from);
      expect(barracksLand.army[0].movements?.to).toBe(to);
      expect(barracksLand.army[0].movements?.path.length).toBe(2);
    });

    describe('corner cases', () => {
      it('empty army', () => {
        const emptyLand = getLand(gameStateStub, { row: 1, col: 1 });
        const unitsToMove: Unit[] = [getDefaultUnit(RegularUnitType.WARRIOR)];

        expect(emptyLand.army.length).toBe(0);

        startMovement(emptyLand.mapPos, barracksLand.mapPos, unitsToMove, gameStateStub);

        expect(barracksLand.army.length).toBe(1);
        expect(barracksLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
        expect(barracksLand.army[0].movements).toBeUndefined();
        expect(barracksLand.army[0].units.length).toBe(2); // 1 hero and 120 warriors
        expect(barracksLand.army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
        expect((barracksLand.army[0].units[0] as RegularUnit).count).toBe(120);
        expect(barracksLand.army[0].units[1].id).toBe(HeroUnitType.FIGHTER);
      });
      it('not enough units to move', () => {
        const from = barracksLand.mapPos;
        const to = { row: 3, col: 5 };
        const unitsToMove: Unit[] = [getDefaultUnit(RegularUnitType.WARRIOR)];
        (unitsToMove[0] as RegularUnit).count = 1000;

        startMovement(from, to, unitsToMove, gameStateStub);

        expect(barracksLand.army.length).toBe(1);
        expect(barracksLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
        expect(barracksLand.army[0].movements).toBeUndefined();
        expect(barracksLand.army[0].units.length).toBe(2); // 1 hero and 120 warriors
        expect(barracksLand.army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
        expect((barracksLand.army[0].units[0] as RegularUnit).count).toBe(120);
        expect(barracksLand.army[0].units[1].id).toBe(HeroUnitType.FIGHTER);
      });

      it('No expected hero', () => {
        const from = barracksLand.mapPos;
        const to = { row: 3, col: 5 };
        const unitsToMove: Unit[] = [getDefaultUnit(HeroUnitType.FIGHTER)];

        startMovement(from, to, unitsToMove, gameStateStub);

        expect(barracksLand.army.length).toBe(1);
        expect(barracksLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
        expect(barracksLand.army[0].movements).toBeUndefined();
        expect(barracksLand.army[0].units.length).toBe(2); // 1 hero and 120 warriors
        expect(barracksLand.army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
        expect((barracksLand.army[0].units[0] as RegularUnit).count).toBe(120);
        expect(barracksLand.army[0].units[1].id).toBe(HeroUnitType.FIGHTER);
      });
    });
  });

  describe('Perform movements', () => {
    it('move on 1 land', () => {
      const to = { row: homeLand.mapPos.row + 1, col: homeLand.mapPos.col };
      const unitsToMove = getLand(gameStateStub, homeLand.mapPos).army[0].units; // initial hero in homeland

      startMovement(homeLand.mapPos, to, unitsToMove, gameStateStub);
      makeNTurns(1);

      expect(getLand(gameStateStub, homeLand.mapPos).army.length).toBe(0);

      expect(getLand(gameStateStub, to).army.length).toBe(1);
      expect(getLand(gameStateStub, to).army[0].controlledBy).toBe(gameStateStub.turnOwner);
      expect(getLand(gameStateStub, to).army[0].movements).toBeUndefined();
      expect(getLand(gameStateStub, to).army[0].units.length).toBe(1);
      expect(getLand(gameStateStub, to).army[0].units[0]).toBe(unitsToMove[0]);
    });

    it('move on neutral territory perform Attrition Penalty and change ownership', () => {
      const from = barracksLand.mapPos;
      expect(getLand(gameStateStub, from).army.length).toBe(1);
      expect(getLand(gameStateStub, from).army[0].units.length).toBe(2);
      expect(getLand(gameStateStub, from).army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
      expect((getLand(gameStateStub, from).army[0].units[0] as RegularUnit).count).toBe(120);

      const to = { row: 3, col: 5 };
      expect(getLand(gameStateStub, to).controlledBy).toBe(NO_PLAYER.id);

      const unitsToMove: Unit[] = [getDefaultUnit(RegularUnitType.WARRIOR)];
      (unitsToMove[0] as RegularUnit).count = 120;

      startMovement(from, to, unitsToMove, gameStateStub);
      expect(getLand(gameStateStub, from).army.length).toBe(2);

      makeNTurns(1);

      expect(getLand(gameStateStub, from).army.length).toBe(1); // hero stay in barracks land

      const newLand = getLand(gameStateStub, to);
      expect(newLand.army.length).toBe(1);
      expect(newLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
      expect(newLand.army[0].movements).toBeUndefined();
      expect(newLand.army[0].units.length).toBe(1);
      expect(newLand.army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
      expect((newLand.army[0].units[0] as RegularUnit).count).toBe(79); // attrition penalty (the same due to randomSpy)
    });
  });
});
