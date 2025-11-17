import { TurnManager, TurnManagerCallbacks } from '../../turn/TurnManager';
import { GameState, getTurnOwner, LandState, TurnPhase } from '../../types/GameState';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { BuildingType } from '../../types/Building';
import { startRecruiting } from '../../map/recruiting/startRecruiting';
import { HeroUnit, HeroUnitType, RegularUnit, RegularUnitType, UnitType } from '../../types/Army';
import { construct } from '../../map/building/construct';
import { getLand, getLands, LandPosition } from '../../map/utils/getLands';

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
      onHeroOutcomeResult: jest.fn(),
    };

    turnManager = new TurnManager(mockCallbacks);
    randomSpy = jest.spyOn(Math, 'random');

    gameStateStub = createDefaultGameStateStub();
    gameStateStub.turn = 2;
    turnManager.startNewTurn(gameStateStub);

    waitStartPhaseComplete();
    // createDefaultGameStateStub place Homeland Stronghold by default
    homeLand = getLands({
      gameState: gameStateStub,
      players: [gameStateStub.turnOwner],
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

  const verifyRecruitSlot = (
    landPos: LandPosition,
    slot: number,
    usedSlots: number,
    unitType: UnitType,
    remainTurns: number
  ): void => {
    const land = getLand(gameStateStub, landPos);

    expect(land).toBeDefined();
    expect(land!.buildings[0].slots?.length).toBe(usedSlots);
    expect(land!.buildings[0].slots![slot].unit).toBe(unitType);
    expect(land!.buildings[0].slots![slot].turnsRemaining).toBe(remainTurns);
  };

  describe('Recruit regular units', () => {
    let barracksLand: LandState;

    beforeEach(() => {
      const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
      construct(gameStateStub, BuildingType.BARRACKS, barracksPos);
      barracksLand = getLand(gameStateStub, barracksPos);

      expect(gameStateStub.turn).toBe(2);
      expect(gameStateStub.turnPhase).toBe(TurnPhase.MAIN);

      expect(barracksLand).toBeDefined();
      expect(barracksLand.army.length).toBe(0);
      expect(barracksLand.buildings[0].numberOfSlots).toBe(3);
      expect(barracksLand.buildings[0].slots?.length).toBe(0);
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
        startRecruiting(unitType, barracksLand.mapPos, gameStateStub);

        expect(barracksLand.army.length).toBe(0); // no units are placed on the map yet
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
        startRecruiting(unitType, barracksLand.mapPos, gameStateStub);

        verifyRecruitSlot(barracksLand.mapPos, 0, 1, unitType, nTurns);

        makeNTurns(nTurns);

        expect(barracksLand.buildings[0].slots?.length).toBe(0); // no units in recruitment queue

        // check that all units are placed on the map
        expect(barracksLand.army.length).toBe(1);
        expect(barracksLand.army[0].units.length).toBe(1);
        expect(barracksLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
        expect(barracksLand.army[0].movements).toBeUndefined();
        expect(barracksLand.army[0].units[0].id).toBe(unitType);

        const recruitedUnit = barracksLand.army[0].units[0] as RegularUnit;
        expect(recruitedUnit.id).toBe(unitType);
        expect(recruitedUnit.count).toBe(nUnits);
        expect(recruitedUnit.level).toBe('regular');
      }
    );

    it('when recruitment in one slot finish another slots should proceed', () => {
      startRecruiting(RegularUnitType.BALLISTA, barracksLand.mapPos, gameStateStub);
      verifyRecruitSlot(barracksLand.mapPos, 0, 1, RegularUnitType.BALLISTA, 3);

      makeNTurns(1);

      expect(barracksLand.buildings[0].slots?.length).toBe(1); // ballista still in recruitment queue
      verifyRecruitSlot(barracksLand.mapPos, 0, 1, RegularUnitType.BALLISTA, 2);

      startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub); // start recruiting warrior
      expect(barracksLand.buildings[0].slots?.length).toBe(2);
      verifyRecruitSlot(barracksLand.mapPos, 0, 2, RegularUnitType.BALLISTA, 2);
      verifyRecruitSlot(barracksLand.mapPos, 1, 2, RegularUnitType.WARRIOR, 1);

      makeNTurns(1);
      expect(barracksLand.buildings[0].slots?.length).toBe(1); // ballista still in recruitment queue
      verifyRecruitSlot(barracksLand.mapPos, 0, 1, RegularUnitType.BALLISTA, 1);

      // check that all units are placed on the map
      expect(barracksLand.army.length).toBe(1);
      expect(barracksLand.army[0].units[0].id).toBe(RegularUnitType.WARRIOR);

      let recruitedUnit = barracksLand.army[0].units[0] as RegularUnit;
      expect(recruitedUnit.id).toBe(RegularUnitType.WARRIOR);
      expect(recruitedUnit.count).toBe(20);
      expect(recruitedUnit.level).toBe('regular');

      makeNTurns(1);

      expect(barracksLand.buildings[0].slots?.length).toBe(0); // all units are recruited
      // check that all units are placed on the map
      expect(barracksLand.army.length).toBe(1);
      expect(barracksLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
      expect(barracksLand.army[0].movements).toBeUndefined();
      expect(barracksLand.army[0].units[0].id).toBe(RegularUnitType.WARRIOR);

      recruitedUnit = barracksLand.army[0].units[0] as RegularUnit;
      expect(recruitedUnit.id).toBe(RegularUnitType.WARRIOR);
      expect(recruitedUnit.count).toBe(20);
      expect(recruitedUnit.level).toBe('regular');

      expect(barracksLand.army[0].units[1].id).toBe(RegularUnitType.BALLISTA);

      recruitedUnit = barracksLand.army[0].units[1] as RegularUnit;
      expect(recruitedUnit.id).toBe(RegularUnitType.BALLISTA);
      expect(recruitedUnit.count).toBe(1);
      expect(recruitedUnit.level).toBe('regular');
    });

    it('When more then 1 slot recruit the same unit type they should be merged when recruited', () => {
      startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
      startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
      startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
      verifyRecruitSlot(barracksLand.mapPos, 0, 3, RegularUnitType.WARRIOR, 1);
      verifyRecruitSlot(barracksLand.mapPos, 1, 3, RegularUnitType.WARRIOR, 1);
      verifyRecruitSlot(barracksLand.mapPos, 2, 3, RegularUnitType.WARRIOR, 1);

      makeNTurns(1);

      expect(barracksLand.buildings[0].slots?.length).toBe(0); // all units are recruited
      // check that all units are placed on the map
      expect(barracksLand.army.length).toBe(1);
      expect(barracksLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
      expect(barracksLand.army[0].movements).toBeUndefined();
      expect(barracksLand.army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
      expect((barracksLand.army[0].units[0] as RegularUnit).count).toBe(60);
    });

    it('When units are recruited and the same type of units are exist on Land they merged', () => {
      startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
      verifyRecruitSlot(barracksLand.mapPos, 0, 1, RegularUnitType.WARRIOR, 1);

      makeNTurns(1);

      expect(barracksLand.buildings[0].slots?.length).toBe(0); // all units are recruited
      // check that all units are placed on the map
      expect(barracksLand.army.length).toBe(1);
      expect(barracksLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
      expect(barracksLand.army[0].movements).toBeUndefined();
      expect(barracksLand.army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
      expect((barracksLand.army[0].units[0] as RegularUnit).count).toBe(20);

      startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub); // recruit more warrior
      verifyRecruitSlot(barracksLand.mapPos, 0, 1, RegularUnitType.WARRIOR, 1);

      makeNTurns(1);

      expect(barracksLand.buildings[0].slots?.length).toBe(0); // all units are recruited
      // check that all units are placed on the map
      expect(barracksLand.army.length).toBe(1);
      expect(barracksLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
      expect(barracksLand.army[0].movements).toBeUndefined();
      expect(barracksLand.army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
      expect((barracksLand.army[0].units[0] as RegularUnit).count).toBe(40); // verify that units are merged
    });

    describe('Corner cases', () => {
      it('regular units could not be recruited in mage towers', () => {
        const mageTowerPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col - 1 };
        construct(gameStateStub, BuildingType.WHITE_MAGE_TOWER, mageTowerPos);

        startRecruiting(RegularUnitType.WARRIOR, mageTowerPos, gameStateStub);
        expect(barracksLand.buildings[0].slots).toBeDefined(); // regular units not recruited
        expect(barracksLand.buildings[0].slots?.length).toBe(0); // regular units not recruited
      });

      it('regular units could not be recruited in land without buildings', () => {
        const emptyLandPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col - 1 };
        const emptyLand = getLand(gameStateStub, emptyLandPos);
        expect(emptyLand.buildings.length).toBe(0);
        expect(emptyLand.army.length).toBe(0);

        startRecruiting(RegularUnitType.WARRIOR, emptyLandPos, gameStateStub);
        expect(emptyLand.buildings.length).toBe(0);

        makeNTurns(1); //wait 1 turn to make sure unit will not appear on the map
        expect(emptyLand.army.length).toBe(0);
      });

      it('regular units could not be recruited when not enough gold in vault', () => {
        getTurnOwner(gameStateStub)!.vault = 100;

        startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);
        expect(barracksLand.buildings[0].slots?.length).toBe(0);
        expect(barracksLand.army.length).toBe(0);
      });
    });
  });

  describe('Recruit Hero units', () => {
    const constructBuilding = (buildingType: BuildingType, pos: LandPosition): void => {
      construct(gameStateStub, buildingType, pos);
      const barracksLand = getLand(gameStateStub, pos);

      expect(gameStateStub.turn).toBe(2);
      expect(gameStateStub.turnPhase).toBe(TurnPhase.MAIN);

      expect(barracksLand).toBeDefined();
      expect(barracksLand.army.length).toBe(0);
      expect(barracksLand.buildings[0].numberOfSlots).toBe(
        buildingType === BuildingType.BARRACKS ? 3 : 1
      );
      expect(barracksLand.buildings[0].slots?.length).toBe(0);
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
          startRecruiting(unitType, barracksLand.mapPos, gameStateStub);
          verifyRecruitSlot(barracksLand.mapPos, 0, 1, unitType, 3);

          makeNTurns(3);

          expect(barracksLand.buildings[0].slots?.length).toBe(0); // hero recruited

          expect(barracksLand.army.length).toBe(1);
          expect(barracksLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
          expect(barracksLand.army[0].movements).toBeUndefined();
          const recruitedUnit = barracksLand.army[0].units[0] as HeroUnit;
          expect(recruitedUnit.id).toBe(unitType);
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
          const mageTowerLand = getLand(gameStateStub, mageTowerPos);

          // Recruiting heroes in mage tower
          startRecruiting(unitType, mageTowerLand.mapPos, gameStateStub);
          verifyRecruitSlot(mageTowerLand.mapPos, 0, 1, unitType, 3);

          makeNTurns(3);

          expect(mageTowerLand.buildings[0].slots?.length).toBe(0); // hero recruited

          expect(mageTowerLand.army.length).toBe(1);
          expect(mageTowerLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
          expect(mageTowerLand.army[0].movements).toBeUndefined();
          const recruitedUnit = mageTowerLand.army[0].units[0] as HeroUnit;
          expect(recruitedUnit.id).toBe(unitType);
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

        const barracksLand = getLand(gameStateStub, barracksPos);
        expect(barracksLand.army.length).toBe(0);

        // Recruiting 3 heroes of the same type in barracks
        startRecruiting(HeroUnitType.FIGHTER, barracksLand.mapPos, gameStateStub);
        startRecruiting(HeroUnitType.FIGHTER, barracksLand.mapPos, gameStateStub);
        startRecruiting(HeroUnitType.FIGHTER, barracksLand.mapPos, gameStateStub);
        verifyRecruitSlot(barracksLand.mapPos, 0, 3, HeroUnitType.FIGHTER, 3);
        verifyRecruitSlot(barracksLand.mapPos, 1, 3, HeroUnitType.FIGHTER, 3);
        verifyRecruitSlot(barracksLand.mapPos, 2, 3, HeroUnitType.FIGHTER, 3);

        makeNTurns(3);

        expect(barracksLand.buildings[0].slots?.length).toBe(0); // hero recruited

        expect(barracksLand.army.length).toBe(1);
        expect(barracksLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
        expect(barracksLand.army[0].movements).toBeUndefined();
        expect(barracksLand.army[0].units.length).toBe(3);
      });
    });

    describe('Corner cases', () => {
      it('mages should not recruit in barracks', () => {
        const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
        constructBuilding(BuildingType.BARRACKS, barracksPos);
        const barracksLand = getLand(gameStateStub, barracksPos);

        startRecruiting(HeroUnitType.FIGHTER, barracksPos, gameStateStub);
        expect(barracksLand.buildings[0].slots?.length).toBe(1); // hero recruited

        startRecruiting(HeroUnitType.CLERIC, barracksPos, gameStateStub);
        expect(barracksLand.buildings[0].slots?.length).toBe(1); // CLERIC is not allowed in Barracks
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

        startRecruiting(HeroUnitType.FIGHTER, mageTowerPos, gameStateStub);
        expect(barracksLand.buildings[0].slots?.length).toBe(0); // hero not recruited
      });

      it('hero units could not be recruited in land without buildings', () => {
        const emptyLandPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col - 1 };
        const emptyLand = getLand(gameStateStub, emptyLandPos);
        expect(emptyLand.buildings.length).toBe(0);
        expect(emptyLand.army.length).toBe(0);

        startRecruiting(HeroUnitType.FIGHTER, emptyLandPos, gameStateStub);
        startRecruiting(HeroUnitType.DRUID, emptyLandPos, gameStateStub);
        expect(emptyLand.buildings.length).toBe(0);

        makeNTurns(1); //wait 1 turn to make sure unit will not appear on the map
        expect(emptyLand.army.length).toBe(0);
      });

      it('regular units could not be recruited when not enough gold in vault', () => {
        const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
        constructBuilding(BuildingType.BARRACKS, barracksPos);

        getTurnOwner(gameStateStub)!.vault = 100;

        const barracksLand = getLand(gameStateStub, barracksPos);

        startRecruiting(HeroUnitType.FIGHTER, barracksPos, gameStateStub);
        expect(barracksLand.army.length).toBe(0);
        expect(barracksLand.buildings[0].slots?.length).toBe(0); // hero is not recruited
      });
    });
  });
});
