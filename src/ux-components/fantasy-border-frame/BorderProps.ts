import type { FrameSize } from '../../contexts/ApplicationContext';

export interface BorderProps {
  side: 'left' | 'right' | 'top' | 'bottom';
  tileDimensions: FrameSize;
  length: number;
  zIndex: number;
}
