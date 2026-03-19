class Scene {
  constructor(_config?: unknown) {}
  preload() {}
  create() {}
  update() {}
}

const Game = jest.fn().mockImplementation(() => ({
  destroy: jest.fn(),
}));

export default { AUTO: 0, Game, Scene };
