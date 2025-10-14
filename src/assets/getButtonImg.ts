import { ButtonName } from '../types/ButtonName';
import BuildImg from './buttons/Build.png';
import CancelImg from './buttons/Cancel.png';
import CastImg from './buttons/Cast.png';
import EndOfTurnImg from './buttons/EndOfTurn.png';
import LoadGameImg from './buttons/LoadGame.png';
import MoveImg from './buttons/Move.png';
import NewGameImg from './buttons/NewGame.png';
import OkImg from './buttons/Ok.png';
import QuestImg from './buttons/Quest.png';
import RecruitImg from './buttons/Recruit.png';
import SaveGameImg from './buttons/SaveGame.png';
import StartGameImg from './buttons/StartGame.png';

export const getButtonImg = (name: ButtonName): string => {
  switch (name) {
    case ButtonName.BUILD:
      return BuildImg;
    case ButtonName.CANCEL:
      return CancelImg;
    case ButtonName.CAST:
      return CastImg;
    case ButtonName.TURN:
      return EndOfTurnImg;
    case ButtonName.LOAD:
      return LoadGameImg;
    case ButtonName.MOVE:
      return MoveImg;
    case ButtonName.NEW:
      return NewGameImg;
    case ButtonName.OK:
      return OkImg;
    case ButtonName.QUEST:
      return QuestImg;
    case ButtonName.RECRUIT:
      return RecruitImg;
    case ButtonName.SAVE:
      return SaveGameImg;
    case ButtonName.START:
      return StartGameImg;
    default:
      return OkImg;
  }
};
