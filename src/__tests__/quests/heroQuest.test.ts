import { getLand } from '../../selectors/landSelectors';
import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import {
  isMoving,
  findLandByHeroName,
  getArmiesAtPosition,
  findArmyByHero,
} from '../../selectors/armySelectors';
import { nextPlayer } from '../../systems/playerActions';
import { startQuest } from '../../map/quest/startQuest';
import { startRecruiting } from '../../map/recruiting/startRecruiting';
import { construct } from '../../map/building/construct';
import { PREDEFINED_PLAYERS } from '../../domain/player/playerRepository';

import { TreasureType } from '../../types/Treasures';
import { BuildingType } from '../../types/Building';
import { HeroUnitType, RegularUnitType } from '../../types/UnitType';
import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { HeroState } from '../../state/army/HeroState';
import type { QuestType } from '../../types/Quest';

import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { TestTurnManagement } from '../utils/TestTurnManagement';

describe('Hero Quest', () => {
  const easyQuest: QuestType = 'The Echoing Ruins';
  const mediumQuest: QuestType = 'The Whispering Grove';

  let randomSpy: jest.SpyInstance<number, []>;

  let testTurnManagement: TestTurnManagement;

  let gameStateStub: GameState;
  let heroLandPos: LandPosition;
  const heroName = PREDEFINED_PLAYERS[0].name;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    randomSpy = jest.spyOn(Math, 'random');

    gameStateStub = createDefaultGameStateStub();
    while (gameStateStub.turn < 2) nextPlayer(gameStateStub);

    testTurnManagement = new TestTurnManagement(gameStateStub);
    testTurnManagement.startNewTurn(gameStateStub);

    // the game always starts with 1 hero on the first turn on homeland
    heroLandPos = findLandByHeroName(gameStateStub, heroName)!;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
    randomSpy.mockRestore();
  });

  const checkQuest = (
    questId: QuestType,
    expectedHero: HeroState,
    expectedLand: LandPosition,
    expectedRemainTurns: number
  ): void => {
    expect(getTurnOwner(gameStateStub).quests.length).toBe(1);
    expect(getTurnOwner(gameStateStub).quests[0].quest.id).toBe(questId);
    expect(getTurnOwner(gameStateStub).quests[0].hero).toBe(expectedHero);
    expect(getTurnOwner(gameStateStub).quests[0].land).toBe(expectedLand);
    expect(getTurnOwner(gameStateStub).quests[0].remainTurnsInQuest).toBe(expectedRemainTurns); // counter should be decreased during start phase
  };

  it('When player send hero to Quest it should "disappear" from Battlefield', () => {
    expect(gameStateStub.turn).toBe(2);
    expect(getTurnOwner(gameStateStub).quests.length).toBe(0); // no quests at the game start

    // all action could be done only on main phase on other phases all actions are performed automatically
    testTurnManagement.waitStartPhaseComplete();

    // get hero before quest start to verify that hero is not returned to the map and placed in Quest
    const hero = findArmyByHero(gameStateStub, heroName)!.heroes[0];
    startQuest(gameStateStub, heroName, easyQuest);
    checkQuest(easyQuest, hero, heroLandPos, 4);

    expect(getArmiesAtPosition(gameStateStub, heroLandPos).length).toBe(0);
  });

  it('When hero is on Quest on next START phase counter (remainTurnsInQuest) should be decreased', () => {
    expect(gameStateStub.turn).toBe(2);
    testTurnManagement.waitStartPhaseComplete();

    // get hero before quest start to verify that hero is not returned to the map and placed in Quest
    const hero = findArmyByHero(gameStateStub, heroName)!.heroes[0];
    startQuest(gameStateStub, heroName, easyQuest);
    checkQuest(easyQuest, hero, heroLandPos, 4);

    testTurnManagement.makeNTurns(1);

    checkQuest(easyQuest, hero, heroLandPos, 3);
  });

  it('When hero Quest is complete and hero survive it should be placed back on the sam land', () => {
    randomSpy.mockReturnValue(0.01); // always survive

    const heroLevel = findArmyByHero(gameStateStub, heroName)!.heroes[0].level;
    expect(gameStateStub.turn).toBe(2);
    testTurnManagement.waitStartPhaseComplete();

    // get hero before quest start to verify that hero is not returned to the map and placed in Quest
    const hero = findArmyByHero(gameStateStub, heroName)!.heroes[0];
    startQuest(gameStateStub, heroName, easyQuest);
    checkQuest(easyQuest, hero, heroLandPos, 4);

    testTurnManagement.makeNTurns(4);

    expect(getTurnOwner(gameStateStub).quests.length).toBe(0);
    const armies = getArmiesAtPosition(gameStateStub, heroLandPos);
    expect(armies.length).toBe(1);
    expect(armies[0].heroes[0]).toEqual(
      expect.objectContaining({
        name: hero.name,
        type: hero.type,
        level: hero.level,
      })
    );
    expect(armies[0].heroes[0].level).toBe(heroLevel); // hero level not incremented since his level is 8 and he goes into easy quest for level 1-5 heroes
  });

  it('When hero Quest is complete and hero die it should not be placed back on the map', () => {
    randomSpy.mockReturnValue(0.99); // always die

    expect(gameStateStub.turn).toBe(2);
    testTurnManagement.waitStartPhaseComplete();

    // get hero before quest start to verify that hero is not returned to the map and placed in Quest
    const hero = findArmyByHero(gameStateStub, heroName)!.heroes[0];
    startQuest(gameStateStub, heroName, mediumQuest);
    checkQuest(mediumQuest, hero, heroLandPos, 5);

    testTurnManagement.makeNTurns(5);

    expect(getTurnOwner(gameStateStub).quests.length).toBe(0);

    expect(findLandByHeroName(gameStateStub, hero.name)).toBeUndefined(); // hero is dead not returned to the map
  });

  it(`When hero Quest is complete and hero survive if his level is related to quest level`, () => {
    randomSpy.mockReturnValue(0.01); // always survive
    const hero = findArmyByHero(gameStateStub, heroName)!.heroes[0];
    const heroBaseStatsBefore = { ...hero.baseStats };

    const heroLevel = hero.level;
    expect(gameStateStub.turn).toBe(2);
    testTurnManagement.waitStartPhaseComplete();

    startQuest(gameStateStub, heroName, mediumQuest);
    checkQuest(mediumQuest, hero, heroLandPos, 5);

    testTurnManagement.makeNTurns(5);

    expect(getTurnOwner(gameStateStub).quests.length).toBe(0);
    const armies = getArmiesAtPosition(gameStateStub, heroLandPos);
    expect(armies.length).toBe(1);
    expect(armies[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
    expect(isMoving(armies[0])).toBeFalsy();
    expect(armies[0].heroes[0].id).toBe(hero.id);
    expect(armies[0].heroes[0].name).toBe(hero.name);
    expect(armies[0].heroes[0].level).toBe(heroLevel + 1); // level incremented
    expect(armies[0].heroes[0].artifacts.length).toBe(0);
    expect(getTurnOwner(gameStateStub).empireTreasures.length).toBe(1);
    expect(getTurnOwner(gameStateStub).empireTreasures[0].treasure.type).toBe(
      TreasureType.WAND_TURN_UNDEAD
    ); // quest reward

    // verify that hero stats are incremented exact new stats calculation verified separately
    expect(hero.baseStats.attack).toBeGreaterThan(heroBaseStatsBefore.attack);
    expect(hero.baseStats.defense).toBe(heroBaseStatsBefore.defense); // in levelUpHero used Math.floor and 6.52 for level 9 is 6 (the same as previous level)
    expect(hero.baseStats.health).toBeGreaterThan(heroBaseStatsBefore.health);
    expect(hero.baseStats.rangeDamage).toBeGreaterThan(heroBaseStatsBefore.rangeDamage!);
    // not changed parameters
    expect(hero.baseStats.speed).toBe(heroBaseStatsBefore.speed);
    expect(hero.baseStats.range).toBe(heroBaseStatsBefore.range);
    expect(hero.mana).not.toBeDefined();
  });

  const constructBuilding = (buildingType: BuildingType, pos: LandPosition): void => {
    construct(gameStateStub, buildingType, pos);
    const barracksLand = getLand(gameStateStub, pos);

    expect(gameStateStub.turn).toBe(2);

    expect(barracksLand).toBeDefined();
    const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
    expect(armies.length).toBe(0);
    expect(barracksLand.buildings[0].slots.length).toBe(
      buildingType === BuildingType.BARRACKS ? 3 : 1
    );
    expect(
      getLand(gameStateStub, barracksLand.mapPos).buildings[0].slots.filter((s) => s.isOccupied)
        .length
    ).toBe(0);
  };

  it('Couple heroes returned from quest at the same time should be placed on the same land', () => {
    testTurnManagement.waitStartPhaseComplete();
    // Initial condition: Recruiting 3 heroes of the same type in barracks
    const homeLand = getPlayerLands(gameStateStub).find((l) =>
      l.buildings.some((b) => b.id === BuildingType.STRONGHOLD)
    )!;

    const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
    constructBuilding(BuildingType.BARRACKS, barracksPos);

    let barracksLand = getLand(gameStateStub, barracksPos);
    const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
    expect(armies.length).toBe(0);

    // Recruiting 3 heroes of the same type in barracks
    startRecruiting(gameStateStub, barracksLand.mapPos, HeroUnitType.FIGHTER);
    startRecruiting(gameStateStub, barracksLand.mapPos, HeroUnitType.FIGHTER);
    startRecruiting(gameStateStub, barracksLand.mapPos, HeroUnitType.FIGHTER);
    barracksLand = getLand(gameStateStub, barracksPos);
    expect(barracksLand.buildings[0].slots![0].unit).toBe(HeroUnitType.FIGHTER);
    expect(barracksLand.buildings[0].slots![1].unit).toBe(HeroUnitType.FIGHTER);
    expect(barracksLand.buildings[0].slots![2].unit).toBe(HeroUnitType.FIGHTER);

    testTurnManagement.makeNTurns(3);

    const occupiedSlots1 = getLand(gameStateStub, barracksLand.mapPos).buildings[0].slots.filter(
      (s) => s.isOccupied
    );
    expect(occupiedSlots1.length).toBe(0); // hero recruited

    // heroes recruited and available for quests
    const armiesRecruited = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
    expect(armiesRecruited.length).toBe(1);
    expect(armiesRecruited[0].heroes.length).toBe(3);

    /* ********************** SEND TO QUEST ******************* */
    randomSpy.mockReturnValue(0); // always survive (to successfully return all 3 heroes to the same land)
    const heroes = [...armiesRecruited[0].heroes];
    heroes.forEach((hero) => startQuest(gameStateStub, hero.name, easyQuest));
    expect(heroes.length).toBe(3);

    expect(getTurnOwner(gameStateStub).quests.length).toBe(3);
    getTurnOwner(gameStateStub).quests.forEach((quest) => {
      expect(quest.land).toBe(barracksLand.mapPos);
      expect(quest.remainTurnsInQuest).toBe(4);
      expect(quest.hero).toBeDefined();
      expect(quest.hero!.level).toBe(1);
      expect(quest.quest.id).toBe(easyQuest);
    });

    expect(getArmiesAtPosition(gameStateStub, barracksLand.mapPos).length).toBe(0);

    testTurnManagement.makeNTurns(4);

    const armiesReturn = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
    expect(getTurnOwner(gameStateStub).quests.length).toBe(0);
    expect(armiesReturn.length).toBe(1);
    expect(armiesReturn[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
    expect(isMoving(armiesReturn[0])).toBeFalsy();
    expect(armiesReturn[0].heroes.length).toBe(3);

    armiesReturn[0].heroes.forEach((armyUnit) => {
      expect(armyUnit.level).toBe(2);
      expect(armyUnit.artifacts.length).toBe(1);
      expect(armyUnit.artifacts[0].treasure.type).toBe(TreasureType.BOOTS_OF_SPEED);
    });
  });

  it('hero returned from quest correctly merge into existing stationed Army', () => {
    testTurnManagement.waitStartPhaseComplete();
    // Initial condition: Recruiting 3 heroes of the same type in barracks
    const homeLand = getPlayerLands(gameStateStub).find((l) =>
      l.buildings.some((b) => b.id === BuildingType.STRONGHOLD)
    )!;

    const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
    constructBuilding(BuildingType.BARRACKS, barracksPos);

    const barracksLand = getLand(gameStateStub, barracksPos);
    const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
    expect(armies.length).toBe(0);

    // Recruit one regular and one hero unit
    startRecruiting(gameStateStub, barracksLand.mapPos, HeroUnitType.FIGHTER);
    startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitType.WARRIOR);

    testTurnManagement.makeNTurns(3);

    const occupiedSlots2 = getLand(gameStateStub, barracksLand.mapPos).buildings[0].slots.filter(
      (s) => s.isOccupied
    );
    expect(occupiedSlots2.length).toBe(0);
    const armiesRecruited = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
    expect(armiesRecruited.length).toBe(1);
    expect(armiesRecruited[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
    expect(isMoving(armiesRecruited[0])).toBeFalsy();
    expect(armiesRecruited[0].heroes.length).toBe(1);
    expect(armiesRecruited[0].regulars.length).toBe(1);

    /* ********************** SEND TO QUEST ******************* */
    randomSpy.mockReturnValue(0.01); // always survive (to successfully return all 3 heroes to the same land)
    const hero = armiesRecruited[0].heroes[0];
    startQuest(gameStateStub, hero.name, easyQuest);
    const armiesQuestSend = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
    expect(armiesQuestSend.length).toBe(1);
    expect(armiesQuestSend[0].heroes.length).toBe(0);
    expect(armiesQuestSend[0].regulars.length).toBe(1);

    testTurnManagement.makeNTurns(4);

    const armiesQuestComplete = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
    expect(getTurnOwner(gameStateStub).quests.length).toBe(0);
    expect(armiesQuestComplete.length).toBe(1);
    expect(armiesQuestComplete[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
    expect(isMoving(armiesQuestComplete[0])).toBeFalsy();
    expect(armiesQuestComplete[0].heroes.length).toBe(1);
    expect(armiesQuestComplete[0].regulars.length).toBe(1);

    expect(armiesQuestComplete[0].regulars[0].type).toBe(RegularUnitType.WARRIOR);
    expect(armiesQuestComplete[0].heroes[0].type).toBe(HeroUnitType.FIGHTER);
    expect(armiesQuestComplete[0].heroes[0].level).toBe(2);
    expect(armiesQuestComplete[0].heroes[0].artifacts.length).toBe(1);
    expect(armiesQuestComplete[0].heroes[0].artifacts[0].treasure.type).toBe(
      TreasureType.BOOTS_OF_SPEED
    );
  });

  //todo add test when hero returns from quest into territory which now controlled by another player and die
});
