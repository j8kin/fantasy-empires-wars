import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/map/land/LandPosition';
import { getLandId } from '../../state/map/land/LandId';
import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import { findArmyById, getArmiesAtPosition } from '../../selectors/armySelectors';
import { getLand, getLandInfo, hasActiveEffect } from '../../selectors/landSelectors';
import { getSpellById } from '../../selectors/spellSelectors';
import { regularsFactory } from '../../factories/regularsFactory';
import { heroFactory } from '../../factories/heroFactory';

import { HeroUnitType, RegularUnitType } from '../../types/UnitType';
import { SpellName } from '../../types/Spell';
import { BuildingType } from '../../types/Building';
import { EffectType } from '../../types/Effect';

import { castSpell } from '../../map/magic/castSpell';
import { getAvailableToCastSpellLands } from '../../map/magic/getAvailableToCastSpellLands';

import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { placeUnitsOnMap } from '../utils/placeUnitsOnMap';
import { TestTurnManagement } from '../utils/TestTurnManagement';

describe('castWhiteManaSpell', () => {
  let randomSpy: jest.SpyInstance<number, []>;

  let gameStateStub: GameState;
  let opponentLand: LandPosition;

  beforeEach(() => {
    randomSpy = jest.spyOn(Math, 'random');

    gameStateStub = createDefaultGameStateStub();
    getTurnOwner(gameStateStub).mana.white = 200;
    placeUnitsOnMap(
      heroFactory(HeroUnitType.CLERIC, 'Cleric Level 1'),
      gameStateStub,
      getPlayerLands(gameStateStub)[0].mapPos
    );
    opponentLand = getPlayerLands(gameStateStub, gameStateStub.players[1].id)[0].mapPos;
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  describe('Cast TURN_UNDEAD spell', () => {
    it('Number of UNDEAD units decremented', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 120), gameStateStub, opponentLand);

      randomSpy.mockReturnValue(0.99); // maximize damage from spell

      castSpell(gameStateStub, SpellName.TURN_UNDEAD, opponentLand);

      const undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      );
      expect(undeadArmy).toBeDefined();
      expect(undeadArmy?.regulars.length).toBe(1);
      expect(undeadArmy?.regulars[0].type).toBe(RegularUnitType.UNDEAD);
      expect(undeadArmy?.regulars[0].count).toBe(58); // ceil(60 * (1 + 1 / 32)) = 62 - spell killed only 62 undead units
    });

    it('Army destroyed if all units killed', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 2), gameStateStub, opponentLand);

      randomSpy.mockReturnValue(0.99); // maximize damage from spell
      const undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      )!;

      castSpell(gameStateStub, SpellName.TURN_UNDEAD, opponentLand);

      expect(findArmyById(gameStateStub, undeadArmy.id)).toBeUndefined(); // army destroyed
      expect(
        getArmiesAtPosition(gameStateStub, opponentLand).filter((a) =>
          a.regulars.some((r) => r.type === RegularUnitType.UNDEAD)
        )
      ).toHaveLength(0); // no UNDEAD armies left
    });

    it('TURN UNDEAD should be casted only once per turn', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 120), gameStateStub, opponentLand);

      randomSpy.mockReturnValue(1); // maximize damage from spell

      castSpell(gameStateStub, SpellName.TURN_UNDEAD, opponentLand);

      let undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      );
      expect(undeadArmy).toBeDefined();
      expect(undeadArmy?.regulars.length).toBe(1);
      expect(undeadArmy?.regulars[0].type).toBe(RegularUnitType.UNDEAD);
      expect(undeadArmy?.regulars[0].count).toBe(58); // ceil(60 * (1 + 1 / 32)) = 62 - spell killed only 62 undead units

      const whiteMana = getTurnOwner(gameStateStub).mana.white;
      castSpell(gameStateStub, SpellName.TURN_UNDEAD, opponentLand);
      expect(getTurnOwner(gameStateStub).mana.white).toBe(whiteMana); // mana not changed

      // check that spell is not affected by the second cast
      undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      );

      expect(undeadArmy).toBeDefined();
      expect(undeadArmy?.regulars.length).toBe(1);
      expect(undeadArmy?.regulars[0].type).toBe(RegularUnitType.UNDEAD);
      expect(undeadArmy?.regulars[0].count).toBe(58); // the same as in the first cast
    });

    it('Only UNDEAD units can be affected by TURN UNDEAD spell', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 120), gameStateStub, opponentLand);
      placeUnitsOnMap(regularsFactory(RegularUnitType.WARRIOR, 120), gameStateStub, opponentLand);

      randomSpy.mockReturnValue(0.99); // maximize damage from spell

      castSpell(gameStateStub, SpellName.TURN_UNDEAD, opponentLand);
      const armies = getArmiesAtPosition(gameStateStub, opponentLand);
      expect(armies).toHaveLength(3); // initial hero, undead army and warrior army

      const undeadArmy = armies.find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      );
      expect(undeadArmy).toBeDefined();
      expect(undeadArmy?.regulars.length).toBe(1);
      expect(undeadArmy?.regulars[0].type).toBe(RegularUnitType.UNDEAD);
      expect(undeadArmy?.regulars[0].count).toBe(58); // ceil(60 * (1 + 1 / 32)) = 62 - spell killed only 62 undead units

      const warriorArmy = armies.find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.WARRIOR)
      );
      expect(warriorArmy).toBeDefined();
      expect(warriorArmy?.regulars.length).toBe(1);
      expect(warriorArmy?.regulars[0].type).toBe(RegularUnitType.WARRIOR);
      expect(warriorArmy?.regulars[0].count).toBe(120); // warrior army not affected by spell
    });

    it('TURN_UNDEAD Effect cleared from opponent Lands on Opponents START Phase and it is possible to cast TURN_UNDEAD on that Lands again', () => {
      /*********** SETUP **************/
      jest.useFakeTimers();
      jest.clearAllMocks();

      gameStateStub = createDefaultGameStateStub();
      getTurnOwner(gameStateStub).mana.white = 200; // to allow casting spells
      const testTurnManagement = new TestTurnManagement(gameStateStub);

      testTurnManagement.startNewTurn(gameStateStub);
      testTurnManagement.waitStartPhaseComplete();
      /********************************/

      const opponetLands = getPlayerLands(gameStateStub, gameStateStub.players[1].id).flatMap((l) =>
        getLandId(l.mapPos)
      );
      const opponentLand = getPlayerLands(gameStateStub, gameStateStub.players[1].id)[0].mapPos;
      let availableToCastSpellLands = getAvailableToCastSpellLands(
        gameStateStub,
        SpellName.TURN_UNDEAD
      );
      expect(
        opponetLands.every((landId) => availableToCastSpellLands.includes(landId))
      ).toBeTruthy();

      /*********** CALL SUT **************/
      castSpell(gameStateStub, SpellName.TURN_UNDEAD, opponentLand);
      /***********************************/

      availableToCastSpellLands = getAvailableToCastSpellLands(
        gameStateStub,
        SpellName.TURN_UNDEAD
      );
      expect(
        opponetLands.every((landId) => availableToCastSpellLands.includes(landId))
      ).toBeFalsy();

      /*********** MAKE A TURN **************/
      testTurnManagement.makeNTurns(1);
      /**************************************/

      availableToCastSpellLands = getAvailableToCastSpellLands(
        gameStateStub,
        SpellName.TURN_UNDEAD
      );
      expect(
        opponetLands.every((landId) => availableToCastSpellLands.includes(landId))
      ).toBeTruthy();

      /*********** CLEANUP **************/
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
  });

  describe('Cast VIEW TERRITORY spell', () => {
    let testTurnManagement: TestTurnManagement;
    let gameStateStub: GameState;

    beforeEach(() => {
      jest.useFakeTimers();
      jest.clearAllMocks();

      gameStateStub = createDefaultGameStateStub();
      getTurnOwner(gameStateStub).mana.white = 200; // to allow casting spells
      testTurnManagement = new TestTurnManagement(gameStateStub);

      testTurnManagement.startNewTurn(gameStateStub);
      testTurnManagement.waitStartPhaseComplete();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should decrement effect durations at the end of startTurn execution and remove with 0 duration', () => {
      expect(gameStateStub.turn).toBe(2);

      // opponent land 0 is homeland: have an initial hero and stronghold
      const opponentLand = getPlayerLands(gameStateStub, gameStateStub.players[1].id)[0].mapPos;
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 1), gameStateStub, opponentLand);

      const landInfo = getLandInfo(gameStateStub, opponentLand);
      // verify that effect not added to the land yet
      expect(landInfo.heroes).toHaveLength(0);
      expect(landInfo.regulars).toHaveLength(0);
      expect(landInfo.buildings).toHaveLength(0);

      const whiteMana = getTurnOwner(gameStateStub).mana.white;
      castSpell(gameStateStub, SpellName.VIEW_TERRITORY, opponentLand);
      expect(getTurnOwner(gameStateStub).mana.white).toBe(
        whiteMana - getSpellById(SpellName.VIEW_TERRITORY).manaCost
      );

      // verify that effect added to the land
      const land = getLand(gameStateStub, opponentLand);
      expect(land.effects).toHaveLength(1);
      expect(land.effects[0].sourceId).toBe(SpellName.VIEW_TERRITORY);
      expect(land.effects[0].duration).toBe(1);

      expect(land.effects[0].appliedBy).toBe(gameStateStub.turnOwner);

      const landInfoWithEffect = getLandInfo(gameStateStub, opponentLand);
      // verify that effect not added to the land yet
      expect(landInfoWithEffect.heroes).toHaveLength(1);
      expect(landInfoWithEffect.heroes[0]).toBe('Morgana Shadowweaver lvl: 12');
      expect(landInfoWithEffect.regulars).toHaveLength(1);
      expect(landInfoWithEffect.regulars[0]).toBe(`${RegularUnitType.UNDEAD} (1)`);
      expect(landInfoWithEffect.buildings).toHaveLength(1);
      expect(landInfoWithEffect.buildings[0]).toBe(BuildingType.STRONGHOLD);

      testTurnManagement.makeNTurns(1);

      // effect disappear since duration 1 turn
      expect(gameStateStub.turn).toBe(3);
      expect(getLand(gameStateStub, opponentLand).effects).toHaveLength(0);
    });
  });

  describe('Cast BLESSING OF PROTECTION spell', () => {
    it('affect all lands in radius 1', () => {
      const homelandPos = getPlayerLands(gameStateStub)[0].mapPos;

      const whiteMana = getTurnOwner(gameStateStub).mana.white;
      castSpell(gameStateStub, SpellName.BLESSING, homelandPos);
      expect(getTurnOwner(gameStateStub).mana.white).toBe(
        whiteMana - getSpellById(SpellName.BLESSING).manaCost
      );

      // central land is affected
      const homeland = getLand(gameStateStub, homelandPos);
      expect(homeland.effects).toHaveLength(1);
      expect(homeland.effects[0].sourceId).toBe(SpellName.BLESSING);
      expect(homeland.effects[0].type).toBe(EffectType.POSITIVE);
      expect(homeland.effects[0].appliedBy).toBe(gameStateStub.turnOwner);
      expect(homeland.effects[0].duration).toBe(3);

      expect(
        getPlayerLands(gameStateStub).filter((l) => hasActiveEffect(l, SpellName.BLESSING))
      ).toHaveLength(7);
    });
  });
});
