import { not } from '../../utils/hooks';
import { getLand, getPlayerLands, hasBuilding } from '../../selectors/landSelectors';
import { getPlayer, getTurnOwner } from '../../selectors/playerSelectors';
import { getArmiesAtPosition, isMoving, isWarsmithPresent } from '../../selectors/armySelectors';
import { getAvailableSlotsCount, getOccupiedSlotsCount } from '../../selectors/buildingSelectors';
import { addPlayerEmpireTreasure } from '../../systems/gameStateActions';
import { relictFactory } from '../../factories/treasureFactory';
import { heroFactory } from '../../factories/heroFactory';
import { getRecruitInfo } from '../../domain/unit/unitRepository';
import { getLandUnitsToRecruit } from '../../domain/land/landRepository';
import { startRecruiting } from '../../map/recruiting/startRecruiting';
import { construct } from '../../map/building/construct';
import { castSpell } from '../../map/magic/castSpell';
import { isDrivenType, isMageType } from '../../domain/unit/unitTypeChecks';
import { Doctrine } from '../../state/player/PlayerProfile';
import { PREDEFINED_PLAYERS } from '../../domain/player/playerRepository';
import { LandName } from '../../types/Land';
import { BuildingName } from '../../types/Building';
import { TreasureName } from '../../types/Treasures';
import { HeroUnitName, RegularUnitName, WarMachineName } from '../../types/UnitType';
import { SpellName } from '../../types/Spell';
import { UnitRank } from '../../state/army/RegularsState';
import type { GameState } from '../../state/GameState';
import type { LandState } from '../../state/map/land/LandState';
import type { DoctrineType, PlayerProfile } from '../../state/player/PlayerProfile';
import type { LandType } from '../../types/Land';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { BuildingType } from '../../types/Building';
import type { HeroUnitType, RegularUnitType, UnitType } from '../../types/UnitType';
import type { WarMachineType } from '../../types/UnitType';

