import { GameState, getLandOwner } from '../../state/GameState';
import { getLandId, LandPosition, LandState } from '../../state/LandState';
import { NO_PLAYER } from '../../state/PlayerState';

import {
  getDefaultUnit,
  HeroUnit,
  HeroUnitType,
  RegularUnit,
  RegularUnitType,
  Unit,
} from '../../types/Army';
import { BuildingType } from '../../types/Building';

import { getLand, getLands } from '../../map/utils/getLands';
import { construct } from '../../map/building/construct';
import { startRecruiting } from '../../map/recruiting/startRecruiting';
import { startMovement } from '../../map/move-army/startMovement';

import { TestTurnManagement } from '../utils/TestTurnManagement';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';

describe('Move Army', () => {
  let randomSpy: jest.SpyInstance<number, []>;

  let testTurnManagement: TestTurnManagement;
  let gameStateStub: GameState;

  let homeLand: LandState;
  let barracksLand: LandState;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    randomSpy = jest.spyOn(Math, 'random');
    randomSpy.mockReturnValue(0.01); // to return the same value on any random function call

    gameStateStub = createDefaultGameStateStub();
    gameStateStub.turn = 2;

    testTurnManagement = new TestTurnManagement(gameStateStub);
    testTurnManagement.startNewTurn(gameStateStub);
    testTurnManagement.waitStartPhaseComplete();

    // createDefaultGameStateStub place Homeland Stronghold by default
    homeLand = getLands({
      gameState: gameStateStub,
      players: [gameStateStub.turnOwner],
      buildings: [BuildingType.STRONGHOLD],
    })[0];

    const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
    construct(gameStateStub, BuildingType.BARRACKS, barracksPos);
    barracksLand = getLand(gameStateStub, barracksPos);

    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
    startRecruiting(HeroUnitType.FIGHTER, barracksLand.mapPos, gameStateStub);

    testTurnManagement.makeNTurns(1);

    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);

    testTurnManagement.makeNTurns(1);

    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);

    testTurnManagement.makeNTurns(1);

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
          expect(getLandId(p)).toBe(path[i]);
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
    it('Hero allowed to move without regular units only on owned territories', () => {
      const to = { row: homeLand.mapPos.row + 1, col: homeLand.mapPos.col };
      const unitsToMove = getLand(gameStateStub, homeLand.mapPos).army[0].units; // initial hero in homeland

      startMovement(homeLand.mapPos, to, unitsToMove, gameStateStub);
      testTurnManagement.makeNTurns(1);

      expect(getLand(gameStateStub, homeLand.mapPos).army.length).toBe(0);

      expect(getLand(gameStateStub, to).army.length).toBe(1);
      expect(getLand(gameStateStub, to).army[0].controlledBy).toBe(gameStateStub.turnOwner);
      expect(getLand(gameStateStub, to).army[0].movements).toBeUndefined();
      expect(getLand(gameStateStub, to).army[0].units.length).toBe(1);
      expect(getLand(gameStateStub, to).army[0].units[0]).toBe(unitsToMove[0]);
    });

    it('Army which complete the movements merged with Stationed Army', () => {
      const unitsToMove = getLand(gameStateStub, homeLand.mapPos).army[0].units; // initial hero in homeland
      expect(getLand(gameStateStub, homeLand.mapPos).army.length).toBe(1);
      expect(getLand(gameStateStub, barracksLand.mapPos).army.length).toBe(1);

      startMovement(homeLand.mapPos, barracksLand.mapPos, unitsToMove, gameStateStub);

      testTurnManagement.makeNTurns(1);
      expect(getLand(gameStateStub, homeLand.mapPos).army.length).toBe(0);
      expect(getLand(gameStateStub, barracksLand.mapPos).army.length).toBe(1); // Stationed Army

      const stationedArmy = getLand(gameStateStub, barracksLand.mapPos).army[0];
      expect(stationedArmy.units.length).toBe(3);
      expect(stationedArmy.units[0].id).toBe(RegularUnitType.WARRIOR);
      expect((stationedArmy.units[0] as RegularUnit).count).toBe(120);
      expect((stationedArmy.units[1] as HeroUnit).name).toBe('Cedric Brightshield');
      expect((stationedArmy.units[2] as HeroUnit).name).toBe('Alaric the Bold'); // new hero comes from homeland
      expect(stationedArmy.controlledBy).toBe(gameStateStub.turnOwner);
    });

    it('move on neutral territory perform Attrition Penalty and change ownership', () => {
      const from = barracksLand.mapPos;
      expect(getLand(gameStateStub, from).army.length).toBe(1);
      expect(getLand(gameStateStub, from).army[0].units.length).toBe(2);
      expect(getLand(gameStateStub, from).army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
      expect((getLand(gameStateStub, from).army[0].units[0] as RegularUnit).count).toBe(120);

      const to = { row: 3, col: 5 };
      expect(getLandOwner(gameStateStub, getLandId(to))).toBe(NO_PLAYER.id);

      const unitsToMove: Unit[] = [getDefaultUnit(RegularUnitType.WARRIOR)];
      (unitsToMove[0] as RegularUnit).count = 120;

      startMovement(from, to, unitsToMove, gameStateStub);
      expect(getLand(gameStateStub, from).army.length).toBe(2);

      testTurnManagement.makeNTurns(1);

      expect(getLand(gameStateStub, from).army.length).toBe(1); // hero stay in barracks land

      const newLand = getLand(gameStateStub, to);
      expect(newLand.army.length).toBe(1);
      expect(newLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
      expect(newLand.army[0].movements).toBeUndefined();
      expect(newLand.army[0].units.length).toBe(1);
      expect(newLand.army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
      expect((newLand.army[0].units[0] as RegularUnit).count).toBe(79); // attrition penalty (the same due to randomSpy)
    });

    it('All army die on new territory', () => {
      const from = barracksLand.mapPos;
      expect(getLand(gameStateStub, from).army.length).toBe(1);
      expect(getLand(gameStateStub, from).army[0].units.length).toBe(2);
      expect(getLand(gameStateStub, from).army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
      expect((getLand(gameStateStub, from).army[0].units[0] as RegularUnit).count).toBe(120);

      const to = { row: 3, col: 5 };
      expect(getLandOwner(gameStateStub, getLandId(to))).toBe(NO_PLAYER.id);

      const unitsToMove: Unit[] = [getDefaultUnit(RegularUnitType.WARRIOR)];
      (unitsToMove[0] as RegularUnit).count = 20; // 20 regular units is not enough to conquer the new territory

      startMovement(from, to, unitsToMove, gameStateStub);
      expect(getLand(gameStateStub, from).army.length).toBe(2);

      testTurnManagement.makeNTurns(1);

      expect(getLand(gameStateStub, from).army.length).toBe(1); // hero and the rest of the warriors

      const newLand = getLand(gameStateStub, to);
      expect(getLandOwner(gameStateStub, getLandId(newLand.mapPos))).toBe(NO_PLAYER.id); // new territory owner is not changed
      expect(newLand.army.length).toBe(0);
    });

    it('when 2 armies are reach uncontroled land they merge in one and then attrition penalty calculated', () => {
      const from = barracksLand.mapPos;
      expect(getLand(gameStateStub, from).army.length).toBe(1);
      expect(getLand(gameStateStub, from).army[0].units.length).toBe(2);
      expect(getLand(gameStateStub, from).army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
      expect((getLand(gameStateStub, from).army[0].units[0] as RegularUnit).count).toBe(120);

      const to = { row: 3, col: 5 };
      expect(getLandOwner(gameStateStub, getLandId(to))).toBe(NO_PLAYER.id);

      // first army is moved to new territory
      const unitsToMove1: Unit[] = [getDefaultUnit(RegularUnitType.WARRIOR)];
      (unitsToMove1[0] as RegularUnit).count = 35; // 35 regular units is not enough to conquer the new territory

      startMovement(from, to, unitsToMove1, gameStateStub);
      expect(getLand(gameStateStub, from).army.length).toBe(2);

      // second army is moved to the same territory
      const unitsToMove2: Unit[] = [getDefaultUnit(RegularUnitType.WARRIOR)];
      (unitsToMove1[0] as RegularUnit).count = 35; // 35 regular units is not enough to conquer the new territory

      startMovement(from, to, unitsToMove2, gameStateStub);
      expect(getLand(gameStateStub, from).army.length).toBe(3);

      testTurnManagement.makeNTurns(1);

      expect(getLand(gameStateStub, from).army.length).toBe(1); // hero and the rest of the warriors

      const newLand = getLand(gameStateStub, to);
      expect(getLandOwner(gameStateStub, getLandId(newLand.mapPos))).toBe(gameStateStub.turnOwner); // new territory owner is not changed
      expect(newLand.army.length).toBe(1);
      expect(newLand.army[0].units.length).toBe(1);
      expect(newLand.army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
      expect((newLand.army[0].units[0] as RegularUnit).count).toBe(14);
    });
  });
});
