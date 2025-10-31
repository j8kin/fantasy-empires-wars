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

export const getAvatarImg = (name: string) => {
  switch (name) {
    case 'alaric':
      return alaric;
    case 'morgana':
      return morgana;
    case 'thorin':
      return thorin;
    case 'vex':
      return vex;
    case 'grimjaw':
      return grimjaw;
    case 'serena':
      return serena;
    case 'kael':
      return kael;
    case 'elara':
      return elara;
    case 'marcus':
      return marcus;
    case 'lydia':
      return lydia;
    case 'selene':
      return selene;
    case 'elderoak':
      return elderoak;
    case 'valdris':
      return valdris;
    case 'ignatius':
      return ignatius;
    case 'ember':
      return ember;
    case 'kaer':
      return kaer;
    default:
      return undefined;
  }
};