import { createGameStateStub } from '../utils/createGameStateStub';
import { placeUnitsOnMap } from '../utils/placeUnitsOnMap';
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

    // PREDEFINED_PLAYERS[2] - Neutral player able to recruit Druids/Enchanter/Pyromancer
    // PREDEFINED_PLAYERS[1] - CHAOTIC player able to recruit Enchanter/Pyromancer/Necromancer
    // PREDEFINED_PLAYERS[3] - Anti-magic undead - able to recruit UNDEAD
    // PREDEFINED_PLAYERS[0] - LAWFUL player able to recruit Cleric/Druid/Enchanter
    gameStateStub = createGameStateStub({
      gamePlayers: [PREDEFINED_PLAYERS[2], PREDEFINED_PLAYERS[1], PREDEFINED_PLAYERS[3], PREDEFINED_PLAYERS[0]],
    });

    testTurnManagement = new TestTurnManagement(gameStateStub);
    testTurnManagement.startNewTurn(gameStateStub);
    testTurnManagement.waitStartPhaseComplete();

    // createDefaultGameStateStub place Homeland Stronghold by default
    homeLand = getPlayerLands(gameStateStub).find((l) => hasBuilding(l, BuildingName.STRONGHOLD))!;
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
    expect(occupiedSlots).toHaveLength(usedSlots);
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
      addPlayerEmpireTreasure(gameStateStub, playerId, relictFactory(TreasureName.CROWN_OF_DOMINION))
    );
    const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
    construct(gameStateStub, BuildingName.BARRACKS, barracksPos);
    let vault = getPlayer(gameStateStub, playerId).vault;

    startRecruiting(gameStateStub, barracksPos, RegularUnitName.WARRIOR);
    // artifact has effect on regular units
    expect(getPlayer(gameStateStub, playerId).vault).toBe(
      vault - Math.ceil(getRecruitInfo(RegularUnitName.WARRIOR).recruitCost * 0.85)
    );

    // artifact has effect on hero units
    vault = getPlayer(gameStateStub, playerId).vault;
    startRecruiting(gameStateStub, barracksPos, HeroUnitName.FIGHTER);
    expect(getPlayer(gameStateStub, playerId).vault).toBe(
      vault - Math.ceil(getRecruitInfo(HeroUnitName.FIGHTER).recruitCost * 0.85)
    );
  });

  it('If land is CORRUPTED then it takes additional turn to recruit units', () => {
    gameStateStub.turnOwner = gameStateStub.players[1].id; // chaotic player to be able recruit orcs
    const player = getTurnOwner(gameStateStub);
    player.mana.black = 200;
    player.vault = 100000;

    homeLand = getPlayerLands(gameStateStub, player.id)[0];
    const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
    construct(gameStateStub, BuildingName.BARRACKS, barracksPos);
    castSpell(gameStateStub, SpellName.CORRUPTION, barracksPos);

    startRecruiting(gameStateStub, barracksPos, RegularUnitName.ORC);
    let barracks = getLand(gameStateStub, barracksPos).buildings[0];
    expect(barracks.slots![0].unit).toBe(RegularUnitName.ORC);
    expect(barracks.slots![0].turnsRemaining).toBe(2);

    startRecruiting(gameStateStub, barracksPos, HeroUnitName.OGR);
    barracks = getLand(gameStateStub, barracksPos).buildings[0];

    expect(barracks.slots![1].unit).toBe(HeroUnitName.OGR);
    expect(barracks.slots![1].turnsRemaining).toBe(4);
  });

  describe('Recruit regular units', () => {
    let barracksLand: LandState;

    beforeEach(() => {
      const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
      construct(gameStateStub, BuildingName.BARRACKS, barracksPos);
      barracksLand = getLand(gameStateStub, barracksPos);

      expect(gameStateStub.turn).toBe(2);

      expect(barracksLand).toBeDefined();
      expect(getArmiesAtPosition(gameStateStub, barracksLand.mapPos)).toHaveLength(0);
      expect(getAvailableSlotsCount(barracksLand.buildings[0])).toBe(3);
    });

    it.each([
      [RegularUnitName.WARRIOR, 1, LandName.PLAINS],
      [RegularUnitName.DWARF, 1, LandName.MOUNTAINS],
      [RegularUnitName.ORC, 1, LandName.SWAMP],
      [RegularUnitName.ELF, 2, LandName.GREEN_FOREST],
      [RegularUnitName.HALFLING, 2, LandName.HILLS],
      [RegularUnitName.DARK_ELF, 2, LandName.DARK_FOREST],

      [WarMachineName.CATAPULT, 3, LandName.PLAINS],
      [WarMachineName.BALLISTA, 3, LandName.PLAINS],
      [WarMachineName.SIEGE_TOWER, 2, LandName.PLAINS],
      [WarMachineName.BATTERING_RAM, 1, LandName.DESERT],
    ])(
      'Regular unit (%s) should be start recruited in (%s) turns in Barracks',
      (unitType: RegularUnitType | WarMachineType, nTurns: number, landType: LandType) => {
        getLand(gameStateStub, barracksLand.mapPos).type = landType;
        startRecruiting(gameStateStub, barracksLand.mapPos, unitType);

        expect(getArmiesAtPosition(gameStateStub, barracksLand.mapPos)).toHaveLength(0); // no units are placed on the map yet
        verifyRecruitSlot(barracksLand.mapPos, 0, 1, unitType, nTurns);
      }
    );

    it.each([
      [30, RegularUnitName.WARD_HANDS, 1, LandName.PLAINS],
      [20, RegularUnitName.WARRIOR, 1, LandName.PLAINS],
      [20, RegularUnitName.DWARF, 1, LandName.MOUNTAINS],
      [20, RegularUnitName.ORC, 1, LandName.SWAMP],
      [25, RegularUnitName.HALFLING, 2, LandName.HILLS],
      [20, RegularUnitName.ELF, 2, LandName.GREEN_FOREST],
      [20, RegularUnitName.DARK_ELF, 2, LandName.DARK_FOREST],
    ])(
      '%s units (%s) should be start recruited in (%s) turns in Barracks',
      (nUnits: number, unitType: RegularUnitType | WarMachineType, nTurns: number, landType: LandType) => {
        getLand(gameStateStub, barracksLand.mapPos).type = landType;
        startRecruiting(gameStateStub, barracksLand.mapPos, unitType);

        verifyRecruitSlot(barracksLand.mapPos, 0, 1, unitType, nTurns);

        testTurnManagement.makeNTurns(nTurns);

        verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // no units in recruitment queue

        // check that all units are placed on the map
        const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        expect(armies).toHaveLength(1);
        expect(armies[0].regulars).toHaveLength(1);
        expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
        expect(isMoving(armies[0])).toBeFalsy();
        expect(armies[0].regulars[0].type).toBe(unitType);

        const recruitedUnit = armies[0].regulars[0];
        expect(recruitedUnit.type).toBe(unitType);
        expect(recruitedUnit.count).toBe(nUnits);
        expect(recruitedUnit.rank).toBe(UnitRank.REGULAR);
      }
    );

    it.each([
      [1, WarMachineName.CATAPULT, 3],
      [1, WarMachineName.BALLISTA, 3],
      [1, WarMachineName.BATTERING_RAM, 1],
      [1, WarMachineName.SIEGE_TOWER, 2],
    ])(
      '%s units (%s) should be start recruited in (%s) turns in Barracks',
      (nUnits: number, unitType: RegularUnitType | WarMachineType, nTurns: number) => {
        startRecruiting(gameStateStub, barracksLand.mapPos, unitType);

        verifyRecruitSlot(barracksLand.mapPos, 0, 1, unitType, nTurns);

        testTurnManagement.makeNTurns(nTurns);

        verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // no units in recruitment queue

        // check that all units are placed on the map
        const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        expect(armies).toHaveLength(1);
        expect(armies[0].warMachines).toHaveLength(1);
        expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
        expect(isMoving(armies[0])).toBeFalsy();
        expect(armies[0].warMachines[0].type).toBe(unitType);

        const recruitedUnit = armies[0].warMachines[0];
        expect(recruitedUnit.type).toBe(unitType);
        expect(recruitedUnit.count).toBe(nUnits);
      }
    );

    it('when recruitment in one slot finish another slots should proceed', () => {
      startRecruiting(gameStateStub, barracksLand.mapPos, WarMachineName.BALLISTA);
      verifyRecruitSlot(barracksLand.mapPos, 0, 1, WarMachineName.BALLISTA, 3);

      testTurnManagement.makeNTurns(1);

      verifyOccupiedSlotsCount(barracksLand.mapPos, 1); // ballista still in recruitment queue
      verifyRecruitSlot(barracksLand.mapPos, 0, 1, WarMachineName.BALLISTA, 2);

      startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitName.WARRIOR); // start recruiting warrior
      verifyOccupiedSlotsCount(barracksLand.mapPos, 2);
      verifyRecruitSlot(barracksLand.mapPos, 0, 2, WarMachineName.BALLISTA, 2);
      verifyRecruitSlot(barracksLand.mapPos, 1, 2, RegularUnitName.WARRIOR, 1);

      testTurnManagement.makeNTurns(1);
      verifyOccupiedSlotsCount(barracksLand.mapPos, 1); // ballista still in recruitment queue
      verifyRecruitSlot(barracksLand.mapPos, 0, 1, WarMachineName.BALLISTA, 1);

      // check that all units are placed on the map
      let armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies).toHaveLength(1);
      expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);

      let recruitedUnit = armies[0].regulars[0];
      expect(recruitedUnit.type).toBe(RegularUnitName.WARRIOR);
      expect(recruitedUnit.count).toBe(20);
      expect(recruitedUnit.rank).toBe(UnitRank.REGULAR);

      testTurnManagement.makeNTurns(1);

      verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // all units are recruited
      // check that all units are placed on the map
      armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies).toHaveLength(1);
      expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);

      recruitedUnit = armies[0].regulars[0];
      expect(recruitedUnit.type).toBe(RegularUnitName.WARRIOR);
      expect(recruitedUnit.count).toBe(20);
      expect(recruitedUnit.rank).toBe(UnitRank.REGULAR);

      expect(armies[0].warMachines[0].type).toBe(WarMachineName.BALLISTA);

      const warMachineUnit = armies[0].warMachines[0];
      expect(warMachineUnit.type).toBe(WarMachineName.BALLISTA);
      expect(warMachineUnit.count).toBe(1);
    });

    it('When more then 1 slot recruit the same unit type they should be merged when recruited', () => {
      startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitName.WARRIOR);
      startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitName.WARRIOR);
      startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitName.WARRIOR);
      verifyRecruitSlot(barracksLand.mapPos, 0, 3, RegularUnitName.WARRIOR, 1);
      verifyRecruitSlot(barracksLand.mapPos, 1, 3, RegularUnitName.WARRIOR, 1);
      verifyRecruitSlot(barracksLand.mapPos, 2, 3, RegularUnitName.WARRIOR, 1);

      testTurnManagement.makeNTurns(1);

      verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // all units are recruited
      // check that all units are placed on the map
      const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies).toHaveLength(1);
      expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(60);
    });

    it('When units are recruited and the same type of units are exist on Land they merged', () => {
      startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitName.WARRIOR);
      verifyRecruitSlot(barracksLand.mapPos, 0, 1, RegularUnitName.WARRIOR, 1);

      testTurnManagement.makeNTurns(1);

      verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // all units are recruited
      // check that all units are placed on the map
      let armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies).toHaveLength(1);
      expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(20);

      startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitName.WARRIOR); // recruit more warrior
      verifyRecruitSlot(barracksLand.mapPos, 0, 1, RegularUnitName.WARRIOR, 1);

      testTurnManagement.makeNTurns(1);

      verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // all units are recruited
      // check that all units are placed on the map
      armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies).toHaveLength(1);
      expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(40); // verify that units are merged
    });

    it('ANTI-MAGIC Doctrine players recruit veteran units', () => {
      const players = [PREDEFINED_PLAYERS.find((p) => p.doctrine === Doctrine.ANTI_MAGIC)!, PREDEFINED_PLAYERS[1]];
      gameStateStub = createGameStateStub({ gamePlayers: players });
      const homeLand = getPlayerLands(gameStateStub)[0].mapPos;
      const barracksPos = { row: homeLand.row, col: homeLand.col + 1 };
      construct(gameStateStub, BuildingName.BARRACKS, barracksPos);

      testTurnManagement.setGameState(gameStateStub);
      testTurnManagement.startNewTurn(gameStateStub);
      testTurnManagement.waitStartPhaseComplete();

      startRecruiting(gameStateStub, barracksPos, RegularUnitName.WARRIOR);
      verifyRecruitSlot(barracksPos, 0, 1, RegularUnitName.WARRIOR, 1);

      testTurnManagement.makeNTurns(1);
      const armies = getArmiesAtPosition(gameStateStub, barracksPos);
      expect(armies).toHaveLength(1);
      expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armies[0])).toBeFalsy();
      expect(armies[0].heroes).toHaveLength(0);
      expect(armies[0].warMachines).toHaveLength(0);
      expect(armies[0].regulars).toHaveLength(1);
      expect(armies[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(armies[0].regulars[0].count).toBe(20);
      expect(armies[0].regulars[0].rank).toBe(UnitRank.VETERAN);
    });

    describe('DRIVEN Doctrine players restrictions', () => {
      let barracksPos: LandPosition;
      beforeEach(() => {
        const players = [PREDEFINED_PLAYERS.find((p) => p.doctrine === Doctrine.DRIVEN)!, PREDEFINED_PLAYERS[1]];
        gameStateStub = createGameStateStub({ gamePlayers: players });
        getTurnOwner(gameStateStub).vault = 100000;
        const homeLand = getPlayerLands(gameStateStub)[0].mapPos;
        barracksPos = { row: homeLand.row, col: homeLand.col + 1 };
        construct(gameStateStub, BuildingName.BARRACKS, barracksPos);
      });

      it.each(Object.values(RegularUnitName).filter(isDrivenType))(
        'Only driven unit type %s could be recruited only when WARSMITH is present on Land with BARRAKS',
        (unitType: RegularUnitType) => {
          // set Barack land type to land which support this unit type
          getLand(gameStateStub, barracksPos).type = Object.values(LandName).find((l) =>
            getLandUnitsToRecruit(l, false).some((u) => u === unitType)
          )!;
          expect(isWarsmithPresent(gameStateStub, barracksPos)).toBeFalsy();

          /************** START RECRUITING **********************/
          startRecruiting(gameStateStub, barracksPos, RegularUnitName.GOLEM);
          verifyOccupiedSlotsCount(barracksPos, 0);

          /************** PLACE WARSMITH **********************/
          placeUnitsOnMap(heroFactory(HeroUnitName.WARSMITH, 'Hero 1'), gameStateStub, barracksPos);
          expect(isWarsmithPresent(gameStateStub, barracksPos)).toBeTruthy();

          /************** START RECRUITING **********************/
          startRecruiting(gameStateStub, barracksPos, unitType);
          verifyOccupiedSlotsCount(barracksPos, 1); // recruiting started
        }
      );

      it.each(Object.values(RegularUnitName).filter(not(isDrivenType)))(
        'Non-Driven unit type %s could not be recruited',
        (unitType: RegularUnitType) => {
          /************** PLACE WARSMITH **********************/
          placeUnitsOnMap(heroFactory(HeroUnitName.WARSMITH, 'Hero 1'), gameStateStub, barracksPos);
          expect(isWarsmithPresent(gameStateStub, barracksPos)).toBeTruthy();

          /************** START RECRUITING **********************/
          startRecruiting(gameStateStub, barracksPos, unitType);
          verifyOccupiedSlotsCount(barracksPos, 0); // recruiting NOT started
        }
      );

      it.each(Object.values(WarMachineName))(
        'War-Machine unit type %s could not be recruited',
        (unitType: WarMachineType) => {
          /************** PLACE WARSMITH **********************/
          placeUnitsOnMap(heroFactory(HeroUnitName.WARSMITH, 'Hero 1'), gameStateStub, barracksPos);
          expect(isWarsmithPresent(gameStateStub, barracksPos)).toBeTruthy();

          /************** START RECRUITING **********************/
          startRecruiting(gameStateStub, barracksPos, unitType);
          verifyOccupiedSlotsCount(barracksPos, 0); // recruiting NOT started
        }
      );
    });

    describe('Corner cases', () => {
      it('regular units could not be recruited in mage towers', () => {
        const mageTowerPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col - 1 };
        construct(gameStateStub, BuildingName.MAGE_TOWER, mageTowerPos);

        startRecruiting(gameStateStub, mageTowerPos, RegularUnitName.WARRIOR);
        expect(barracksLand.buildings[0].slots).toBeDefined(); // regular units not recruited
        verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // regular units not recruited
      });

      it('regular units could not be recruited in land without buildings', () => {
        const emptyLandPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col - 1 };
        let armies = getArmiesAtPosition(gameStateStub, emptyLandPos);
        expect(getLand(gameStateStub, emptyLandPos).buildings).toHaveLength(0);
        expect(armies).toHaveLength(0);

        startRecruiting(gameStateStub, emptyLandPos, RegularUnitName.WARRIOR);
        expect(getLand(gameStateStub, emptyLandPos).buildings).toHaveLength(0);

        testTurnManagement.makeNTurns(1); //wait 1 turn to make sure unit will not appear on the map
        armies = getArmiesAtPosition(gameStateStub, emptyLandPos);
        expect(armies).toHaveLength(0);
      });

      it('regular units could not be recruited when not enough gold in vault', () => {
        getTurnOwner(gameStateStub).vault = 100;

        startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitName.WARRIOR);
        const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
        verifyOccupiedSlotsCount(barracksLand.mapPos, 0);
        expect(armies).toHaveLength(0);
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
      expect(armies).toHaveLength(0);
      expect(barracksLand.buildings[0].slots).toHaveLength(buildingType === BuildingName.BARRACKS ? 3 : 1);
      expect(getLand(gameStateStub, barracksLand.mapPos).buildings[0].slots.filter((s) => s.isOccupied).length).toBe(0);
    };

    describe('Non-Mage heroes', () => {
      it.each([
        [HeroUnitName.FIGHTER, 'Adela Ravenfell', LandName.PLAINS],
        [HeroUnitName.HAMMER_LORD, 'Hilda Goldgrip', LandName.MOUNTAINS],
        [HeroUnitName.OGR, 'Ozma Foeskull', LandName.SWAMP],
        [HeroUnitName.RANGER, 'Myrra Gladesong', LandName.GREEN_FOREST],
      ])(
        "%s named '%s' should be start recruited in 3 turn in Barracks",
        (unitType: HeroUnitType, name: string, landType: LandType) => {
          randomSpy.mockReturnValue(0.99); // to have the same name of the hero unit
          const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };

          getLand(gameStateStub, barracksPos).type = landType;
          constructBuilding(BuildingName.BARRACKS, barracksPos);

          const barracksLand = getLand(gameStateStub, barracksPos);

          // Recruiting heroes in barracks
          startRecruiting(gameStateStub, barracksLand.mapPos, unitType);
          verifyRecruitSlot(barracksLand.mapPos, 0, 1, unitType, 3);

          testTurnManagement.makeNTurns(3);

          verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // hero recruited

          const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
          expect(armies).toHaveLength(1);
          expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
          expect(isMoving(armies[0])).toBeFalsy();
          const recruitedUnit = armies[0].heroes[0];
          expect(recruitedUnit.type).toBe(unitType);
          expect(recruitedUnit.name).toBe(name);
          expect(recruitedUnit.level).toBe(1);
          expect(recruitedUnit.mana).not.toBeDefined(); // non magic unit does not have mana
          expect(recruitedUnit.artifacts).toHaveLength(0);
        }
      );

      it('Recruiting heroes 3 heroes in parallel', () => {
        const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
        constructBuilding(BuildingName.BARRACKS, barracksPos);

        let armies = getArmiesAtPosition(gameStateStub, barracksPos);
        expect(armies).toHaveLength(0);

        // Recruiting 3 heroes of the same type in barracks
        startRecruiting(gameStateStub, barracksPos, HeroUnitName.FIGHTER);
        startRecruiting(gameStateStub, barracksPos, HeroUnitName.FIGHTER);
        startRecruiting(gameStateStub, barracksPos, HeroUnitName.FIGHTER);
        verifyRecruitSlot(barracksPos, 0, 3, HeroUnitName.FIGHTER, 3);
        verifyRecruitSlot(barracksPos, 1, 3, HeroUnitName.FIGHTER, 3);
        verifyRecruitSlot(barracksPos, 2, 3, HeroUnitName.FIGHTER, 3);

        testTurnManagement.makeNTurns(3);

        verifyOccupiedSlotsCount(barracksPos, 0); // hero recruited

        armies = getArmiesAtPosition(gameStateStub, barracksPos);
        expect(armies).toHaveLength(1);
        expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
        expect(isMoving(armies[0])).toBeFalsy();
        expect(armies[0].heroes).toHaveLength(3);
      });
    });

    describe('Mage heroes', () => {
      const landPos: LandPosition = { row: 4, col: 3 };
      const prepareGame = (playerType: HeroUnitType, doctrine: DoctrineType) => {
        const player: PlayerProfile = { ...PREDEFINED_PLAYERS[0], type: playerType, doctrine: doctrine };
        gameStateStub = createGameStateStub({ gamePlayers: [player, PREDEFINED_PLAYERS[1]] });
        getTurnOwner(gameStateStub).vault = 100000;

        construct(gameStateStub, BuildingName.MAGE_TOWER, landPos);
        expect(getLand(gameStateStub, landPos).buildings[0].type).toBe(BuildingName.MAGE_TOWER);

        testTurnManagement = new TestTurnManagement(gameStateStub);
        testTurnManagement.startNewTurn(gameStateStub);
        testTurnManagement.waitStartPhaseComplete();
      };

      describe('Mage recruitment restriction based on Doctrine', () => {
        it.each([
          [HeroUnitName.CLERIC, HeroUnitName.CLERIC],
          [HeroUnitName.HAMMER_LORD, HeroUnitName.CLERIC],
          [HeroUnitName.DRUID, HeroUnitName.DRUID],
          [HeroUnitName.RANGER, HeroUnitName.DRUID],
          [HeroUnitName.ENCHANTER, HeroUnitName.ENCHANTER],
          [HeroUnitName.FIGHTER, HeroUnitName.ENCHANTER],
          [HeroUnitName.PYROMANCER, HeroUnitName.PYROMANCER],
          [HeroUnitName.OGR, HeroUnitName.PYROMANCER],
          [HeroUnitName.NECROMANCER, HeroUnitName.NECROMANCER],
          [HeroUnitName.SHADOW_BLADE, HeroUnitName.NECROMANCER],
        ])(
          'Player %s with MELEE Doctrine able to recruit only %s',
          (playerType: HeroUnitType, allowedMageType: HeroUnitType) => {
            prepareGame(playerType, Doctrine.MELEE);

            startRecruiting(gameStateStub, landPos, allowedMageType);

            const slot = getLand(gameStateStub, landPos).buildings[0].slots[0];
            expect(slot.unit).toBe(allowedMageType);
            expect(slot.turnsRemaining).toBe(3);
            expect(slot.isOccupied).toBeTruthy();

            testTurnManagement.makeNTurns(3);

            verifyOccupiedSlotsCount(landPos, 0); // hero recruited

            const heroes = getArmiesAtPosition(gameStateStub, landPos).flatMap((a) => a.heroes);
            expect(heroes).toHaveLength(1);
            expect(heroes[0].type).toBe(allowedMageType);

            // try to recruit prohibited mage unit types
            Object.values(HeroUnitName)
              .filter((u) => isMageType(u) && u !== allowedMageType)
              .forEach((unit) => {
                startRecruiting(gameStateStub, landPos, unit);
                getLand(gameStateStub, landPos).buildings[0].slots.every((s) => expect(s.isOccupied).toBeFalsy());
              });
          }
        );

        it.each([
          [HeroUnitName.CLERIC, [HeroUnitName.CLERIC, HeroUnitName.DRUID, HeroUnitName.ENCHANTER]],
          [HeroUnitName.HAMMER_LORD, [HeroUnitName.CLERIC, HeroUnitName.DRUID, HeroUnitName.ENCHANTER]],
          [HeroUnitName.DRUID, [HeroUnitName.CLERIC, HeroUnitName.DRUID, HeroUnitName.ENCHANTER]],
          [HeroUnitName.RANGER, [HeroUnitName.CLERIC, HeroUnitName.DRUID, HeroUnitName.ENCHANTER]],
          [HeroUnitName.ENCHANTER, [HeroUnitName.DRUID, HeroUnitName.ENCHANTER, HeroUnitName.PYROMANCER]],
          [HeroUnitName.FIGHTER, [HeroUnitName.DRUID, HeroUnitName.ENCHANTER, HeroUnitName.PYROMANCER]],
          [HeroUnitName.OGR, [HeroUnitName.DRUID, HeroUnitName.ENCHANTER, HeroUnitName.PYROMANCER]],
          [HeroUnitName.PYROMANCER, [HeroUnitName.ENCHANTER, HeroUnitName.PYROMANCER, HeroUnitName.NECROMANCER]],
          [HeroUnitName.NECROMANCER, [HeroUnitName.ENCHANTER, HeroUnitName.PYROMANCER, HeroUnitName.NECROMANCER]],
          [HeroUnitName.SHADOW_BLADE, [HeroUnitName.ENCHANTER, HeroUnitName.PYROMANCER, HeroUnitName.NECROMANCER]],
        ])(
          'Player %s with MAGIC Doctrine able to recruit %s',
          (playerType: HeroUnitType, allowedMageTypes: HeroUnitType[]) => {
            prepareGame(playerType, Doctrine.MAGIC);

            allowedMageTypes.forEach((mage) => {
              startRecruiting(gameStateStub, landPos, mage);

              const slot = getLand(gameStateStub, landPos).buildings[0].slots[0];
              expect(slot.unit).toBe(mage);
              expect(slot.turnsRemaining).toBe(3);
              expect(slot.isOccupied).toBeTruthy();

              testTurnManagement.makeNTurns(3);

              verifyOccupiedSlotsCount(landPos, 0); // hero recruited

              const heroes = getArmiesAtPosition(gameStateStub, landPos).flatMap((a) => a.heroes);
              expect(heroes.some((h) => h.type === mage)).toBeTruthy();
            });

            const heroes = getArmiesAtPosition(gameStateStub, landPos).flatMap((a) => a.heroes);
            expect(heroes).toHaveLength(3);

            // try to recruit prohibited mage unit types
            Object.values(HeroUnitName)
              .filter((u) => isMageType(u) && !allowedMageTypes.includes(u))
              .forEach((unit) => {
                startRecruiting(gameStateStub, landPos, unit);
                getLand(gameStateStub, landPos).buildings[0].slots.every((s) => expect(s.isOccupied).toBeFalsy());
              });
          }
        );

        it.each([
          [HeroUnitName.CLERIC],
          [HeroUnitName.DRUID],
          [HeroUnitName.ENCHANTER],
          [HeroUnitName.PYROMANCER],
          [HeroUnitName.NECROMANCER],
        ])('Player %s with PURE MAGIC Doctrine able to recruit All Mages', (playerType: HeroUnitType) => {
          prepareGame(playerType, Doctrine.PURE_MAGIC);

          Object.values(HeroUnitName)
            .filter((u) => isMageType(u))
            .forEach((mage) => {
              startRecruiting(gameStateStub, landPos, mage);

              const slot = getLand(gameStateStub, landPos).buildings[0].slots[0];
              expect(slot.unit).toBe(mage);
              expect(slot.turnsRemaining).toBe(3);
              expect(slot.isOccupied).toBeTruthy();

              testTurnManagement.makeNTurns(3);

              verifyOccupiedSlotsCount(landPos, 0); // hero recruited

              const heroes = getArmiesAtPosition(gameStateStub, landPos).flatMap((a) => a.heroes);
              expect(heroes.some((h) => h.type === mage)).toBeTruthy();
            });
          const heroes = getArmiesAtPosition(gameStateStub, landPos).flatMap((a) => a.heroes);
          expect(heroes).toHaveLength(5);
        });
      });

      describe('Mage recruitment restriction for special land types', () => {
        it.each([
          [LandName.SUN_SPIRE_PEAKS, HeroUnitName.CLERIC, 1],
          [LandName.HEARTWOOD_GROVE, HeroUnitName.DRUID, 1],
          [LandName.CRISTAL_BASIN, HeroUnitName.ENCHANTER, 1],
          [LandName.VOLCANO, HeroUnitName.PYROMANCER, 1],
          [LandName.SHADOW_MIRE, HeroUnitName.NECROMANCER, 1],

          [LandName.GOLDEN_PLAINS, HeroUnitName.CLERIC, 2],
          [LandName.GOLDEN_PLAINS, HeroUnitName.DRUID, 2],
          [LandName.GOLDEN_PLAINS, HeroUnitName.ENCHANTER, 3], // it is possible to recruit enchanter, but it takes regular time
          [LandName.VERDANT_GLADE, HeroUnitName.CLERIC, 2],
          [LandName.VERDANT_GLADE, HeroUnitName.DRUID, 2],
          [LandName.VERDANT_GLADE, HeroUnitName.ENCHANTER, 2],
          [LandName.MISTY_GLADES, HeroUnitName.DRUID, 2],
          [LandName.MISTY_GLADES, HeroUnitName.ENCHANTER, 2],
          [LandName.MISTY_GLADES, HeroUnitName.PYROMANCER, 2],
          [LandName.LAVA, HeroUnitName.ENCHANTER, 2],
          [LandName.LAVA, HeroUnitName.PYROMANCER, 2],
          [LandName.LAVA, HeroUnitName.NECROMANCER, 2],
          [LandName.BLIGHTED_FEN, HeroUnitName.ENCHANTER, 3], // it is possible to recruit enchanter, but it takes regular time
          [LandName.BLIGHTED_FEN, HeroUnitName.PYROMANCER, 2],
          [LandName.BLIGHTED_FEN, HeroUnitName.NECROMANCER, 2],
        ])('in %s land %s should be recruited in %s turn', (landType: LandType, mage: HeroUnitType, nTurn: number) => {
          prepareGame(mage, Doctrine.PURE_MAGIC); // use Pure Magic doctrine since they could recruit any mage unit

          getLand(gameStateStub, landPos).type = landType; // change type to special land

          startRecruiting(gameStateStub, landPos, mage);

          const slot = getLand(gameStateStub, landPos).buildings[0].slots[0];
          expect(slot.unit).toBe(mage);
          expect(slot.turnsRemaining).toBe(nTurn);
          expect(slot.isOccupied).toBeTruthy();

          testTurnManagement.makeNTurns(nTurn);

          verifyOccupiedSlotsCount(landPos, 0); // hero recruited

          const heroes = getArmiesAtPosition(gameStateStub, landPos).flatMap((a) => a.heroes);
          expect(heroes).toHaveLength(1);
          expect(heroes[0].type).toBe(mage);
        });
      });
    });

    describe('PURE MAGIC Doctrine Heroes', () => {
      it.each([
        HeroUnitName.CLERIC,
        HeroUnitName.DRUID,
        HeroUnitName.ENCHANTER,
        HeroUnitName.PYROMANCER,
        HeroUnitName.NECROMANCER,
      ])('recruited at level 10', (heroType: HeroUnitType) => {
        const pureMagicPlayer: PlayerProfile = PREDEFINED_PLAYERS.find(
          (p) => p.type === heroType && p.doctrine === Doctrine.PURE_MAGIC
        )!;
        gameStateStub = createGameStateStub({ gamePlayers: [pureMagicPlayer, PREDEFINED_PLAYERS[1]] });
        getTurnOwner(gameStateStub).vault = 100000;
        const homeLand = getPlayerLands(gameStateStub, pureMagicPlayer.id)[0];
        const mageTowerLand = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
        construct(gameStateStub, BuildingName.MAGE_TOWER, mageTowerLand);

        testTurnManagement.setGameState(gameStateStub);
        testTurnManagement.startNewTurn(gameStateStub);
        testTurnManagement.waitStartPhaseComplete();

        startRecruiting(gameStateStub, mageTowerLand, heroType);
        verifyRecruitSlot(mageTowerLand, 0, 1, heroType, 3);

        testTurnManagement.makeNTurns(3);
        verifyOccupiedSlotsCount(mageTowerLand, 0);
        const armies = getArmiesAtPosition(gameStateStub, mageTowerLand);
        expect(armies).toHaveLength(1);
        expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
        expect(isMoving(armies[0])).toBeFalsy();
        expect(armies[0].regulars).toHaveLength(0);
        expect(armies[0].warMachines).toHaveLength(0);
        expect(armies[0].heroes).toHaveLength(1);
        expect(armies[0].heroes[0].type).toBe(heroType);
        expect(armies[0].heroes[0].level).toBe(10);
      });
    });

    describe('DRIVEN Doctrine Heroes', () => {
      let barracksPos: LandPosition;
      beforeEach(() => {
        const players = [PREDEFINED_PLAYERS.find((p) => p.doctrine === Doctrine.DRIVEN)!, PREDEFINED_PLAYERS[1]];
        gameStateStub = createGameStateStub({ gamePlayers: players });
        getTurnOwner(gameStateStub).vault = 100000;
        const homeLand = getPlayerLands(gameStateStub)[0].mapPos;
        barracksPos = { row: homeLand.row, col: homeLand.col + 1 };
        construct(gameStateStub, BuildingName.BARRACKS, barracksPos);
        expect(isWarsmithPresent(gameStateStub, barracksPos)).toBeFalsy();
      });
      it('WARSMITH could be recruited at any time', () => {
        /************** START RECRUITING **********************/
        startRecruiting(gameStateStub, barracksPos, HeroUnitName.WARSMITH);
        verifyOccupiedSlotsCount(barracksPos, 1); // recruiting started
      });

      it.each(Object.values(HeroUnitName).filter(not(isDrivenType)))(
        'Non-driven type %s hero could not be recruited',
        (unitType: HeroUnitType) => {
          /************** START RECRUITING **********************/
          startRecruiting(gameStateStub, barracksPos, unitType);
          verifyOccupiedSlotsCount(barracksPos, 0); // recruiting NOT started

          /************** PLACE WARSMITH **********************/
          placeUnitsOnMap(heroFactory(HeroUnitName.WARSMITH, 'Hero 1'), gameStateStub, barracksPos);
          expect(isWarsmithPresent(gameStateStub, barracksPos)).toBeTruthy();

          /************** START RECRUITING **********************/
          startRecruiting(gameStateStub, barracksPos, unitType);
          verifyOccupiedSlotsCount(barracksPos, 0); // recruiting still ISN'T started
        }
      );
    });

    describe('Corner cases', () => {
      it('mages should not recruit in barracks', () => {
        const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
        constructBuilding(BuildingName.BARRACKS, barracksPos);
        const barracksLand = getLand(gameStateStub, barracksPos);

        startRecruiting(gameStateStub, barracksPos, HeroUnitName.FIGHTER);
        verifyOccupiedSlotsCount(barracksLand.mapPos, 1); // hero recruited

        startRecruiting(gameStateStub, barracksPos, HeroUnitName.CLERIC);
        verifyOccupiedSlotsCount(barracksLand.mapPos, 1); // CLERIC is not allowed in Barracks
      });

      it('non-mage heroes should not recruit in mage towers', () => {
        const mageTowerPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
        constructBuilding(BuildingName.MAGE_TOWER, mageTowerPos);
        const barracksLand = getLand(gameStateStub, mageTowerPos);

        startRecruiting(gameStateStub, mageTowerPos, HeroUnitName.FIGHTER);
        verifyOccupiedSlotsCount(barracksLand.mapPos, 0); // hero not recruited
      });

      it('hero units could not be recruited in land without buildings', () => {
        const emptyLandPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col - 1 };
        let armies = getArmiesAtPosition(gameStateStub, emptyLandPos);
        expect(getLand(gameStateStub, emptyLandPos).buildings).toHaveLength(0);
        expect(armies).toHaveLength(0);

        startRecruiting(gameStateStub, emptyLandPos, HeroUnitName.FIGHTER);
        startRecruiting(gameStateStub, emptyLandPos, HeroUnitName.DRUID);
        expect(getLand(gameStateStub, emptyLandPos).buildings).toHaveLength(0);

        testTurnManagement.makeNTurns(1); //wait 1 turn to make sure unit will not appear on the map
        armies = getArmiesAtPosition(gameStateStub, emptyLandPos);
        expect(armies).toHaveLength(0);
      });

      it('regular units could not be recruited when not enough gold in vault', () => {
        const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
        constructBuilding(BuildingName.BARRACKS, barracksPos);

        getTurnOwner(gameStateStub).vault = 100;

        startRecruiting(gameStateStub, barracksPos, HeroUnitName.FIGHTER);

        const armies = getArmiesAtPosition(gameStateStub, barracksPos);
        expect(armies).toHaveLength(0);
        verifyOccupiedSlotsCount(barracksPos, 0); // hero is not recruited
      });
    });
  });
});
