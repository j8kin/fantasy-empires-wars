import { GameState } from '../../state/GameState';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import { HeroUnitType, RegularUnitType } from '../../types/UnitType';
import { getArmiesAtPositionByPlayers, getArmiesByPlayer } from '../../selectors/armySelectors';
import { castSpell } from '../../map/magic/castSpell';
import { getSpellById } from '../../selectors/spellSelectors';
import { SpellName } from '../../types/Spell';
import { UnitRank } from '../../state/army/RegularsState';
import { heroFactory } from '../../factories/heroFactory';
import { levelUpHero } from '../../systems/unitsActions';
import { Alignment } from '../../types/Alignment';
import { placeUnitsOnMap } from '../utils/placeUnitsOnMap';
import { regularsFactory } from '../../factories/regularsFactory';

describe('castBlackManaSpell', () => {
  let randomSpy: jest.SpyInstance<number, []>;

  let gameStateStub: GameState;

  beforeEach(() => {
    randomSpy = jest.spyOn(Math, 'random');

    gameStateStub = createDefaultGameStateStub();
    getTurnOwner(gameStateStub).mana.black = 200;
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  describe('Cast SUMMON UNDEAD spell', () => {
    beforeEach(() => {
      randomSpy.mockReturnValue(0.99); // maximize number of UNDEAD units to be summoned
    });

    it('Allow Summoned UNDEAD units when no Necromancer but enough mana', () => {
      const nNecromancers = getArmiesByPlayer(gameStateStub).find((a) =>
        a.heroes.some((h) => h.type === HeroUnitType.NECROMANCER)
      );
      expect(nNecromancers).toBeUndefined(); // no Necromancers on the map

      const playerLandPos = getPlayerLands(gameStateStub)[1].mapPos; // land[0] is Homeland and has default hero that is why use [1]
      expect(
        getArmiesAtPositionByPlayers(gameStateStub, playerLandPos, [gameStateStub.turnOwner])
      ).toHaveLength(0);

      castSpell(getSpellById(SpellName.SUMMON_UNDEAD), playerLandPos, gameStateStub);

      const undeadArmy = getArmiesAtPositionByPlayers(gameStateStub, playerLandPos, [
        gameStateStub.turnOwner,
      ]);
      expect(undeadArmy).toHaveLength(1); // new army created
      expect(undeadArmy[0].regulars).toHaveLength(1); // only undead regulars
      expect(undeadArmy[0].regulars[0].type).toBe(RegularUnitType.UNDEAD);
      expect(undeadArmy[0].regulars[0].rank).toBe(UnitRank.REGULAR);
      expect(undeadArmy[0].regulars[0].count).toBe(60);
    });

    it('When Undead already exist on Land add to existing units during SUMMON UNDEAD', () => {
      const playerLandPos = getPlayerLands(gameStateStub)[1].mapPos; // land[0] is Homeland and has default hero that is why use [1]
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 1), gameStateStub, playerLandPos);

      castSpell(getSpellById(SpellName.SUMMON_UNDEAD), playerLandPos, gameStateStub);

      const undeadArmies = getArmiesAtPositionByPlayers(gameStateStub, playerLandPos, [
        gameStateStub.turnOwner,
      ]);

      expect(undeadArmies).toHaveLength(1); // not increased
      expect(undeadArmies[0].regulars).toHaveLength(1);
      expect(undeadArmies[0].regulars[0].type).toBe(RegularUnitType.UNDEAD);
      expect(undeadArmies[0].regulars[0].rank).toBe(UnitRank.REGULAR);
      expect(undeadArmies[0].regulars[0].count).toBe(61); // 60 units added
    });

    it.each([
      [1, 62],
      [16, 90],
      [32, 120],
    ])(
      'Number of UNDEAD units depends on max Necromancer level (%s): %s',
      (maxLevel: number, summoned: number) => {
        const playerLandPos = getPlayerLands(gameStateStub)[0].mapPos;

        const necromancer = heroFactory(HeroUnitType.NECROMANCER, `Necromancer Level ${maxLevel}`);

        while (necromancer.level < maxLevel) {
          levelUpHero(necromancer, Alignment.LAWFUL);
        }
        expect(necromancer.level).toBe(maxLevel);
        placeUnitsOnMap(necromancer, gameStateStub, playerLandPos);

        castSpell(getSpellById(SpellName.SUMMON_UNDEAD), playerLandPos, gameStateStub);

        const summonedUndead = getArmiesAtPositionByPlayers(gameStateStub, playerLandPos, [
          gameStateStub.turnOwner,
        ]).flatMap((r) => r.regulars);
        expect(summonedUndead).toHaveLength(1);
        expect(summonedUndead[0].type).toBe(RegularUnitType.UNDEAD);
        expect(summonedUndead[0].rank).toBe(UnitRank.REGULAR);
        expect(summonedUndead[0].count).toBe(summoned);
      }
    );
  });
});
