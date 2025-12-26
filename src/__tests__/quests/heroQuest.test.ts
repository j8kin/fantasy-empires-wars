import { getLand, getLandOwner, getPlayerLands, hasBuilding } from '../../selectors/landSelectors';
import { getTurnOwner, hasTreasureByPlayer } from '../../selectors/playerSelectors';
import {
  findArmyByHero,
  findLandByHeroName,
  getArmiesAtPosition,
  isMoving,
} from '../../selectors/armySelectors';
import { getAvailableSlotsCount, hasAvailableSlot } from '../../selectors/buildingSelectors';
import { nextPlayer } from '../../systems/playerActions';
import { startQuest } from '../../map/quest/startQuest';
import { startRecruiting } from '../../map/recruiting/startRecruiting';
import { construct } from '../../map/building/construct';
import { heroFactory } from '../../factories/heroFactory';
import { levelUpHero } from '../../systems/unitsActions';
import { addPlayerEmpireTreasure } from '../../systems/gameStateActions';
import { itemFactory } from '../../factories/treasureFactory';
import { getQuest } from '../../domain/quest/questRepository';
import { items, relicts } from '../../domain/treasure/treasureRepository';
import { NO_PLAYER, PREDEFINED_PLAYERS } from '../../domain/player/playerRepository';
import { Alignment } from '../../types/Alignment';
import { TreasureName, TreasureType } from '../../types/Treasures';
import { BuildingName } from '../../types/Building';
import { HeroUnitName, MAX_HERO_LEVEL, RegularUnitName } from '../../types/UnitType';
import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { QuestType } from '../../types/Quest';
import type { HeroState } from '../../state/army/HeroState';
import type { BuildingType } from '../../types/Building';

import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { placeUnitsOnMap } from '../utils/placeUnitsOnMap';
import { TestTurnManagement } from '../utils/TestTurnManagement';

