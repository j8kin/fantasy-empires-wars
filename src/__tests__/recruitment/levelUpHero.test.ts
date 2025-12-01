import { PlayerProfile } from '../../state/player/PlayerProfile';
import { levelUpHero } from '../../systems/unitsActions';
import { playerFactory } from '../../factories/playerFactory';
import { heroFactory } from '../../factories/heroFactory';

import { PREDEFINED_PLAYERS } from '../../domain/player/playerRepository';

import { HeroUnitType } from '../../types/UnitType';
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
    'should increase characteristics when hero (%s) level %s gain new level',
    (playerType: HeroUnitType, initLevel: number, player: PlayerProfile, expected) => {
      expect(player.type).toBe(playerType);

      const hero = heroFactory(player.type, player.name);

      while (hero.level < initLevel) levelUpHero(hero, player.alignment); // set initial level

      levelUpHero(hero, player.alignment); // increase level

      expect(hero.level).toBe(initLevel + 1);
      expect(hero.baseStats.attack).toBe(expected.attack);
      expect(hero.baseStats.defense).toBe(expected.defense);
      expect(hero.baseStats.range).toBe(expected.range);
      expect(hero.baseStats.rangeDamage).toBe(expected.rangeDamage);
      expect(hero.baseStats.speed).toBe(expected.speed);
      expect(hero.mana).toBe(expected.mana);
    }
  );

  it('Ring of the Ascendant (RING_OF_EXPERIENCE) artifact increment level by 2', () => {
    const player = playerFactory(PREDEFINED_PLAYERS[0], 'human', 200000);
    const playerProfile = player.playerProfile;
    const hero1 = heroFactory(playerProfile.type, 'Hero 1');
    const hero2 = heroFactory(playerProfile.type, 'Hero 2');
    hero2.artifacts.push(artifacts.filter((a) => a.id === TreasureItem.RING_OF_EXPERIENCE)[0]);

    levelUpHero(hero1, playerProfile.alignment);
    levelUpHero(hero2, playerProfile.alignment);

    expect(hero1.level).toBe(2);
    expect(hero2.level).toBe(3);
  });

  it('level up after 32 is not possible', () => {
    const player = playerFactory(PREDEFINED_PLAYERS[0], 'human', 200000);
    const playerProfile = player.playerProfile;
    const hero1 = heroFactory(playerProfile.type, 'Hero 1');
    while (hero1.level < 32) levelUpHero(hero1, playerProfile.alignment); // gain initial level: 32
    expect(hero1.level).toBe(32);
    const hero2 = heroFactory(playerProfile.type, 'Hero 2');
    while (hero2.level < 31) levelUpHero(hero2, playerProfile.alignment); // gain initial level: 31
    expect(hero2.level).toBe(31);
    hero2.artifacts.push(artifacts.filter((a) => a.id === TreasureItem.RING_OF_EXPERIENCE)[0]);

    levelUpHero(hero1, playerProfile.alignment);
    levelUpHero(hero2, playerProfile.alignment);

    expect(hero1.level).toBe(32);
    expect(hero2.level).toBe(32);
  });
});
