import { FrameSize } from './FantasyBorderFrame';

export interface BorderProps {
  side: 'left' | 'right' | 'top' | 'bottom';
  tileDimensions: FrameSize;
  length: number;
  zIndex: number;
}
