import { GameState } from '../state/GameState';
import { LandPosition } from '../state/map/land/LandPosition';

import { getTurnOwner } from '../selectors/playerSelectors';
import { addLand } from '../systems/playerActions';
import { addRegulars } from '../systems/armyActions';
import { levelUpHero, levelUpRegulars } from '../systems/unitsActions';

import { armyFactory } from '../factories/armyFactory';

import { BuildingType } from '../types/Building';
import { UnitRank } from '../state/army/RegularsState';
import { HeroUnitType, RegularUnitType } from '../types/UnitType';
import { Alignment } from '../types/Alignment';

import { calculateMaintenance } from '../map/vault/calculateMaintenance';
import { construct } from '../map/building/construct';

import { placeUnitsOnMap } from './utils/placeUnitsOnMap';
import { createGameStateStub } from './utils/createGameStateStub';
import { heroFactory } from '../factories/heroFactory';
import { regularsFactory } from '../factories/regularsFactory';

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
      addLand(getTurnOwner(gameStateStub), { row: 0, col: 0 });
      const heroUnit = heroFactory(hero, hero);
      while (heroUnit.level < level) {
        levelUpHero(heroUnit, Alignment.LAWFUL);
      }

      gameStateStub.armies = [
        armyFactory(getTurnOwner(gameStateStub).id, { row: 0, col: 0 }, [heroUnit]),
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
    ])('RegularUnit %s maintenance level %s quantity %s', (regular, level, quantity, expected) => {
      addLand(getTurnOwner(gameStateStub), { row: 0, col: 0 });
      const regularUnit = regularsFactory(regular);
      while (regularUnit.rank !== level) {
        levelUpRegulars(regularUnit, Alignment.LAWFUL);
      }
      regularUnit.count = quantity;

      gameStateStub.armies = [
        armyFactory(getTurnOwner(gameStateStub).id, { row: 0, col: 0 }, undefined, [regularUnit]),
      ];
      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(expected);
    });

    it('Multiple units in one army', () => {
      const elitDwarf = regularsFactory(RegularUnitType.DWARF);
      levelUpRegulars(elitDwarf, Alignment.LAWFUL);
      levelUpRegulars(elitDwarf, Alignment.LAWFUL);
      expect(elitDwarf.rank).toBe(UnitRank.ELITE);
      elitDwarf.count = 17;

      addLand(getTurnOwner(gameStateStub), { row: 0, col: 0 });
      const army = armyFactory(getTurnOwner(gameStateStub).id, { row: 0, col: 0 }, [
        heroFactory(HeroUnitType.NECROMANCER, HeroUnitType.NECROMANCER),
      ]);
      addRegulars(army, regularsFactory(RegularUnitType.DWARF));
      addRegulars(army, regularsFactory(RegularUnitType.BALLISTA));
      addRegulars(army, elitDwarf);

      gameStateStub.armies = [army];
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
      addLand(getTurnOwner(gameStateStub), buildingPos);
      construct(gameStateStub, building, buildingPos);

      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(expected);
    });

    it('Multiple buildings', () => {
      const buildingPos: LandPosition = { row: 5, col: 5 };
      addLand(getTurnOwner(gameStateStub), buildingPos);
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

      placeUnitsOnMap(regularsFactory(RegularUnitType.DWARF), gameStateStub, barracksPos);

      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(1000 + 20 * 5);
    });
  });
});
