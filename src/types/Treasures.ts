export type EmpireTreasure = Item | Relic;

interface TreasureType {
  id: string;
}

// Hero items
export interface Artifact extends TreasureType {
  level: number; // +1 - +5 todo ???
}

// Usable on Map Items
interface Item extends TreasureType {
  charge: number;
}

// Items that have a permanent effect on the Game State
interface Relic extends TreasureType {}
