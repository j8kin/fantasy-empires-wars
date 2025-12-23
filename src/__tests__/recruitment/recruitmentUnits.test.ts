import { getLand } from '../../selectors/landSelectors';
import { getPlayer, getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import { getArmiesAtPosition, isMoving } from '../../selectors/armySelectors';
import { getAvailableSlotsCount, getOccupiedSlotsCount } from '../../selectors/buildingSelectors';
import { addPlayerEmpireTreasure } from '../../systems/gameStateActions';
import { relictFactory } from '../../factories/treasureFactory';
import { unitsBaseStats } from '../../domain/unit/unitRepository';
import { startRecruiting } from '../../map/recruiting/startRecruiting';
import { construct } from '../../map/building/construct';
import { castSpell } from '../../map/magic/castSpell';

import { BuildingType } from '../../types/Building';
import { TreasureType } from '../../types/Treasures';
import { HeroUnitType, RegularUnitType, UnitType } from '../../types/UnitType';
import { SpellName } from '../../types/Spell';
import { UnitRank } from '../../state/army/RegularsState';
import type { GameState } from '../../state/GameState';
import type { LandState } from '../../state/map/land/LandState';
import type { LandPosition } from '../../state/map/land/LandPosition';

import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { TestTurnManagement } from '../utils/TestTurnManagement';

describe('Recruitment', () => {
  let randomSpy: jest.SpyInstance<number, []>;

  let testTurnManagement: TestTurnManagement;
  let gameStateStub: GameState;

  let homeLand: LandState;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    randomSpy = jest.spyOn(Math, 'random');

    gameStateStub = createDefaultGameStateStub();

    testTurnManagement = new TestTurnManagement(gameStateStub);
    testTurnManagement.startNewTurn(gameStateStub);
    testTurnManagement.waitStartPhaseComplete();

    // createDefaultGameStateStub place Homeland Stronghold by default
    homeLand = getPlayerLands(gameStateStub).find((l) =>
      l.buildings.some((b) => b.type === BuildingType.STRONGHOLD)
    )!;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
    randomSpy.mockRestore();
  });

  const verifyRecruitSlot = (
    landPos: LandPosition,
    slot: number,
    usedSlots: number,
    unitType: UnitType,
    remainTurns: number
  ): void => {
    const land = getLand(gameStateStub, landPos);

    expect(land).toBeDefined();
    const occupiedSlots = land!.buildings[0].slots.filter((s) => s.isOccupied);
    expect(occupiedSlots.length).toBe(usedSlots);
    expect(land!.buildings[0].slots[slot].unit).toBe(unitType);
    expect(land!.buildings[0].slots[slot].turnsRemaining).toBe(remainTurns);
  };

  const verifyOccupiedSlotsCount = (landPos: LandPosition, occupiedSlotsCount: number): void => {
    const land = getLand(gameStateStub, landPos);
    expect(getOccupiedSlotsCount(land.buildings[0])).toBe(occupiedSlotsCount);
  };

  it('Recruitment cost less when player has TreasureItem.CROWN_OF_DOMINION', () => {
    const playerId = getTurnOwner(gameStateStub).id;
    // add  TreasureItem.CROWN_OF_DOMINION to player treasury
    Object.assign(
      gameStateStub,
      addPlayerEmpireTreasure(
        gameStateStub,
        playerId,
        relictFactory(TreasureType.CROWN_OF_DOMINION)
      )
    );
    const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
    construct(gameStateStub, BuildingType.BARRACKS, barracksPos);
    let vault = getPlayer(gameStateStub, playerId).vault;

    startRecruiting(gameStateStub, barracksPos, RegularUnitType.WARRIOR);
    // artifact has effect on regular units
    expect(getPlayer(gameStateStub, playerId).vault).toBe(
      vault - Math.ceil(unitsBaseStats(RegularUnitType.WARRIOR).recruitCost * 0.85)
    );

    // artifact has effect on hero units
    vault = getPlayer(gameStateStub, playerId).vault;
    startRecruiting(gameStateStub, barracksPos, HeroUnitType.FIGHTER);
    expect(getPlayer(gameStateStub, playerId).vault).toBe(
      vault - Math.ceil(unitsBaseStats(HeroUnitType.FIGHTER).recruitCost * 0.85)
    );
  });

  it('If land is CORRUPTED then it takes additional turn to recruit units', () => {
    const player = getTurnOwner(gameStateStub);
    player.mana.black = 200;
    player.vault = 100000;

    const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
    construct(gameStateStub, BuildingType.BARRACKS, barracksPos);
    castSpell(gameStateStub, SpellName.CORRUPTION, barracksPos);

    startRecruiting(gameStateStub, barracksPos, RegularUnitType.ORC);
    let barracks = getLand(gameStateStub, barracksPos).buildings[0];
    expect(barracks.slots![0].unit).toBe(RegularUnitType.ORC);
    expect(barracks.slots![0].turnsRemaining).toBe(2);

    startRecruiting(gameStateStub, barracksPos, HeroUnitType.OGR);
    barracks = getLand(gameStateStub, barracksPos).buildings[0];

    expect(barracks.slots![1].unit).toBe(HeroUnitType.OGR);
    expect(barracks.slots![1].turnsRemaining).toBe(4);
  });

  describe('Recruit regular units', () => {
    let barracksLand: LandState;

    beforeEach(() => {
      const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
      construct(gameStateStub, BuildingType.BARRACKS, barracksPos);
      barracksLand = getLand(gameStateStub, barracksPos);

      expect(gameStateStub.turn).toBe(2);

      expect(barracksLand).toBeDefined();
      expect(getArmiesAtPosition(gameStateStub, barracksLand.mapPos).length).toBe(0);
      expect(getAvailableSlotsCount(barracksLand.buildings[0])).toBe(3);
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
        startRecruiting(gameStateStub, barracksLand.mapPos, unitType);

        expect(getArmiesAtPosition(gameStateStub, barracksLand.mapPos).length).toBe(0); // no units are placed on the map yet
        verifyRecruitSlot(barracksLand.mapPos, 0, 1, unitType, nTurns);
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
        startRecruiting(gameStateStub, barracksLand.mapPos, unitType);

        verifyRecruitSlot(barracksLand.mapPos, 0, 1, unitType, nTurns);

        testTurnManagement.makeNTurns(nTurns);

        verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // no units in recruitment queue

        // check that all units are placed on the map
        const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        expect(armies.length).toBe(1);
        expect(armies[0].regulars.length).toBe(1);
        expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
        expect(isMoving(armies[0])).toBeFalsy();
        expect(armies[0].regulars[0].type).toBe(unitType);

        const recruitedUnit = armies[0].regulars[0];
        expect(recruitedUnit.type).toBe(unitType);
        expect(recruitedUnit.count).toBe(nUnits);
        expect(recruitedUnit.rank).toBe(UnitRank.REGULAR);
      }
    );

    it('when recruitment in one slot finish another slots should proceed', () => {
      startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitType.BALLISTA);
      verifyRecruitSlot(barracksLand.mapPos, 0, 1, RegularUnitType.BALLISTA, 3);

      testTurnManagement.makeNTurns(1);

      verifyOccupiedSlotsCount(barracksLand.mapPos, 1); // ballista still in recruitment queue
      verifyRecruitSlot(barracksLand.mapPos, 0, 1, RegularUnitType.BALLISTA, 2);

      startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitType.WARRIOR); // start recruiting warrior
      verifyOccupiedSlotsCount(barracksLand.mapPos, 2);
      verifyRecruitSlot(barracksLand.mapPos, 0, 2, RegularUnitType.BALLISTA, 2);
      verifyRecruitSlot(barracksLand.mapPos, 1, 2, RegularUnitType.WARRIOR, 1);

      testTurnManagement.makeNTurns(1);
      verifyOccupiedSlotsCount(barracksLand.mapPos, 1); // ballista still in recruitment queue
      verifyRecruitSlot(barracksLand.mapPos, 0, 1, RegularUnitType.BALLISTA, 1);

      // check that all units are placed on the map
      let armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies.length).toBe(1);
      expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);

      let recruitedUnit = armies[0].regulars[0];
      expect(recruitedUnit.type).toBe(RegularUnitType.WARRIOR);
      expect(recruitedUnit.count).toBe(20);
      expect(recruitedUnit.rank).toBe(UnitRank.REGULAR);

      testTurnManagement.makeNTurns(1);

      verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // all units are recruited
      // check that all units are placed on the map
      armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies.length).toBe(1);
      expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);

      recruitedUnit = armies[0].regulars[0];
      expect(recruitedUnit.type).toBe(RegularUnitType.WARRIOR);
      expect(recruitedUnit.count).toBe(20);
      expect(recruitedUnit.rank).toBe(UnitRank.REGULAR);

      expect(armies[0].regulars[1].type).toBe(RegularUnitType.BALLISTA);

      recruitedUnit = armies[0].regulars[1];
      expect(recruitedUnit.type).toBe(RegularUnitType.BALLISTA);
      expect(recruitedUnit.count).toBe(1);
      expect(recruitedUnit.rank).toBe(UnitRank.REGULAR);
    });

    it('When more then 1 slot recruit the same unit type they should be merged when recruited', () => {
      startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitType.WARRIOR);
      startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitType.WARRIOR);
      startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitType.WARRIOR);
      verifyRecruitSlot(barracksLand.mapPos, 0, 3, RegularUnitType.WARRIOR, 1);
      verifyRecruitSlot(barracksLand.mapPos, 1, 3, RegularUnitType.WARRIOR, 1);
      verifyRecruitSlot(barracksLand.mapPos, 2, 3, RegularUnitType.WARRIOR, 1);

      testTurnManagement.makeNTurns(1);

      verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // all units are recruited
      // check that all units are placed on the map
      const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies.length).toBe(1);
      expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(60);
    });

    it('When units are recruited and the same type of units are exist on Land they merged', () => {
      startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitType.WARRIOR);
      verifyRecruitSlot(barracksLand.mapPos, 0, 1, RegularUnitType.WARRIOR, 1);

      testTurnManagement.makeNTurns(1);

      verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // all units are recruited
      // check that all units are placed on the map
      let armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies.length).toBe(1);
      expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(20);

      startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitType.WARRIOR); // recruit more warrior
      verifyRecruitSlot(barracksLand.mapPos, 0, 1, RegularUnitType.WARRIOR, 1);

      testTurnManagement.makeNTurns(1);

      verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // all units are recruited
      // check that all units are placed on the map
      armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies.length).toBe(1);
      expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(40); // verify that units are merged
    });

    describe('Corner cases', () => {
      it('regular units could not be recruited in mage towers', () => {
        const mageTowerPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col - 1 };
        construct(gameStateStub, BuildingType.WHITE_MAGE_TOWER, mageTowerPos);

        startRecruiting(gameStateStub, mageTowerPos, RegularUnitType.WARRIOR);
        expect(barracksLand.buildings[0].slots).toBeDefined(); // regular units not recruited
        verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // regular units not recruited
      });

      it('regular units could not be recruited in land without buildings', () => {
        const emptyLandPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col - 1 };
        let armies = getArmiesAtPosition(gameStateStub, emptyLandPos);
        expect(getLand(gameStateStub, emptyLandPos).buildings.length).toBe(0);
        expect(armies.length).toBe(0);

        startRecruiting(gameStateStub, emptyLandPos, RegularUnitType.WARRIOR);
        expect(getLand(gameStateStub, emptyLandPos).buildings.length).toBe(0);

        testTurnManagement.makeNTurns(1); //wait 1 turn to make sure unit will not appear on the map
        armies = getArmiesAtPosition(gameStateStub, emptyLandPos);
        expect(armies.length).toBe(0);
      });

      it('regular units could not be recruited when not enough gold in vault', () => {
        getTurnOwner(gameStateStub).vault = 100;

        startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitType.WARRIOR);
        const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        verifyOccupiedSlotsCount(barracksLand.mapPos, 0);
        expect(armies.length).toBe(0);
      });
    });
  });

  describe('Recruit Hero units', () => {
    const constructBuilding = (buildingType: BuildingType, pos: LandPosition): void => {
      construct(gameStateStub, buildingType, pos);
      const barracksLand = getLand(gameStateStub, pos);
      const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(gameStateStub.turn).toBe(2);

      expect(barracksLand).toBeDefined();
      expect(armies.length).toBe(0);
      expect(barracksLand.buildings[0].slots.length).toBe(
        buildingType === BuildingType.BARRACKS ? 3 : 1
      );
      expect(
        getLand(gameStateStub, barracksLand.mapPos).buildings[0].slots.filter((s) => s.isOccupied)
          .length
      ).toBe(0);
    };
    describe('Non-Mage heroes', () => {
      it.each([
        [HeroUnitType.FIGHTER, 'Adela Ravenfell'],
        [HeroUnitType.HAMMER_LORD, 'Hilda Goldgrip'],
        [HeroUnitType.OGR, 'Ozma Foeskull'],
        [HeroUnitType.RANGER, 'Myrra Gladesong'],
      ])(
        "%s named '%s' should be start recruited in 3 turn in Barracks",
        (unitType: HeroUnitType, name: string) => {
          randomSpy.mockReturnValue(0.99); // to have the same name of the hero unit

          const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
          constructBuilding(BuildingType.BARRACKS, barracksPos);

          const barracksLand = getLand(gameStateStub, barracksPos);

          // Recruiting heroes in barracks
          startRecruiting(gameStateStub, barracksLand.mapPos, unitType);
          verifyRecruitSlot(barracksLand.mapPos, 0, 1, unitType, 3);

          testTurnManagement.makeNTurns(3);

          verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // hero recruited

          const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
          expect(armies.length).toBe(1);
          expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
          expect(isMoving(armies[0])).toBeFalsy();
          const recruitedUnit = armies[0].heroes[0];
          expect(recruitedUnit.type).toBe(unitType);
          expect(recruitedUnit.name).toBe(name);
          expect(recruitedUnit.level).toBe(1);
          expect(recruitedUnit.mana).not.toBeDefined(); // non magic unit does not have mana
          expect(recruitedUnit.artifacts.length).toBe(0);
        }
      );

      it.each([
        [HeroUnitType.CLERIC, 'Rowena Ironhall', BuildingType.WHITE_MAGE_TOWER],
        [HeroUnitType.DRUID, 'Olyssia Riverlight', BuildingType.GREEN_MAGE_TOWER],
        [HeroUnitType.ENCHANTER, 'Eldra Stonebeard', BuildingType.BLUE_MAGE_TOWER],
        [HeroUnitType.PYROMANCER, 'Branna Ashfang', BuildingType.RED_MAGE_TOWER],
        [HeroUnitType.NECROMANCER, 'Eldra Stonebeard', BuildingType.BLACK_MAGE_TOWER],
      ])(
        '"%s named \'%s\' should be start recruited in 3 turn in %s"',
        (unitType: HeroUnitType, name: string, magicTower: BuildingType) => {
          randomSpy.mockReturnValue(0.6); // to have the same name of the hero unit

          const mageTowerPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
          constructBuilding(magicTower, mageTowerPos);
          // Mage towers cost 15000, which exhausts the initial 15000 vault, so add more gold for recruitment
          getTurnOwner(gameStateStub).vault += 5000;
          const mageTowerLand = getLand(gameStateStub, mageTowerPos);

          // Recruiting heroes in mage tower
          startRecruiting(gameStateStub, mageTowerLand.mapPos, unitType);
          verifyRecruitSlot(mageTowerLand.mapPos, 0, 1, unitType, 3);

          testTurnManagement.makeNTurns(3);

          verifyOccupiedSlotsCount(mageTowerLand.mapPos, 0); // hero recruited

          const armies = getArmiesAtPosition(gameStateStub, mageTowerLand.mapPos);
          expect(armies.length).toBe(1);
          expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
          expect(isMoving(armies[0])).toBeFalsy();
          const recruitedUnit = armies[0].heroes[0];
          expect(recruitedUnit.type).toBe(unitType);
          expect(recruitedUnit.name).toBe(name);
          expect(recruitedUnit.level).toBe(1);
          expect(recruitedUnit.mana).toBeDefined(); // magic units have mana
          expect(recruitedUnit.mana).toBe(1); // one mana per turn
          expect(recruitedUnit.artifacts.length).toBe(0);
        }
      );

      it('Recruiting heroes 3 heroes in parallel', () => {
        const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
        constructBuilding(BuildingType.BARRACKS, barracksPos);

        let armies = getArmiesAtPosition(gameStateStub, barracksPos);
        expect(armies.length).toBe(0);

        // Recruiting 3 heroes of the same type in barracks
        startRecruiting(gameStateStub, barracksPos, HeroUnitType.FIGHTER);
        startRecruiting(gameStateStub, barracksPos, HeroUnitType.FIGHTER);
        startRecruiting(gameStateStub, barracksPos, HeroUnitType.FIGHTER);
        verifyRecruitSlot(barracksPos, 0, 3, HeroUnitType.FIGHTER, 3);
        verifyRecruitSlot(barracksPos, 1, 3, HeroUnitType.FIGHTER, 3);
        verifyRecruitSlot(barracksPos, 2, 3, HeroUnitType.FIGHTER, 3);

        testTurnManagement.makeNTurns(3);

        verifyOccupiedSlotsCount(barracksPos, 0); // hero recruited

        armies = getArmiesAtPosition(gameStateStub, barracksPos);
        expect(armies.length).toBe(1);
        expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
        expect(isMoving(armies[0])).toBeFalsy();
        expect(armies[0].heroes.length).toBe(3);
      });
    });

    describe('Corner cases', () => {
      it('mages should not recruit in barracks', () => {
        const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
        constructBuilding(BuildingType.BARRACKS, barracksPos);
        const barracksLand = getLand(gameStateStub, barracksPos);

        startRecruiting(gameStateStub, barracksPos, HeroUnitType.FIGHTER);
        verifyOccupiedSlotsCount(barracksLand.mapPos, 1); // hero recruited

        startRecruiting(gameStateStub, barracksPos, HeroUnitType.CLERIC);
        verifyOccupiedSlotsCount(barracksLand.mapPos, 1); // CLERIC is not allowed in Barracks
      });

      it.each([
        [BuildingType.WHITE_MAGE_TOWER],
        [BuildingType.GREEN_MAGE_TOWER],
        [BuildingType.BLUE_MAGE_TOWER],
        [BuildingType.RED_MAGE_TOWER],
        [BuildingType.BLACK_MAGE_TOWER],
      ])('non-mage heroes should not recruit in mage towers', (mageTower: BuildingType) => {
        const mageTowerPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
        constructBuilding(mageTower, mageTowerPos);
        const barracksLand = getLand(gameStateStub, mageTowerPos);

        startRecruiting(gameStateStub, mageTowerPos, HeroUnitType.FIGHTER);
        verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // hero not recruited
      });

      it('hero units could not be recruited in land without buildings', () => {
        const emptyLandPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col - 1 };
        let armies = getArmiesAtPosition(gameStateStub, emptyLandPos);
        expect(getLand(gameStateStub, emptyLandPos).buildings.length).toBe(0);
        expect(armies.length).toBe(0);

        startRecruiting(gameStateStub, emptyLandPos, HeroUnitType.FIGHTER);
        startRecruiting(gameStateStub, emptyLandPos, HeroUnitType.DRUID);
        expect(getLand(gameStateStub, emptyLandPos).buildings.length).toBe(0);

        testTurnManagement.makeNTurns(1); //wait 1 turn to make sure unit will not appear on the map
        armies = getArmiesAtPosition(gameStateStub, emptyLandPos);
        expect(armies.length).toBe(0);
      });

      it('regular units could not be recruited when not enough gold in vault', () => {
        const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
        constructBuilding(BuildingType.BARRACKS, barracksPos);

        getTurnOwner(gameStateStub).vault = 100;

        startRecruiting(gameStateStub, barracksPos, HeroUnitType.FIGHTER);

        const armies = getArmiesAtPosition(gameStateStub, barracksPos);
        expect(armies.length).toBe(0);
        verifyOccupiedSlotsCount(barracksPos, 0); // hero is not recruited
      });
    });
  });
});
