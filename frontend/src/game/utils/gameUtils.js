import saboteurRol from '../cards-images/roles/saboteurRol.png';
import minerRol from '../cards-images/roles/minerRol.png';

export const calculateSaboteurCount = (n) => {
  if (n === 3 || n === 4) return 1;
  if (n === 5 || n === 6) return 2;
  if (n === 7 || n === 8) return 3;
  if (n === 9 || n === 10) return 4;
  if (n === 11 || n === 12) return 5;
  return 1;
};

export const assignRolesGame = (activePlayers) => {
  const n = activePlayers.length;
  const numSaboteur = calculateSaboteurCount(n);

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
    roleImg: i < numSaboteur ? saboteurRol : minerRol,
    roleName: i < numSaboteur ? 'SABOTEUR' : 'MINER'
  }));

  console.log(`🎭 Roles assigned for ${n} players: ${numSaboteur} Saboteurs, ${n - numSaboteur} Miners`);
  console.log('Roles:', roles);

  return roles;
};

export const formatTime = (seconds) => {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
};

export const calculateCardsPerPlayer = (numPlayers) => {
  if (numPlayers <= 5) return 6;
  else if (numPlayers >= 6 && numPlayers <= 7) return 5;
  else if (numPlayers >= 8 && numPlayers <= 9) return 4;
  else return 4; // Fallback para 10+ jugadores
};

export const calculateInitialDeck = (numPlayers, cardsPerPlayer) => {
  return 70 - (numPlayers * cardsPerPlayer);
};

const cleanImageName = (s) => String(s ?? '').trim().replace(/\r?\n/g, '');

const ROTATED_RE = /_rotated\.png$/i;

export const isRotatedImage = (image) => ROTATED_RE.test(cleanImageName(image));

export const getRotatedCards = (cards) =>
  (cards ?? []).filter((c) => c.rotacion === true);

export const getNonRotatedCards = (cards) =>
  (cards ?? []).filter((c) => c.rotacion !== true && c.id >= 1 && c.id <= 70);

export const findRotatedPair = (card, allCards) => {
  if (!card || !allCards || allCards.length === 0) return null;
  const isRotated = card.image && card.image.includes('_rotated.png');
  
  let targetImage;
  if (isRotated) {
    targetImage = card.image.replace('_rotated.png', '.png');
  } else {
    targetImage = card.image.replace('.png', '_rotated.png');
  }
  const pair = allCards.find(c => c.image === targetImage);
  
  return pair || null;
};

export const shuffleInPlace = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};



