import { getLandId } from '../../state/map/land/LandId';
import {
  getLand,
  getLandOwner,
  getPlayerLands,
  getTilesInRadius,
  hasActiveEffect,
  hasBuilding,
} from '../../selectors/landSelectors';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { briefInfo, getArmiesAtPosition, isMoving } from '../../selectors/armySelectors';
import { addPlayerLand, updateLandEffect } from '../../systems/gameStateActions';
import { getMapDimensions } from '../../utils/screenPositionUtils';
import { regularsFactory } from '../../factories/regularsFactory';
import { effectFactory } from '../../factories/effectFactory';
import { construct } from '../../map/building/construct';
import { startRecruiting } from '../../map/recruiting/startRecruiting';
import { startMovement } from '../../map/move-army/startMovement';
import { castSpell } from '../../map/magic/castSpell';
import { NO_PLAYER } from '../../domain/player/playerRepository';
import { TreasureName } from '../../types/Treasures';
import { HeroUnitName, RegularUnitName, WarMachineName } from '../../types/UnitType';
import { BuildingName } from '../../types/Building';
import { SpellName } from '../../types/Spell';
import { UnitRank } from '../../state/army/RegularsState';
import type { GameState } from '../../state/GameState';
import type { LandState } from '../../state/map/land/LandState';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { ArmyBriefInfo } from '../../state/army/ArmyState';

