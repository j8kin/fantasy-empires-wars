import type { GameState } from '../state/GameState';
import type { LandPosition } from '../state/map/land/LandPosition';

import { getTurnOwner } from '../selectors/playerSelectors';
import { addPlayerLand } from '../systems/gameStateActions';
import { addRegulars } from '../systems/armyActions';
import { levelUpHero, levelUpRegulars } from '../systems/unitsActions';
import { heroFactory } from '../factories/heroFactory';
import { regularsFactory } from '../factories/regularsFactory';
import { armyFactory } from '../factories/armyFactory';
import { calculateMaintenance } from '../map/vault/calculateMaintenance';
import { construct } from '../map/building/construct';

import { BuildingKind } from '../types/Building';
import { UnitRank } from '../state/army/RegularsState';
import { HeroUnitName, RegularUnitName } from '../types/UnitType';
import { Alignment } from '../types/Alignment';

import { createGameStateStub } from './utils/createGameStateStub';
import { placeUnitsOnMap } from './utils/placeUnitsOnMap';

describe('Calculate Maintenance', () => {
  let gameStateStub: GameState;

  beforeEach(() => {
    // clear map to remove all armies and buildings
    gameStateStub = createGameStateStub({ addPlayersHomeland: false });
  });

  describe('Army Maintenance cost', () => {
    it.each([
      [HeroUnitName.FIGHTER, 1, 100],
      [HeroUnitName.FIGHTER, 3, 100],
      [HeroUnitName.FIGHTER, 4, 200],
      [HeroUnitName.FIGHTER, 20, 600],
      [HeroUnitName.HAMMER_LORD, 1, 100],
      [HeroUnitName.RANGER, 1, 100],
      [HeroUnitName.PYROMANCER, 1, 100],
      [HeroUnitName.CLERIC, 1, 100],
      [HeroUnitName.DRUID, 1, 100],
      [HeroUnitName.ENCHANTER, 1, 100],
      [HeroUnitName.NECROMANCER, 1, 100],
    ])('Hero %s maintenance level %s', (hero, level, expected) => {
      Object.assign(
        gameStateStub,
        addPlayerLand(gameStateStub, getTurnOwner(gameStateStub).id, { row: 0, col: 0 })
      );
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
      [RegularUnitName.WARRIOR, UnitRank.REGULAR, 1, 4],
      [RegularUnitName.WARRIOR, UnitRank.VETERAN, 1, 6],
      [RegularUnitName.WARRIOR, UnitRank.ELITE, 1, 8],
      [RegularUnitName.WARRIOR, UnitRank.REGULAR, 20, 80],
      [RegularUnitName.WARRIOR, UnitRank.REGULAR, 753, 3012],
      [RegularUnitName.WARRIOR, UnitRank.VETERAN, 20, 120],
      [RegularUnitName.WARRIOR, UnitRank.ELITE, 20, 160],
      [RegularUnitName.DWARF, UnitRank.REGULAR, 1, 5],
      [RegularUnitName.ORC, UnitRank.REGULAR, 1, 5],
      [RegularUnitName.ORC, UnitRank.REGULAR, 20, 90], // orc maintenance is not an integer number
      [RegularUnitName.ELF, UnitRank.REGULAR, 1, 5],
      [RegularUnitName.DARK_ELF, UnitRank.REGULAR, 1, 5],
      [RegularUnitName.BALLISTA, UnitRank.REGULAR, 1, 150],
      [RegularUnitName.CATAPULT, UnitRank.REGULAR, 1, 50],
    ])('RegularUnit %s maintenance level %s quantity %s', (regular, level, quantity, expected) => {
      Object.assign(
        gameStateStub,
        addPlayerLand(gameStateStub, getTurnOwner(gameStateStub).id, { row: 0, col: 0 })
      );
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
      const elitDwarf = regularsFactory(RegularUnitName.DWARF);
      levelUpRegulars(elitDwarf, Alignment.LAWFUL);
      levelUpRegulars(elitDwarf, Alignment.LAWFUL);
      expect(elitDwarf.rank).toBe(UnitRank.ELITE);
      elitDwarf.count = 17;

      Object.assign(
        gameStateStub,
        addPlayerLand(gameStateStub, getTurnOwner(gameStateStub).id, { row: 0, col: 0 })
      );
      const army = armyFactory(getTurnOwner(gameStateStub).id, { row: 0, col: 0 }, [
        heroFactory(HeroUnitName.NECROMANCER, HeroUnitName.NECROMANCER),
      ]);
      Object.assign(army, addRegulars(army, regularsFactory(RegularUnitName.DWARF)));
      Object.assign(army, addRegulars(army, regularsFactory(RegularUnitName.BALLISTA)));
      Object.assign(army, addRegulars(army, elitDwarf));

      gameStateStub.armies = [army];
      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(520);
    });
  });

  describe('Building Maintenance cost', () => {
    it.each([
      [BuildingKind.STRONGHOLD, 0],
      [BuildingKind.BARRACKS, 1000],
      [BuildingKind.WHITE_MAGE_TOWER, 2000],
      [BuildingKind.BLACK_MAGE_TOWER, 2000],
      [BuildingKind.BLUE_MAGE_TOWER, 2000],
      [BuildingKind.GREEN_MAGE_TOWER, 2000],
      [BuildingKind.RED_MAGE_TOWER, 2000],
      [BuildingKind.WATCH_TOWER, 300],
      [BuildingKind.OUTPOST, 1000],
      [BuildingKind.WALL, 100],
    ])('Building %s maintenance cost', (building, expected) => {
      const buildingPos: LandPosition = { row: 5, col: 5 };
      Object.assign(
        gameStateStub,
        addPlayerLand(gameStateStub, getTurnOwner(gameStateStub).id, buildingPos)
      );
      construct(gameStateStub, building, buildingPos);

      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(expected);
    });

    it('Multiple buildings', () => {
      const buildingPos: LandPosition = { row: 5, col: 5 };
      Object.assign(
        gameStateStub,
        addPlayerLand(gameStateStub, getTurnOwner(gameStateStub).id, buildingPos)
      );
      construct(gameStateStub, BuildingKind.BARRACKS, buildingPos);
      construct(gameStateStub, BuildingKind.WALL, buildingPos);
      construct(gameStateStub, BuildingKind.WALL, buildingPos);

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

      construct(gameStateStub, BuildingKind.STRONGHOLD, { row: 5, col: 5 });
      construct(gameStateStub, BuildingKind.BARRACKS, barracksPos);

      placeUnitsOnMap(regularsFactory(RegularUnitName.DWARF), gameStateStub, barracksPos);

      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(1000 + 20 * 5);
    });
  });
});
