import {
  BattlefieldDimensions,
  battlefieldLandId,
  GameState,
  TurnPhase,
} from '../../types/GameState';
import { PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import { toGamePlayer } from './toGamePlayer';
import { generateMockMap } from './generateMockMap';
import { construct } from '../../map/building/construct';
import { BuildingType } from '../../types/Building';
import { LandPosition } from '../../map/utils/getLands';
import { recruitHero } from '../../map/army/recruit';
import { getDefaultUnit, HeroUnit } from '../../types/Army';
import { generateMap } from '../../map/generation/generateMap';

export const defaultBattlefieldSizeStub = { rows: 10, cols: 20 };
export const createDefaultGameStateStub = (): GameState => createGameStateStub({});

export const createGameStateStub = ({
  nPlayers = 3,
  turnOwner = 0,
  turnPhase = TurnPhase.MAIN,
  battlefieldSize = defaultBattlefieldSizeStub,
  realBattlefield = false,
  addPlayersHomeland = true,
}: {
  nPlayers?: number;
  turnOwner?: number;
  turnPhase?: TurnPhase;
  battlefieldSize?: BattlefieldDimensions;
  realBattlefield?: boolean;
  addPlayersHomeland?: boolean;
}): GameState => {
  const players = PREDEFINED_PLAYERS.slice(0, nPlayers).map((p, idx) =>
    toGamePlayer(p, idx === 0 ? 'human' : 'computer')
  );

  const stubGameState: GameState = {
    battlefield: realBattlefield ? generateMap(battlefieldSize) : generateMockMap(battlefieldSize),
    players: players,
    turn: 1,
    turnOwner: players[turnOwner].id,
    turnPhase: turnPhase,
  };

  if (addPlayersHomeland) {
    players.forEach((player, idx) => {
      stubGameState.turnOwner = player.id;
      const homeland: LandPosition = { row: 3 + (idx % 2), col: 3 + idx * 5 };
      construct(stubGameState, BuildingType.STRONGHOLD, homeland);

      const hero = getDefaultUnit(player.type) as HeroUnit;
      hero.name = player.name;
      hero.level = player.level;

      recruitHero(hero, stubGameState.battlefield.lands[battlefieldLandId(homeland)]);
    });
    stubGameState.turnOwner = players[0].id;
  }
  return stubGameState;
};
