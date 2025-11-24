import { calculateMaintenance } from '../map/vault/calculateMaintenance';
import { GameState } from '../state/GameState';
import { getLandId, LandPosition } from '../state/LandState';
import { BuildingType } from '../types/Building';

import { getDefaultUnit, HeroUnit, RegularUnit, UnitRank } from '../types/Unit';
import { HeroUnitType, RegularUnitType } from '../types/UnitType';

import { construct } from '../map/building/construct';

import { placeUnitsOnMap } from './utils/placeUnitsOnMap';
import { createGameStateStub } from './utils/createGameStateStub';

describe('Calculate Maintenance', () => {
  let gameStateStub: GameState;

  beforeEach(() => {
    // clear map to remove all armies and buildings
    gameStateStub = createGameStateStub({ addPlayersHomeland: false });
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
      gameStateStub.turnOwner.addLand(getLandId({ row: 0, col: 0 }));
      const heroUnit = getDefaultUnit(hero) as HeroUnit;
      heroUnit.level = level;

      gameStateStub.map.lands[getLandId({ row: 0, col: 0 })].army = [
        {
          units: [heroUnit],
          controlledBy: gameStateStub.turnOwner.id,
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
      gameStateStub.turnOwner.addLand(getLandId({ row: 0, col: 0 }));
      const regularUnit = getDefaultUnit(regular) as RegularUnit;
      regularUnit.level = level;
      regularUnit.count = quantity;

      gameStateStub.map.lands[getLandId({ row: 0, col: 0 })].army = [
        {
          units: [regularUnit],
          controlledBy: gameStateStub.turnOwner.id,
        },
      ];
      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(expected);
    });

    it('Multiple units in one army', () => {
      const elitDwarf = getDefaultUnit(RegularUnitType.DWARF) as RegularUnit;
      elitDwarf.level = UnitRank.ELITE;
      elitDwarf.count = 17;

      gameStateStub.turnOwner.addLand(getLandId({ row: 0, col: 0 }));
      gameStateStub.map.lands[getLandId({ row: 0, col: 0 })].army = [
        {
          units: [getDefaultUnit(HeroUnitType.NECROMANCER)],
          controlledBy: gameStateStub.turnOwner.id,
        },
        {
          units: [getDefaultUnit(RegularUnitType.DWARF)],
          controlledBy: gameStateStub.turnOwner.id,
        },
        {
          units: [getDefaultUnit(RegularUnitType.BALLISTA)],
          controlledBy: gameStateStub.turnOwner.id,
        },
        {
          units: [elitDwarf],
          controlledBy: gameStateStub.turnOwner.id,
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
      gameStateStub.turnOwner.addLand(getLandId(buildingPos));
      construct(gameStateStub, building, buildingPos);

      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(expected);
    });

    it('Multiple buildings', () => {
      const buildingPos: LandPosition = { row: 5, col: 5 };
      gameStateStub.turnOwner.addLand(getLandId(buildingPos));
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

      placeUnitsOnMap(getDefaultUnit(RegularUnitType.DWARF), gameStateStub, barracksPos);

      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(1000 + 20 * 5);
    });
  });
});
