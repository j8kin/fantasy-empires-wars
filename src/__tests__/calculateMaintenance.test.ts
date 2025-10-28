import { calculateMaintenance } from '../map/gold/calculateMaintenance';
import { battlefieldLandId, GameState } from '../types/GameState';
import { generateMockMap } from './utils/generateMockMap';
import {
  getDefaultUnit,
  HeroUnit,
  HeroUnitType,
  RegularUnit,
  RegularUnitType,
  UnitRank,
} from '../types/Army';
import { BuildingType } from '../types/Building';
import { construct } from '../map/building/construct';
import { placeUnitsOnMap } from '../map/army/recruit';
import { LandPosition } from '../map/utils/getLands';
import {
  createDefaultGameStateStub,
  defaultBattlefieldSizeStub,
} from './utils/createGameStateStub';

describe('Calculate Maintenance', () => {
  const gameStateStub: GameState = createDefaultGameStateStub();
  const player = gameStateStub.players[0];

  beforeEach(() => {
    // clear map to remove all armies and buildings
    gameStateStub.battlefield = generateMockMap(defaultBattlefieldSizeStub);
  });

  describe('Army Maintenance cost', () => {
    it.each([
      [HeroUnitType.FIGHTER, 1, 100],
      [HeroUnitType.FIGHTER, 3, 100],
      [HeroUnitType.FIGHTER, 4, 200],
      [HeroUnitType.FIGHTER, 20, 600],
      [HeroUnitType.HAMMER_LORD, 1, 100],
      [HeroUnitType.RANGER, 1, 100],
      [HeroUnitType.PYROMANCER, 1, 100],
      [HeroUnitType.CLERIC, 1, 100],
      [HeroUnitType.DRUID, 1, 100],
      [HeroUnitType.ENCHANTER, 1, 100],
      [HeroUnitType.NECROMANCER, 1, 100],
    ])('Hero %s maintenance level %s', (hero, level, expected) => {
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 0, col: 0 })].controlledBy =
        player.id;
      const heroUnit = getDefaultUnit(hero) as HeroUnit;
      heroUnit.level = level;

      gameStateStub.battlefield.lands[battlefieldLandId({ row: 0, col: 0 })].army = [
        {
          unit: heroUnit,
          isMoving: false,
        },
      ];
      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(expected);
    });

    it.each([
      [RegularUnitType.WARRIOR, UnitRank.REGULAR, 1, 4],
      [RegularUnitType.WARRIOR, UnitRank.VETERAN, 1, 6],
      [RegularUnitType.WARRIOR, UnitRank.ELITE, 1, 8],
      [RegularUnitType.WARRIOR, UnitRank.REGULAR, 20, 80],
      [RegularUnitType.WARRIOR, UnitRank.REGULAR, 753, 3012],
      [RegularUnitType.WARRIOR, UnitRank.VETERAN, 20, 120],
      [RegularUnitType.WARRIOR, UnitRank.ELITE, 20, 160],
      [RegularUnitType.DWARF, UnitRank.REGULAR, 1, 5],
      [RegularUnitType.ORC, UnitRank.REGULAR, 1, 5],
      [RegularUnitType.ORC, UnitRank.REGULAR, 20, 90], // orc maintenance is not an integer number
      [RegularUnitType.ELF, UnitRank.REGULAR, 1, 5],
      [RegularUnitType.DARK_ELF, UnitRank.REGULAR, 1, 5],
      [RegularUnitType.BALLISTA, UnitRank.REGULAR, 1, 150],
      [RegularUnitType.CATAPULT, UnitRank.REGULAR, 1, 50],
    ])('Unit %s maintenance level %s quantity %s', (regular, level, quantity, expected) => {
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 0, col: 0 })].controlledBy =
        player.id;
      const regularUnit = getDefaultUnit(regular) as RegularUnit;
      regularUnit.level = level;
      regularUnit.count = quantity;

      gameStateStub.battlefield.lands[battlefieldLandId({ row: 0, col: 0 })].army = [
        {
          unit: regularUnit,
          isMoving: false,
        },
      ];
      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(expected);
    });

    it('Multiple units in one army', () => {
      const elitDwarf = getDefaultUnit(RegularUnitType.DWARF) as RegularUnit;
      elitDwarf.level = UnitRank.ELITE;
      elitDwarf.count = 17;

      gameStateStub.battlefield.lands[battlefieldLandId({ row: 0, col: 0 })].controlledBy =
        player.id;
      gameStateStub.battlefield.lands[battlefieldLandId({ row: 0, col: 0 })].army = [
        {
          unit: getDefaultUnit(HeroUnitType.NECROMANCER),
          isMoving: false,
        },
        {
          unit: getDefaultUnit(RegularUnitType.DWARF),
          isMoving: false,
        },
        {
          unit: getDefaultUnit(RegularUnitType.BALLISTA),
          isMoving: false,
        },
        {
          unit: elitDwarf,
          isMoving: false,
        },
      ];
      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(520);
    });
  });

  describe('Building Maintenance cost', () => {
    it.each([
      [BuildingType.STRONGHOLD, 0],
      [BuildingType.BARRACKS, 1000],
      [BuildingType.WHITE_MAGE_TOWER, 2000],
      [BuildingType.BLACK_MAGE_TOWER, 2000],
      [BuildingType.BLUE_MAGE_TOWER, 2000],
      [BuildingType.GREEN_MAGE_TOWER, 2000],
      [BuildingType.RED_MAGE_TOWER, 2000],
      [BuildingType.WATCH_TOWER, 300],
      [BuildingType.OUTPOST, 1000],
      [BuildingType.WALL, 100],
    ])('Building %s maintenance cost', (building, expected) => {
      const buildingPos: LandPosition = { row: 5, col: 5 };
      gameStateStub.battlefield.lands[battlefieldLandId(buildingPos)].controlledBy = player.id;
      construct(gameStateStub, building, buildingPos);

      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(expected);
    });

    it('Multiple buildings', () => {
      const buildingPos: LandPosition = { row: 5, col: 5 };
      gameStateStub.battlefield.lands[battlefieldLandId(buildingPos)].controlledBy = player.id;
      construct(gameStateStub, BuildingType.BARRACKS, buildingPos);
      construct(gameStateStub, BuildingType.WALL, buildingPos);
      construct(gameStateStub, BuildingType.WALL, buildingPos);

      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(1200);
    });
  });

  describe('Full Maintenance cost', () => {
    it('No Army and Buildings', () => {
      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(0);
    });

    it('Army and Buildings', () => {
      const barracksPos: LandPosition = { row: 5, col: 6 };

      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 5, col: 5 });
      construct(gameStateStub, BuildingType.BARRACKS, barracksPos);
      gameStateStub.turn = 2; // only on turn 2 and after units could be recruited in BARRACK and placed on map
      placeUnitsOnMap(getDefaultUnit(RegularUnitType.DWARF), gameStateStub, barracksPos);

      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(1000 + 20 * 5);
    });
  });
});
