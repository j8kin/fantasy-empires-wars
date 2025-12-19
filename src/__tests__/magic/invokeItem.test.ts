import { placeUnitsOnMap } from '../utils/placeUnitsOnMap';
import { regularsFactory } from '../../factories/regularsFactory';
import { HeroUnitType, RegularUnitType } from '../../types/UnitType';
import { findArmyById, getArmiesAtPosition } from '../../selectors/armySelectors';
import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/map/land/LandPosition';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import {
  getPlayerLands,
  getTreasureItem,
  getTreasureItemById,
  getTurnOwner,
} from '../../selectors/playerSelectors';
import { heroFactory } from '../../factories/heroFactory';
import { invokeItem } from '../../map/magic/invokeItem';
import { Item, TreasureType } from '../../types/Treasures';
import { addPlayerEmpireTreasure } from '../../systems/gameStateActions';
import { itemFactory } from '../../factories/treasureFactory';

describe('useItem', () => {
  let randomSpy: jest.SpyInstance<number, []>;

  let gameStateStub: GameState;
  let opponentLand: LandPosition;
  let treasureItem: Item;

  beforeEach(() => {
    randomSpy = jest.spyOn(Math, 'random');

    gameStateStub = createDefaultGameStateStub();
    getTurnOwner(gameStateStub).mana.white = 200;
    placeUnitsOnMap(
      heroFactory(HeroUnitType.CLERIC, 'Cleric Level 1'),
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
      Object.assign(
        gameStateStub,
        addPlayerEmpireTreasure(
          gameStateStub,
          gameStateStub.turnOwner,
          itemFactory(TreasureType.WAND_OF_TURN_UNDEAD)
        )
      );
      treasureItem = getTreasureItem(
        getTurnOwner(gameStateStub),
        TreasureType.WAND_OF_TURN_UNDEAD
      )!;
    });

    it('should decrement opponent Undead in army', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 120), gameStateStub, opponentLand);

      /************** USE WAND_OF_TURN_UNDEAD *********************/
      randomSpy.mockReturnValue(0.99); // maximize damage from item
      invokeItem(gameStateStub, treasureItem.id, opponentLand);
      /************************************************************/

      const undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      );
      expect(undeadArmy).toBeDefined();
      expect(undeadArmy?.regulars.length).toBe(1);
      expect(undeadArmy?.regulars[0].type).toBe(RegularUnitType.UNDEAD);
      expect(undeadArmy?.regulars[0].count).toBe(60); // max damage from WAND_OF_TURN_UNDEAD = 60
    });

    it('possible to use WAND_OF_TURN_UNDEAD more then once per turn', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 120), gameStateStub, opponentLand);

      randomSpy.mockReturnValue(0.0); // minimize damage from item

      /************** USE WAND_OF_TURN_UNDEAD *********************/
      invokeItem(gameStateStub, treasureItem.id, opponentLand);
      /************************************************************/

      let undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      );
      expect(undeadArmy).toBeDefined();
      expect(undeadArmy?.regulars.length).toBe(1);
      expect(undeadArmy?.regulars[0].type).toBe(RegularUnitType.UNDEAD);
      expect(undeadArmy?.regulars[0].count).toBe(80); // min damage from WAND_OF_TURN_UNDEAD = 40

      /************** USE WAND_OF_TURN_UNDEAD AGAIN ***************/
      invokeItem(gameStateStub, treasureItem.id, opponentLand);
      /************************************************************/

      undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      );
      expect(undeadArmy).toBeDefined();
      expect(undeadArmy?.regulars.length).toBe(1);
      expect(undeadArmy?.regulars[0].type).toBe(RegularUnitType.UNDEAD);
      expect(undeadArmy?.regulars[0].count).toBe(40); // decremented by 40 from previous useItem call
    });

    it('Army destroyed if all units killed', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 2), gameStateStub, opponentLand);

      const undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      )!;

      /************** USE WAND_OF_TURN_UNDEAD *********************/
      randomSpy.mockReturnValue(0.99); // maximize damage from item
      invokeItem(gameStateStub, treasureItem.id, opponentLand);
      /************************************************************/

      expect(findArmyById(gameStateStub, undeadArmy.id)).toBeUndefined(); // army destroyed
      expect(
        getArmiesAtPosition(gameStateStub, opponentLand).filter((a) =>
          a.regulars.some((r) => r.type === RegularUnitType.UNDEAD)
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
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 2), gameStateStub, opponentLand);
      const undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
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
  });
});