describe('Hero Quest', () => {
  const easyQuest: QuestType = 'The Echoing Ruins';
  const mediumQuest: QuestType = 'The Whispering Grove';
  const hardQuest: QuestType = 'The Abyssal Crypt';
  const impossibleQuest: QuestType = 'The Shattered Sky';

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

  describe('Base Quest Mechanics', () => {
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
        TreasureName.WAND_OF_TURN_UNDEAD
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
      expect(hasAvailableSlot(barracksLand.buildings[0])).toBeTruthy();
    };

    it('Couple heroes returned from quest at the same time should be placed on the same land', () => {
      testTurnManagement.waitStartPhaseComplete();
      // Initial condition: Recruiting 3 heroes of the same type in barracks
      const homeLand = getPlayerLands(gameStateStub).find((l) =>
        hasBuilding(l, BuildingName.STRONGHOLD)
      )!;

      const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
      constructBuilding(BuildingName.BARRACKS, barracksPos);

      let barracksLand = getLand(gameStateStub, barracksPos);
      const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies.length).toBe(0);

      // Recruiting 3 heroes of the same type in barracks
      startRecruiting(gameStateStub, barracksLand.mapPos, HeroUnitName.FIGHTER);
      startRecruiting(gameStateStub, barracksLand.mapPos, HeroUnitName.FIGHTER);
      startRecruiting(gameStateStub, barracksLand.mapPos, HeroUnitName.FIGHTER);
      barracksLand = getLand(gameStateStub, barracksPos);
      expect(barracksLand.buildings[0].slots![0].unit).toBe(HeroUnitName.FIGHTER);
      expect(barracksLand.buildings[0].slots![1].unit).toBe(HeroUnitName.FIGHTER);
      expect(barracksLand.buildings[0].slots![2].unit).toBe(HeroUnitName.FIGHTER);

      testTurnManagement.makeNTurns(3);

      // heroes are recruited and available for quests
      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksLand.mapPos).buildings[0])).toBe(
        3
      );

      // heroes recruited and available for quests
      const armiesRecruited = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armiesRecruited.length).toBe(1);
      expect(armiesRecruited[0].heroes.length).toBe(3);

      /* ********************** SEND TO QUEST ******************* */
      randomSpy.mockReturnValue(0); // always survive (to successfully return all 3 heroes to the same land)
      const heroes = [...armiesRecruited[0].heroes];
      expect(heroes.length).toBe(3);
      heroes.forEach((hero) => startQuest(gameStateStub, hero.name, easyQuest));

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
        expect(armyUnit.artifacts[0].treasure.type).toBe(TreasureName.BOOTS_OF_SPEED);
      });
    });

    it('hero returned from quest correctly merge into existing stationed Army', () => {
      testTurnManagement.waitStartPhaseComplete();
      // Initial condition: Recruiting a hero in barracks
      const homeLand = getPlayerLands(gameStateStub).find((l) =>
        hasBuilding(l, BuildingName.STRONGHOLD)
      )!;

      const barracksPos = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 };
      constructBuilding(BuildingName.BARRACKS, barracksPos);

      const barracksLand = getLand(gameStateStub, barracksPos);
      const armies = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armies.length).toBe(0);

      // Recruit one regular and one hero unit
      startRecruiting(gameStateStub, barracksLand.mapPos, HeroUnitName.FIGHTER);
      startRecruiting(gameStateStub, barracksLand.mapPos, RegularUnitName.WARRIOR);

      testTurnManagement.makeNTurns(3);

      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksLand.mapPos).buildings[0])).toBe(
        3
      );

      const armiesRecruited = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armiesRecruited.length).toBe(1);
      expect(armiesRecruited[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armiesRecruited[0])).toBeFalsy();
      expect(armiesRecruited[0].heroes.length).toBe(1);
      expect(armiesRecruited[0].regulars.length).toBe(1);

      /* ********************** SEND TO QUEST ******************* */
      randomSpy.mockReturnValue(0.01); // always survive (to successfully return hero to the same land)
      const hero = armiesRecruited[0].heroes[0];
      startQuest(gameStateStub, hero.name, easyQuest);
      const armiesQuestSend = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(armiesQuestSend.length).toBe(1);
      expect(armiesQuestSend[0].heroes.length).toBe(0);
      expect(armiesQuestSend[0].regulars.length).toBe(1);

      testTurnManagement.makeNTurns(4);

      // verify that hero merge into stationed army with existing regulars
      const armiesQuestComplete = getArmiesAtPosition(gameStateStub, barracksLand.mapPos);
      expect(getTurnOwner(gameStateStub).quests.length).toBe(0);
      expect(armiesQuestComplete.length).toBe(1);
      expect(armiesQuestComplete[0].controlledBy).toBe(getTurnOwner(gameStateStub).id);
      expect(isMoving(armiesQuestComplete[0])).toBeFalsy();
      expect(armiesQuestComplete[0].heroes.length).toBe(1);
      expect(armiesQuestComplete[0].regulars.length).toBe(1);

      expect(armiesQuestComplete[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(armiesQuestComplete[0].heroes[0].type).toBe(HeroUnitName.FIGHTER);
      expect(armiesQuestComplete[0].heroes[0].level).toBe(2);
      expect(armiesQuestComplete[0].heroes[0].artifacts.length).toBe(1);
      expect(armiesQuestComplete[0].heroes[0].artifacts[0].treasure.type).toBe(
        TreasureName.BOOTS_OF_SPEED
      );
    });

    it.each([
      [mediumQuest, 0.55],
      [hardQuest, 0.3],
      [impossibleQuest, 0.05],
    ])(
      'Hi risk awarded with gain high level of hero',
      (questType: QuestType, chanceToSurvive: number) => {
        // create new 1 level hero
        const luckyHero = heroFactory(HeroUnitName.FIGHTER, 'Lucky Hero');
        placeUnitsOnMap(luckyHero, gameStateStub, heroLandPos);
        const quest = getQuest(questType);
        randomSpy.mockReturnValueOnce(chanceToSurvive); // survive in Quest

        /********************** SEND TO QUEST ********************/
        testTurnManagement.waitStartPhaseComplete();
        startQuest(gameStateStub, luckyHero.name, questType);
        testTurnManagement.makeNTurns(quest.length + 1);
        /*********************************************************/
        const heroAfterQuest = findArmyByHero(gameStateStub, luckyHero.name)?.heroes?.find(
          (h) => h.name === luckyHero.name
        );
        expect(heroAfterQuest).toBeDefined();
        expect(heroAfterQuest!.level).toBe((quest.level - 1) * 5); // gain level up to min level of quest - reward for the risk
      }
    );
  });

  describe('Return Empty-Handed', () => {
    let hero: HeroState;
    beforeEach(() => {
      // level up till MAX_HERO_LEVEL in this case this hero always survives
      hero = findArmyByHero(gameStateStub, heroName)!.heroes[0];
      while (hero.level < MAX_HERO_LEVEL) levelUpHero(hero, Alignment.LAWFUL);
    });

    it.each([easyQuest, mediumQuest, hardQuest, impossibleQuest])(
      'Hero could return empty-handed from quest %s',
      (questType: QuestType) => {
        const questLen = getQuest(questType).length;
        randomSpy.mockReturnValueOnce(0.1); // survive in Quest
        randomSpy.mockReturnValueOnce(0.8); // do return empty-handed

        /********************** SEND TO QUEST ********************/
        testTurnManagement.waitStartPhaseComplete();
        startQuest(gameStateStub, hero.name, questType);
        testTurnManagement.makeNTurns(questLen + 1);
        /*********************************************************/
        const heroAfterQuest = findArmyByHero(gameStateStub, hero.name);
        expect(heroAfterQuest).toBeDefined();
        // no Artifacts
        expect(heroAfterQuest!.heroes[0].artifacts).toHaveLength(0);
        // no Relicts/Items in empire treasures
        expect(getTurnOwner(gameStateStub).empireTreasures).toHaveLength(0);
      }
    );
  });

  describe('Gain Artifacts', () => {
    let hero: HeroState;
    beforeEach(() => {
      // level up till MAX_HERO_LEVEL in this case this hero always survives
      hero = findArmyByHero(gameStateStub, heroName)!.heroes[0];
      while (hero.level < MAX_HERO_LEVEL) levelUpHero(hero, Alignment.LAWFUL);
    });

    it.each([
      [TreasureName.BOOTS_OF_SPEED, easyQuest],
      [TreasureName.GAUNTLETS_OF_POWER, mediumQuest],
      [TreasureName.HELMET_OF_VISION, hardQuest],
    ])(
      'Artifact %s could be obtained in quest %s',
      (itemObtained: TreasureType, questType: QuestType) => {
        const questLen = getQuest(questType).length;
        switch (questType) {
          case easyQuest:
            randomSpy.mockReturnValue(0.1); // to get Hero Artifact
            break;
          case mediumQuest:
            randomSpy.mockReturnValue(0.31); // to get Hero Artifact
            break;
          case hardQuest:
            randomSpy.mockReturnValueOnce(0.1); // survive in Quest
            randomSpy.mockReturnValueOnce(0.2); // do not return empty-handed
            randomSpy.mockReturnValue(0.56); // to get Hero Artifact
            break;
        }
        // no artifacts before quest
        expect(hero.artifacts).toHaveLength(0);
        /********************** SEND TO QUEST ********************/
        testTurnManagement.waitStartPhaseComplete();
        startQuest(gameStateStub, hero.name, questType);
        testTurnManagement.makeNTurns(questLen + 1);
        /*********************************************************/
        expect(findArmyByHero(gameStateStub, hero.name)).toBeDefined();
        const heroAfterQuest = findArmyByHero(gameStateStub, hero.name)!.heroes[0];
        expect(heroAfterQuest.artifacts).toHaveLength(1); // gain artifact
        expect(heroAfterQuest.artifacts[0].treasure.type).toBe(itemObtained);

        // Empire treasure is empty no items/relicts obtained
        expect(getTurnOwner(gameStateStub).empireTreasures).toHaveLength(0);
      }
    );

    // todo update when hero would be able to contain only one artifact
    it('Hero could obtain more then one artifact', () => {
      randomSpy.mockReturnValue(0.1); // to get Hero Artifact
      testTurnManagement.waitStartPhaseComplete();

      // no artifacts before quest
      expect(hero.artifacts).toHaveLength(0);
      /********************** SEND TO QUEST ********************/
      startQuest(gameStateStub, hero.name, easyQuest);
      testTurnManagement.makeNTurns(5);
      /*********************************************************/
      expect(findArmyByHero(gameStateStub, hero.name)).toBeDefined();
      // gain artifact
      expect(findArmyByHero(gameStateStub, hero.name)!.heroes[0].artifacts).toHaveLength(1);
      expect(findArmyByHero(gameStateStub, hero.name)!.heroes[0].artifacts[0].treasure.type).toBe(
        TreasureName.BOOTS_OF_SPEED
      );

      randomSpy.mockReturnValue(0.3); // to get Another Hero Artifact
      /********************** SEND TO QUEST ********************/
      startQuest(gameStateStub, hero.name, easyQuest);
      testTurnManagement.makeNTurns(5);
      /*********************************************************/
      expect(findArmyByHero(gameStateStub, hero.name)).toBeDefined();
      // gain artifact
      expect(findArmyByHero(gameStateStub, hero.name)!.heroes[0].artifacts).toHaveLength(2);
      expect(findArmyByHero(gameStateStub, hero.name)!.heroes[0].artifacts[0].treasure.type).toBe(
        TreasureName.BOOTS_OF_SPEED
      );
      expect(findArmyByHero(gameStateStub, hero.name)!.heroes[0].artifacts[1].treasure.type).toBe(
        TreasureName.GAUNTLETS_OF_POWER
      );
    });
  });

  describe('Gain Items', () => {
    let hero: HeroState;
    beforeEach(() => {
      // level up till MAX_HERO_LEVEL in this case this hero always survives
      hero = findArmyByHero(gameStateStub, heroName)!.heroes[0];
      while (hero.level < MAX_HERO_LEVEL) levelUpHero(hero, Alignment.LAWFUL);
    });

    it.each([
      [TreasureName.AEGIS_SHARD, mediumQuest],
      [TreasureName.SEED_OF_RENEWAL, hardQuest],
      [TreasureName.RESURRECTION, impossibleQuest],
    ])(
      'Item %s could be obtained in quest %s',
      (itemObtained: TreasureType, questType: QuestType) => {
        const questLen = getQuest(questType).length;
        switch (questType) {
          case mediumQuest:
            randomSpy.mockReturnValue(0.3); // to get Item
            break;
          case hardQuest:
            randomSpy.mockReturnValue(0.21); // to get Item
            break;
          case impossibleQuest:
            randomSpy.mockReturnValueOnce(0.1); // survive in Quest
            randomSpy.mockReturnValueOnce(0.2); // do not return empty-handed
            randomSpy.mockReturnValue(0.41); // gets Item
            break;
        }

        /********************** SEND TO QUEST ********************/
        testTurnManagement.waitStartPhaseComplete();
        startQuest(gameStateStub, hero.name, questType);
        testTurnManagement.makeNTurns(questLen + 1);
        /*********************************************************/
        expect(findArmyByHero(gameStateStub, hero.name)).toBeDefined();
        const heroAfterQuest = findArmyByHero(gameStateStub, hero.name)!.heroes[0];
        expect(heroAfterQuest.level).toBe(32);
        expect(getTurnOwner(gameStateStub).empireTreasures).toHaveLength(1);
        const item = getTurnOwner(gameStateStub).empireTreasures[0];
        expect(item.treasure.type).toBe(itemObtained);
        expect(items.some((i) => i.type === itemObtained)).toBeTruthy(); // verify that get Item not other rewards type
      }
    );

    it('Items could be obtained more then once', () => {
      randomSpy.mockReturnValue(0.21); // to get the same Item
      /********************** SEND TO QUEST ********************/
      testTurnManagement.waitStartPhaseComplete();
      startQuest(gameStateStub, hero.name, hardQuest);
      testTurnManagement.makeNTurns(7);
      /*********************************************************/
      expect(findArmyByHero(gameStateStub, hero.name)).toBeDefined();
      expect(getTurnOwner(gameStateStub).empireTreasures).toHaveLength(1);
      expect(getTurnOwner(gameStateStub).empireTreasures[0].treasure.type).toBe(
        TreasureName.SEED_OF_RENEWAL
      );

      /********************** SEND TO QUEST ********************/
      startQuest(gameStateStub, hero.name, hardQuest);
      testTurnManagement.makeNTurns(7);
      /*********************************************************/
      expect(findArmyByHero(gameStateStub, hero.name)).toBeDefined();
      expect(getTurnOwner(gameStateStub).empireTreasures).toHaveLength(2);
      expect(getTurnOwner(gameStateStub).empireTreasures[0].treasure.type).toBe(
        TreasureName.SEED_OF_RENEWAL
      );
      expect(getTurnOwner(gameStateStub).empireTreasures[1].treasure.type).toBe(
        TreasureName.SEED_OF_RENEWAL
      );
    });
  });

  describe('Gain Relics', () => {
    let hero: HeroState;
    beforeEach(() => {
      // level up till MAX_HERO_LEVEL in this case this hero always survives
      hero = findArmyByHero(gameStateStub, heroName)!.heroes[0];
      while (hero.level < MAX_HERO_LEVEL) levelUpHero(hero, Alignment.LAWFUL);
    });

    it.each([hardQuest, impossibleQuest])(
      'Relic could be obtained in quest %s',
      (questType: QuestType) => {
        const questLen = getQuest(questType).length;

        randomSpy.mockReturnValue(0.01); // to get Relic
        /********************** SEND TO QUEST ********************/
        testTurnManagement.waitStartPhaseComplete();
        startQuest(gameStateStub, hero.name, questType);
        testTurnManagement.makeNTurns(questLen + 1);
        /*********************************************************/
        expect(findArmyByHero(gameStateStub, hero.name)).toBeDefined();
        const heroAfterQuest = findArmyByHero(gameStateStub, hero.name)!.heroes[0];
        expect(heroAfterQuest.level).toBe(32);
        expect(getTurnOwner(gameStateStub).empireTreasures).toHaveLength(1);
        const relic = getTurnOwner(gameStateStub).empireTreasures[0];
        expect(relic.treasure.type).toBe(TreasureName.MIRROR_OF_ILLUSION);
      }
    );

    it('Relic could be obtained only once per game', () => {
      randomSpy.mockReturnValue(0.01); // try to get the same Relic
      /********************** SEND TO QUEST ********************/
      testTurnManagement.waitStartPhaseComplete();
      startQuest(gameStateStub, hero.name, hardQuest);
      testTurnManagement.makeNTurns(8);
      /*********************************************************/
      expect(findArmyByHero(gameStateStub, hero.name)).toBeDefined();
      expect(getTurnOwner(gameStateStub).empireTreasures).toHaveLength(1);
      expect(getTurnOwner(gameStateStub).empireTreasures[0].treasure.type).toBe(
        TreasureName.MIRROR_OF_ILLUSION
      );

      /********************** SEND TO QUEST ********************/
      startQuest(gameStateStub, hero.name, hardQuest);
      testTurnManagement.makeNTurns(8);
      /*********************************************************/
      expect(findArmyByHero(gameStateStub, hero.name)).toBeDefined();
      expect(getTurnOwner(gameStateStub).empireTreasures).toHaveLength(2);
      expect(getTurnOwner(gameStateStub).empireTreasures[0].treasure.type).toBe(
        TreasureName.MIRROR_OF_ILLUSION
      );
      expect(getTurnOwner(gameStateStub).empireTreasures[1].treasure.type).toBe(
        TreasureName.BANNER_OF_UNITY
      );
    });

    it('get all relicts in game', () => {
      randomSpy.mockReturnValue(0.01); // to get Relic
      testTurnManagement.waitStartPhaseComplete();
      for (let i = 0; i < relicts.length; i++) {
        /********************** SEND TO QUEST ********************/
        startQuest(gameStateStub, hero.name, hardQuest);
        testTurnManagement.makeNTurns(8);
        /*********************************************************/
        expect(findArmyByHero(gameStateStub, hero.name)).toBeDefined();
        expect(getTurnOwner(gameStateStub).empireTreasures).toHaveLength(i + 1);
      }

      const turnOwner = getTurnOwner(gameStateStub);
      expect(hasTreasureByPlayer(turnOwner, TreasureName.MIRROR_OF_ILLUSION)).toBeTruthy();
      expect(hasTreasureByPlayer(turnOwner, TreasureName.BANNER_OF_UNITY)).toBeTruthy();
      expect(hasTreasureByPlayer(turnOwner, TreasureName.HEARTSTONE_OF_ORRIVANE)).toBeTruthy();
      expect(hasTreasureByPlayer(turnOwner, TreasureName.SHARD_OF_THE_SILENT_ANVIL)).toBeTruthy();
      expect(hasTreasureByPlayer(turnOwner, TreasureName.CROWN_OF_DOMINION)).toBeTruthy();
      expect(hasTreasureByPlayer(turnOwner, TreasureName.SCEPTER_OF_TEMPESTS)).toBeTruthy();
      expect(hasTreasureByPlayer(turnOwner, TreasureName.VERDANT_IDOL)).toBeTruthy();
      expect(hasTreasureByPlayer(turnOwner, TreasureName.OBSIDIAN_CHALICE)).toBeFalsy(); // non-alignment artifact
      expect(hasTreasureByPlayer(turnOwner, TreasureName.STARWELL_PRISM)).toBeFalsy(); // non-alignment artifact
    });

    it('when it is not possible to get relic, hero gain item', () => {
      randomSpy.mockReturnValue(0.01); // to get Relic
      testTurnManagement.waitStartPhaseComplete();
      // only 7 relicts are available
      for (let i = 0; i < 7; i++) {
        /********************** SEND TO QUEST ********************/
        startQuest(gameStateStub, hero.name, hardQuest);
        testTurnManagement.makeNTurns(8);
        /*********************************************************/
        expect(findArmyByHero(gameStateStub, hero.name)).toBeDefined();
        expect(getTurnOwner(gameStateStub).empireTreasures).toHaveLength(i + 1);
      }
      expect(getTurnOwner(gameStateStub).empireTreasures).toHaveLength(7); // all posible relics obtained
      /********************** SEND TO QUEST ********************/
      startQuest(gameStateStub, hero.name, hardQuest);
      testTurnManagement.makeNTurns(8);
      /*********************************************************/
      expect(getTurnOwner(gameStateStub).empireTreasures).toHaveLength(8); // item obtained instead of relic
      expect(getTurnOwner(gameStateStub).empireTreasures[7].treasure.type).toBe(
        TreasureName.WAND_OF_TURN_UNDEAD
      );
    });
  });

  describe('Hero die in Quest', () => {
    it('When hero Quest is complete and hero die it should not be placed back on the map', () => {
      randomSpy.mockReturnValue(0.99); // always die

      expect(gameStateStub.turn).toBe(2);
      testTurnManagement.waitStartPhaseComplete();

      // get hero before quest start to verify that hero is not returned to the map and placed in Quest
      const hero = findArmyByHero(gameStateStub, heroName)!.heroes[0];
      /********************** SEND TO QUEST ********************/
      startQuest(gameStateStub, heroName, mediumQuest);
      checkQuest(mediumQuest, hero, heroLandPos, 5);
      /*********************************************************/

      testTurnManagement.makeNTurns(5);

      expect(getTurnOwner(gameStateStub).quests.length).toBe(0);

      expect(findLandByHeroName(gameStateStub, hero.name)).toBeUndefined(); // hero is dead not returned to the map
    });

    it('hero die when it returned from quest to uncontrolled by player land', () => {
      const maxLevelHero = heroFactory(HeroUnitName.FIGHTER, 'MaxLevelHero');
      while (maxLevelHero.level < MAX_HERO_LEVEL) levelUpHero(maxLevelHero, Alignment.LAWFUL);
      getTurnOwner(gameStateStub).vault = 100000;
      construct(gameStateStub, BuildingName.STRONGHOLD, { row: 0, col: 0 }); // far from player territory
      placeUnitsOnMap(maxLevelHero, gameStateStub, { row: 0, col: 0 });
      testTurnManagement.waitStartPhaseComplete();

      /***************** START QUEST *********************/
      startQuest(gameStateStub, maxLevelHero.name, easyQuest);
      // and destroy stronghold
      construct(gameStateStub, BuildingName.DEMOLITION, { row: 0, col: 0 });
      expect(getLandOwner(gameStateStub, { row: 0, col: 0 })).toBe(NO_PLAYER.id);
      /**************************************************/

      testTurnManagement.makeNTurns(5);

      expect(getTurnOwner(gameStateStub).quests.length).toBe(0);

      expect(findLandByHeroName(gameStateStub, maxLevelHero.name)).toBeUndefined(); // hero is dead not returned to the map
    });

    it('Hero survive if player has MERCY_OF_ORRIVANE in treasury and hero level >= 10', () => {
      Object.assign(
        gameStateStub,
        addPlayerEmpireTreasure(
          gameStateStub,
          gameStateStub.turnOwner,
          itemFactory(TreasureName.MERCY_OF_ORRIVANE)
        )
      );
      expect(
        hasTreasureByPlayer(getTurnOwner(gameStateStub), TreasureName.MERCY_OF_ORRIVANE)
      ).toBeTruthy();

      randomSpy.mockReturnValue(1.0); // always die

      expect(gameStateStub.turn).toBe(2);
      testTurnManagement.waitStartPhaseComplete();

      // get hero before quest start to verify that hero is not returned to the map and placed in Quest
      const hero = findArmyByHero(gameStateStub, heroName)!.heroes[0];
      while (hero.level < 10) levelUpHero(hero, Alignment.LAWFUL); // increase level to 10
      /********************** SEND TO QUEST ********************/
      startQuest(gameStateStub, heroName, hardQuest);
      checkQuest(hardQuest, hero, heroLandPos, 6);
      /**************************************************/

      testTurnManagement.makeNTurns(6);

      expect(getTurnOwner(gameStateStub).quests.length).toBe(0);

      expect(findLandByHeroName(gameStateStub, hero.name)).toBeDefined(); // hero is survived
      expect(findArmyByHero(gameStateStub, heroName)!.heroes[0].name).toBe(hero.name);
      expect(findArmyByHero(gameStateStub, heroName)!.heroes[0].level).toBe(hero.level); // level not incremented !!!
      // item disappeared
      expect(
        hasTreasureByPlayer(getTurnOwner(gameStateStub), TreasureName.MERCY_OF_ORRIVANE)
      ).toBeFalsy();
    });

    it('Hero die even if player has MERCY_OF_ORRIVANE in treasury but hero level < 10', () => {
      Object.assign(
        gameStateStub,
        addPlayerEmpireTreasure(
          gameStateStub,
          gameStateStub.turnOwner,
          itemFactory(TreasureName.MERCY_OF_ORRIVANE)
        )
      );
      expect(
        hasTreasureByPlayer(getTurnOwner(gameStateStub), TreasureName.MERCY_OF_ORRIVANE)
      ).toBeTruthy();

      randomSpy.mockReturnValue(1.0); // always die

      expect(gameStateStub.turn).toBe(2);
      testTurnManagement.waitStartPhaseComplete();

      // get hero before quest start to verify that hero is not returned to the map and placed in Quest
      const hero = findArmyByHero(gameStateStub, heroName)!.heroes[0];
      expect(hero.level).toBeLessThan(10);
      /********************** SEND TO QUEST ********************/
      startQuest(gameStateStub, heroName, hardQuest);
      checkQuest(hardQuest, hero, heroLandPos, 6);
      /**************************************************/

      testTurnManagement.makeNTurns(6);

      expect(getTurnOwner(gameStateStub).quests.length).toBe(0);

      expect(findLandByHeroName(gameStateStub, hero.name)).toBeUndefined(); // hero is not survived
      // item still exists
      expect(
        hasTreasureByPlayer(getTurnOwner(gameStateStub), TreasureName.MERCY_OF_ORRIVANE)
      ).toBeTruthy();
    });

    it('If player has two MERCY_OF_ORRIVANE in treasury only one should be used', () => {
      Object.assign(
        gameStateStub,
        addPlayerEmpireTreasure(
          gameStateStub,
          gameStateStub.turnOwner,
          itemFactory(TreasureName.MERCY_OF_ORRIVANE)
        )
      );
      Object.assign(
        gameStateStub,
        addPlayerEmpireTreasure(
          gameStateStub,
          gameStateStub.turnOwner,
          itemFactory(TreasureName.MERCY_OF_ORRIVANE)
        )
      );
      expect(
        hasTreasureByPlayer(getTurnOwner(gameStateStub), TreasureName.MERCY_OF_ORRIVANE)
      ).toBeTruthy();
      expect(getTurnOwner(gameStateStub).empireTreasures.length).toBe(2);

      randomSpy.mockReturnValue(1.0); // always die

      expect(gameStateStub.turn).toBe(2);
      testTurnManagement.waitStartPhaseComplete();

      // get hero before quest start to verify that hero is not returned to the map and placed in Quest
      const hero = findArmyByHero(gameStateStub, heroName)!.heroes[0];
      while (hero.level < 10) levelUpHero(hero, Alignment.LAWFUL); // increase level to 10 to be aligned with MERCY_OF_ORRIVANE
      /********************** SEND TO QUEST ********************/
      startQuest(gameStateStub, heroName, hardQuest);
      checkQuest(hardQuest, hero, heroLandPos, 6);
      /**************************************************/

      testTurnManagement.makeNTurns(6);

      expect(getTurnOwner(gameStateStub).quests.length).toBe(0);

      expect(findLandByHeroName(gameStateStub, hero.name)).toBeDefined(); // hero is survived
      expect(findArmyByHero(gameStateStub, heroName)!.heroes[0].name).toBe(hero.name);
      expect(findArmyByHero(gameStateStub, heroName)!.heroes[0].level).toBe(hero.level); // level not incremented !!!
      // item disappeared
      expect(
        hasTreasureByPlayer(getTurnOwner(gameStateStub), TreasureName.MERCY_OF_ORRIVANE)
      ).toBeTruthy();
      expect(getTurnOwner(gameStateStub).empireTreasures.length).toBe(1);
    });
  });
});
