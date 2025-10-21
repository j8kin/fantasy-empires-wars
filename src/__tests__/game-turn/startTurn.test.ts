import { battlefieldLandId, GameState, getTurnOwner } from '../../types/GameState';
import { startTurn } from '../../turn/startTurn';
import { generateMockMap } from '../utils/generateMockMap';
import { PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import { toGamePlayer } from '../utils/toGamePlayer';
import { construct } from '../../map/building/construct';
import { BuildingType } from '../../types/Building';
import { recruitHero } from '../../map/army/recruit';
import { getUnit, UnitType } from '../../types/Army';
import { LandPosition } from '../../map/utils/mapLands';

describe('Start Turn phase', () => {
  let mockGameState: GameState;
  const player1StrongholdPosition: LandPosition = { row: 3, col: 3 };

  beforeEach(() => {
    mockGameState = {
      battlefield: generateMockMap(10, 10),
      turnOwner: PREDEFINED_PLAYERS[0].id,
      turn: 1,
      players: [...PREDEFINED_PLAYERS.slice(0, 3).map(toGamePlayer)],
    };
    construct(
      getTurnOwner(mockGameState)!,
      BuildingType.STRONGHOLD,
      player1StrongholdPosition,
      mockGameState
    );
    const hero = getUnit(UnitType.HAMMERLORD);
    hero.id = 'abarvalg';
    hero.name = 'Abarvalg Burgrondus';
    recruitHero(
      hero,
      mockGameState.battlefield.lands[battlefieldLandId(player1StrongholdPosition)]
    );
  });

  it('Income and Money should be calculated during Start Game phase', () => {
    startTurn(mockGameState);
    expect(mockGameState.players[0].money).toBe(434);
    expect(mockGameState.players[0].income).toBe(434);
  });
});
