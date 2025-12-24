import { findArmyById, getArmiesAtPosition } from '../../selectors/armySelectors';
import {
  getPlayerLands,
  getTreasureItem,
  getTreasureItemById,
  getTurnOwner,
} from '../../selectors/playerSelectors';
import {
  calculateHexDistance,
  getLand,
  getLandOwner,
  hasActiveEffect,
} from '../../selectors/landSelectors';
import { levelUpHero } from '../../systems/unitsActions';
import { addPlayerEmpireTreasure } from '../../systems/gameStateActions';
import { regularsFactory } from '../../factories/regularsFactory';
import { itemFactory } from '../../factories/treasureFactory';
import { heroFactory } from '../../factories/heroFactory';
import { invokeItem } from '../../map/magic/invokeItem';
import { castSpell } from '../../map/magic/castSpell';
import { getMapDimensions } from '../../utils/screenPositionUtils';
import { EffectKind } from '../../types/Effect';
import { SpellName } from '../../types/Spell';
import { HeroUnitName, RegularUnitName } from '../../types/UnitType';
import { TreasureName } from '../../types/Treasures';
import { Alignment } from '../../types/Alignment';
import { NO_PLAYER } from '../../domain/player/playerRepository';
import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { Item, TreasureType } from '../../types/Treasures';

import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { placeUnitsOnMap } from '../utils/placeUnitsOnMap';
import { TestTurnManagement } from '../utils/TestTurnManagement';

