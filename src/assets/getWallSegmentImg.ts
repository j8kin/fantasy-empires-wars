import angleSegmentImg from './buildings/map/wall-segments/angle-segment.png';
import verticalSegmentImg from './buildings/map/wall-segments/vertical-segment.png';

export const WALL_TEXTURE = {
  ANGLE: 'wall-seg-angle',
  VERTICAL: 'wall-seg-vertical',
} as const;

export const getWallSegmentImages = (): [string, string][] => [
  [WALL_TEXTURE.ANGLE, angleSegmentImg],
  [WALL_TEXTURE.VERTICAL, verticalSegmentImg],
];
