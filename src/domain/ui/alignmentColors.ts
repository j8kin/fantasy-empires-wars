import { Alignment } from '../../types/Alignment';
import type { AlignmentType } from '../../types/Alignment';

const alignmentColors: Record<AlignmentType, string> = {
  [Alignment.LAWFUL]: 'rgb(74, 144, 226)', // Blue
  [Alignment.NEUTRAL]: 'rgb(149, 165, 166)', // Gray
  [Alignment.CHAOTIC]: 'rgb(231, 76, 60)', // Red
  [Alignment.NONE]: 'rgb(255, 255, 255)', // White
};

export const getAlignmentColor = (alignment: AlignmentType): string => {
  return alignmentColors[alignment];
};
