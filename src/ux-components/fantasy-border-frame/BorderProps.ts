import { Dimensions } from './FantasyBorderFrame';

export interface BorderProps {
  side: 'left' | 'right' | 'top' | 'bottom';
  tileDimensions: Dimensions;
  length: number;
  zIndex: number;
}
