import { createGameStateStub, defaultBattlefieldSizeStub } from './utils/createGameStateStub';
import { battlefieldLandId, getTurnOwner, TurnPhase } from '../types/GameState';
import { placeUnitsOnMap } from '../map/army/recruit';
import { getDefaultUnit, HeroUnit, HeroUnitType, RegularUnitType } from '../types/Army';
import { BuildingType } from '../types/Building';
import { construct } from '../map/building/construct';
import { generateMockMap } from './utils/generateMockMap';

describe('placeUnitsOnMap', () => {
  const homeland = { row: 3, col: 3 };
  const barracks = { row: 1, col: 2 };
  const mageTowerPos = { row: 1, col: 2 };

  const gameStateStub = createGameStateStub({
    nPlayers: 1,
    addPlayersHomeland: false,
  });

  const player = getTurnOwner(gameStateStub)!;

  beforeEach(() => {
    gameStateStub.turnPhase = TurnPhase.START;
    gameStateStub.battlefield = generateMockMap(defaultBattlefieldSizeStub);
  });

  describe('Place units on Map on turn phase', () => {
    beforeEach(() => {
      gameStateStub.turn = 2;
    });

    it.each([[TurnPhase.START], [TurnPhase.MAIN], [TurnPhase.END]])(
      "should work only on 'START' phase",
      (turnPhase) => {
        gameStateStub.turnPhase = turnPhase;

        const hero = getDefaultUnit(HeroUnitType.FIGHTER);
        construct(gameStateStub, BuildingType.BARRACKS, barracks);

        placeUnitsOnMap(hero, gameStateStub, barracks); // SUT

        expect(gameStateStub.battlefield.lands[battlefieldLandId(barracks)].army.length).toBe(
          turnPhase === TurnPhase.START ? 1 : 0
        );

        const regular = getDefaultUnit(RegularUnitType.WARRIOR);
        construct(gameStateStub, BuildingType.BARRACKS, barracks);

        placeUnitsOnMap(regular, gameStateStub, barracks); // SUT

        expect(gameStateStub.battlefield.lands[battlefieldLandId(barracks)].army.length).toBe(
          turnPhase === TurnPhase.START ? 2 : 0
        );
      }
    );
  });

  describe('Place Hero on Map', () => {
    const hero = getDefaultUnit(player.type) as HeroUnit;

    beforeEach(() => {
      hero.name = player.name;
      hero.level = player.level;
      construct(gameStateStub, BuildingType.STRONGHOLD, homeland);
    });

    it('Turn 1', () => {
      gameStateStub.turn = 1;

      placeUnitsOnMap(hero, gameStateStub, homeland); // SUT

      const army = gameStateStub.battlefield.lands[battlefieldLandId(homeland)].army;
      expect(army.length).toBe(1);
      expect(army[0].unit as HeroUnit).toEqual(hero);
      expect(army[0].isMoving).not.toBeTruthy();
    });

    it('Turn 1 on BARRACK should not work', () => {
      gameStateStub.turn = 1;
      construct(gameStateStub, BuildingType.BARRACKS, barracks);

      placeUnitsOnMap(hero, gameStateStub, barracks); // SUT

      expect(gameStateStub.battlefield.lands[battlefieldLandId(homeland)].army.length).toBe(0);
    });

    it('Turn 2 should not work', () => {
      gameStateStub.turn = 2;

      placeUnitsOnMap(hero, gameStateStub, homeland); // SUT

      expect(gameStateStub.battlefield.lands[battlefieldLandId(homeland)].army.length).toBe(0);
    });

    it.each(Object.values(HeroUnitType))(
      'Heroes (%s) should not place if no buildings on land',
      (heroType) => {
        gameStateStub.turn = 2;
        const newHero = getDefaultUnit(heroType as HeroUnitType) as HeroUnit;

        placeUnitsOnMap(newHero, gameStateStub, barracks); // SUT

        expect(gameStateStub.battlefield.lands[battlefieldLandId(barracks)].army.length).toBe(0);
      }
    );

    it.each([[HeroUnitType.FIGHTER], [HeroUnitType.RANGER], [HeroUnitType.HAMMER_LORD]])(
      'Turn 2 only non-mage Heroes (%s) could be placed on BARRACKS',
      (heroType: HeroUnitType) => {
        gameStateStub.turn = 2;
        const nonMageHero = getDefaultUnit(heroType) as HeroUnit;
        construct(gameStateStub, BuildingType.BARRACKS, barracks);

        placeUnitsOnMap(nonMageHero, gameStateStub, barracks); // SUT

        const army = gameStateStub.battlefield.lands[battlefieldLandId(barracks)].army;
        expect(army.length).toBe(1);
        expect(army[0].unit as HeroUnit).toEqual(nonMageHero);
      }
    );

    it.each([
      [BuildingType.RED_MAGE_TOWER],
      [BuildingType.BLUE_MAGE_TOWER],
      [BuildingType.GREEN_MAGE_TOWER],
      [BuildingType.WHITE_MAGE_TOWER],
      [BuildingType.BLACK_MAGE_TOWER],
    ])('Non-Mage heroes could not be placed on Map with %s', (mageTower: BuildingType) => {
      gameStateStub.turn = 2;
      const nonMageHero = getDefaultUnit(HeroUnitType.FIGHTER) as HeroUnit;
      construct(gameStateStub, mageTower, mageTowerPos);

      placeUnitsOnMap(nonMageHero, gameStateStub, mageTowerPos); // SUT

      expect(gameStateStub.battlefield.lands[battlefieldLandId(mageTowerPos)].army.length).toBe(0);
    });

    describe.each([
      [HeroUnitType.CLERIC],
      [HeroUnitType.DRUID],
      [HeroUnitType.ENCHANTER],
      [HeroUnitType.NECROMANCER],
      [HeroUnitType.PYROMANCER],
    ])('Mage heroes %s could be placed on map', (heroType: HeroUnitType) => {
      it.each([
        [BuildingType.RED_MAGE_TOWER],
        [BuildingType.BLUE_MAGE_TOWER],
        [BuildingType.GREEN_MAGE_TOWER],
        [BuildingType.WHITE_MAGE_TOWER],
        [BuildingType.BLACK_MAGE_TOWER],
      ])("only with it's own color of mage-tower (%s)", (mageTower: BuildingType) => {
        const isRelatedColor =
          (heroType === HeroUnitType.CLERIC && mageTower === BuildingType.WHITE_MAGE_TOWER) ||
          (heroType === HeroUnitType.DRUID && mageTower === BuildingType.GREEN_MAGE_TOWER) ||
          (heroType === HeroUnitType.ENCHANTER && mageTower === BuildingType.BLUE_MAGE_TOWER) ||
          (heroType === HeroUnitType.PYROMANCER && mageTower === BuildingType.RED_MAGE_TOWER) ||
          (heroType === HeroUnitType.NECROMANCER && mageTower === BuildingType.BLACK_MAGE_TOWER);

        gameStateStub.turn = 2;
        const mageHero = getDefaultUnit(heroType) as HeroUnit;
        construct(gameStateStub, mageTower, mageTowerPos);

        placeUnitsOnMap(mageHero, gameStateStub, mageTowerPos); // SUT

        expect(gameStateStub.battlefield.lands[battlefieldLandId(mageTowerPos)].army.length).toBe(
          isRelatedColor ? 1 : 0
        );
      });

      it('only with mage-tower', () => {
        gameStateStub.turn = 2;
        const mageHero = getDefaultUnit(heroType) as HeroUnit;
        construct(gameStateStub, BuildingType.BARRACKS, barracks);

        placeUnitsOnMap(mageHero, gameStateStub, barracks); // SUT

        expect(gameStateStub.battlefield.lands[battlefieldLandId(barracks)].army.length).toBe(0);
      });
    });
  });

  describe('Place Regular Unit on Map', () => {
    const regularUnit = getDefaultUnit(RegularUnitType.BALLISTA);
    it('Turn 1 no units should be placed', () => {
      gameStateStub.turn = 1;
      construct(gameStateStub, BuildingType.BARRACKS, barracks);

      placeUnitsOnMap(regularUnit, gameStateStub, barracks); // SUT

      expect(gameStateStub.battlefield.lands[battlefieldLandId(homeland)].army.length).toBe(0);
    });

    it('Turn 2 units should be placed', () => {
      gameStateStub.turn = 2;
      construct(gameStateStub, BuildingType.BARRACKS, barracks);

      placeUnitsOnMap(regularUnit, gameStateStub, barracks); // SUT

      expect(gameStateStub.battlefield.lands[battlefieldLandId(homeland)].army.length).toBe(0);

      const regularArmy = gameStateStub.battlefield.lands[battlefieldLandId(barracks)].army;
      expect(regularArmy.length).toBe(1);
      expect(regularArmy[0].unit.id).toBe(RegularUnitType.BALLISTA);
      expect(regularArmy[0].isMoving).not.toBeTruthy();
    });

    it('Turn 2 units should not be placed on empty land', () => {
      gameStateStub.turn = 2;

      placeUnitsOnMap(regularUnit, gameStateStub, barracks); // SUT

      expect(gameStateStub.battlefield.lands[battlefieldLandId(homeland)].army.length).toBe(0);

      expect(gameStateStub.battlefield.lands[battlefieldLandId(barracks)].army.length).toBe(0);
    });

    it('Turn 2 units should not be placed on land which not contain BARRACKS/MAGE Towers', () => {
      gameStateStub.turn = 2;

      construct(gameStateStub, BuildingType.OUTPOST, barracks);

      placeUnitsOnMap(regularUnit, gameStateStub, barracks); // SUT

      expect(gameStateStub.battlefield.lands[battlefieldLandId(homeland)].army.length).toBe(0);

      expect(gameStateStub.battlefield.lands[battlefieldLandId(barracks)].army.length).toBe(0);
    });

    it.each([
      [BuildingType.RED_MAGE_TOWER],
      [BuildingType.BLUE_MAGE_TOWER],
      [BuildingType.GREEN_MAGE_TOWER],
      [BuildingType.WHITE_MAGE_TOWER],
      [BuildingType.BLACK_MAGE_TOWER],
    ])(
      'Turn 2 Regular units could be placed on Map only on land with BARRACKS, it is not allows to place on land with %s',
      (mageTower: BuildingType) => {
        gameStateStub.turn = 2;

        construct(gameStateStub, mageTower, mageTowerPos);

        placeUnitsOnMap(regularUnit, gameStateStub, mageTowerPos); // SUT

        expect(gameStateStub.battlefield.lands[battlefieldLandId(homeland)].army.length).toBe(0);

        expect(gameStateStub.battlefield.lands[battlefieldLandId(mageTowerPos)].army.length).toBe(
          0
        );
      }
    );
  });
});
