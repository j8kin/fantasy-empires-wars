import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/map/land/LandPosition';
import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import { getSpellById } from '../../selectors/spellSelectors';
import { findArmyById, getArmiesAtPosition } from '../../selectors/armySelectors';
import { regularsFactory } from '../../factories/regularsFactory';
import { heroFactory } from '../../factories/heroFactory';
import { HeroUnitType, RegularUnitType } from '../../types/UnitType';
import { SpellName } from '../../types/Spell';

import { castSpell } from '../../map/magic/castSpell';

import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { placeUnitsOnMap } from '../utils/placeUnitsOnMap';

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

  describe('Cast TURN_TO_MANA spell', () => {
    it('Number of UNDEAD units decremented', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 20), gameStateStub, opponentLand);

      randomSpy.mockReturnValue(0.99); // maximize damage from spell

      castSpell(getSpellById(SpellName.TURN_UNDEAD), opponentLand, gameStateStub);

      const undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      );
      expect(undeadArmy).toBeDefined();
      expect(undeadArmy?.regulars.length).toBe(1);
      expect(undeadArmy?.regulars[0].type).toBe(RegularUnitType.UNDEAD);
      expect(undeadArmy?.regulars[0].count).toBe(18); // ceil(60 * 1 / 32) = 2 - spell killed only 2 undead units
    });

    it('Army destroyed if all units killed', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 2), gameStateStub, opponentLand);

      randomSpy.mockReturnValue(0.99); // maximize damage from spell
      const undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      )!;

      castSpell(getSpellById(SpellName.TURN_UNDEAD), opponentLand, gameStateStub);

      expect(findArmyById(gameStateStub, undeadArmy.id)).toBeUndefined(); // army destroyed
      expect(
        getArmiesAtPosition(gameStateStub, opponentLand).filter((a) =>
          a.regulars.some((r) => r.type === RegularUnitType.UNDEAD)
        )
      ).toHaveLength(0); // no UNDEAD armies left
    });

    it('TURN UNDEAD should be casted only once per turn', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 20), gameStateStub, opponentLand);

      randomSpy.mockReturnValue(0.99); // maximize damage from spell

      castSpell(getSpellById(SpellName.TURN_UNDEAD), opponentLand, gameStateStub);

      let undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      );
      expect(undeadArmy).toBeDefined();
      expect(undeadArmy?.regulars.length).toBe(1);
      expect(undeadArmy?.regulars[0].type).toBe(RegularUnitType.UNDEAD);
      expect(undeadArmy?.regulars[0].count).toBe(18); // ceil(60 * 1 / 32) = 2 - spell killed only 2 undead units

      castSpell(getSpellById(SpellName.TURN_UNDEAD), opponentLand, gameStateStub);

      // check that spell is not affected by the second cast
      undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      );

      expect(undeadArmy).toBeDefined();
      expect(undeadArmy?.regulars.length).toBe(1);
      expect(undeadArmy?.regulars[0].type).toBe(RegularUnitType.UNDEAD);
      expect(undeadArmy?.regulars[0].count).toBe(18); // the same as in the first cast
    });
  });
});
