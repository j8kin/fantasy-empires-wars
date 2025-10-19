import { DialogSize } from './FantasyBorderFrame';

export interface BorderProps {
  side: 'left' | 'right' | 'top' | 'bottom';
  tileDimensions: DialogSize;
  length: number;
  zIndex: number;
}
