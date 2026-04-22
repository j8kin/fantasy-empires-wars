import { WorldMapScene } from '../phaser/scenes/WorldMapScene';

export const mockWorldScene = (): WorldMapScene => {
  const scene = new WorldMapScene();
  const makeContainer = () => ({ add: jest.fn(), removeAll: jest.fn(), setDepth: jest.fn() });
  (scene as any).landGraphics = {
    clear: jest.fn(),
    fillStyle: jest.fn(),
    fillPoints: jest.fn(),
    lineStyle: jest.fn(),
    strokePoints: jest.fn(),
  };
  (scene as any).backgroundTile = { setSize: jest.fn() };
  (scene as any).landsLayer = makeContainer();
  (scene as any).wallLayer = makeContainer();
  (scene as any).figureLayer = makeContainer();
  (scene as any).buildingLayer = makeContainer();
  (scene as any).textures = { exists: jest.fn().mockReturnValue(true) };
  (scene as any).add.image = jest.fn().mockReturnValue({
    setOrigin: jest.fn().mockReturnThis(),
    setScale: jest.fn().mockReturnThis(),
    setName: jest.fn().mockReturnThis(),
    setRotation: jest.fn().mockReturnThis(),
    setFlipX: jest.fn().mockReturnThis(),
    width: 100,
    height: 100,
  });
  return scene;
};