import { TestTurnManagement } from '../utils/TestTurnManagement';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { placeUnitsOnMap } from '../utils/placeUnitsOnMap';

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
    homeLand = getPlayerLands(gameStateStub).find((l) => hasBuilding(l, BuildingName.STRONGHOLD))!;

    const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
    construct(gameStateStub, BuildingName.BARRACKS, barracksPos);
    barracksLand = getLand(gameStateStub, barracksPos);

    startRecruiting(gameStateStub, barracksPos, RegularUnitName.WARRIOR);
    startRecruiting(gameStateStub, barracksPos, RegularUnitName.WARRIOR);
    startRecruiting(gameStateStub, barracksPos, HeroUnitName.FIGHTER);

    testTurnManagement.makeNTurns(1);
    let armies = getArmiesAtPosition(gameStateStub, barracksPos);
    expect(armies).toHaveLength(1);
    expect(armies[0].regulars[0].count).toBe(40);

    startRecruiting(gameStateStub, barracksPos, RegularUnitName.WARRIOR);
    startRecruiting(gameStateStub, barracksPos, RegularUnitName.WARRIOR);

    testTurnManagement.makeNTurns(1);
    armies = getArmiesAtPosition(gameStateStub, barracksPos);
    expect(armies).toHaveLength(1);
    expect(armies[0].regulars[0].count).toBe(80);

    startRecruiting(gameStateStub, barracksPos, RegularUnitName.WARRIOR);
    startRecruiting(gameStateStub, barracksPos, RegularUnitName.WARRIOR);

    testTurnManagement.makeNTurns(1);

    // recruit war machine first
    startRecruiting(gameStateStub, barracksPos, WarMachineName.CATAPULT);
    startRecruiting(gameStateStub, barracksPos, WarMachineName.SIEGE_TOWER);
    startRecruiting(gameStateStub, barracksPos, WarMachineName.CATAPULT);
    testTurnManagement.makeNTurns(3);

    armies = getArmiesAtPosition(gameStateStub, barracksPos);
    expect(armies).toHaveLength(1);
    expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
    expect(isMoving(armies[0])).toBeFalsy();
    expect(armies[0].heroes).toHaveLength(1); // 1 hero
    expect(armies[0].heroes[0].type).toBe(HeroUnitName.FIGHTER);
    expect(armies[0].regulars).toHaveLength(1); // and 120 warriors
    expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
    expect(armies[0].regulars[0].count).toBe(120);
    expect(armies[0].warMachines[0].type).toBe(WarMachineName.SIEGE_TOWER);
    expect(armies[0].warMachines[0].count).toBe(1);
    expect(armies[0].warMachines[1].type).toBe(WarMachineName.CATAPULT);
    expect(armies[0].warMachines[1].count).toBe(2);
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
        const armyBriefInfo: ArmyBriefInfo = {
          heroes: [],
          regulars: [{ id: RegularUnitName.WARRIOR, rank: UnitRank.REGULAR, count: 20 }],
          warMachines: [],
        };

        Object.assign(gameStateStub, startMovement(gameStateStub, from, to, armyBriefInfo));

        const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        expect(armies).toHaveLength(2);
        // "old" army"
        expect(armies[0].regulars).toHaveLength(1);
        expect(armies[0].heroes).toHaveLength(1);
        expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
        expect(armies[0].regulars[0].count).toBe(100);
        expect(armies[0].heroes[0].type).toBe(HeroUnitName.FIGHTER);
        expect(isMoving(armies[0])).toBeFalsy();

        // "new" army
        expect(armies[1].regulars).toHaveLength(1);
        expect(armies[1].regulars[0].count).toBe(20);
        expect(isMoving(armies[1])).toBeTruthy();
        expect(armies[1].movement.path).toHaveLength(pathLength);
        armies[1].movement.path.forEach((pos) => expect(path).toContain(getLandId(pos)));
      }
    );

    it('move all regular units', () => {
      const from = barracksLand.mapPos;
      const to = { row: 3, col: 5 };
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [],
        regulars: [{ id: RegularUnitName.WARRIOR, rank: UnitRank.REGULAR, count: 120 }],
        warMachines: [],
      };

      Object.assign(gameStateStub, startMovement(gameStateStub, from, to, armyBriefInfo));

      // only hero remains in the army
      const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies).toHaveLength(2);
      expect(armies[0].heroes).toHaveLength(1);
      expect(armies[0].heroes[0].type).toBe(HeroUnitName.FIGHTER);
      expect(isMoving(armies[0])).toBeFalsy();

      expect(armies[1].regulars[0].count).toBe(120);
      expect(isMoving(armies[1])).toBeTruthy();
    });

    describe('Move on Hostile Territory', () => {
      let from: LandPosition;
      const to = { row: 3, col: 5 };

      beforeEach(() => {
        from = barracksLand.mapPos;
        expect(getLandOwner(gameStateStub, to)).not.toBe(getTurnOwner(gameStateStub).id);
      });

      it('Heroes are not able to move on hostile territory only without regular units', () => {
        let armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);

        const armyBriefInfo: ArmyBriefInfo = {
          heroes: [briefInfo(armies[0]).heroes[0]],
          regulars: [],
          warMachines: [],
        };

        Object.assign(gameStateStub, startMovement(gameStateStub, from, to, armyBriefInfo));

        // All army stays the same
        armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        expect(armies).toHaveLength(1);
        expect(isMoving(armies[0])).toBeFalsy();
      });

      it('Heroes are able to move on hostile territory only with regular units.', () => {
        let armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        const armyBriefInfo: ArmyBriefInfo = {
          heroes: [briefInfo(armies[0]).heroes[0]],
          regulars: [{ id: RegularUnitName.WARRIOR, rank: UnitRank.REGULAR, count: 20 }],
          warMachines: [],
        };

        Object.assign(gameStateStub, startMovement(gameStateStub, from, to, armyBriefInfo));

        // only regular remains in the army
        armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        expect(armies).toHaveLength(2);
        expect(armies[0].regulars).toHaveLength(1);
        expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
        expect(armies[0].regulars[0].count).toBe(100);
        expect(isMoving(armies[0])).toBeFalsy();

        expect(armies[1].heroes).toHaveLength(1);
        expect(armies[1].regulars).toHaveLength(1);
        expect(isMoving(armies[1])).toBeTruthy();

        expect(armies[1].heroes[0].type).toBe(HeroUnitName.FIGHTER);
        expect(armies[1].regulars[0].type).toBe(RegularUnitName.WARRIOR);
        expect(armies[1].regulars[0].count).toBe(20);
      });

      it('War-Machines are not able to move on hostile territory without regular units', () => {
        let armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);

        const armyBriefInfo: ArmyBriefInfo = {
          heroes: [],
          regulars: [],
          warMachines: [briefInfo(armies[0]).warMachines[0]],
        };

        Object.assign(gameStateStub, startMovement(gameStateStub, from, to, armyBriefInfo));

        // All armies stay the same
        armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        expect(armies).toHaveLength(1);
        expect(isMoving(armies[0])).toBeFalsy();
      });

      it('War-machines are able to move on hostile territory only with regular units.', () => {
        let armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        const armyBriefInfo: ArmyBriefInfo = {
          heroes: [],
          regulars: [briefInfo(armies[0]).regulars[0]],
          warMachines: [briefInfo(armies[0]).warMachines[1]],
        };

        Object.assign(gameStateStub, startMovement(gameStateStub, from, to, armyBriefInfo));

        // only hero remain in the army
        armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        expect(armies).toHaveLength(2);
        expect(armies[0].heroes).toHaveLength(1);
        expect(armies[0].regulars).toHaveLength(0);
        expect(armies[0].warMachines).toHaveLength(1);
        expect(isMoving(armies[0])).toBeFalsy();

        expect(armies[1].heroes).toHaveLength(0);
        expect(armies[1].regulars).toHaveLength(1);
        expect(armies[1].warMachines).toHaveLength(1);
        expect(isMoving(armies[1])).toBeTruthy();

        expect(armies[1].regulars[0].type).toBe(RegularUnitName.WARRIOR);
        expect(armies[1].regulars[0].count).toBe(120);
        expect(armies[1].warMachines[0].type).toBe(WarMachineName.CATAPULT);
        expect(armies[1].warMachines[0].count).toBe(2);
      });

      it('War-Machines and Hero are not able to move on hostile territory together without regular units', () => {
        let armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);

        const armyBriefInfo: ArmyBriefInfo = {
          heroes: [briefInfo(armies[0]).heroes[0]],
          regulars: [],
          warMachines: [
            {
              type: WarMachineName.CATAPULT,
              count: 1,
            },
          ],
        };

        Object.assign(gameStateStub, startMovement(gameStateStub, from, to, armyBriefInfo));

        // All armies stay the same
        armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        expect(armies).toHaveLength(1);
        expect(isMoving(armies[0])).toBeFalsy();
      });

      it('move all units', () => {
        let armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        const armyBriefInfo: ArmyBriefInfo = briefInfo(armies[0]);

        Object.assign(gameStateStub, startMovement(gameStateStub, from, to, armyBriefInfo));

        // only new army remains
        armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        expect(armies).toHaveLength(1);
        expect(armies[0].heroes).toHaveLength(1);
        expect(armies[0].heroes[0].type).toBe(HeroUnitName.FIGHTER);

        expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
        expect(armies[0].regulars[0].count).toBe(120);

        expect(armies[0].warMachines).toHaveLength(2);
        expect(armies[0].warMachines[0].type).toBe(WarMachineName.SIEGE_TOWER);
        expect(armies[0].warMachines[0].count).toBe(1);
        expect(armies[0].warMachines[1].type).toBe(WarMachineName.CATAPULT);
        expect(armies[0].warMachines[1].count).toBe(2);

        expect(isMoving(armies[0])).toBeTruthy();
      });
    });

    describe('corner cases', () => {
      it('empty army', () => {
        const emptyLand = getLand(gameStateStub, { row: 1, col: 1 });
        const armyBriefInfo: ArmyBriefInfo = {
          heroes: [],
          regulars: [{ id: RegularUnitName.WARRIOR, rank: UnitRank.REGULAR, count: 20 }],
          warMachines: [],
        };
        let armies = getArmiesAtPosition(gameStateStub, emptyLand.mapPos);

        expect(armies).toHaveLength(0);

        Object.assign(
          gameStateStub,
          startMovement(gameStateStub, emptyLand.mapPos, barracksLand.mapPos, armyBriefInfo)
        );

        armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        expect(armies).toHaveLength(1);
        expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
        expect(isMoving(armies[0])).toBeFalsy();
        expect(armies[0].heroes).toHaveLength(1); // 1 hero
        expect(armies[0].heroes[0].type).toBe(HeroUnitName.FIGHTER);
        expect(armies[0].regulars).toHaveLength(1); // and 120 warriors
        expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
        expect(armies[0].regulars[0].count).toBe(120);
      });
      it('not enough units to move', () => {
        const from = barracksLand.mapPos;
        const to = { row: 3, col: 5 };
        let armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        const armyBriefInfo: ArmyBriefInfo = {
          heroes: [briefInfo(armies[0]).heroes[0]],
          regulars: [{ id: RegularUnitName.WARRIOR, rank: UnitRank.REGULAR, count: 1000 }],
          warMachines: [],
        };

        Object.assign(gameStateStub, startMovement(gameStateStub, from, to, armyBriefInfo));
        armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);

        expect(armies).toHaveLength(1);
        expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
        expect(isMoving(armies[0])).toBeFalsy();
        expect(armies[0].heroes).toHaveLength(1); // 1 hero
        expect(armies[0].heroes[0].type).toBe(HeroUnitName.FIGHTER);
        expect(armies[0].regulars).toHaveLength(1); // and 120 warriors
        expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
        expect(armies[0].regulars[0].count).toBe(120);
      });

      it('No expected hero', () => {
        const from = barracksLand.mapPos;
        const to = { row: 3, col: 5 };
        const armyBriefInfo: ArmyBriefInfo = {
          heroes: [{ name: 'Invalid hero name', type: HeroUnitName.CLERIC, level: 1 }],
          regulars: [],
          warMachines: [],
        };

        Object.assign(gameStateStub, startMovement(gameStateStub, from, to, armyBriefInfo));

        const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        expect(armies).toHaveLength(1);
        expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
        expect(isMoving(armies[0])).toBeFalsy();
        expect(armies[0].heroes).toHaveLength(1); // 1 hero
        expect(armies[0].heroes[0].type).toBe(HeroUnitName.FIGHTER);
        expect(armies[0].regulars).toHaveLength(1); // 1 and 120 warriors
        expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
        expect(armies[0].regulars[0].count).toBe(120);
      });
    });
  });

  describe('Perform movements', () => {
    it('When army step on opponent land it became turn owners land and remove from opponent lands', () => {
      const opponent = gameStateStub.players[1].id;
      const opponentLand = getPlayerLands(gameStateStub, opponent)[1];
      expect(getLandOwner(gameStateStub, opponentLand.mapPos)).toBe(opponent);
      expect(getPlayerLands(gameStateStub, opponent).map((l) => getLandId(l.mapPos))).toContain(
        getLandId(opponentLand.mapPos)
      );
      const from: LandPosition = getTilesInRadius(
        getMapDimensions(gameStateStub),
        opponentLand.mapPos,
        1
      ).find((l) => getLandOwner(gameStateStub, l) !== opponent)!; // move from neutral land

      placeUnitsOnMap(regularsFactory(RegularUnitName.WARD_HANDS, 120), gameStateStub, from);

      let armies = getArmiesAtPosition(gameStateStub, from);
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [],
        regulars: [briefInfo(armies[0]).regulars[0]],
        warMachines: [],
      };

      /******************* Start Movement *********************/
      Object.assign(
        gameStateStub,
        startMovement(gameStateStub, from, opponentLand.mapPos, armyBriefInfo)
      );
      /******************* End Movement *********************/
      testTurnManagement.makeNTurns(1);
      /******************* Verify Ownership *********************/
      armies = getArmiesAtPosition(gameStateStub, opponentLand.mapPos);
      expect(armies).toHaveLength(1);
      expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[0].regulars).toHaveLength(1);
      expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARD_HANDS);
      expect(armies[0].regulars[0].count).toBeLessThan(120); // due to attrition penalty
      // additionally verify that land is removed from opponent lands
      expect(getPlayerLands(gameStateStub, opponent).map((l) => getLandId(l.mapPos))).not.toContain(
        getLandId(opponentLand.mapPos)
      );
    });

    it('When army occupy opponent land with DEED OF RECLAMATION effect then effect disappears', () => {
      const from = barracksLand.mapPos;
      const to = getTilesInRadius(getMapDimensions(gameStateStub), from, 1).find(
        (l) => getLandOwner(gameStateStub, l) === NO_PLAYER.id
      )!;

      /******************* Add DEED OF RECLAMATION by opponent *********************/
      Object.assign(
        gameStateStub,
        updateLandEffect(
          gameStateStub,
          to,
          effectFactory(TreasureName.DEED_OF_RECLAMATION, gameStateStub.players[1].id)
        )
      );
      Object.assign(gameStateStub, addPlayerLand(gameStateStub, gameStateStub.players[1].id, to));

      /****************** Start Movement *********************/
      // 20 regular units is not enough to conquer the new territory so it became neutral and DEED OF RECLAMATION effect disappears
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [],
        regulars: [{ id: RegularUnitName.WARRIOR, rank: UnitRank.REGULAR, count: 20 }],
        warMachines: [],
      };
      Object.assign(gameStateStub, startMovement(gameStateStub, from, to, armyBriefInfo));

      /******************* End Movement *********************/
      testTurnManagement.makeNTurns(1);
      /******************* Verify Ownership *********************/
      const armies = getArmiesAtPosition(gameStateStub, to);
      expect(armies).toHaveLength(0);
      // land became neutral
      expect(getLandOwner(gameStateStub, to)).toBe(NO_PLAYER.id);
      // DEED OF RECLAMATION effect disappears
      expect(getLand(gameStateStub, to).effects).toHaveLength(0);
    });

    it('Hero allowed to move without regular units only on owned territories', () => {
      const to = { row: homeLand.mapPos.row + 1, col: homeLand.mapPos.col };
      let armies = getArmiesAtPosition(gameStateStub, homeLand.mapPos);
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [briefInfo(armies[0]).heroes[0]], // initial hero in homeland
        regulars: [],
        warMachines: [],
      };

      Object.assign(
        gameStateStub,
        startMovement(gameStateStub, homeLand.mapPos, to, armyBriefInfo)
      );
      testTurnManagement.makeNTurns(1);

      armies = getArmiesAtPosition(gameStateStub, homeLand.mapPos);
      expect(armies).toHaveLength(0);

      armies = getArmiesAtPosition(gameStateStub, to);
      expect(armies).toHaveLength(1);
      expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[0].heroes).toHaveLength(1);
      expect(armies[0].heroes[0].name).toBe(armyBriefInfo.heroes[0].name);
    });

    it('War-Machine allowed to move without regular units only on owned territories', () => {
      const to = { row: homeLand.mapPos.row + 1, col: homeLand.mapPos.col };
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [],
        regulars: [],
        warMachines: [{ type: WarMachineName.CATAPULT, count: 1 }],
      };

      Object.assign(
        gameStateStub,
        startMovement(gameStateStub, barracksLand.mapPos, to, armyBriefInfo)
      );
      testTurnManagement.makeNTurns(2); // 2 turn to destination from barrack land to "to" position

      const remainArmy = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(remainArmy[0].warMachines[0].type).toBe(WarMachineName.SIEGE_TOWER);
      expect(remainArmy[0].warMachines[0].count).toBe(1);
      expect(remainArmy[0].warMachines[1].type).toBe(WarMachineName.CATAPULT);
      expect(remainArmy[0].warMachines[1].count).toBe(1);

      const armies = getArmiesAtPosition(gameStateStub, to);
      expect(armies).toHaveLength(1);
      expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[0].warMachines).toHaveLength(1);
      expect(armies[0].warMachines[0].type).toBe(WarMachineName.CATAPULT);
      expect(armies[0].warMachines[0].count).toBe(1);
    });

    it('Army which complete the movements merged with Stationed Army', () => {
      let armies = getArmiesAtPosition(gameStateStub, homeLand.mapPos);
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [briefInfo(armies[0]).heroes[0]], // initial hero in homeland
        regulars: [],
        warMachines: [],
      };

      expect(armies).toHaveLength(1);

      armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies).toHaveLength(1);

      Object.assign(
        gameStateStub,
        startMovement(gameStateStub, homeLand.mapPos, barracksLand.mapPos, armyBriefInfo)
      );

      testTurnManagement.makeNTurns(1);
      armies = getArmiesAtPosition(gameStateStub, homeLand.mapPos);
      expect(armies).toHaveLength(0);

      armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies).toHaveLength(1); // Stationed Army

      const stationedArmy = armies[0];
      expect(stationedArmy.regulars).toHaveLength(1);
      expect(stationedArmy.heroes).toHaveLength(2);
      expect(stationedArmy.heroes[0].name).toBe('Alaric the Bold'); // hero comes from homeland
      expect(stationedArmy.heroes[1].name).not.toBe('Alaric the Bold');
      expect(stationedArmy.regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(stationedArmy.regulars[0].count).toBe(120);
      expect(stationedArmy.controlledBy).toBe(getTurnOwner(gameStateStub).id);
    });

    it('War-machined merged when reach destination', () => {
      const from = barracksLand.mapPos;
      const to = homeLand.mapPos;
      const armyBriefInfo1: ArmyBriefInfo = {
        heroes: [],
        regulars: [],
        warMachines: [{ type: WarMachineName.SIEGE_TOWER, count: 1 }],
      };

      Object.assign(gameStateStub, startMovement(gameStateStub, from, to, armyBriefInfo1));

      const armyBriefInfo2: ArmyBriefInfo = {
        heroes: [],
        regulars: [],
        warMachines: [{ type: WarMachineName.CATAPULT, count: 1 }],
      };

      Object.assign(gameStateStub, startMovement(gameStateStub, from, to, armyBriefInfo2));

      expect(getArmiesAtPosition(gameStateStub, from)).toHaveLength(3);
      expect(getArmiesAtPosition(gameStateStub, to)).toHaveLength(1);

      testTurnManagement.makeNTurns(1);

      expect(getArmiesAtPosition(gameStateStub, from)).toHaveLength(1);
      const fromArmy = getArmiesAtPosition(gameStateStub, from)[0];
      expect(fromArmy.warMachines).toHaveLength(1);
      expect(fromArmy.warMachines[0].type).toBe(WarMachineName.CATAPULT);
      expect(fromArmy.warMachines[0].count).toBe(1);

      expect(getArmiesAtPosition(gameStateStub, to)).toHaveLength(1);
      const toArmy = getArmiesAtPosition(gameStateStub, to)[0];
      expect(toArmy.warMachines).toHaveLength(2);
      expect(toArmy.warMachines[0].type).toBe(WarMachineName.CATAPULT);
      expect(toArmy.warMachines[0].count).toBe(1);
      expect(toArmy.warMachines[1].type).toBe(WarMachineName.SIEGE_TOWER);
      expect(toArmy.warMachines[1].count).toBe(1);
    });

    it('move on neutral territory perform Attrition Penalty and change ownership', () => {
      const from = barracksLand.mapPos;
      let armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies).toHaveLength(1);
      expect(armies[0].heroes).toHaveLength(1);
      expect(armies[0].regulars).toHaveLength(1);
      expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(120);

      const to = { row: 3, col: 5 };
      expect(getLandOwner(gameStateStub, to)).toBe(NO_PLAYER.id);

      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [],
        regulars: [{ id: RegularUnitName.WARRIOR, rank: UnitRank.REGULAR, count: 120 }],
        warMachines: [],
      };

      Object.assign(gameStateStub, startMovement(gameStateStub, from, to, armyBriefInfo));
      armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies).toHaveLength(2);

      randomSpy = jest.spyOn(Math, 'random');
      randomSpy.mockReturnValue(0.01); // to return the same value on any random function call to calculate the same penalty

      testTurnManagement.makeNTurns(1);

      armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies).toHaveLength(1); // hero stay in barracks land

      armies = getArmiesAtPosition(gameStateStub, to);
      expect(armies).toHaveLength(1);
      expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[0].regulars).toHaveLength(1);
      expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(79); // attrition penalty (the same due to randomSpy)

      randomSpy.mockRestore();
    });

    it('All army die on new territory', () => {
      const from = barracksLand.mapPos;
      let armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies).toHaveLength(1);
      expect(armies[0].heroes).toHaveLength(1);
      expect(armies[0].regulars).toHaveLength(1);
      expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(120);

      const to = { row: 3, col: 5 };
      expect(getLandOwner(gameStateStub, to)).toBe(NO_PLAYER.id);

      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [],
        regulars: [{ id: RegularUnitName.WARRIOR, rank: UnitRank.REGULAR, count: 20 }], // 20 regular units is not enough to conquer the new territory
        warMachines: [],
      };

      Object.assign(gameStateStub, startMovement(gameStateStub, from, to, armyBriefInfo));
      armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies).toHaveLength(2);

      testTurnManagement.makeNTurns(1);

      armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies).toHaveLength(1); // hero and the rest of the warriors

      armies = getArmiesAtPosition(gameStateStub, to);
      expect(armies).toHaveLength(0);
      expect(getLandOwner(gameStateStub, to)).toBe(NO_PLAYER.id); // new territory owner is not changed
    });

    it('War-machines destroyed on Hostile territory if no regulars or Heroes present', () => {
      const from = barracksLand.mapPos;
      let armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies).toHaveLength(1);
      expect(armies[0].heroes).toHaveLength(1);
      expect(armies[0].regulars).toHaveLength(1);
      expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(120);

      const to = { row: 3, col: 5 };
      expect(getLandOwner(gameStateStub, to)).toBe(NO_PLAYER.id);

      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [],
        regulars: [{ id: RegularUnitName.WARRIOR, rank: UnitRank.REGULAR, count: 20 }], // 20 regular units is not enough to conquer the new territory
        warMachines: [briefInfo(armies[0]).warMachines[0]],
      };

      Object.assign(gameStateStub, startMovement(gameStateStub, from, to, armyBriefInfo));
      armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies).toHaveLength(2);
      expect(armies[0].warMachines).toHaveLength(1);
      expect(armies[0].warMachines[0].type).toBe(WarMachineName.CATAPULT);
      expect(armies[0].warMachines[0].count).toBe(2);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[1].warMachines).toHaveLength(1);
      expect(armies[1].warMachines[0].type).toBe(WarMachineName.SIEGE_TOWER);
      expect(armies[1].warMachines[0].count).toBe(1);
      expect(isMoving(armies[1])).toBeTruthy();

      testTurnManagement.makeNTurns(1);

      armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies).toHaveLength(1); // hero and the rest of the warriors and war-machines
      expect(armies[0].warMachines).toHaveLength(1);
      expect(armies[0].warMachines[0].type).toBe(WarMachineName.CATAPULT);
      expect(armies[0].warMachines[0].count).toBe(2);

      armies = getArmiesAtPosition(gameStateStub, to);
      expect(armies).toHaveLength(0);
      expect(getLandOwner(gameStateStub, to)).toBe(NO_PLAYER.id); // new territory owner is not changed
    });

    it('when 2 armies are reach uncontrolled land they merge in one and then attrition penalty calculated', () => {
      const from = barracksLand.mapPos;
      let armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies).toHaveLength(1);
      expect(armies[0].heroes).toHaveLength(1);
      expect(armies[0].regulars).toHaveLength(1);
      expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(120);

      const to = { row: 3, col: 5 };
      expect(getLandOwner(gameStateStub, to)).toBe(NO_PLAYER.id);

      // first army is moved to new territory
      const ArmyBriefInfo1: ArmyBriefInfo = {
        heroes: [],
        regulars: [{ id: RegularUnitName.WARRIOR, rank: UnitRank.REGULAR, count: 20 }], // 20 regular units is not enough to conquer the new territory
        warMachines: [],
      };

      Object.assign(gameStateStub, startMovement(gameStateStub, from, to, ArmyBriefInfo1));
      armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies).toHaveLength(2);

      // second army is moved to the same territory
      const ArmyBriefInfo2: ArmyBriefInfo = {
        heroes: [],
        regulars: [{ id: RegularUnitName.WARRIOR, rank: UnitRank.REGULAR, count: 35 }], // 35 regular units is not enough to conquer the new territory
        warMachines: [],
      };

      Object.assign(gameStateStub, startMovement(gameStateStub, from, to, ArmyBriefInfo2));
      armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies).toHaveLength(3);

      randomSpy = jest.spyOn(Math, 'random');
      randomSpy.mockReturnValue(0.01); // to return the same value on any random function call to calculate the same a

      testTurnManagement.makeNTurns(1);

      armies = getArmiesAtPosition(gameStateStub, from);
      expect(armies).toHaveLength(1); // hero and the rest of the warriors

      armies = getArmiesAtPosition(gameStateStub, to);
      expect(armies).toHaveLength(1);
      expect(armies[0].regulars).toHaveLength(1);
      expect(armies[0].heroes).toHaveLength(0);
      expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(14);
      expect(getLandOwner(gameStateStub, to)).toBe(getTurnOwner(gameStateStub).id); // new territory owner is not changed

      randomSpy.mockRestore();
    });

    it('ENTANGLING ROOTS should prevent armies from moving', () => {
      // set player 1 to turnOwner to emulate castSpell ENTANGLING ROOTS on player 0 territory on previous turn
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      gameStateStub.players[1].mana.green = 200;
      castSpell(gameStateStub, SpellName.ENTANGLING_ROOTS, homeLand.mapPos);
      // roll-back turnOwner
      gameStateStub.turnOwner = gameStateStub.players[0].id;
      expect(
        hasActiveEffect(getLand(gameStateStub, homeLand.mapPos), SpellName.ENTANGLING_ROOTS)
      ).toBeTruthy();

      const to = { row: homeLand.mapPos.row + 1, col: homeLand.mapPos.col };
      let armies = getArmiesAtPosition(gameStateStub, homeLand.mapPos);
      const armyBriefInfo: ArmyBriefInfo = {
        heroes: [briefInfo(armies[0]).heroes[0]], // initial hero in homeland
        regulars: [],
        warMachines: [],
      };

      Object.assign(
        gameStateStub,
        startMovement(gameStateStub, homeLand.mapPos, to, armyBriefInfo)
      );
      expect(isMoving(getArmiesAtPosition(gameStateStub, homeLand.mapPos)[0])).toBeTruthy();
      testTurnManagement.makeNTurns(1);

      const heroArmy = getArmiesAtPosition(gameStateStub, homeLand.mapPos);
      expect(heroArmy).toHaveLength(1); // armies should not move
      expect(isMoving(heroArmy[0])).toBeTruthy();
      expect(getLand(gameStateStub, homeLand.mapPos).effects).toHaveLength(0); // effect disappear

      // double-check that
      testTurnManagement.makeNTurns(1);
      expect(getArmiesAtPosition(gameStateStub, homeLand.mapPos)).toHaveLength(0);

      armies = getArmiesAtPosition(gameStateStub, to);
      expect(armies).toHaveLength(1);
      expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[0].heroes).toHaveLength(1);
      expect(armies[0].heroes[0].name).toBe(armyBriefInfo.heroes[0].name);
    });
  });
});
