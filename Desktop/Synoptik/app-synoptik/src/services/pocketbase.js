
import PocketBase from 'pocketbase';

// En local sur localhost/127.0.0.1, on cible le serveur VPS distant.
// En production sur synoptik.timeobinda.fr, on utilise window.location.origin.
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '[::1]'
);

const PB_SERVER_URL = isLocalhost
  ? 'https://synoptik.timeobinda.fr'
  : window.location.origin;

export const pb = new PocketBase(PB_SERVER_URL);
pb.autoCancellation(false);
