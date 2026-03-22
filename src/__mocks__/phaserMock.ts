export class Scene {
  constructor(_config?: unknown) {}
  preload() {}
  create() {}
  update() {}
  cameras = {
    main: {
      setBounds: jest.fn(),
    },
  };
  add = {
    graphics: jest.fn().mockReturnValue({
      clear: jest.fn(),
      fillStyle: jest.fn(),
      fillPoints: jest.fn(),
      lineStyle: jest.fn(),
      strokePoints: jest.fn(),
    }),
  };
  input = {
    on: jest.fn(),
  };
}

export class Point {
  x: number;
  y: number;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

export class Polygon {
  static Contains = jest.fn();
  constructor(_points?: any[]) {}
}

const Game = jest.fn().mockImplementation(() => ({
  destroy: jest.fn(),
}));

export default {
  AUTO: 0,
  Game,
  Scene,
  Geom: {
    Point,
    Polygon,
  },
  Input: {
    Pointer: jest.fn(),
  },
  GameObjects: {
    Graphics: jest.fn(),
  },
};