describe('invokeItems', () => {
  let randomSpy: jest.SpyInstance<number, []>;

  let gameStateStub: GameState;
  let opponentLand: LandPosition;
  let treasureItem: Item;

  const addTreasureItemToPlayer = (treasureType: TreasureType) => {
    Object.assign(
      gameStateStub,
      addPlayerEmpireTreasure(gameStateStub, gameStateStub.turnOwner, itemFactory(treasureType))
    );
    return getTreasureItem(getTurnOwner(gameStateStub), treasureType)!;
  };

  beforeEach(() => {
    randomSpy = jest.spyOn(Math, 'random');

    gameStateStub = createDefaultGameStateStub();
    getTurnOwner(gameStateStub).mana.white = 200;
    placeUnitsOnMap(
      heroFactory(HeroUnitName.CLERIC, 'Cleric Level 1'),
      gameStateStub,
      getPlayerLands(gameStateStub)[0].mapPos
    );
    opponentLand = getPlayerLands(gameStateStub, gameStateStub.players[1].id)[1].mapPos;
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  describe('Use WAND_OF_TURN_UNDEAD', () => {
    beforeEach(() => {
      treasureItem = addTreasureItemToPlayer(TreasureName.WAND_OF_TURN_UNDEAD)!;
    });

    it('should decrement opponent Undead in army', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitName.UNDEAD, 120), gameStateStub, opponentLand);

      /************** USE WAND_OF_TURN_UNDEAD *********************/
      randomSpy.mockReturnValue(0.99); // maximize damage from item
      invokeItem(gameStateStub, treasureItem.id, opponentLand);
      /************************************************************/

      const undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitName.UNDEAD)
      );
      expect(undeadArmy).toBeDefined();
      expect(undeadArmy?.regulars.length).toBe(1);
      expect(undeadArmy?.regulars[0].type).toBe(RegularUnitName.UNDEAD);
      expect(undeadArmy?.regulars[0].count).toBe(60); // max damage from WAND_OF_TURN_UNDEAD = 60
    });

    it('possible to use WAND_OF_TURN_UNDEAD more then once per turn', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitName.UNDEAD, 120), gameStateStub, opponentLand);

      randomSpy.mockReturnValue(0.0); // minimize damage from item

      /************** USE WAND_OF_TURN_UNDEAD *********************/
      invokeItem(gameStateStub, treasureItem.id, opponentLand);
      /************************************************************/

      let undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitName.UNDEAD)
      );
      expect(undeadArmy).toBeDefined();
      expect(undeadArmy?.regulars.length).toBe(1);
      expect(undeadArmy?.regulars[0].type).toBe(RegularUnitName.UNDEAD);
      expect(undeadArmy?.regulars[0].count).toBe(90); // min damage from WAND_OF_TURN_UNDEAD = 30

      /************** USE WAND_OF_TURN_UNDEAD AGAIN ***************/
      invokeItem(gameStateStub, treasureItem.id, opponentLand);
      /************************************************************/

      undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitName.UNDEAD)
      );
      expect(undeadArmy).toBeDefined();
      expect(undeadArmy?.regulars.length).toBe(1);
      expect(undeadArmy?.regulars[0].type).toBe(RegularUnitName.UNDEAD);
      expect(undeadArmy?.regulars[0].count).toBe(60); // decremented by 30 from previous invokeItem call
    });

    it('Army destroyed if all units killed', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitName.UNDEAD, 2), gameStateStub, opponentLand);

      const undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitName.UNDEAD)
      )!;

      /************** USE WAND_OF_TURN_UNDEAD *********************/
      randomSpy.mockReturnValue(0.99); // maximize damage from item
      invokeItem(gameStateStub, treasureItem.id, opponentLand);
      /************************************************************/

      expect(findArmyById(gameStateStub, undeadArmy.id)).toBeUndefined(); // army destroyed
      expect(
        getArmiesAtPosition(gameStateStub, opponentLand).filter((a) =>
          a.regulars.some((r) => r.type === RegularUnitName.UNDEAD)
        )
      ).toHaveLength(0); // no UNDEAD armies left
    });

    it('possible to use Item while item charges are not exceeded', () => {
      expect(treasureItem).toBeDefined();
      expect(treasureItem.charge).toBeGreaterThan(5);
      const nCharges = treasureItem.charge;
      for (let i = 0; i < nCharges; i++) {
        invokeItem(gameStateStub, treasureItem.id, opponentLand);
      }
      const zeroChargeWand = getTreasureItemById(getTurnOwner(gameStateStub), treasureItem.id);
      expect(zeroChargeWand).toBeDefined();
      expect(zeroChargeWand?.charge).toBe(0);

      /************** Place minimum number of UNDEAD units on map  to make sure that wand not cast ****************/
      placeUnitsOnMap(regularsFactory(RegularUnitName.UNDEAD, 2), gameStateStub, opponentLand);
      const undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitName.UNDEAD)
      )!;

      /************** USE WAND_OF_TURN_UNDEAD with 0 charge ****************/
      randomSpy.mockReturnValue(0.99); // maximize damage from item
      invokeItem(gameStateStub, treasureItem.id, opponentLand);
      /************************************************************/

      // wand removed from player treasure
      expect(getTreasureItemById(getTurnOwner(gameStateStub), treasureItem.id)).toBeUndefined();
      // no effect on an opponent army
      expect(findArmyById(gameStateStub, undeadArmy.id)).toBeDefined();
    });

    it.each([0, 1, 32])(
      'Corner Case: Cleric level (%s) is not related to damage from WAND_OF_TURN_UNDEAD',
      (clericLevel) => {
        if (clericLevel > 0) {
          const clericHero = heroFactory(HeroUnitName.CLERIC, `Cleric Level ${clericLevel}`);
          while (clericHero.level < clericLevel) levelUpHero(clericHero, Alignment.LAWFUL);
          placeUnitsOnMap(clericHero, gameStateStub, getPlayerLands(gameStateStub)[0].mapPos);
        }
        placeUnitsOnMap(regularsFactory(RegularUnitName.UNDEAD, 120), gameStateStub, opponentLand);

        randomSpy.mockReturnValue(0.5); // some value to make test stable

        /************** USE WAND_OF_TURN_UNDEAD *********************/
        invokeItem(gameStateStub, treasureItem.id, opponentLand);
        /************************************************************/

        let undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
          a.regulars.some((u) => u.type === RegularUnitName.UNDEAD)
        );
        expect(undeadArmy).toBeDefined();
        expect(undeadArmy?.regulars.length).toBe(1);
        expect(undeadArmy?.regulars[0].type).toBe(RegularUnitName.UNDEAD);
        expect(undeadArmy?.regulars[0].count).toBe(75); // number of casualties are not related on CLERIC level
      }
    );

    it('Corner Case: Non-Undead units should not be affected by WAND_OF_TURN_UNDEAD', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitName.WARRIOR, 2), gameStateStub, opponentLand);

      let warriorsArmyId = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitName.WARRIOR)
      )!.id;

      /************** USE WAND_OF_TURN_UNDEAD *********************/
      randomSpy.mockReturnValue(0.99); // maximize damage from item
      invokeItem(gameStateStub, treasureItem.id, opponentLand);
      /************************************************************/
      const warriorsArmy = findArmyById(gameStateStub, warriorsArmyId);
      expect(warriorsArmy).toBeDefined(); // army still exists
      expect(warriorsArmy?.regulars).toHaveLength(1); // regulars are not affected by WAND_OF_TURN_UNDEAD
      expect(warriorsArmy?.regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(warriorsArmy?.regulars[0].count).toBe(2);
    });
  });

  describe('Use ORB_OF_STORM', () => {
    beforeEach(() => {
      treasureItem = addTreasureItemToPlayer(TreasureName.ORB_OF_STORM)!;
    });

    it('should decrement opponent regulars in army', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitName.WARRIOR, 120), gameStateStub, opponentLand);

      /************** USE ORB_OF_STORM *********************/
      randomSpy.mockReturnValue(0.99); // maximize damage from item
      invokeItem(gameStateStub, treasureItem.id, opponentLand);
      /************************************************************/

      const regularArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitName.WARRIOR)
      );
      expect(regularArmy).toBeDefined();
      expect(regularArmy?.regulars.length).toBe(1);
      expect(regularArmy?.regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(regularArmy?.regulars[0].count).toBe(60); // max damage from ORB_OF_STORM = 60
    });

    it('could be used more then once per turn', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitName.WARRIOR, 120), gameStateStub, opponentLand);

      randomSpy.mockReturnValue(0.0); // minimize damage from item

      /************** USE ORB_OF_STORM *********************/
      invokeItem(gameStateStub, treasureItem.id, opponentLand);
      /************************************************************/

      const regularArmyId = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitName.WARRIOR)
      )!.id;
      let regularArmy = findArmyById(gameStateStub, regularArmyId);
      expect(regularArmy).toBeDefined();
      expect(regularArmy?.regulars.length).toBe(1);
      expect(regularArmy?.regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(regularArmy?.regulars[0].count).toBe(90); // min damage from ORB_OF_STORM = 30

      /************** USE ORB_OF_STORM AGAIN ***************/
      invokeItem(gameStateStub, treasureItem.id, opponentLand);
      /************************************************************/

      regularArmy = regularArmy = findArmyById(gameStateStub, regularArmyId);
      expect(regularArmy).toBeDefined();
      expect(regularArmy?.regulars.length).toBe(1);
      expect(regularArmy?.regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(regularArmy?.regulars[0].count).toBe(60); // decremented by 30 from previous invokeItem call
    });

    it('Army destroyed if all units killed', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitName.WARD_HANDS, 2), gameStateStub, opponentLand);

      const regularArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitName.WARD_HANDS)
      )!;

      /************** USE ORB_OF_STORM *********************/
      randomSpy.mockReturnValue(0.99); // maximize damage from item
      invokeItem(gameStateStub, treasureItem.id, opponentLand);
      /************************************************************/

      expect(findArmyById(gameStateStub, regularArmy.id)).toBeUndefined(); // army destroyed
      expect(
        getArmiesAtPosition(gameStateStub, opponentLand).filter((a) =>
          a.regulars.some((r) => r.type === RegularUnitName.WARD_HANDS)
        )
      ).toHaveLength(0); // no armies left
    });

    it('possible to use Item while item charges are not exceeded', () => {
      expect(treasureItem).toBeDefined();
      expect(treasureItem.charge).toBeGreaterThan(5);
      const nCharges = treasureItem.charge;
      for (let i = 0; i < nCharges; i++) {
        invokeItem(gameStateStub, treasureItem.id, opponentLand);
      }
      const zeroChargeOrb = getTreasureItemById(getTurnOwner(gameStateStub), treasureItem.id);
      expect(zeroChargeOrb).toBeDefined();
      expect(zeroChargeOrb?.charge).toBe(0);

      /************** Place minimum number of WARRIORS units on map  to make sure that ORB not cast ****************/
      placeUnitsOnMap(regularsFactory(RegularUnitName.WARRIOR, 2), gameStateStub, opponentLand);
      const regularArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitName.WARRIOR)
      )!;

      /************** USE ORB_OF_STORM with 0 charge ****************/
      randomSpy.mockReturnValue(0.99); // maximize damage from item
      invokeItem(gameStateStub, treasureItem.id, opponentLand);
      /************************************************************/

      // wand removed from player treasure
      expect(getTreasureItemById(getTurnOwner(gameStateStub), treasureItem.id)).toBeUndefined();
      // no effect on an opponent army
      expect(findArmyById(gameStateStub, regularArmy.id)).toBeDefined();
    });

    it('Undead army also affected by ORB_OF_STORM', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitName.UNDEAD, 120), gameStateStub, opponentLand);

      randomSpy.mockReturnValue(0.5); // some value to make test stable

      /************** USE ORB_OF_STORM *********************/
      invokeItem(gameStateStub, treasureItem.id, opponentLand);
      /************************************************************/

      let regularArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitName.UNDEAD)
      );
      expect(regularArmy).toBeDefined();
      expect(regularArmy?.regulars.length).toBe(1);
      expect(regularArmy?.regulars[0].type).toBe(RegularUnitName.UNDEAD);
      expect(regularArmy?.regulars[0].count).toBe(75); // undead army also affected by ORB_OF_STORM
    });

    it.each([0, 1, 32])(
      'Corner Case: Enchanter level (%s) is not related to damage from ORB_OF_STORM',
      (clericLevel) => {
        if (clericLevel > 0) {
          const enchanterHero = heroFactory(
            HeroUnitName.ENCHANTER,
            `Enchanter Level ${clericLevel}`
          );
          while (enchanterHero.level < clericLevel) levelUpHero(enchanterHero, Alignment.LAWFUL);
          placeUnitsOnMap(enchanterHero, gameStateStub, getPlayerLands(gameStateStub)[0].mapPos);
        }
        placeUnitsOnMap(
          regularsFactory(RegularUnitName.DARK_ELF, 120),
          gameStateStub,
          opponentLand
        );

        randomSpy.mockReturnValue(0.5); // some value to make test stable

        /************** USE ORB_OF_STORM *********************/
        invokeItem(gameStateStub, treasureItem.id, opponentLand);
        /************************************************************/

        let regularArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
          a.regulars.some((u) => u.type === RegularUnitName.DARK_ELF)
        );
        expect(regularArmy).toBeDefined();
        expect(regularArmy?.regulars.length).toBe(1);
        expect(regularArmy?.regulars[0].type).toBe(RegularUnitName.DARK_ELF);
        expect(regularArmy?.regulars[0].count).toBe(75); // number of casualties are not related on ENCHANTER level
      }
    );
  });

  describe('Use AEGIS_SHARD', () => {
    let playerLand: LandPosition;

    beforeEach(() => {
      treasureItem = addTreasureItemToPlayer(TreasureName.AEGIS_SHARD)!;
      playerLand = getPlayerLands(gameStateStub)[0].mapPos;
    });

    it('effect should be added only to one land', () => {
      expect(
        hasActiveEffect(getLand(gameStateStub, playerLand), TreasureName.AEGIS_SHARD)
      ).toBeFalsy();
      /************** USE AEGIS_SHARD *********************/
      invokeItem(gameStateStub, treasureItem.id, playerLand);
      /************************************************************/
      const effectedLand = getLand(gameStateStub, playerLand);
      expect(hasActiveEffect(effectedLand, TreasureName.AEGIS_SHARD)).toBeTruthy();
      expect(effectedLand.effects[0].rules.type).toBe(EffectKind.PERMANENT);
      expect(effectedLand.effects[0].rules.duration).toBe(0);
      getPlayerLands(gameStateStub)
        .filter((l) => !(l.mapPos.row === playerLand.row && l.mapPos.col === playerLand.col))
        .forEach((land) => expect(hasActiveEffect(land, TreasureName.AEGIS_SHARD)).toBeFalsy());
    });

    it('will cancel next negative spell', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitName.WARRIOR, 120), gameStateStub, playerLand);
      const regularArmyId = getArmiesAtPosition(gameStateStub, playerLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitName.WARRIOR)
      )!.id;

      /************** USE AEGIS_SHARD *********************/
      invokeItem(gameStateStub, treasureItem.id, playerLand);
      /************************************************************/

      // change turn owner and cast Turn Undead
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      // add white mana and cleric to be able to cast Turn Undead spell
      gameStateStub.players[1].mana.blue = 100;

      /************** cast TORNADO Spell *********************/
      castSpell(gameStateStub, SpellName.TORNADO, playerLand);
      // chack that mana was spent
      expect(gameStateStub.players[1].mana.blue).toBe(50);
      /***********************************************************/

      // verify that spell not affected due to AEGIS_SHARD
      let regularArmy = findArmyById(gameStateStub, regularArmyId);
      expect(regularArmy).toBeDefined();
      expect(regularArmy?.regulars.length).toBe(1);
      expect(regularArmy?.regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(regularArmy?.regulars[0].count).toBe(120);

      // effect should be removed from land
      expect(
        hasActiveEffect(getLand(gameStateStub, playerLand), TreasureName.AEGIS_SHARD)
      ).toBeFalsy();

      randomSpy.mockReturnValue(0.5); // some value to make test stable
      /************** cast TORNADO Spell Second time *********************/
      castSpell(gameStateStub, SpellName.TORNADO, playerLand);
      // chack that mana was spent
      expect(gameStateStub.players[1].mana.blue).toBe(0);
      /***********************************************************/

      regularArmy = findArmyById(gameStateStub, regularArmyId);
      expect(regularArmy).toBeDefined();
      expect(regularArmy?.regulars.length).toBe(1);
      expect(regularArmy?.regulars[0].type).toBe(RegularUnitName.WARRIOR);
      expect(regularArmy?.regulars[0].count).toBe(87); // now land is not protected and army is affected by spell
    });

    it('creates permanent effect', () => {
      jest.useFakeTimers();

      const testTurnManagement = new TestTurnManagement(gameStateStub);
      testTurnManagement.startNewTurn(gameStateStub);
      testTurnManagement.waitStartPhaseComplete();

      /************** USE AEGIS_SHARD *********************/
      invokeItem(gameStateStub, treasureItem.id, playerLand);
      /************************************************************/

      testTurnManagement.makeNTurns(10);

      // effect still exists
      const effectedLand = getLand(gameStateStub, playerLand);
      expect(hasActiveEffect(effectedLand, TreasureName.AEGIS_SHARD)).toBeTruthy();
      expect(effectedLand.effects[0].rules.type).toBe(EffectKind.PERMANENT);
      expect(effectedLand.effects[0].rules.duration).toBe(0);

      jest.useRealTimers();
    });
  });

  describe('Use STONE_OF_RENEWAL', () => {
    let playerLand: LandPosition;

    beforeEach(() => {
      treasureItem = addTreasureItemToPlayer(TreasureName.STONE_OF_RENEWAL)!;
      playerLand = getPlayerLands(gameStateStub)[0].mapPos;
    });

    it('Should remove one NEGATIVE effect from land', () => {
      // set player 1 as turn owner and cast 2 negetive effects
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      gameStateStub.players[1].mana.red = 200;
      gameStateStub.players[1].mana.green = 200;
      castSpell(gameStateStub, SpellName.EMBER_RAID, playerLand);
      castSpell(gameStateStub, SpellName.ENTANGLING_ROOTS, playerLand);

      // change owner back
      gameStateStub.turnOwner = gameStateStub.players[0].id;

      expect(getLand(gameStateStub, playerLand).effects).toHaveLength(2);

      /************** USE STONE_OF_RENEWAL *********************/
      invokeItem(gameStateStub, treasureItem.id, playerLand);
      /************************************************************/
      expect(getLand(gameStateStub, playerLand).effects).toHaveLength(1);

      /************** USE STONE_OF_RENEWAL Second time *********************/
      invokeItem(gameStateStub, treasureItem.id, playerLand);
      /************************************************************/
      expect(getLand(gameStateStub, playerLand).effects).toHaveLength(0);
    });

    it('Should not remove POSITIVE effect from land', () => {
      // set player 1 as turn owner and cast 2 negetive effects
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      gameStateStub.players[1].mana.red = 200;
      castSpell(gameStateStub, SpellName.EMBER_RAID, playerLand); // negative effect

      // change owner back
      gameStateStub.turnOwner = gameStateStub.players[0].id;
      gameStateStub.players[0].mana.green = 200;
      castSpell(gameStateStub, SpellName.FERTILE_LAND, playerLand); // positive effect

      expect(getLand(gameStateStub, playerLand).effects).toHaveLength(2);

      const charges = getTreasureItemById(getTurnOwner(gameStateStub), treasureItem.id)?.charge;
      /************** USE STONE_OF_RENEWAL *********************/
      invokeItem(gameStateStub, treasureItem.id, playerLand);
      /************************************************************/
      expect(getTreasureItemById(getTurnOwner(gameStateStub), treasureItem.id)?.charge).toBe(
        charges! - 1
      );
      const land = getLand(gameStateStub, playerLand);
      expect(land.effects).toHaveLength(1);
      expect(land.effects[0].sourceId).toBe(SpellName.FERTILE_LAND);
      expect(land.effects[0].rules.type).toBe(EffectKind.POSITIVE);

      /************** USE STONE_OF_RENEWAL the second time *********************/
      invokeItem(gameStateStub, treasureItem.id, playerLand);
      /************************************************************/
      expect(getTreasureItemById(getTurnOwner(gameStateStub), treasureItem.id)?.charge).toBe(
        charges! - 2
      );
      expect(getLand(gameStateStub, playerLand).effects).toHaveLength(1);
    });
  });

  describe('Use COMPASS_OF_DOMINION', () => {
    beforeEach(() => {
      treasureItem = addTreasureItemToPlayer(TreasureName.COMPASS_OF_DOMINION)!;
    });

    it('Should reveal opponent lands in radius 1 for 2 turns, central land', () => {
      // homeland all 7 lands should be revealed
      const opponent = gameStateStub.players[1];
      const landPos = getPlayerLands(gameStateStub, opponent.id)[0].mapPos;

      /************** USE COMPASS_OF_DOMINION *********************/
      invokeItem(gameStateStub, treasureItem.id, landPos);
      /************************************************************/
      const revealedLands = getPlayerLands(gameStateStub, opponent.id).filter((l) =>
        hasActiveEffect(l, TreasureName.COMPASS_OF_DOMINION)
      );
      expect(revealedLands).toHaveLength(7);
      expect(revealedLands.every((l) => l.effects.length === 1)).toBe(true);
      expect(revealedLands.every((l) => l.effects[0].rules.duration === 2)).toBe(true);
    });

    it('Should reveal opponent lands in radius 1 for 2 turns, border land', () => {
      // homeland all 7 lands should be revealed
      const opponent = gameStateStub.players[1];
      const landPos = getPlayerLands(gameStateStub, opponent.id)[1].mapPos;

      /************** USE COMPASS_OF_DOMINION *********************/
      invokeItem(gameStateStub, treasureItem.id, landPos);
      /************************************************************/
      const revealedLands = getPlayerLands(gameStateStub, opponent.id).filter((l) =>
        hasActiveEffect(l, TreasureName.COMPASS_OF_DOMINION)
      );
      expect(revealedLands).toHaveLength(4);
      expect(revealedLands.every((l) => l.effects.length === 1)).toBe(true);
      expect(revealedLands.every((l) => l.effects[0].rules.duration === 2)).toBe(true);
    });
  });

  describe('Use DEED_OF_RECLAMATION', () => {
    beforeEach(() => {
      treasureItem = addTreasureItemToPlayer(TreasureName.DEED_OF_RECLAMATION)!;
    });

    it('should change ownership of neutral land to player', () => {
      const landPos: LandPosition = { row: 0, col: 0 };
      expect(getLandOwner(gameStateStub, landPos)).toBe(NO_PLAYER.id);

      /************** USE DEED_OF_RECLAMATION *********************/
      invokeItem(gameStateStub, treasureItem.id, landPos);
      /************************************************************/
      expect(getLandOwner(gameStateStub, landPos)).toBe(gameStateStub.turnOwner);
      const land = getLand(gameStateStub, landPos);
      expect(hasActiveEffect(land, TreasureName.DEED_OF_RECLAMATION)).toBeTruthy();
      expect(land.effects[0].rules.duration).toBe(0);
      expect(land.effects[0].rules.type).toBe(EffectKind.PERMANENT);
    });

    it('lands with DEED_OF_RECLAMATION treated as non-hostile land and no Attrition Penalty to the players army', () => {
      jest.useFakeTimers();

      const testTurnManagement = new TestTurnManagement(gameStateStub);
      testTurnManagement.startNewTurn(gameStateStub);
      testTurnManagement.waitStartPhaseComplete();

      /************** NEUTRAL LAND FAR FROM HOMELAND *********************/
      const landPos: LandPosition = { row: 0, col: 0 };
      expect(getLandOwner(gameStateStub, landPos)).toBe(NO_PLAYER.id);
      const homeland = getPlayerLands(gameStateStub)[0];
      expect(
        calculateHexDistance(getMapDimensions(gameStateStub), homeland.mapPos, landPos)
      ).toBeGreaterThan(2);
      /***** PLACE PLAYER's army ********/
      placeUnitsOnMap(regularsFactory(RegularUnitName.WARRIOR, 120), gameStateStub, landPos);

      /************** USE DEED_OF_RECLAMATION *********************/
      invokeItem(gameStateStub, treasureItem.id, landPos);
      /************************************************************/

      testTurnManagement.makeNTurns(10);

      // effect still exists
      const effectedLand = getLand(gameStateStub, landPos);
      expect(hasActiveEffect(effectedLand, TreasureName.DEED_OF_RECLAMATION)).toBeTruthy();
      expect(effectedLand.effects[0].rules.type).toBe(EffectKind.PERMANENT);
      expect(effectedLand.effects[0].rules.duration).toBe(0);

      /******** ARMY EXISTS and no Attrition Penalty ********/
      const army = getArmiesAtPosition(gameStateStub, landPos);
      expect(army).toHaveLength(1);
      expect(army[0].regulars[0].count).toBe(120);
      expect(army[0].regulars[0].type).toBe(RegularUnitName.WARRIOR);

      jest.useRealTimers();
    });
  });
});
