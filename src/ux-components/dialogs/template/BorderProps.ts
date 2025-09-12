export interface BorderProps {
  side: 'left' | 'right' | 'top' | 'bottom';
  tileSize: { width: number; height: number };
  length: number;
}
