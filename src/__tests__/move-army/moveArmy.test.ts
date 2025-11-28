import { GameState } from '../../state/GameState';
import { LandState } from '../../state/map/land/LandState';
import { LandPosition } from '../../state/map/land/LandPosition';

import { getLand, getLandOwner } from '../../selectors/landSelectors';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { briefInfo, isMoving } from '../../selectors/armySelectors';
import { addLand } from '../../systems/playerActions';

import { ArmyBriefInfo } from '../../state/army/ArmyState';
import { RegularsState, UnitRank } from '../../state/army/RegularsState';
import { HeroState } from '../../state/army/HeroState';
import { HeroUnitType, RegularUnitType } from '../../types/UnitType';
import { BuildingType } from '../../types/Building';

import { getLands } from '../../map/utils/getLands';
import { construct } from '../../map/building/construct';
import { startRecruiting } from '../../map/recruiting/startRecruiting';
import { startMovement } from '../../map/move-army/startMovement';

import { TestTurnManagement } from '../utils/TestTurnManagement';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { NO_PLAYER } from '../../data/players/predefinedPlayers';

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

    // Increase vault to handle BARRACKS maintenance cost (1000 per turn) during testing
    getTurnOwner(gameStateStub).vault = 25000;

    testTurnManagement = new TestTurnManagement(gameStateStub);
    testTurnManagement.startNewTurn(gameStateStub);
    testTurnManagement.waitStartPhaseComplete();

    // createDefaultGameStateStub place Homeland Stronghold by default
    homeLand = getLands({
      gameState: gameStateStub,
      players: [getTurnOwner(gameStateStub).id],
      buildings: [BuildingType.STRONGHOLD],
    })[0];

    const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
    construct(gameStateStub, BuildingType.BARRACKS, barracksPos);
    barracksLand = getLand(gameStateStub, barracksPos);

    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
    startRecruiting(HeroUnitType.FIGHTER, barracksLand.mapPos, gameStateStub);

    testTurnManagement.makeNTurns(1);
    expect(barracksLand.army[0].regulars[0].count).toBe(40);

    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);

    testTurnManagement.makeNTurns(1);
    expect(barracksLand.army[0].regulars[0].count).toBe(80);

    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);

    testTurnManagement.makeNTurns(1);

    expect(barracksLand.army.length).toBe(1);
    expect(barracksLand.army[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
    expect(isMoving(barracksLand.army[0])).toBeFalsy();
    expect(barracksLand.army[0].heroes.length).toBe(1); // 1 hero
    expect(barracksLand.army[0].regulars.length).toBe(1); // and 120 warriors
    expect(barracksLand.army[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
    expect(barracksLand.army[0].regulars[0].count).toBe(120);
    expect(barracksLand.army[0].heroes[0].type).toBe(HeroUnitType.FIGHTER);
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
        addLand(getTurnOwner(gameStateStub), from);
        const armyBriefInfo: ArmyBriefInfo = {
          heroes: [],
          regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 20 }],
        };

        startMovement(from, to, armyBriefInfo, gameStateStub);

        expect(barracksLand.army.length).toBe(2);
        // "old" army"
        expect(barracksLand.army[0].regulars.length).toBe(1);
        expect(barracksLand.army[0].heroes.length).toBe(1);
        expect(barracksLand.army[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
        expect(barracksLand.army[0].regulars[0].count).toBe(100);
        expect(barracksLand.army[0].heroes[0].type).toBe(HeroUnitType.FIGHTER);
        expect(isMoving(barracksLand.army[0])).toBeFalsy();

        // "new" army
        expect(barracksLand.army[1].regulars.length).toBe(1);
        expect(barracksLand.army[1].regulars[0].count).toBe(20);
        expect(isMoving(barracksLand.army[1])).toBeTruthy();
      }
    );

    it('move all regular units', () => {
      const from = barracksLand.mapPos;
      const to = { row: 3, col: 5 };
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [],
        regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 120 }],
      };

      startMovement(from, to, armyBriefInfo, gameStateStub);

      // only hero remains in the army
      expect(barracksLand.army.length).toBe(2);
      expect(barracksLand.army[0].heroes.length).toBe(1);
      expect(barracksLand.army[0].heroes[0].type).toBe(HeroUnitType.FIGHTER);
      expect(isMoving(barracksLand.army[0])).toBeFalsy();

      expect(barracksLand.army[1].regulars[0].count).toBe(120);
      expect(isMoving(barracksLand.army[1])).toBeTruthy();
    });

    it('Heroes are not able to move on hostile territory only without regular units', () => {
      const from = barracksLand.mapPos;
      const to = { row: 3, col: 5 };
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [briefInfo(barracksLand.army[0]).heroes[0]],
        regulars: [],
      };

      startMovement(from, to, armyBriefInfo, gameStateStub);

      // All army stays the same
      expect(barracksLand.army.length).toBe(1);
      expect(isMoving(barracksLand.army[0])).toBeFalsy();
    });

    it('Heroes are able to move on hostile territory only with regular units.', () => {
      const from = barracksLand.mapPos;
      const to = { row: 3, col: 5 };
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [briefInfo(barracksLand.army[0]).heroes[0]],
        regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 20 }],
      };

      startMovement(from, to, armyBriefInfo, gameStateStub);

      // only regular remains in the army
      expect(barracksLand.army.length).toBe(2);
      expect(barracksLand.army[0].regulars.length).toBe(1);
      expect(barracksLand.army[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(barracksLand.army[0].regulars[0].count).toBe(100);
      expect(isMoving(barracksLand.army[0])).toBeFalsy();

      expect(barracksLand.army[1].heroes.length).toBe(1);
      expect(barracksLand.army[1].regulars.length).toBe(1);
      expect(isMoving(barracksLand.army[1])).toBeTruthy();

      expect(barracksLand.army[1].heroes[0].type).toBe(HeroUnitType.FIGHTER);
      expect((barracksLand.army[1].heroes[0] as HeroState).name).toBe('Cedric Brightshield');
      expect(barracksLand.army[1].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect((barracksLand.army[1].regulars[0] as RegularsState).count).toBe(20);
    });

    it('move all units', () => {
      const from = barracksLand.mapPos;
      const to = { row: 3, col: 5 };
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [briefInfo(barracksLand.army[0]).heroes[0]],
        regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 120 }],
      };

      startMovement(from, to, armyBriefInfo, gameStateStub);

      // only new army remains
      expect(barracksLand.army.length).toBe(1);
      expect(barracksLand.army[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(barracksLand.army[0].regulars[0].count).toBe(120);

      expect(barracksLand.army[0].heroes.length).toBe(1);
      expect(barracksLand.army[0].heroes[0].type).toBe(HeroUnitType.FIGHTER);
      expect(barracksLand.army[0].heroes[0].name).toBe('Cedric Brightshield');
      expect(isMoving(barracksLand.army[0])).toBeTruthy();
    });

    describe('corner cases', () => {
      it('empty army', () => {
        const emptyLand = getLand(gameStateStub, { row: 1, col: 1 });
        const armyBriefInfo: ArmyBriefInfo = {
          heroes: [],
          regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 20 }],
        };

        expect(emptyLand.army.length).toBe(0);

        startMovement(emptyLand.mapPos, barracksLand.mapPos, armyBriefInfo, gameStateStub);

        expect(barracksLand.army.length).toBe(1);
        expect(barracksLand.army[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
        expect(isMoving(barracksLand.army[0])).toBeFalsy();
        expect(barracksLand.army[0].heroes.length).toBe(1); // 1 hero
        expect(barracksLand.army[0].heroes[0].type).toBe(HeroUnitType.FIGHTER);
        expect(barracksLand.army[0].regulars.length).toBe(1); // and 120 warriors
        expect(barracksLand.army[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
        expect(barracksLand.army[0].regulars[0].count).toBe(120);
      });
      it('not enough units to move', () => {
        const from = barracksLand.mapPos;
        const to = { row: 3, col: 5 };
        const armyBriefInfo: ArmyBriefInfo = {
          heroes: [briefInfo(barracksLand.army[0]).heroes[0]],
          regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 1000 }],
        };

        startMovement(from, to, armyBriefInfo, gameStateStub);

        expect(barracksLand.army.length).toBe(1);
        expect(barracksLand.army[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
        expect(isMoving(barracksLand.army[0])).toBeFalsy();
        expect(barracksLand.army[0].heroes.length).toBe(1); // 1 hero
        expect(barracksLand.army[0].heroes[0].type).toBe(HeroUnitType.FIGHTER);
        expect(barracksLand.army[0].regulars.length).toBe(1); // and 120 warriors
        expect(barracksLand.army[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
        expect(barracksLand.army[0].regulars[0].count).toBe(120);
      });

      it('No expected hero', () => {
        const from = barracksLand.mapPos;
        const to = { row: 3, col: 5 };
        const armyBriefInfo: ArmyBriefInfo = {
          heroes: [{ name: 'Invalid hero name', type: HeroUnitType.CLERIC, level: 1 }],
          regulars: [],
        };

        startMovement(from, to, armyBriefInfo, gameStateStub);

        expect(barracksLand.army.length).toBe(1);
        expect(barracksLand.army[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
        expect(isMoving(barracksLand.army[0])).toBeFalsy();
        expect(barracksLand.army[0].heroes.length).toBe(1); // 1 hero
        expect(barracksLand.army[0].heroes[0].type).toBe(HeroUnitType.FIGHTER);
        expect(barracksLand.army[0].regulars.length).toBe(1); // 1 and 120 warriors
        expect(barracksLand.army[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
        expect(barracksLand.army[0].regulars[0].count).toBe(120);
      });
    });
  });

  describe('Perform movements', () => {
    it('Hero allowed to move without regular units only on owned territories', () => {
      const to = { row: homeLand.mapPos.row + 1, col: homeLand.mapPos.col };
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [briefInfo(homeLand.army[0]).heroes[0]], // initial hero in homeland
        regulars: [],
      };

      startMovement(homeLand.mapPos, to, armyBriefInfo, gameStateStub);
      testTurnManagement.makeNTurns(1);

      expect(getLand(gameStateStub, homeLand.mapPos).army.length).toBe(0);
      const landTo = getLand(gameStateStub, to);
      expect(landTo.army.length).toBe(1);
      expect(landTo.army[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(landTo.army[0])).toBeFalsy();
      expect(landTo.army[0].heroes.length).toBe(1);
      expect(landTo.army[0].heroes[0].name).toBe(armyBriefInfo.heroes[0].name);
    });

    it('Army which complete the movements merged with Stationed Army', () => {
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [briefInfo(homeLand.army[0]).heroes[0]], // initial hero in homeland
        regulars: [],
      };

      expect(getLand(gameStateStub, homeLand.mapPos).army.length).toBe(1);
      expect(getLand(gameStateStub, barracksLand.mapPos).army.length).toBe(1);

      startMovement(homeLand.mapPos, barracksLand.mapPos, armyBriefInfo, gameStateStub);

      testTurnManagement.makeNTurns(1);
      expect(getLand(gameStateStub, homeLand.mapPos).army.length).toBe(0);
      expect(getLand(gameStateStub, barracksLand.mapPos).army.length).toBe(1); // Stationed Army

      const stationedArmy = getLand(gameStateStub, barracksLand.mapPos).army[0];
      expect(stationedArmy.regulars.length).toBe(1);
      expect(stationedArmy.heroes.length).toBe(2);
      expect(stationedArmy.heroes[0].name).toBe('Alaric the Bold'); // hero comes from homeland
      expect(stationedArmy.heroes[1].name).toBe('Cedric Brightshield');
      expect(stationedArmy.regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(stationedArmy.regulars[0].count).toBe(120);
      expect(stationedArmy.controlledBy).toBe(getTurnOwner(gameStateStub).id);
    });

    it('move on neutral territory perform Attrition Penalty and change ownership', () => {
      const from = barracksLand.mapPos;
      const fromLand = getLand(gameStateStub, from);
      expect(fromLand.army.length).toBe(1);
      expect(fromLand.army[0].heroes.length).toBe(1);
      expect(fromLand.army[0].regulars.length).toBe(1);
      expect(fromLand.army[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(fromLand.army[0].regulars[0].count).toBe(120);

      const to = { row: 3, col: 5 };
      expect(getLandOwner(gameStateStub, to)).toBe(NO_PLAYER.id);

      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [],
        regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 120 }],
      };

      startMovement(from, to, armyBriefInfo, gameStateStub);
      expect(getLand(gameStateStub, from).army.length).toBe(2);

      testTurnManagement.makeNTurns(1);

      expect(getLand(gameStateStub, from).army.length).toBe(1); // hero stay in barracks land

      const newLand = getLand(gameStateStub, to);
      expect(newLand.army.length).toBe(1);
      expect(newLand.army[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(newLand.army[0])).toBeFalsy();
      expect(newLand.army[0].regulars.length).toBe(1);
      expect(newLand.army[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(newLand.army[0].regulars[0].count).toBe(79); // attrition penalty (the same due to randomSpy)
    });

    it('All army die on new territory', () => {
      const from = barracksLand.mapPos;
      let fromLand = getLand(gameStateStub, from);
      expect(fromLand.army.length).toBe(1);
      expect(fromLand.army[0].heroes.length).toBe(1);
      expect(fromLand.army[0].regulars.length).toBe(1);
      expect(fromLand.army[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(fromLand.army[0].regulars[0].count).toBe(120);

      const to = { row: 3, col: 5 };
      expect(getLandOwner(gameStateStub, to)).toBe(NO_PLAYER.id);

      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [],
        regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 20 }], // 20 regular units is not enough to conquer the new territory
      };

      startMovement(from, to, armyBriefInfo, gameStateStub);
      fromLand = getLand(gameStateStub, from);
      expect(fromLand.army.length).toBe(2);

      testTurnManagement.makeNTurns(1);

      fromLand = getLand(gameStateStub, from);
      expect(fromLand.army.length).toBe(1); // hero and the rest of the warriors

      const newLand = getLand(gameStateStub, to);
      expect(getLandOwner(gameStateStub, newLand.mapPos)).toBe(NO_PLAYER.id); // new territory owner is not changed
      expect(newLand.army.length).toBe(0);
    });

    it('when 2 armies are reach uncontrolled land they merge in one and then attrition penalty calculated', () => {
      const from = barracksLand.mapPos;
      let fromLand = getLand(gameStateStub, from);
      expect(fromLand.army.length).toBe(1);
      expect(fromLand.army[0].heroes.length).toBe(1);
      expect(fromLand.army[0].regulars.length).toBe(1);
      expect(fromLand.army[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(fromLand.army[0].regulars[0].count).toBe(120);

      const to = { row: 3, col: 5 };
      expect(getLandOwner(gameStateStub, to)).toBe(NO_PLAYER.id);

      // first army is moved to new territory
      const ArmyBriefInfo1: ArmyBriefInfo = {
        heroes: [],
        regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 20 }], // 20 regular units is not enough to conquer the new territory
      };

      startMovement(from, to, ArmyBriefInfo1, gameStateStub);
      fromLand = getLand(gameStateStub, from);
      expect(fromLand.army.length).toBe(2);

      // second army is moved to the same territory
      const ArmyBriefInfo2: ArmyBriefInfo = {
        heroes: [],
        regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 35 }], // 35 regular units is not enough to conquer the new territory
      };

      startMovement(from, to, ArmyBriefInfo2, gameStateStub);
      fromLand = getLand(gameStateStub, from);
      expect(fromLand.army.length).toBe(3);

      testTurnManagement.makeNTurns(1);

      fromLand = getLand(gameStateStub, from);
      expect(fromLand.army.length).toBe(1); // hero and the rest of the warriors

      const newLand = getLand(gameStateStub, to);
      expect(getLandOwner(gameStateStub, newLand.mapPos)).toBe(getTurnOwner(gameStateStub).id); // new territory owner is not changed
      expect(newLand.army.length).toBe(1);
      expect(newLand.army[0].regulars.length).toBe(1);
      expect(newLand.army[0].heroes.length).toBe(0);
      expect(newLand.army[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(newLand.army[0].regulars[0].count).toBe(14);
    });
  });
});
