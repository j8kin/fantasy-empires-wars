import { isWarMachine, RegularUnit, UnitRank } from '../../types/Army';

const MAX_MOVE = 4;

const maxKill = (n: number, rank: UnitRank) => {
  switch (rank) {
    case UnitRank.REGULAR:
      return Math.max(Math.ceil(n * 0.1), 60);
    case UnitRank.VETERAN:
      return Math.max(Math.ceil(n * 0.07), 40);
    default:
      return Math.max(Math.ceil(n * 0.05), 20);
  }
};

const nUnits = (units: RegularUnit[]) =>
  units.reduce(
    (acc, unit) => (isWarMachine(unit.id) ? acc + unit.count * 20 : acc + unit.count),
    0
  );

export const calcMaxMove = (army: RegularUnit[]): number => {
  const fullArmy = Object.values(UnitRank).map((r) => ({
    rank: r,
    num: nUnits(army.filter((u) => u.level === r)),
  }));

  const acc = fullArmy.map((a) => ({ ...a }));
  let i = 1;
  while (i < MAX_MOVE) {
    Object.values(UnitRank).forEach((rank) => {
      const n = acc.find((a) => a.rank === rank)!;
      n.num = Math.max(n.num - maxKill(n.num, rank), 0);
    });
    if (acc.every((a) => a.num <= 0.4 * fullArmy.find((f) => f.rank === a.rank)!.num)) break;

    i++;
  }

  return Math.max(i, 1);
};
