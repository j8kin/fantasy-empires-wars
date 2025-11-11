import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { GameState, getTurnOwner, LandState, TurnPhase } from '../../types/GameState';
import { getLand, getLands, LandPosition } from '../../map/utils/getLands';
import { startQuest } from '../../map/quest/startQuest';
import { HeroUnit, HeroUnitType, isHero, RegularUnitType } from '../../types/Army';
import { QuestType } from '../../types/Quest';
import { TurnManager, TurnManagerCallbacks } from '../../turn/TurnManager';
import { TreasureItem } from '../../types/Treasures';
import { BuildingType } from '../../types/Building';
import { startRecruiting } from '../../map/recruiting/startRecruiting';
import { construct } from '../../map/building/construct';

describe('Hero Quest', () => {
  const easyQuest: QuestType = 'The Echoing Ruins';
  const mediumQuest: QuestType = 'The Whispering Grove';

  let randomSpy: jest.SpyInstance<number, []>;

  let turnManager: TurnManager;
  let mockCallbacks: jest.Mocked<TurnManagerCallbacks>;

  let gameStateStub: GameState;
  let heroLand: LandState;
  let hero: HeroUnit;

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

    // the game always starts with 1 hero on the first turn on homeland
    heroLand = getLands({
      lands: gameStateStub.battlefield.lands,
      players: [getTurnOwner(gameStateStub)!],
      noArmy: false,
    })[0];

    hero = heroLand.army[0].units[0] as HeroUnit;
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

  const checkQuest = (
    questId: QuestType,
    expectedHero: HeroUnit,
    expectedLand: LandPosition,
    expectedRemainTurns: number
  ): void => {
    expect(getTurnOwner(gameStateStub)?.quests.length).toBe(1);
    expect(getTurnOwner(gameStateStub)?.quests[0].quest.id).toBe(questId);
    expect(getTurnOwner(gameStateStub)?.quests[0].hero).toBe(expectedHero);
    expect(getTurnOwner(gameStateStub)?.quests[0].land).toBe(expectedLand);
    expect(getTurnOwner(gameStateStub)?.quests[0].remainTurnsInQuest).toBe(expectedRemainTurns); // counter should be decreased during start phase
  };

  it('When player send hero to Quest it should "disappear" from Battlefield', () => {
    expect(gameStateStub.turn).toBe(2);
    expect(getTurnOwner(gameStateStub)?.quests.length).toBe(0); // no quests at the game start

    // all action could be done only on main phase on other phases all actions are performed automatically
    waitStartPhaseComplete();

    startQuest(hero, easyQuest, gameStateStub);

    checkQuest(easyQuest, hero, heroLand.mapPos, 4);

    expect(heroLand.army.length).toBe(0);
  });

  it('When hero is on Quest on next START phase counter (remainTurnsInQuest) should be decreased', () => {
    expect(gameStateStub.turn).toBe(2);
    waitStartPhaseComplete();

    startQuest(hero, easyQuest, gameStateStub);
    checkQuest(easyQuest, hero, heroLand.mapPos, 4);

    makeNTurns(1);

    checkQuest(easyQuest, hero, heroLand.mapPos, 3);
  });

  it('When hero Quest is complete and hero survive it should be placed back on the sam land', () => {
    randomSpy.mockReturnValue(0.01); // always survive

    const heroLevel = hero.level;
    expect(gameStateStub.turn).toBe(2);
    waitStartPhaseComplete();

    startQuest(hero, easyQuest, gameStateStub);
    checkQuest(easyQuest, hero, heroLand.mapPos, 4);

    makeNTurns(4);

    expect(getTurnOwner(gameStateStub)!.quests.length).toBe(0);
    expect(heroLand.army.length).toBe(1);
    expect(heroLand.army[0].units[0]).toBe(hero);
    expect(hero.level).toBe(heroLevel); // hero level not incremented since his level is 8 and he goes into easy quest for level 1-5 heroes
  });

  it('When hero Quest is complete and hero die it should not be placed back on the map', () => {
    randomSpy.mockReturnValue(0.99); // always die

    expect(gameStateStub.turn).toBe(2);
    waitStartPhaseComplete();

    startQuest(hero, mediumQuest, gameStateStub);
    checkQuest(mediumQuest, hero, heroLand.mapPos, 5);

    makeNTurns(5);

    expect(getTurnOwner(gameStateStub)!.quests.length).toBe(0);
    expect(heroLand.army.length).toBe(0); // hero is dead not returned to the map
    expect(
      getLands({
        lands: gameStateStub.battlefield.lands,
        players: [getTurnOwner(gameStateStub)!],
        noArmy: false,
      }).length
    ).toBe(0); // not returned to map at all
  });

  it('When hero Quest is complete and hero survive if his level is related to quest level', () => {
    randomSpy.mockReturnValue(0.01); // always survive
    const heroStatsBefore = { ...hero };

    const heroLevel = hero.level;
    expect(gameStateStub.turn).toBe(2);
    waitStartPhaseComplete();

    startQuest(hero, mediumQuest, gameStateStub);
    checkQuest(mediumQuest, hero, heroLand.mapPos, 5);

    makeNTurns(5);

    expect(getTurnOwner(gameStateStub)!.quests.length).toBe(0);
    expect(heroLand.army.length).toBe(1);
    expect(heroLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
    expect(heroLand.army[0].movements).toBeUndefined();
    expect(heroLand.army[0].units[0]).toBe(hero);
    expect((heroLand.army[0].units[0] as HeroUnit).artifacts.length).toBe(0);
    expect(getTurnOwner(gameStateStub)?.empireTreasures.length).toBe(1);
    expect(getTurnOwner(gameStateStub)?.empireTreasures[0].id).toBe(TreasureItem.WAND_TURN_UNDEAD); // quest reward
    expect(hero.level).toBe(heroLevel + 1);

    // verify that hero stats are incremented exact new stats calculation verified separately
    expect(hero.attack).toBeGreaterThan(heroStatsBefore.attack);
    expect(hero.defense).toBeGreaterThan(heroStatsBefore.defense);
    expect(hero.health).toBeGreaterThan(heroStatsBefore.health);
    expect(hero.rangeDamage).toBeGreaterThan(heroStatsBefore.rangeDamage!);
    // not changed parameters
    expect(hero.speed).toBe(heroStatsBefore.speed);
    expect(hero.range).toBe(heroStatsBefore.range);
    expect(hero.mana).not.toBeDefined();
  });

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

  it('Couple heroes returned from quest at the same time should be placed on the same land', () => {
    waitStartPhaseComplete();
    // Initial condition: Recruiting 3 heroes of the same type in barracks
    const homeLand = getLands({
      lands: gameStateStub.battlefield.lands,
      players: [getTurnOwner(gameStateStub)!],
      buildings: [BuildingType.STRONGHOLD],
    })[0];

    const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
    constructBuilding(BuildingType.BARRACKS, barracksPos);

    const barracksLand = getLand(gameStateStub, barracksPos);
    expect(barracksLand.army.length).toBe(0);

    // Recruiting 3 heroes of the same type in barracks
    startRecruiting(HeroUnitType.FIGHTER, barracksLand.mapPos, gameStateStub);
    startRecruiting(HeroUnitType.FIGHTER, barracksLand.mapPos, gameStateStub);
    startRecruiting(HeroUnitType.FIGHTER, barracksLand.mapPos, gameStateStub);
    expect(barracksLand.buildings[0].slots![0].unit).toBe(HeroUnitType.FIGHTER);
    expect(barracksLand.buildings[0].slots![1].unit).toBe(HeroUnitType.FIGHTER);
    expect(barracksLand.buildings[0].slots![2].unit).toBe(HeroUnitType.FIGHTER);

    makeNTurns(3);

    expect(barracksLand.buildings[0].slots?.length).toBe(0); // hero recruited

    // heroes recruited and available for quests
    expect(barracksLand.army.length).toBe(1);
    expect(barracksLand.army[0].units.length).toBe(3);

    /* ********************** SEND TO QUEST ******************* */
    randomSpy.mockReturnValue(0.01); // always survive (to successfully return all 3 heroes to the same land)
    barracksLand.army.forEach((armyUnit) => {
      armyUnit.units
        .filter((unit) => isHero(unit))
        .forEach((unit) => {
          startQuest(unit as HeroUnit, easyQuest, gameStateStub);
        });
    });
    expect(getTurnOwner(gameStateStub)!.quests.length).toBe(3);
    getTurnOwner(gameStateStub)!.quests.forEach((quest) => {
      expect(quest.land).toBe(barracksLand.mapPos);
      expect(quest.remainTurnsInQuest).toBe(4);
      expect(quest.hero).toBeDefined();
      expect(quest.hero!.level).toBe(1);
      expect(quest.quest.id).toBe(easyQuest);
    });

    expect(barracksLand.army.length).toBe(0);

    makeNTurns(4);
    expect(getTurnOwner(gameStateStub)!.quests.length).toBe(0);
    expect(barracksLand.army.length).toBe(1);
    expect(barracksLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
    expect(barracksLand.army[0].movements).toBeUndefined();
    expect(barracksLand.army[0].units.length).toBe(3);

    barracksLand.army[0].units.forEach((armyUnit) => {
      expect((armyUnit as HeroUnit).level).toBe(2);
      expect((armyUnit as HeroUnit).artifacts.length).toBe(1);
      expect((armyUnit as HeroUnit).artifacts[0].id).toBe(TreasureItem.BOOTS_OF_SPEED);
    });
  });

  it('hero returned from quest correctly merge into existing stationed Army', () => {
    waitStartPhaseComplete();
    // Initial condition: Recruiting 3 heroes of the same type in barracks
    const homeLand = getLands({
      lands: gameStateStub.battlefield.lands,
      players: [getTurnOwner(gameStateStub)!],
      buildings: [BuildingType.STRONGHOLD],
    })[0];

    const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
    constructBuilding(BuildingType.BARRACKS, barracksPos);

    const barracksLand = getLand(gameStateStub, barracksPos);
    expect(barracksLand.army.length).toBe(0);

    // Recruit one regular and one hero unit
    startRecruiting(HeroUnitType.FIGHTER, barracksLand.mapPos, gameStateStub);
    startRecruiting(RegularUnitType.WARRIOR, barracksLand.mapPos, gameStateStub);

    makeNTurns(3);

    expect(barracksLand.buildings[0].slots?.length).toBe(0);
    expect(barracksLand.army.length).toBe(1);
    expect(barracksLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
    expect(barracksLand.army[0].movements).toBeUndefined();
    expect(barracksLand.army[0].units.length).toBe(2);

    /* ********************** SEND TO QUEST ******************* */
    randomSpy.mockReturnValue(0.01); // always survive (to successfully return all 3 heroes to the same land)
    const hero = barracksLand.army[0].units.find((unit) => isHero(unit)) as HeroUnit;
    startQuest(hero, easyQuest, gameStateStub);

    expect(barracksLand.army.length).toBe(1);
    expect(barracksLand.army[0].units.length).toBe(1);

    makeNTurns(4);

    expect(getTurnOwner(gameStateStub)!.quests.length).toBe(0);
    expect(barracksLand.army.length).toBe(1);
    expect(barracksLand.army[0].controlledBy).toBe(gameStateStub.turnOwner);
    expect(barracksLand.army[0].movements).toBeUndefined();
    expect(barracksLand.army[0].units.length).toBe(2);

    expect(barracksLand.army[0].units[0].id).toBe(RegularUnitType.WARRIOR);
    expect(barracksLand.army[0].units[1].id).toBe(HeroUnitType.FIGHTER);
    expect((barracksLand.army[0].units[1] as HeroUnit).level).toBe(2);
    expect((barracksLand.army[0].units[1] as HeroUnit).artifacts.length).toBe(1);
    expect((barracksLand.army[0].units[1] as HeroUnit).artifacts[0].id).toBe(
      TreasureItem.BOOTS_OF_SPEED
    );
  });

  //todo add test when hero returns from quest into territory which now controlled by another player and die
});
