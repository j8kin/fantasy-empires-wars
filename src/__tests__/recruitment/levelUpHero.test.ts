import { PlayerInfo, PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import { getDefaultUnit, HeroUnit, HeroUnitType } from '../../types/Army';
import { levelUpHero } from '../../map/recruiting/levelUpHero';
import { toGamePlayer } from '../utils/toGamePlayer';
import { artifacts, TreasureItem } from '../../types/Treasures';

describe('level up hero', () => {
  it.each([
    [
      HeroUnitType.FIGHTER,
      1,
      PREDEFINED_PLAYERS[0],
      { attack: 32, defense: 3, range: 2, rangeDamage: 32, speed: 4, mana: undefined },
    ],
    [
      HeroUnitType.NECROMANCER,
      1,
      PREDEFINED_PLAYERS[1],
      { attack: 35, defense: 2, range: 25, rangeDamage: 36, speed: 2, mana: 1 },
    ],
    [
      HeroUnitType.FIGHTER,
      9,
      PREDEFINED_PLAYERS[0],
      { attack: 50, defense: 6, range: 2, rangeDamage: 50, speed: 4, mana: undefined },
    ],
    [
      HeroUnitType.NECROMANCER,
      9,
      PREDEFINED_PLAYERS[1],
      { attack: 39, defense: 5, range: 25, rangeDamage: 52, speed: 2, mana: 5 },
    ],
    [
      HeroUnitType.FIGHTER,
      31,
      PREDEFINED_PLAYERS[0],
      { attack: 99, defense: 16, range: 2, rangeDamage: 99, speed: 4, mana: undefined },
    ],
    [
      HeroUnitType.NECROMANCER,
      31,
      PREDEFINED_PLAYERS[1],
      { attack: 52, defense: 13, range: 25, rangeDamage: 96, speed: 2, mana: 18 },
    ],
    [
      HeroUnitType.ENCHANTER,
      31,
      PREDEFINED_PLAYERS[7],
      { attack: 61, defense: 15, range: 35, rangeDamage: 15, speed: 2, mana: 25 },
    ],
    [
      HeroUnitType.CLERIC,
      31,
      PREDEFINED_PLAYERS[6],
      { attack: 94, defense: 18, range: 2, rangeDamage: 94, speed: 2, mana: 16 },
    ],
    [
      HeroUnitType.DRUID,
      31,
      PREDEFINED_PLAYERS[12],
      { attack: 97, defense: 16, range: 2, rangeDamage: 97, speed: 3, mana: 16 },
    ],
    [
      HeroUnitType.PYROMANCER,
      31,
      PREDEFINED_PLAYERS[14],
      { attack: 45, defense: 15, range: 30, rangeDamage: 85, speed: 2, mana: 16 },
    ],
  ])(
    'should increase characteristics when hero (%s) gain level %s',
    (playerType: HeroUnitType, initLevel: number, player: PlayerInfo, expected) => {
      expect(player.type).toBe(playerType);

      const hero = getDefaultUnit(player.type) as HeroUnit;
      hero.level = initLevel;

      levelUpHero(hero, toGamePlayer(player));

      expect(hero.level).toBe(initLevel + 1);
      expect(hero.attack).toBe(expected.attack);
      expect(hero.defense).toBe(expected.defense);
      expect(hero.range).toBe(expected.range);
      expect(hero.rangeDamage).toBe(expected.rangeDamage);
      expect(hero.speed).toBe(expected.speed);
      expect(hero.mana).toBe(expected.mana);
    }
  );

  it('Ring of the Ascendant (RING_OF_EXPERIENCE) artifact increment level by 2', () => {
    const player = toGamePlayer(PREDEFINED_PLAYERS[0]);
    const hero1 = getDefaultUnit(player.type) as HeroUnit;
    hero1.level = 1;
    const hero2 = getDefaultUnit(player.type) as HeroUnit;
    hero2.level = 1;
    hero2.artifacts.push(artifacts.filter((a) => a.id === TreasureItem.RING_OF_EXPERIENCE)[0]);

    levelUpHero(hero1, player);
    levelUpHero(hero2, player);

    expect(hero1.level).toBe(2);
    expect(hero2.level).toBe(3);
  });

  it('level up after 32 is not possible', () => {
    const player = toGamePlayer(PREDEFINED_PLAYERS[0]);
    const hero1 = getDefaultUnit(player.type) as HeroUnit;
    hero1.level = 32;
    const hero2 = getDefaultUnit(player.type) as HeroUnit;
    hero2.level = 31;
    hero2.artifacts.push(artifacts.filter((a) => a.id === TreasureItem.RING_OF_EXPERIENCE)[0]);

    levelUpHero(hero1, player);
    levelUpHero(hero2, player);

    expect(hero1.level).toBe(32);
    expect(hero2.level).toBe(32);
  });
});
