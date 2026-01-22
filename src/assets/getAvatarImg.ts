import alaric from '../assets/avatars/alaric.png';
import morgana from '../assets/avatars/morgana.png';
import thorin from '../assets/avatars/thorin.png';
import vex from '../assets/avatars/vex.png';
import grimjaw from '../assets/avatars/grimjaw.png';
import serena from '../assets/avatars/serena.png';
import kael from '../assets/avatars/kael.png';
import elara from '../assets/avatars/elara.png';
import marcus from '../assets/avatars/marcus.png';
import lydia from '../assets/avatars/lydia.png';
import elderoak from '../assets/avatars/elderoak.png';
import valdris from '../assets/avatars/valdris.png';
import ignatius from '../assets/avatars/ignatius.png';
import ember from '../assets/avatars/ember.png';
import selene from '../assets/avatars/selene.png';
import kaer from '../assets/avatars/kaer.png';
import nullwarden from '../assets/avatars/nullwarden.png';

// pure-magic doctrine players
import sereth from '../assets/avatars/sereth.png';
import zarhka from '../assets/avatars/zarhka.png';
import ilyra from '../assets/avatars/ilyra.png';
import aelthir from '../assets/avatars/aelthir.png';
import brunna from '../assets/avatars/brunna.png';

const avatars: Record<string, string> = {
  alaric: alaric,
  morgana: morgana,
  thorin: thorin,
  vex: vex,
  grimjaw: grimjaw,
  serena: serena,
  kael: kael,
  elara: elara,
  marcus: marcus,
  lydia: lydia,
  selene: selene,
  elderoak: elderoak,
  valdris: valdris,
  ignatius: ignatius,
  ember: ember,
  kaer: kaer,
  nullwarden: nullwarden,
  sereth: sereth,
  zarhka: zarhka,
  ilyra: ilyra,
  aelthir: aelthir,
  brunna: brunna,
};

export const getAvatarImg = (name: string) => {
  return avatars[name];
};
