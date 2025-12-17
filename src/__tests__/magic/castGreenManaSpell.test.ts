import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/map/land/LandPosition';

import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import { getArmiesAtPosition, getMaxHeroLevelByType } from '../../selectors/armySelectors';
import { getSpellById } from '../../selectors/spellSelectors';
import { getLand, hasActiveEffect } from '../../selectors/landSelectors';
import { levelUpHero } from '../../systems/unitsActions';
import { heroFactory } from '../../factories/heroFactory';
import { regularsFactory } from '../../factories/regularsFactory';

import { HeroUnitType, RegularUnitType } from '../../types/UnitType';
import { Alignment } from '../../types/Alignment';
import { SpellName } from '../../types/Spell';
import { EffectType } from '../../types/Effect';
import { TreasureType } from '../../types/Treasures';
import { castSpell } from '../../map/magic/castSpell';
import { calculateIncome } from '../../map/vault/calculateIncome';

import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { placeUnitsOnMap } from '../utils/placeUnitsOnMap';
import { relictFactory } from '../../factories/treasureFactory';

describe('castGreenManaSpell', () => {
  let gameStateStub: GameState;

  beforeEach(() => {
    gameStateStub = createDefaultGameStateStub();
    getTurnOwner(gameStateStub).mana.green = 200;
  });

  describe('Cast FERTILE LAND', () => {
    it.each([
      [1, 0],
      [2, 1],
      [2, 5],
      [3, 6],
      [3, 10],
      [4, 11],
      [4, 16],
      [5, 17],
      [5, 21],
      [6, 22],
      [6, 26],
      [7, 27], // for level 27 and above all lands in radius 1 are affected by FERTILE LAND spell
    ])(
      'Number of affected lands(%s) related to hero level (%s)',
      (nLands: number, maxDruidLvl: number) => {
        const homeLandPos = getPlayerLands(gameStateStub)[0].mapPos;

        if (maxDruidLvl > 0) {
          // add DRUID on Map
          const hero = heroFactory(HeroUnitType.DRUID, `Druid Level ${maxDruidLvl}`);
          while (hero.level < maxDruidLvl) levelUpHero(hero, Alignment.LAWFUL);
          placeUnitsOnMap(hero, gameStateStub, homeLandPos);
        }

        const greenMana = getTurnOwner(gameStateStub).mana.green;
        castSpell(gameStateStub, SpellName.FERTILE_LAND, homeLandPos);
        expect(getTurnOwner(gameStateStub).mana.green).toBe(
          greenMana - getSpellById(SpellName.FERTILE_LAND).manaCost
        );

        const affectedLands = getPlayerLands(gameStateStub).filter((l) => l.effects.length > 0);
        expect(affectedLands).toHaveLength(nLands);
        affectedLands.forEach((l) => {
          expect(l.effects).toHaveLength(1);
          expect(l.effects[0].sourceId).toBe(SpellName.FERTILE_LAND);
          expect(l.effects[0].rules.type).toBe(EffectType.POSITIVE);
          expect(l.effects[0].rules.duration).toBe(2);
          expect(l.effects[0].appliedBy).toBe(gameStateStub.turnOwner);
        });
      }
    );

    it('Income from the land should be increased by 50%', () => {
      const totalIncomeBefore = calculateIncome(gameStateStub);
      const homeLand = getPlayerLands(gameStateStub)[0];
      const homeLandIncome = homeLand.goldPerTurn;

      // no DRUIDS only one land would be affected by FERTILE LAND spell
      expect(getMaxHeroLevelByType(gameStateStub, HeroUnitType.DRUID)).toBe(0);

      castSpell(gameStateStub, SpellName.FERTILE_LAND, homeLand.mapPos);

      // check that base income not changed
      expect(getLand(gameStateStub, homeLand.mapPos).goldPerTurn).toBe(homeLandIncome);

      // check that income from the land increased by 50%
      expect(calculateIncome(gameStateStub)).toBe(
        Math.ceil(totalIncomeBefore + homeLandIncome * 0.5)
      );
    });
  });

  describe('Cast ENTANGLING ROOTS spell', () => {
    // this test only verifies that effect added to the land
    // actual effect is tested in moveArmy.test.ts
    // 'ENTANGLING ROOTS should prevent armies from moving'

    it.each([0, 1, 32])(
      'ENTANGLING ROOTS affects only one land and not depends on max Druid Level (%s)',
      (maxDruidLvl: number) => {
        const opponentHomeLandPos = getPlayerLands(gameStateStub, gameStateStub.players[1].id)[0]
          .mapPos;

        const homeLandPos = getPlayerLands(gameStateStub)[0].mapPos;

        if (maxDruidLvl > 0) {
          // add DRUID on Map
          const hero = heroFactory(HeroUnitType.DRUID, `Druid Level ${maxDruidLvl}`);
          while (hero.level < maxDruidLvl) levelUpHero(hero, Alignment.LAWFUL);
          placeUnitsOnMap(hero, gameStateStub, homeLandPos);
        }

        const greenMana = getTurnOwner(gameStateStub).mana.green;
        castSpell(gameStateStub, SpellName.ENTANGLING_ROOTS, opponentHomeLandPos);
        expect(getTurnOwner(gameStateStub).mana.green).toBe(
          greenMana - getSpellById(SpellName.ENTANGLING_ROOTS).manaCost
        );

        // spell should affect only one land
        expect(
          getPlayerLands(gameStateStub, gameStateStub.players[1].id).filter((l) =>
            hasActiveEffect(l, SpellName.ENTANGLING_ROOTS)
          )
        ).toHaveLength(1);

        const opponentHomeLand = getLand(gameStateStub, opponentHomeLandPos);
        expect(opponentHomeLand.effects).toHaveLength(1);
        expect(opponentHomeLand.effects[0].sourceId).toBe(SpellName.ENTANGLING_ROOTS);
        expect(opponentHomeLand.effects[0].rules.type).toBe(EffectType.NEGATIVE);
        expect(opponentHomeLand.effects[0].rules.duration).toBe(1);
      }
    );
  });

  describe('Cast BEAST ATTACK spell', () => {
    let randomSpy: jest.SpyInstance<number, []>;
    let opponentLand: LandPosition;
    beforeEach(() => {
      opponentLand = getPlayerLands(gameStateStub, gameStateStub.players[1].id)[0].mapPos;

      // setup Opponent army
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      placeUnitsOnMap(regularsFactory(RegularUnitType.ORC, 120), gameStateStub, opponentLand);
      gameStateStub.turnOwner = gameStateStub.players[0].id;

      randomSpy = jest.spyOn(Math, 'random');
    });

    afterEach(() => {
      randomSpy.mockRestore();
    });

    it.each([
      [30, 0],
      [31, 1],
      [32, 5],
      [33, 6],
      [34, 10],
      [35, 11],
      [36, 16],
      [37, 17],
      [38, 21],
      [39, 22],
      [40, 26],
      [41, 27],
      [42, 32],
    ])(
      'number of killed units (%s) in opponent army depends on max Druid level (%s)',
      (nKilled: number, maxDruidLvl: number) => {
        // setup player
        const homeLandPos = getPlayerLands(gameStateStub)[0].mapPos;
        if (maxDruidLvl > 0) {
          // add DRUID on Map
          const hero = heroFactory(HeroUnitType.DRUID, `Druid Level ${maxDruidLvl}`);
          while (hero.level < maxDruidLvl) levelUpHero(hero, Alignment.LAWFUL);
          placeUnitsOnMap(hero, gameStateStub, homeLandPos);
        }

        randomSpy.mockReturnValue(0.99); // maximize damage from spell to make test stable
        // Cast BEAST ATTACK
        const greenMana = getTurnOwner(gameStateStub).mana.green;
        castSpell(gameStateStub, SpellName.BEAST_ATTACK, opponentLand);
        expect(getTurnOwner(gameStateStub).mana.green).toBe(
          greenMana - getSpellById(SpellName.BEAST_ATTACK).manaCost
        );

        const woundedOpponentArmy = getArmiesAtPosition(gameStateStub, opponentLand);
        expect(woundedOpponentArmy).toHaveLength(2); // first Hero army second regulars army
        expect(woundedOpponentArmy[1].regulars).toHaveLength(1);
        expect(woundedOpponentArmy[1].regulars[0].type).toBe(RegularUnitType.ORC);
        expect(woundedOpponentArmy[1].regulars[0].count).toBe(120 - nKilled);
      }
    );

    it('calculate minimal damage from spell to wounded opponent army', () => {
      randomSpy.mockReturnValue(0.01); // minimize damage from spell to make test stable

      // Cast BEAST ATTACK
      castSpell(gameStateStub, SpellName.BEAST_ATTACK, opponentLand);

      const woundedOpponentArmy = getArmiesAtPosition(gameStateStub, opponentLand);
      expect(woundedOpponentArmy).toHaveLength(2); // first Hero army second regulars army
      expect(woundedOpponentArmy[1].regulars).toHaveLength(1);
      expect(woundedOpponentArmy[1].regulars[0].type).toBe(RegularUnitType.ORC);
      expect(woundedOpponentArmy[1].regulars[0].count).toBe(120 - 19);
    });

    it('if opponent army has only 5 units and less army would be destroyed', () => {
      const minArmyLandPos = { row: opponentLand.row + 1, col: opponentLand.col };
      // setup Opponent army
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      // This spell at least kills 5 regulars and destroys the army in this case
      placeUnitsOnMap(regularsFactory(RegularUnitType.ORC, 5), gameStateStub, minArmyLandPos);
      gameStateStub.turnOwner = gameStateStub.players[0].id;

      // minimize damage from spell to make sure that even in this case all units would be destroyed
      randomSpy.mockReturnValue(0.01);

      // Cast BEAST ATTACK
      castSpell(gameStateStub, SpellName.BEAST_ATTACK, minArmyLandPos);

      const woundedOpponentArmy = getArmiesAtPosition(gameStateStub, minArmyLandPos);
      expect(woundedOpponentArmy).toHaveLength(0); // army destroyed
    });

    it('Spell could be cast multiple times in one turn', () => {
      randomSpy.mockReturnValue(0.01); // minimize damage from spell to make test stable

      // Cast BEAST ATTACK
      castSpell(gameStateStub, SpellName.BEAST_ATTACK, opponentLand);

      let woundedOpponentArmy = getArmiesAtPosition(gameStateStub, opponentLand);
      expect(woundedOpponentArmy).toHaveLength(2); // first Hero army second regulars army
      expect(woundedOpponentArmy[1].regulars).toHaveLength(1);
      expect(woundedOpponentArmy[1].regulars[0].type).toBe(RegularUnitType.ORC);
      expect(woundedOpponentArmy[1].regulars[0].count).toBe(120 - 19);

      // Cast BEAST ATTACK second time
      castSpell(gameStateStub, SpellName.BEAST_ATTACK, opponentLand);

      woundedOpponentArmy = getArmiesAtPosition(gameStateStub, opponentLand);
      expect(woundedOpponentArmy).toHaveLength(2); // first Hero army second regulars army
      expect(woundedOpponentArmy[1].regulars).toHaveLength(1);
      expect(woundedOpponentArmy[1].regulars[0].type).toBe(RegularUnitType.ORC);
      // spell damage based on %% of units that is why on second tyme it is less then on first time
      expect(woundedOpponentArmy[1].regulars[0].count).toBe(120 - 19 - 16);
    });
  });

  describe('Cast EARTHQUAKE spell', () => {
    let randomSpy: jest.SpyInstance<number, []>;
    let opponentLand: LandPosition;
    beforeEach(() => {
      opponentLand = getPlayerLands(gameStateStub, gameStateStub.players[1].id)[0].mapPos;

      gameStateStub.turnOwner = gameStateStub.players[1].id;
      placeUnitsOnMap(regularsFactory(RegularUnitType.ORC, 120), gameStateStub, opponentLand);
      gameStateStub.turnOwner = gameStateStub.players[0].id;

      randomSpy = jest.spyOn(Math, 'random');
    });

    afterEach(() => {
      randomSpy.mockRestore();
    });

    it.each([0, 1, 32])(
      'EARTHQUAKE kill rate not depends on DRUID level (%s)',
      (maxDruidLvl: number) => {
        const homeLandPos = getPlayerLands(gameStateStub)[0].mapPos;
        if (maxDruidLvl > 0) {
          // add DRUID on Map
          const hero = heroFactory(HeroUnitType.DRUID, `Druid Level ${maxDruidLvl}`);
          while (hero.level < maxDruidLvl) levelUpHero(hero, Alignment.LAWFUL);
          placeUnitsOnMap(hero, gameStateStub, homeLandPos);
        }

        randomSpy.mockReturnValue(0.99); // maximize damage from spell to make test stable
        const greenMana = getTurnOwner(gameStateStub).mana.green;
        castSpell(gameStateStub, SpellName.EARTHQUAKE, opponentLand);
        expect(getTurnOwner(gameStateStub).mana.green).toBe(
          greenMana - getSpellById(SpellName.EARTHQUAKE).manaCost
        );

        const woundedOpponentArmy = getArmiesAtPosition(gameStateStub, opponentLand);
        expect(woundedOpponentArmy).toHaveLength(2); // first Hero army second regulars army
        expect(woundedOpponentArmy[1].regulars).toHaveLength(1);
        expect(woundedOpponentArmy[1].regulars[0].type).toBe(RegularUnitType.ORC);
        expect(woundedOpponentArmy[1].regulars[0].count).toBe(120 - 24);
      }
    );

    it('EARTHQUAKE should could destroy buildings', () => {
      expect(getLand(gameStateStub, opponentLand).buildings).toHaveLength(1);

      randomSpy.mockReturnValue(0.39); // less then 0.4 since EARTHQUAKE destroy buildings in 40% probability

      castSpell(gameStateStub, SpellName.EARTHQUAKE, opponentLand);

      expect(getLand(gameStateStub, opponentLand).buildings).toHaveLength(0);
    });
  });

  it.each([
    SpellName.FERTILE_LAND,
    SpellName.BEAST_ATTACK,
    SpellName.ENTANGLING_ROOTS,
    SpellName.EARTHQUAKE,
  ])('If VERDANT IDOL is in treasury GREEN spells (%s) cost 15% less', (spellName: SpellName) => {
    let dummyLand: LandPosition =
      spellName === SpellName.FERTILE_LAND
        ? getPlayerLands(gameStateStub)[0].mapPos
        : getPlayerLands(gameStateStub, gameStateStub.players[1].id)[0].mapPos;

    castSpell(gameStateStub, spellName, dummyLand);

    expect(getTurnOwner(gameStateStub).mana.green).toBe(200 - getSpellById(spellName).manaCost);

    getTurnOwner(gameStateStub).empireTreasures.push(relictFactory(TreasureType.VERDANT_IDOL));

    // select another land to cast spell to avoid situation that it is not possible to cast spell on the same land
    dummyLand =
      spellName === SpellName.FERTILE_LAND
        ? getPlayerLands(gameStateStub)[1].mapPos
        : getPlayerLands(gameStateStub, gameStateStub.players[1].id)[1].mapPos;

    getTurnOwner(gameStateStub).mana.green = 200;

    castSpell(gameStateStub, spellName, dummyLand);
    expect(getTurnOwner(gameStateStub).mana.green).toBe(
      200 - Math.floor(getSpellById(spellName).manaCost * 0.85)
    );
  });
});
