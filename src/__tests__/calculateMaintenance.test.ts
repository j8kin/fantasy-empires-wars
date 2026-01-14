import type { GameState } from '../state/GameState';
import type { LandPosition } from '../state/map/land/LandPosition';
import type { UnitRankType } from '../state/army/RegularsState';
import type { RegularUnitType, WarMachineType } from '../types/UnitType';

import { getTurnOwner } from '../selectors/playerSelectors';
import { addPlayerLand } from '../systems/gameStateActions';
import { addRegulars, addWarMachines } from '../systems/armyActions';
import { levelUpHero, levelUpRegulars } from '../systems/unitsActions';
import { heroFactory } from '../factories/heroFactory';
import { regularsFactory } from '../factories/regularsFactory';
import { armyFactory } from '../factories/armyFactory';
import { calculateMaintenance } from '../map/vault/calculateMaintenance';
import { construct } from '../map/building/construct';
import { warMachineFactory } from '../factories/warMachineFactory';

import { Doctrine } from '../state/player/PlayerProfile';
import { UnitRank } from '../state/army/RegularsState';
import { BuildingName } from '../types/Building';
import { HeroUnitName, RegularUnitName, WarMachineName } from '../types/UnitType';

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
    ])('Hero %s maintenance level %s', (heroType, level, expected) => {
      Object.assign(gameStateStub, addPlayerLand(gameStateStub, getTurnOwner(gameStateStub).id, { row: 0, col: 0 }));
      const hero = heroFactory(heroType, heroType);
      while (hero.level < level) {
        levelUpHero(hero, Doctrine.MELEE);
      }

      gameStateStub.armies = [armyFactory(getTurnOwner(gameStateStub).id, { row: 0, col: 0 }, { hero })];
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
    ])(
      'RegularUnit %s maintenance level %s quantity %s',
      (regularType: RegularUnitType, level: UnitRankType, quantity: number, expected: number) => {
        Object.assign(gameStateStub, addPlayerLand(gameStateStub, getTurnOwner(gameStateStub).id, { row: 0, col: 0 }));
        const regular = regularsFactory(regularType);
        while (regular.rank !== level) {
          levelUpRegulars(regular, getTurnOwner(gameStateStub).playerProfile.doctrine);
        }
        regular.count = quantity;

        gameStateStub.armies = [armyFactory(getTurnOwner(gameStateStub).id, { row: 0, col: 0 }, { regular })];
        const maintenance = calculateMaintenance(gameStateStub);
        expect(maintenance).toBe(expected);
      }
    );
    it.each([
      [WarMachineName.BALLISTA, 150],
      [WarMachineName.CATAPULT, 250],
      [WarMachineName.BATTERING_RAM, 50],
      [WarMachineName.SIEGE_TOWER, 250],
    ])('WarMachine %s maintenance', (regular: WarMachineType, expected: number) => {
      Object.assign(gameStateStub, addPlayerLand(gameStateStub, getTurnOwner(gameStateStub).id, { row: 0, col: 0 }));
      gameStateStub.armies = [
        armyFactory(getTurnOwner(gameStateStub).id, { row: 0, col: 0 }, { warMachine: warMachineFactory(regular) }),
      ];
      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(expected);
    });

    it('Multiple units in one army', () => {
      const elitDwarf = regularsFactory(RegularUnitName.DWARF);
      levelUpRegulars(elitDwarf, getTurnOwner(gameStateStub).playerProfile.doctrine);
      levelUpRegulars(elitDwarf, getTurnOwner(gameStateStub).playerProfile.doctrine);
      expect(elitDwarf.rank).toBe(UnitRank.ELITE);
      elitDwarf.count = 17;

      Object.assign(gameStateStub, addPlayerLand(gameStateStub, getTurnOwner(gameStateStub).id, { row: 0, col: 0 }));
      const army = armyFactory(
        getTurnOwner(gameStateStub).id,
        { row: 0, col: 0 },
        { hero: heroFactory(HeroUnitName.NECROMANCER, HeroUnitName.NECROMANCER) }
      );
      Object.assign(army, addRegulars(army, regularsFactory(RegularUnitName.DWARF)));
      Object.assign(army, addWarMachines(army, warMachineFactory(WarMachineName.BALLISTA)));
      Object.assign(army, addRegulars(army, elitDwarf));

      gameStateStub.armies = [army];
      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(520);
    });
  });

  describe('Building Maintenance cost', () => {
    it.each([
      [BuildingName.STRONGHOLD, 0],
      [BuildingName.BARRACKS, 1000],
      [BuildingName.MAGE_TOWER, 2000],
      [BuildingName.WATCH_TOWER, 300],
      [BuildingName.OUTPOST, 1000],
      [BuildingName.WALL, 100],
    ])('Building %s maintenance cost', (building, expected) => {
      const buildingPos: LandPosition = { row: 5, col: 5 };
      Object.assign(gameStateStub, addPlayerLand(gameStateStub, getTurnOwner(gameStateStub).id, buildingPos));
      construct(gameStateStub, building, buildingPos);

      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(expected);
    });

    it('Multiple buildings', () => {
      const buildingPos: LandPosition = { row: 5, col: 5 };
      Object.assign(gameStateStub, addPlayerLand(gameStateStub, getTurnOwner(gameStateStub).id, buildingPos));
      construct(gameStateStub, BuildingName.BARRACKS, buildingPos);
      construct(gameStateStub, BuildingName.WALL, buildingPos);
      construct(gameStateStub, BuildingName.WALL, buildingPos);

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

      construct(gameStateStub, BuildingName.STRONGHOLD, { row: 5, col: 5 });
      construct(gameStateStub, BuildingName.BARRACKS, barracksPos);

      placeUnitsOnMap(regularsFactory(RegularUnitName.DWARF), gameStateStub, barracksPos);

      const maintenance = calculateMaintenance(gameStateStub);
      expect(maintenance).toBe(1000 + 20 * 5);
    });
  });
});
