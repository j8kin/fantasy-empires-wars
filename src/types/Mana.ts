export enum ManaType {
  WHITE = 'white',
  BLACK = 'black',
  GREEN = 'green',
  BLUE = 'blue',
  RED = 'red',
}

export interface Mana {
  color: ManaType;
  mana: number;
}
