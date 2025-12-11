import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/map/land/LandPosition';
import { UnitRank } from '../../state/army/RegularsState';
import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import { getArmiesAtPosition } from '../../selectors/armySelectors';
import { getLand } from '../../selectors/landSelectors';
import { getLandById } from '../../domain/land/landRepository';
import { castSpell } from '../../map/magic/castSpell';
import { construct } from '../../map/building/construct';
import { startRecruiting } from '../../map/recruiting/startRecruiting';
import { HeroUnitType, RegularUnitType, UnitType } from '../../types/UnitType';
import { LandType } from '../../types/Land';
import { SpellName } from '../../types/Spell';
import { BuildingType } from '../../types/Building';
import { EffectType } from '../../types/Effect';

import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { TestTurnManagement } from '../utils/TestTurnManagement';
import { getSpellById } from '../../selectors/spellSelectors';
import { placeUnitsOnMap } from '../utils/placeUnitsOnMap';
import { regularsFactory } from '../../factories/regularsFactory';
import { heroFactory } from '../../factories/heroFactory';
import { levelUpHero } from '../../systems/unitsActions';
import { Alignment } from '../../types/Alignment';

describe('castRedManaSpell', () => {
  let randomSpy: jest.SpyInstance<number, []>;

  let gameStateStub: GameState;

  beforeEach(() => {
    gameStateStub = createDefaultGameStateStub();
    getTurnOwner(gameStateStub).mana.red = 200;
    getTurnOwner(gameStateStub).vault = 100000;

    gameStateStub.players[1].mana.red = 200;
  });

  describe('Cast EMBER RAID spell', () => {
    describe('EMBER RAID effects current recruiting', () => {
      it.each([
        [HeroUnitType.NECROMANCER, BuildingType.BLACK_MAGE_TOWER, 4],
        [HeroUnitType.FIGHTER, BuildingType.BARRACKS, 4],
        [RegularUnitType.WARRIOR, BuildingType.BARRACKS, 2],
        [RegularUnitType.CATAPULT, BuildingType.BARRACKS, 4],
      ])(
        'Recruiting %s in %s affected and became %s',
        (unit: UnitType, building: BuildingType, newNTurn: number) => {
          const homeLand = getPlayerLands(gameStateStub)[0];
          const landToRecruit: LandPosition = {
            row: homeLand.mapPos.row - 1,
            col: homeLand.mapPos.col,
          };
          construct(gameStateStub, building, landToRecruit);

          startRecruiting(unit, landToRecruit, gameStateStub);

          // change turnOwner and cast EMBER RAID spell
          gameStateStub.turnOwner = gameStateStub.players[1].id;
          castSpell(gameStateStub, SpellName.EMBER_RAID, landToRecruit);

          // verify that recruiting in building was affected and became newNTurn
          const reqLand = getLand(gameStateStub, landToRecruit);
          expect(reqLand.effects).toHaveLength(1);
          expect(reqLand.effects[0].spell).toBe(SpellName.EMBER_RAID);
          expect(reqLand.effects[0].castBy).toBe(gameStateStub.players[1].id);
          expect(reqLand.effects[0].type).toBe(EffectType.NEGATIVE);
          expect(reqLand.effects[0].duration).toBe(3);

          expect(reqLand.buildings).toHaveLength(1);
          expect(reqLand.buildings[0].slots![0].unit).toBe(unit);
          expect(reqLand.buildings[0].slots![0].turnsRemaining).toBe(newNTurn);
        }
      );
    });
    describe('EMBER RAID effects new recruiting if effect active', () => {
      it.each([
        [HeroUnitType.CLERIC, BuildingType.WHITE_MAGE_TOWER, 4],
        [HeroUnitType.RANGER, BuildingType.BARRACKS, 4],
        [RegularUnitType.ELF, BuildingType.BARRACKS, 3],
        [RegularUnitType.BALLISTA, BuildingType.BARRACKS, 4],
      ])(
        'Recruiting %s in %s affected and became %s',
        (unit: UnitType, building: BuildingType, newNTurn: number) => {
          const homeLand = getPlayerLands(gameStateStub)[0];
          const landToRecruit: LandPosition = {
            row: homeLand.mapPos.row - 1,
            col: homeLand.mapPos.col,
          };
          construct(gameStateStub, building, landToRecruit);

          // change turnOwner and cast EMBER RAID spell
          gameStateStub.turnOwner = gameStateStub.players[1].id;
          castSpell(gameStateStub, SpellName.EMBER_RAID, landToRecruit);

          // return turn to player 0 and start recruiting
          gameStateStub.turnOwner = gameStateStub.players[0].id;
          startRecruiting(unit, landToRecruit, gameStateStub);

          // verify that recruiting in building was affected and became newNTurn
          const reqLand = getLand(gameStateStub, landToRecruit);
          expect(reqLand.effects).toHaveLength(1);
          expect(reqLand.effects[0].spell).toBe(SpellName.EMBER_RAID);
          expect(reqLand.effects[0].castBy).toBe(gameStateStub.players[1].id);
          expect(reqLand.effects[0].type).toBe(EffectType.NEGATIVE);
          expect(reqLand.effects[0].duration).toBe(3);

          expect(reqLand.buildings).toHaveLength(1);
          expect(reqLand.buildings[0].slots![0].unit).toBe(unit);
          expect(reqLand.buildings[0].slots![0].turnsRemaining).toBe(newNTurn);
        }
      );
    });

    describe('EMBER RAID is not possible to cast twice', () => {
      let testTurnManagement: TestTurnManagement;

      beforeEach(() => {
        jest.useFakeTimers();

        testTurnManagement = new TestTurnManagement(gameStateStub);
        testTurnManagement.startNewTurn(gameStateStub);
        testTurnManagement.waitStartPhaseComplete();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('Cast EMBER RAID on Land that has effect is not effects', () => {
        const opponentLandPos = getPlayerLands(gameStateStub, gameStateStub.players[1].id)[1]
          .mapPos;

        castSpell(gameStateStub, SpellName.EMBER_RAID, opponentLandPos);

        testTurnManagement.makeNTurns(1);
        expect(getLand(gameStateStub, opponentLandPos).effects).toHaveLength(1);
        expect(getLand(gameStateStub, opponentLandPos).effects[0].spell).toBe(SpellName.EMBER_RAID);
        expect(getLand(gameStateStub, opponentLandPos).effects[0].duration).toBe(2);

        const opponentMana = getTurnOwner(gameStateStub).mana.red;
        castSpell(gameStateStub, SpellName.EMBER_RAID, opponentLandPos);
        expect(getTurnOwner(gameStateStub).mana.red).toBe(opponentMana); // mana not used

        expect(getLand(gameStateStub, opponentLandPos).effects).toHaveLength(1);
        expect(getLand(gameStateStub, opponentLandPos).effects[0].spell).toBe(SpellName.EMBER_RAID);
        expect(getLand(gameStateStub, opponentLandPos).effects[0].duration).toBe(2); // not changed
      });
    });

    it('Corner case: EMBER RAID on affect the land even if there are no buildings', () => {
      const opponentLandPos = getPlayerLands(gameStateStub, gameStateStub.players[1].id).find(
        (l) => l.buildings.length === 0
      )!.mapPos;

      castSpell(gameStateStub, SpellName.EMBER_RAID, opponentLandPos);

      // change turnOwner construct building and start recruiting
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      construct(gameStateStub, BuildingType.BARRACKS, opponentLandPos);
      startRecruiting(RegularUnitType.WARRIOR, opponentLandPos, gameStateStub);

      const opponentLand = getLand(gameStateStub, opponentLandPos);
      expect(opponentLand.effects).toHaveLength(1); // effect not disappear due to construction
      expect(opponentLand.effects[0].spell).toBe(SpellName.EMBER_RAID);
      expect(opponentLand.effects[0].castBy).toBe(gameStateStub.players[0].id);
      expect(opponentLand.effects[0].type).toBe(EffectType.NEGATIVE);
      expect(opponentLand.effects[0].duration).toBe(3);

      expect(opponentLand.buildings).toHaveLength(1);
      expect(opponentLand.buildings[0].slots![0].unit).toBe(RegularUnitType.WARRIOR);
      expect(opponentLand.buildings[0].slots![0].turnsRemaining).toBe(2); // EMBER RAID effect
    });
  });
  describe('Cast FORGE OF WAR spell', () => {
    it.each([
      [LandType.PLAINS, RegularUnitType.WARRIOR],
      [LandType.MOUNTAINS, RegularUnitType.DWARF],
      [LandType.GREEN_FOREST, RegularUnitType.ELF],
      [LandType.DARK_FOREST, RegularUnitType.DARK_ELF],
      [LandType.HILLS, RegularUnitType.HALFLING],
      [LandType.SWAMP, RegularUnitType.ORC],
      [LandType.DESERT, RegularUnitType.WARRIOR],
      [LandType.VOLCANO, RegularUnitType.ORC],
      [LandType.LAVA, RegularUnitType.ORC],
      [LandType.SUN_SPIRE_PEAKS, RegularUnitType.DWARF],
      [LandType.GOLDEN_PLAINS, RegularUnitType.DWARF],
      [LandType.HEARTWOOD_COVE, RegularUnitType.ELF],
      [LandType.VERDANT_GLADE, RegularUnitType.ELF],
      [LandType.CRISTAL_BASIN, RegularUnitType.WARRIOR],
      [LandType.MISTY_GLADES, RegularUnitType.WARRIOR],
      [LandType.SHADOW_MIRE, RegularUnitType.ORC],
      [LandType.BLIGHTED_FEN, RegularUnitType.ORC],
    ])(
      'Cast FORGE OF WAR on Land (%s) recruit 60 %s',
      (landType: LandType, recruitType: RegularUnitType) => {
        const homeLand = getPlayerLands(gameStateStub)[0];
        homeLand.land = getLandById(landType);
        expect(
          getArmiesAtPosition(gameStateStub, homeLand.mapPos).flatMap((a) => a.regulars)
        ).toHaveLength(0);

        const redMana = getTurnOwner(gameStateStub).mana.red;
        castSpell(gameStateStub, SpellName.FORGE_OF_WAR, homeLand.mapPos);
        expect(getTurnOwner(gameStateStub).mana.red).toBe(
          redMana - getSpellById(SpellName.FORGE_OF_WAR).manaCost
        );

        const regulars = getArmiesAtPosition(gameStateStub, homeLand.mapPos).flatMap(
          (a) => a.regulars
        );
        expect(regulars).toHaveLength(1);
        expect(regulars[0].type).toBe(recruitType);
        expect(regulars[0].count).toBe(60);
        expect(regulars[0].rank).toBe(UnitRank.REGULAR);
      }
    );
  });
  describe('Cast FIRESTORM spell', () => {
    let opponentLands: LandPosition[];

    beforeEach(() => {
      opponentLands = getPlayerLands(gameStateStub, gameStateStub.players[1].id).flatMap(
        (l) => l.mapPos
      );

      // change turn owner and place units on all lands to make sure that FIRESTORM affects all lands
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      opponentLands.forEach((l) =>
        placeUnitsOnMap(regularsFactory(RegularUnitType.WARRIOR, 100), gameStateStub, l)
      );

      // change turn Owner back
      gameStateStub.turnOwner = gameStateStub.players[0].id;

      randomSpy = jest.spyOn(Math, 'random');
      randomSpy.mockReturnValue(0.99); // return the same value to maximize damage from spell and stability
    });

    afterEach(() => {
      randomSpy.mockRestore();
    });

    it('FIRESTORM affect all lands in range 1', () => {
      const redMana = getTurnOwner(gameStateStub).mana.red;
      castSpell(gameStateStub, SpellName.FIRESTORM, opponentLands[0]);
      expect(getTurnOwner(gameStateStub).mana.red).toBe(
        redMana - getSpellById(SpellName.FIRESTORM).manaCost
      );

      opponentLands.forEach((l) => {
        const army = getArmiesAtPosition(gameStateStub, l).find((a) => a.regulars.length > 0);

        expect(army).toBeDefined();
        expect(army!.regulars[0].type).toBe(RegularUnitType.WARRIOR);
        expect(army!.regulars[0].count).toBe(80);
      });
    });

    it.each([
      [20, 0],
      [21, 1],
      [22, 6],
      [23, 7],
      [24, 12],
      [25, 13],
      [26, 17],
      [27, 21],
      [27, 22],
      [29, 26],
      [29, 27],
      [30, 32],
    ])(
      'Number of killed units (%s) related to max PYROMANCER Level (%s)',
      (nKilled: number, maxPyrLvl: number) => {
        // setup player
        const homeLandPos = getPlayerLands(gameStateStub)[0].mapPos;
        if (maxPyrLvl > 0) {
          // add PYROMANCER on Map
          const hero = heroFactory(HeroUnitType.PYROMANCER, `Pyromancer Level ${maxPyrLvl}`);
          while (hero.level < maxPyrLvl) levelUpHero(hero, Alignment.LAWFUL);
          placeUnitsOnMap(hero, gameStateStub, homeLandPos);
        }

        const redMana = getTurnOwner(gameStateStub).mana.red;
        castSpell(gameStateStub, SpellName.FIRESTORM, opponentLands[0]);
        expect(getTurnOwner(gameStateStub).mana.red).toBe(
          redMana - getSpellById(SpellName.FIRESTORM).manaCost
        );

        opponentLands.forEach((l) => {
          const army = getArmiesAtPosition(gameStateStub, l).find((a) => a.regulars.length > 0);

          expect(army).toBeDefined();
          expect(army!.regulars[0].type).toBe(RegularUnitType.WARRIOR);
          expect(army!.regulars[0].count).toBe(100 - nKilled);
        });
      }
    );
  });
  describe('Cast METEOR SHOWER spell', () => {
    let opponentLand: LandPosition;

    beforeEach(() => {
      opponentLand = getPlayerLands(gameStateStub, gameStateStub.players[1].id)[0].mapPos;

      // change turn owner and place units on all lands to make sure that FIRESTORM affects all lands
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      placeUnitsOnMap(regularsFactory(RegularUnitType.WARRIOR, 100), gameStateStub, opponentLand);

      // change turn Owner back
      gameStateStub.turnOwner = gameStateStub.players[0].id;

      randomSpy = jest.spyOn(Math, 'random');
      randomSpy.mockReturnValue(0.99); // return the same value to maximize damage from spell and stability
    });

    afterEach(() => {
      randomSpy.mockRestore();
    });

    it.each([
      [45, 0],
      [46, 1],
      [47, 6],
      [48, 7],
      [49, 12],
      [51, 17],
      [51, 19],
      [52, 20],
      [54, 26],
      [54, 27],
      [55, 32],
    ])(
      'Number of killed units (%s) related to max PYROMANCER Level (%s)',
      (nKilled: number, maxPyrLvl: number) => {
        // setup player
        const homeLandPos = getPlayerLands(gameStateStub)[0].mapPos;
        if (maxPyrLvl > 0) {
          // add PYROMANCER on Map
          const hero = heroFactory(HeroUnitType.PYROMANCER, `Pyromancer Level ${maxPyrLvl}`);
          while (hero.level < maxPyrLvl) levelUpHero(hero, Alignment.LAWFUL);
          placeUnitsOnMap(hero, gameStateStub, homeLandPos);
        }

        const redMana = getTurnOwner(gameStateStub).mana.red;
        castSpell(gameStateStub, SpellName.METEOR_SHOWER, opponentLand);
        expect(getTurnOwner(gameStateStub).mana.red).toBe(
          redMana - getSpellById(SpellName.METEOR_SHOWER).manaCost
        );

        const army = getArmiesAtPosition(gameStateStub, opponentLand).find(
          (a) => a.regulars.length > 0
        );

        expect(army).toBeDefined();
        expect(army!.regulars[0].type).toBe(RegularUnitType.WARRIOR);
        expect(army!.regulars[0].count).toBe(100 - nKilled);
      }
    );

    it.each([
      [false, 50, 0], // the building is not destroyed in 50%
      [true, 51, 0],
      [false, 49, 1], // the building is not destroyed in 49%
      [true, 50, 1],
      [false, 46, 10], // the building is not destroyed in 46%
      [true, 47, 10],
      [false, 43, 20], // the building is not destroyed in 43%
      [true, 47, 20],
      [false, 40, 30], // the building is not destroyed in 40%
      [true, 41, 30],
    ])(
      'METEOR SHOWER could destroy buildings (%s) with probability (%s%) based on Pyromancer level (%s)',
      (destroy: boolean, probability: number, maxPyrLvl: number) => {
        const homeLandPos = getPlayerLands(gameStateStub)[0].mapPos;
        if (maxPyrLvl > 0) {
          // add PYROMANCER on Map
          const hero = heroFactory(HeroUnitType.PYROMANCER, `Pyromancer Level ${maxPyrLvl}`);
          while (hero.level < maxPyrLvl) levelUpHero(hero, Alignment.LAWFUL);
          placeUnitsOnMap(hero, gameStateStub, homeLandPos);
        }

        randomSpy.mockReturnValue((100 - probability) / 100); // change probability to verify effect
        const redMana = getTurnOwner(gameStateStub).mana.red;
        castSpell(gameStateStub, SpellName.METEOR_SHOWER, opponentLand);
        expect(getTurnOwner(gameStateStub).mana.red).toBe(
          redMana - getSpellById(SpellName.METEOR_SHOWER).manaCost
        );

        // verify that the building was destroyed/not destroyed based on probability
        expect(getLand(gameStateStub, opponentLand).buildings).toHaveLength(destroy ? 0 : 1);
      }
    );
  });
});
