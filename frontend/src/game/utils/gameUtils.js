import saboteurRol from '../cards-images/roles/saboteurRol.png';
import minerRol from '../cards-images/roles/minerRol.png';

export const assignRolesGame = (activePlayers) => {
  const n = activePlayers.length;
  let numSaboteur = 0;
  let numMiner = 0;

  if (n === 1) { numSaboteur = 1; numMiner = 3; }
  else if (n === 4) { numSaboteur = 1; numMiner = 3; }
  else if (n === 5) { numSaboteur = 2; numMiner = 3; }
  else if (n === 6) { numSaboteur = 2; numMiner = 4; }
  else if (n === 7) { numSaboteur = 3; numMiner = 4; }
  else if (n === 8) { numSaboteur = 3; numMiner = 5; }
  else if (n === 9) { numSaboteur = 4; numMiner = 5; }
  else if (n === 10) { numSaboteur = 4; numMiner = 6; }
  else if (n === 11) { numSaboteur = 5; numMiner = 6; }
  else if (n === 12) { numSaboteur = 5; numMiner = 7; }

  const shuffleArray = (array) => {
    const res = [...array];
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  };

  const shuffledPlayers = shuffleArray(activePlayers);
  const roles = shuffledPlayers.map((p, i) => ({
    username: p.username || p,
    role: i < numSaboteur ? 'SABOTEUR' : 'MINER',
    roleImg: i < numSaboteur ? saboteurRol : minerRol
  }));

  return roles;
};

export const formatTime = (seconds) => {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
};

export const calculateCardsPerPlayer = (numPlayers) => {
  if (numPlayers <= 5) return 6;
  else if (numPlayers <= 9 && numPlayers > 6) return 5;
  else return 4;
};

export const calculateInitialDeck = (numPlayers, cardsPerPlayer) => {
  return 60 - (numPlayers * cardsPerPlayer);
};

const cleanImageName = (s) => String(s ?? '').trim().replace(/\r?\n/g, '');

const ROTATED_RE = /_rotated\.png$/i;

export const isRotatedImage = (image) => ROTATED_RE.test(cleanImageName(image));

// Cartas cuya imagen termina en "_rotated.png"
export const getRotatedCards = (cards) =>
  (cards ?? []).filter((c) => isRotatedImage(c.image));

// Cartas cuya imagen NO termina en "_rotated.png"
export const getNonRotatedCards = (cards) =>
  (cards ?? []).filter((c) => !isRotatedImage(c.image));

//Elegir cartas al azar
export const shuffleInPlace = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};



