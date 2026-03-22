class Scene {
  constructor(_config?: unknown) {}
  preload() {}
  create() {}
  update() {}
  add = {
    graphics: jest.fn().mockReturnValue({
      clear: jest.fn().mockReturnThis(),
      fillStyle: jest.fn().mockReturnThis(),
      fillPoints: jest.fn().mockReturnThis(),
      lineStyle: jest.fn().mockReturnThis(),
      strokePoints: jest.fn().mockReturnThis(),
      beginPath: jest.fn().mockReturnThis(),
      closePath: jest.fn().mockReturnThis(),
      fill: jest.fn().mockReturnThis(),
      stroke: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis(),
    }),
    container: jest.fn().mockReturnValue({
      add: jest.fn(),
      removeAll: jest.fn(),
      destroy: jest.fn(),
    }),
  };
  load = {
    image: jest.fn(),
  };
  input = {
    on: jest.fn(),
  };
}

const Point = class {
  x: number;
  y: number;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
};

const Polygon = class {
  points: { x: number; y: number }[];
  constructor(points: { x: number; y: number }[] = []) {
    this.points = points;
  }
  static Contains(_poly: any, _x: number, _y: number) {
    return false;
  }
};

const Geom = {
  Point,
  Polygon,
};

const Game = jest.fn().mockImplementation(() => ({
  destroy: jest.fn(),
}));

export default {
  AUTO: 0,
  Game,
  Scene,
  Geom,
  GameObjects: {
    Graphics: jest.fn(),
    Container: jest.fn(),
  },
  Input: {
    Pointer: jest.fn(),
  },
};
