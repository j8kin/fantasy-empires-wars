import { BattlefieldDimensions, GameState, TurnPhase } from '../../types/GameState';
import { PlayerProfile, PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import { toGamePlayer } from './toGamePlayer';
import { generateMockMap } from './generateMockMap';
import { construct } from '../../map/building/construct';
import { BuildingType } from '../../types/Building';
import { LandPosition } from '../../map/utils/getLands';
import { placeUnitsOnMap } from './placeUnitsOnMap';
import { getDefaultUnit, HeroUnit } from '../../types/Army';
import { generateMap } from '../../map/generation/generateMap';
import { levelUpHero } from '../../map/recruiting/levelUpHero';

export const defaultBattlefieldSizeStub = { rows: 10, cols: 20 };
export const createDefaultGameStateStub = (): GameState => createGameStateStub({});

export const createGameStateStub = ({
  nPlayers = 3,
  gamePlayers,
  turnOwner = 0,
  turnPhase = TurnPhase.START,
  battlefieldSize = defaultBattlefieldSizeStub,
  realBattlefield = false,
  addPlayersHomeland = true,
}: {
  nPlayers?: number;
  gamePlayers?: PlayerProfile[];
  turnOwner?: number;
  turnPhase?: TurnPhase;
  battlefieldSize?: BattlefieldDimensions;
  realBattlefield?: boolean;
  addPlayersHomeland?: boolean;
}): GameState => {
  const players = (gamePlayers == null ? PREDEFINED_PLAYERS.slice(0, nPlayers) : gamePlayers).map(
    (p, idx) => toGamePlayer(p, idx === 0 ? 'human' : 'computer')
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
      hero.level = player.level - 1;
      levelUpHero(hero, player);

      placeUnitsOnMap(hero, stubGameState, homeland);
    });
    stubGameState.turnOwner = players[0].id;
  }
  return stubGameState;
};
