import React from 'react';
import Phaser from 'phaser';
import { render } from '@testing-library/react';
import { PhaserGameInstance } from '../../phaser/PhaserGameInstance';
import { GameProvider } from '../../contexts/GameContext';

const MockGame = Phaser.Game as jest.MockedClass<typeof Phaser.Game>;

beforeEach(() => {
  MockGame.mockClear();
});

describe('PhaserGameInstance', () => {
  it('renders a div container element', () => {
    const { container } = render(
      <GameProvider>
        <PhaserGameInstance />
      </GameProvider>
    );
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('instantiates Phaser.Game exactly once on mount', () => {
    render(
      <GameProvider>
        <PhaserGameInstance />
      </GameProvider>
    );
    expect(MockGame).toHaveBeenCalledTimes(1);
  });

  it('passes the OverworldScene and correct config to Phaser.Game', () => {
    render(
      <GameProvider>
        <PhaserGameInstance />
      </GameProvider>
    );
    const [config] = MockGame.mock.calls[0];
    expect(config).toMatchObject({
      backgroundColor: '#2b2b2b',
      width: '100%',
      height: '100%',
    });
    expect(Array.isArray(config?.scene)).toBe(true);
    expect((config?.scene as unknown[]).length).toBe(1);
  });

  it('calls game.destroy(true) on unmount', () => {
    const { unmount } = render(
      <GameProvider>
        <PhaserGameInstance />
      </GameProvider>
    );
    const gameInstance = MockGame.mock.results[0].value as { destroy: jest.Mock };
    unmount();
    expect(gameInstance.destroy).toHaveBeenCalledWith(true);
  });
});
