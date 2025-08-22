export interface Player {
  id: string;
  name: string;
  color: string;
  gold: number;
  isActive: boolean;
}

export const NEUTRAL_PLAYER: Player = {
  id: 'neutral',
  name: 'Uncontrolled',
  color: '#888888',
  gold: 0,
  isActive: false,
};
