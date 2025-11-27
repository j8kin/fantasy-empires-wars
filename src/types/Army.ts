import { Movements, placeArmy } from './Movements';
import { createRegularUnit, RegularUnit, UnitRank } from './RegularUnit';
import { HeroUnit } from './HeroUnit';
import { HeroUnitType, RegularUnitType } from './UnitType';
import { INVALID, LandPosition } from '../state/LandState';

export interface ArmyBriefInfo {
  heroes: { name: string; type: HeroUnitType; level: number }[];
  regulars: { id: RegularUnitType; rank: UnitRank; count: number }[];
}

export interface Army {
  get controlledBy(): string;
  get position(): LandPosition;

  get isMoving(): boolean;
  startMoving(from: LandPosition, to: LandPosition): void;
  move(): void;

  addHero(hero: HeroUnit): void;
  getHero(name: string): HeroUnit | undefined;

  get heroes(): HeroUnit[];
  get regulars(): RegularUnit[];

  get briefInfo(): ArmyBriefInfo;

  addRegulars(unit: RegularUnit): void;
  getRegulars(unitType: RegularUnitType, rank: UnitRank, count: number): RegularUnit | undefined;

  merge(army: Army): void;
}

export type Armies = Army[];

export const createArmy = (
  controlledBy: string,
  position: LandPosition,
  initHeroes: HeroUnit[] = [],
  initRegulars: RegularUnit[] = []
): Army => {
  const allHeroes: HeroUnit[] = initHeroes;
  const allRegulars: RegularUnit[] = initRegulars;
  const movements: Movements = placeArmy(position);
  return {
    get controlledBy(): string {
      return controlledBy;
    },
    get isMoving(): boolean {
      return movements.from !== INVALID;
    },
    get position(): LandPosition {
      return movements.position;
    },
    get heroes(): HeroUnit[] {
      return allHeroes;
    },
    get regulars(): RegularUnit[] {
      return allRegulars;
    },

    get briefInfo(): ArmyBriefInfo {
      return {
        heroes: allHeroes.map((h) => ({ name: h.name, type: h.id, level: h.level })),
        regulars: allRegulars.map((u) => ({ id: u.id, rank: u.rank, count: u.count })),
      };
    },

    startMoving(from: LandPosition, to: LandPosition): void {
      movements.startMoving(from, to);
    },
    move(): void {
      movements.move();
    },
    addHero: function (hero: HeroUnit): void {
      allHeroes.push(hero);
    },
    getHero(name: string): HeroUnit | undefined {
      const heroIdx = allHeroes.findIndex((h) => h.name === name);
      if (heroIdx === -1) return undefined;
      const hero = allHeroes[heroIdx];
      allHeroes.splice(heroIdx, 1);
      return hero;
    },
    addRegulars: function (unit: RegularUnit): void {
      const unitIdx = allRegulars.findIndex((u) => u.id === unit.id && u.rank === unit.rank);
      if (unitIdx !== -1) {
        allRegulars[unitIdx].count += unit.count;
      } else {
        allRegulars.push(unit);
      }
    },
    getRegulars(unitType: RegularUnitType, rank: UnitRank, count: number): RegularUnit | undefined {
      const unitIdx = allRegulars.findIndex(
        (u) => u.id === unitType && u.rank === rank && u.count >= count
      );
      if (unitIdx === -1) return undefined;
      const unit = allRegulars[unitIdx];
      if (unit.count === count) {
        allRegulars.splice(unitIdx, 1);
        return unit;
      }
      allRegulars[unitIdx].count -= count;
      return createRegularUnit(allRegulars[unitIdx].id, count);
    },

    merge(army: Army) {
      army.heroes.forEach((hero) => this.addHero(hero));
      army.regulars.forEach((unit) => this.addRegulars(unit));
    },
  };
};
