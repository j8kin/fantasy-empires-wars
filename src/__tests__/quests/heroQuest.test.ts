import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { GameState, getTurnOwner, LandState, TurnPhase } from '../../types/GameState';
import { getLands, LandPosition } from '../../map/utils/getLands';
import { startQuest } from '../../map/quest/startQuest';
import { HeroUnit } from '../../types/Army';
import { QuestType } from '../../map/quest/Quest';
import { TurnManager, TurnManagerCallbacks } from '../../turn/TurnManager';
import { TreasureItem } from '../../types/Treasures';

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

    hero = heroLand.army[0].unit as HeroUnit;
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
    expect(getTurnOwner(gameStateStub)?.quests[0].id).toBe(questId);
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
    expect(heroLand.army[0].unit).toBe(hero);
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
    expect(heroLand.army[0].unit).toBe(hero);
    expect((heroLand.army[0].unit as HeroUnit).artifacts.length).toBe(0);
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

  //todo add test when hero returns from quest into territory which now controlled by another player and die
});
