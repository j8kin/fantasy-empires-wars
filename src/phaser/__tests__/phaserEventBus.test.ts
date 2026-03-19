import { phaserEventBus, PhaserEvents } from '../phaserEventBus';

describe('phaserEventBus', () => {
  afterEach(() => {
    phaserEventBus.removeAllListeners();
  });

  it('emits and receives a TILE_CLICKED event with a payload', () => {
    const listener = jest.fn();
    const pos = { row: 2, col: 3 };

    phaserEventBus.on(PhaserEvents.TILE_CLICKED, listener);
    phaserEventBus.emit(PhaserEvents.TILE_CLICKED, pos);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(pos);
  });

  it('emits and receives a STATE_UPDATE event with a payload', () => {
    const listener = jest.fn();
    const fakeState = { turn: 1 };

    phaserEventBus.on(PhaserEvents.STATE_UPDATE, listener);
    phaserEventBus.emit(PhaserEvents.STATE_UPDATE, fakeState);

    expect(listener).toHaveBeenCalledWith(fakeState);
  });

  it('emits GLOW_TILES with an array of positions', () => {
    const listener = jest.fn();
    const positions = [{ row: 0, col: 0 }, { row: 1, col: 1 }];

    phaserEventBus.on(PhaserEvents.GLOW_TILES, listener);
    phaserEventBus.emit(PhaserEvents.GLOW_TILES, positions);

    expect(listener).toHaveBeenCalledWith(positions);
  });

  it('emits CLEAR_GLOW with no payload', () => {
    const listener = jest.fn();

    phaserEventBus.on(PhaserEvents.CLEAR_GLOW, listener);
    phaserEventBus.emit(PhaserEvents.CLEAR_GLOW);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('supports multiple listeners on the same event', () => {
    const first = jest.fn();
    const second = jest.fn();

    phaserEventBus.on(PhaserEvents.SCENE_READY, first);
    phaserEventBus.on(PhaserEvents.SCENE_READY, second);
    phaserEventBus.emit(PhaserEvents.SCENE_READY, 'OverworldScene');

    expect(first).toHaveBeenCalledWith('OverworldScene');
    expect(second).toHaveBeenCalledWith('OverworldScene');
  });

  it('does not call listener after it is removed with off()', () => {
    const listener = jest.fn();

    phaserEventBus.on(PhaserEvents.TILE_RIGHT_CLICKED, listener);
    phaserEventBus.off(PhaserEvents.TILE_RIGHT_CLICKED, listener);
    phaserEventBus.emit(PhaserEvents.TILE_RIGHT_CLICKED, { row: 0, col: 0 });

    expect(listener).not.toHaveBeenCalled();
  });

  it('once() listener is called only once', () => {
    const listener = jest.fn();

    phaserEventBus.once(PhaserEvents.ARMY_CLICKED, listener);
    phaserEventBus.emit(PhaserEvents.ARMY_CLICKED, { id: 'a1' });
    phaserEventBus.emit(PhaserEvents.ARMY_CLICKED, { id: 'a2' });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ id: 'a1' });
  });

  it('listenerCount() reflects active listeners', () => {
    const listener = jest.fn();

    expect(phaserEventBus.listenerCount(PhaserEvents.STATE_UPDATE)).toBe(0);

    phaserEventBus.on(PhaserEvents.STATE_UPDATE, listener);
    expect(phaserEventBus.listenerCount(PhaserEvents.STATE_UPDATE)).toBe(1);

    phaserEventBus.off(PhaserEvents.STATE_UPDATE, listener);
    expect(phaserEventBus.listenerCount(PhaserEvents.STATE_UPDATE)).toBe(0);
  });

  it('PhaserEvents constants are unique strings', () => {
    const values = Object.values(PhaserEvents);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});
