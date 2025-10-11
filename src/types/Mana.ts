export enum ManaType {
  WHITE = 'white',
  BLACK = 'black',
  GREEN = 'green',
  BLUE = 'blue',
  RED = 'red',
}

export type Mana = Record<ManaType, number>;
