import { GameState } from '../../state/GameState';
import { LandState } from '../../state/map/land/LandState';
import { LandPosition } from '../../state/map/land/LandPosition';
import { ArmyBriefInfo } from '../../state/army/ArmyState';
import { UnitRank } from '../../state/army/RegularsState';
import { getLandId } from '../../state/map/land/LandId';

import { getLand, getLandOwner } from '../../selectors/landSelectors';
import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import { briefInfo, isMoving } from '../../selectors/armySelectors';
import { addLand } from '../../systems/playerActions';
import { getArmiesAtPosition } from '../../map/utils/armyUtils';

import { HeroUnitType, RegularUnitType } from '../../types/UnitType';
import { BuildingType } from '../../types/Building';

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

    gameStateStub = createDefaultGameStateStub();

    // Increase vault to handle BARRACKS maintenance cost (1000 per turn) during testing
    getTurnOwner(gameStateStub).vault = 25000;

    testTurnManagement = new TestTurnManagement(gameStateStub);
    testTurnManagement.startNewTurn(gameStateStub);
    testTurnManagement.waitStartPhaseComplete();

    // createDefaultGameStateStub place Homeland Stronghold by default
    homeLand = getPlayerLands(gameStateStub).find((l) =>
      l.buildings.some((b) => b.id === BuildingType.STRONGHOLD)
    )!;

    const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
    construct(gameStateStub, BuildingType.BARRACKS, barracksPos);
    barracksLand = getLand(gameStateStub, barracksPos);

    startRecruiting(RegularUnitType.WARRIOR, barracksPos, gameStateStub);
    startRecruiting(RegularUnitType.WARRIOR, barracksPos, gameStateStub);
    startRecruiting(HeroUnitType.FIGHTER, barracksPos, gameStateStub);

    testTurnManagement.makeNTurns(1);
    let armies = getArmiesAtPosition(gameStateStub, barracksPos);
    expect(armies.length).toBe(1);
    expect(armies[0].regulars[0].count).toBe(40);

    startRecruiting(RegularUnitType.WARRIOR, barracksPos, gameStateStub);
    startRecruiting(RegularUnitType.WARRIOR, barracksPos, gameStateStub);

    testTurnManagement.makeNTurns(1);
    armies = getArmiesAtPosition(gameStateStub, barracksPos);
    expect(armies.length).toBe(1);
    expect(armies[0].regulars[0].count).toBe(80);

    startRecruiting(RegularUnitType.WARRIOR, barracksPos, gameStateStub);
    startRecruiting(RegularUnitType.WARRIOR, barracksPos, gameStateStub);

    testTurnManagement.makeNTurns(1);

    armies = getArmiesAtPosition(gameStateStub, barracksPos);
    expect(armies.length).toBe(1);
    expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
    expect(isMoving(armies[0])).toBeFalsy();
    expect(armies[0].heroes.length).toBe(1); // 1 hero
    expect(armies[0].regulars.length).toBe(1); // and 120 warriors
    expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
    expect(armies[0].regulars[0].count).toBe(120);
    expect(armies[0].heroes[0].type).toBe(HeroUnitType.FIGHTER);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
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

        const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        expect(armies.length).toBe(2);
        // "old" army"
        expect(armies[0].regulars.length).toBe(1);
        expect(armies[0].heroes.length).toBe(1);
        expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
        expect(armies[0].regulars[0].count).toBe(100);
        expect(armies[0].heroes[0].type).toBe(HeroUnitType.FIGHTER);
        expect(isMoving(armies[0])).toBeFalsy();

        // "new" army
        expect(armies[1].regulars.length).toBe(1);
        expect(armies[1].regulars[0].count).toBe(20);
        expect(isMoving(armies[1])).toBeTruthy();
        expect(armies[1].movement.path.length).toBe(pathLength);
        armies[1].movement.path.forEach((pos) => expect(path).toContain(getLandId(pos)));
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
      const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies.length).toBe(2);
      expect(armies[0].heroes.length).toBe(1);
      expect(armies[0].heroes[0].type).toBe(HeroUnitType.FIGHTER);
      expect(isMoving(armies[0])).toBeFalsy();

      expect(armies[1].regulars[0].count).toBe(120);
      expect(isMoving(armies[1])).toBeTruthy();
    });

    it('Heroes are not able to move on hostile territory only without regular units', () => {
      const from = barracksLand.mapPos;
      const to = { row: 3, col: 5 };
      let armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);

      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [briefInfo(armies[0]).heroes[0]],
        regulars: [],
      };

      startMovement(from, to, armyBriefInfo, gameStateStub);

      // All army stays the same
      armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies.length).toBe(1);
      expect(isMoving(armies[0])).toBeFalsy();
    });

    it('Heroes are able to move on hostile territory only with regular units.', () => {
      const from = barracksLand.mapPos;
      const to = { row: 3, col: 5 };
      let armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [briefInfo(armies[0]).heroes[0]],
        regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 20 }],
      };

      startMovement(from, to, armyBriefInfo, gameStateStub);

      // only regular remains in the army
      armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies.length).toBe(2);
      expect(armies[0].regulars.length).toBe(1);
      expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(100);
      expect(isMoving(armies[0])).toBeFalsy();

      expect(armies[1].heroes.length).toBe(1);
      expect(armies[1].regulars.length).toBe(1);
      expect(isMoving(armies[1])).toBeTruthy();

      expect(armies[1].heroes[0].type).toBe(HeroUnitType.FIGHTER);
      expect(armies[1].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(armies[1].regulars[0].count).toBe(20);
    });

    it('move all units', () => {
      const from = barracksLand.mapPos;
      const to = { row: 3, col: 5 };
      let armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [briefInfo(armies[0]).heroes[0]],
        regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 120 }],
      };

      startMovement(from, to, armyBriefInfo, gameStateStub);

      // only new army remains
      armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies.length).toBe(1);
      expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(120);

      expect(armies[0].heroes.length).toBe(1);
      expect(armies[0].heroes[0].type).toBe(HeroUnitType.FIGHTER);
      expect(isMoving(armies[0])).toBeTruthy();
    });

    describe('corner cases', () => {
      it('empty army', () => {
        const emptyLand = getLand(gameStateStub, { row: 1, col: 1 });
        const armyBriefInfo: ArmyBriefInfo = {
          heroes: [],
          regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 20 }],
        };
        let armies = getArmiesAtPosition(gameStateStub, emptyLand.mapPos);

        expect(armies.length).toBe(0);

        startMovement(emptyLand.mapPos, barracksLand.mapPos, armyBriefInfo, gameStateStub);

        armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        expect(armies.length).toBe(1);
        expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
        expect(isMoving(armies[0])).toBeFalsy();
        expect(armies[0].heroes.length).toBe(1); // 1 hero
        expect(armies[0].heroes[0].type).toBe(HeroUnitType.FIGHTER);
        expect(armies[0].regulars.length).toBe(1); // and 120 warriors
        expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
        expect(armies[0].regulars[0].count).toBe(120);
      });
      it('not enough units to move', () => {
        const from = barracksLand.mapPos;
        const to = { row: 3, col: 5 };
        let armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        const armyBriefInfo: ArmyBriefInfo = {
          heroes: [briefInfo(armies[0]).heroes[0]],
          regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 1000 }],
        };

        startMovement(from, to, armyBriefInfo, gameStateStub);
        armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);

        expect(armies.length).toBe(1);
        expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
        expect(isMoving(armies[0])).toBeFalsy();
        expect(armies[0].heroes.length).toBe(1); // 1 hero
        expect(armies[0].heroes[0].type).toBe(HeroUnitType.FIGHTER);
        expect(armies[0].regulars.length).toBe(1); // and 120 warriors
        expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
        expect(armies[0].regulars[0].count).toBe(120);
      });

      it('No expected hero', () => {
        const from = barracksLand.mapPos;
        const to = { row: 3, col: 5 };
        const armyBriefInfo: ArmyBriefInfo = {
          heroes: [{ name: 'Invalid hero name', type: HeroUnitType.CLERIC, level: 1 }],
          regulars: [],
        };

        startMovement(from, to, armyBriefInfo, gameStateStub);

        const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        expect(armies.length).toBe(1);
        expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
        expect(isMoving(armies[0])).toBeFalsy();
        expect(armies[0].heroes.length).toBe(1); // 1 hero
        expect(armies[0].heroes[0].type).toBe(HeroUnitType.FIGHTER);
        expect(armies[0].regulars.length).toBe(1); // 1 and 120 warriors
        expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
        expect(armies[0].regulars[0].count).toBe(120);
      });
    });
  });

  describe('Perform movements', () => {
    it('Hero allowed to move without regular units only on owned territories', () => {
      const to = { row: homeLand.mapPos.row + 1, col: homeLand.mapPos.col };
      let armies = getArmiesAtPosition(gameStateStub, homeLand.mapPos);
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [briefInfo(armies[0]).heroes[0]], // initial hero in homeland
        regulars: [],
      };

      startMovement(homeLand.mapPos, to, armyBriefInfo, gameStateStub);
      testTurnManagement.makeNTurns(1);

      armies = getArmiesAtPosition(gameStateStub, homeLand.mapPos);
      expect(armies.length).toBe(0);

      armies = getArmiesAtPosition(gameStateStub, to);
      expect(armies.length).toBe(1);
      expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[0].heroes.length).toBe(1);
      expect(armies[0].heroes[0].name).toBe(armyBriefInfo.heroes[0].name);
    });

    it('Army which complete the movements merged with Stationed Army', () => {
      let armies = getArmiesAtPosition(gameStateStub, homeLand.mapPos);
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [briefInfo(armies[0]).heroes[0]], // initial hero in homeland
        regulars: [],
      };

      expect(armies.length).toBe(1);

      armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies.length).toBe(1);

      startMovement(homeLand.mapPos, barracksLand.mapPos, armyBriefInfo, gameStateStub);

      testTurnManagement.makeNTurns(1);
      armies = getArmiesAtPosition(gameStateStub, homeLand.mapPos);
      expect(armies.length).toBe(0);

      armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies.length).toBe(1); // Stationed Army

      const stationedArmy = armies[0];
      expect(stationedArmy.regulars.length).toBe(1);
      expect(stationedArmy.heroes.length).toBe(2);
      expect(stationedArmy.heroes[0].name).toBe('Alaric the Bold'); // hero comes from homeland
      expect(stationedArmy.heroes[1].name).not.toBe('Alaric the Bold');
      expect(stationedArmy.regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(stationedArmy.regulars[0].count).toBe(120);
      expect(stationedArmy.controlledBy).toBe(getTurnOwner(gameStateStub).id);
    });

    it('move on neutral territory perform Attrition Penalty and change ownership', () => {
      const from = barracksLand.mapPos;
      let armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies.length).toBe(1);
      expect(armies[0].heroes.length).toBe(1);
      expect(armies[0].regulars.length).toBe(1);
      expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(120);

      const to = { row: 3, col: 5 };
      expect(getLandOwner(gameStateStub, to)).toBe(NO_PLAYER.id);

      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [],
        regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 120 }],
      };

      startMovement(from, to, armyBriefInfo, gameStateStub);
      armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies.length).toBe(2);

      randomSpy = jest.spyOn(Math, 'random');
      randomSpy.mockReturnValue(0.01); // to return the same value on any random function call to clculate the same a

      testTurnManagement.makeNTurns(1);

      armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies.length).toBe(1); // hero stay in barracks land

      armies = getArmiesAtPosition(gameStateStub, to);
      expect(armies.length).toBe(1);
      expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[0].regulars.length).toBe(1);
      expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(79); // attrition penalty (the same due to randomSpy)

      randomSpy.mockRestore();
    });

    it('All army die on new territory', () => {
      const from = barracksLand.mapPos;
      let armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies.length).toBe(1);
      expect(armies[0].heroes.length).toBe(1);
      expect(armies[0].regulars.length).toBe(1);
      expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(120);

      const to = { row: 3, col: 5 };
      expect(getLandOwner(gameStateStub, to)).toBe(NO_PLAYER.id);

      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [],
        regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 20 }], // 20 regular units is not enough to conquer the new territory
      };

      startMovement(from, to, armyBriefInfo, gameStateStub);
      armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies.length).toBe(2);

      testTurnManagement.makeNTurns(1);

      armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies.length).toBe(1); // hero and the rest of the warriors

      armies = getArmiesAtPosition(gameStateStub, to);
      expect(armies.length).toBe(0);
      expect(getLandOwner(gameStateStub, to)).toBe(NO_PLAYER.id); // new territory owner is not changed
    });

    it('when 2 armies are reach uncontrolled land they merge in one and then attrition penalty calculated', () => {
      const from = barracksLand.mapPos;
      let armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies.length).toBe(1);
      expect(armies[0].heroes.length).toBe(1);
      expect(armies[0].regulars.length).toBe(1);
      expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(120);

      const to = { row: 3, col: 5 };
      expect(getLandOwner(gameStateStub, to)).toBe(NO_PLAYER.id);

      // first army is moved to new territory
      const ArmyBriefInfo1: ArmyBriefInfo = {
        heroes: [],
        regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 20 }], // 20 regular units is not enough to conquer the new territory
      };

      startMovement(from, to, ArmyBriefInfo1, gameStateStub);
      armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies.length).toBe(2);

      // second army is moved to the same territory
      const ArmyBriefInfo2: ArmyBriefInfo = {
        heroes: [],
        regulars: [{ id: RegularUnitType.WARRIOR, rank: UnitRank.REGULAR, count: 35 }], // 35 regular units is not enough to conquer the new territory
      };

      startMovement(from, to, ArmyBriefInfo2, gameStateStub);
      armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies.length).toBe(3);

      randomSpy = jest.spyOn(Math, 'random');
      randomSpy.mockReturnValue(0.01); // to return the same value on any random function call to calculate the same a

      testTurnManagement.makeNTurns(1);

      armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies.length).toBe(1); // hero and the rest of the warriors

      armies = getArmiesAtPosition(gameStateStub, to);
      expect(armies.length).toBe(1);
      expect(armies[0].regulars.length).toBe(1);
      expect(armies[0].heroes.length).toBe(0);
      expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(14);
      expect(getLandOwner(gameStateStub, to)).toBe(getTurnOwner(gameStateStub).id); // new territory owner is not changed

      randomSpy.mockRestore();
    });
  });
});
