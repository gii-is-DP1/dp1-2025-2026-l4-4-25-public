import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { getNonRotatedCards, shuffleInPlace, calculateCardsPerPlayer, isRotatedImage } from '../utils/gameUtils';
import InteractiveCard from './InteractiveCard';

export default function PlayerCards({
  game,
  ListCards,
  activePlayers,
  postDeck,
  getDeck,
  patchDeck,
  fetchOtherPlayerDeck,
  findActivePlayerUsername,
  onTunnelCardDrop,
  onActionCardUse,
  onMapCardUse,
  playerOrder,
  currentUsername,
  currentPlayer,
  deckCount,
  CardPorPlayer,
  isSpectator,
  deck,
}) {
  const [hand, setHand] = useState([]);
  const [availableCards, setAvailableCards] = useState([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [hasServerDeck, setHasServerDeck] = useState(false);
  const [deckChecked, setDeckChecked] = useState(false);
  const [cardRotations, setCardRotations] = useState({}); 

  const normalizeImagePath = (imagePath = '') =>
    String(imagePath || '')
      .split('?')[0]
      .trim()
      .toLowerCase();

  const fileName = (imagePath = '') => {
    const normalized = normalizeImagePath(imagePath);
    const parts = normalized.split('/');
    return parts[parts.length - 1];
  };

  const coreName = (name = '') =>
    fileName(name)
      .replace(/_rotated(?=\.[a-z]+$)/i, '')
      .replace(/\.(png|jpe?g)$/i, '');

  const resolveDeckUsername = () => {
    if (currentUsername) return currentUsername;
    if (Array.isArray(activePlayers)) {
      return findActivePlayerUsername(activePlayers);
    }
    return null;
  };

  const buildRotatedImageName = (imagePath) => {
    const cleaned = fileName(imagePath);
    if (!cleaned.match(/\.(png|jpe?g)$/i)) return null;
    return cleaned.replace(/\.(png|jpe?g)$/i, '_rotated.png');
  };

  const buildBaseImageName = (imagePath) => {
    const cleaned = fileName(imagePath);
    if (!cleaned.toLowerCase().includes('_rotated')) return null;
    return cleaned.replace(/_rotated(\.(png|jpe?g))$/i, '$1');
  };

  const findRotationPair = (card) => {
    if (!card?.image) return null;

    const currentPath = normalizeImagePath(card.image);
    const currentFile = fileName(currentPath);
    const currentCore = coreName(currentFile);
    const lookingForRotated = !isRotatedImage(currentPath);

    const targetName = lookingForRotated
      ? buildRotatedImageName(currentFile)
      : buildBaseImageName(currentFile);

    const pool = [
      ...(Array.isArray(ListCards) ? ListCards : []),
      ...(Array.isArray(availableCards) ? availableCards : []),
      ...(Array.isArray(hand) ? hand : [])
    ];

    const match = pool.find(candidate => {
      if (!candidate?.image) return false;
      if (candidate.id === card.id) return false;
      const candidatePath = normalizeImagePath(candidate.image);
      const candidateFile = fileName(candidatePath);
      const candidateCore = coreName(candidateFile);
      const coreMatch = candidateCore === currentCore && candidateFile !== currentFile;
      const targetMatch = targetName ? candidateFile === targetName : false;
      return coreMatch || targetMatch;
    });

    return match;
  };


  // Se encarga de realizar el patch del deck en el servidor con la nueva mano
  const syncServerDeck = async (nextHand) => {
    const username = resolveDeckUsername();
    if (!username) return false;
    const ids = nextHand.map(card => card.id);
    try {
      const result = await patchDeck(username, ids);
      return !!result;
    } catch (e) {
      console.error('Error sincronizando deck en servidor:', e);
      return false;
    }
  };

  const pickRandomNonRotated = (cards, count = 5) => {
    const pool = getNonRotatedCards(cards).slice();
    shuffleInPlace(pool);
    return pool.slice(0, Math.min(count, pool.length));
  };

  // Comprobar si el jugador tiene un mazo en el servidor, si no lo tiene, crearlo
  const deckInitializedRef = useRef(false);
  
  useEffect(() => {
    if (isSpectator) return;
    if (!Array.isArray(ListCards) || ListCards.length === 0) return;
    if (!activePlayers || activePlayers.length === 0) return;
    if (hand.length > 0) return;
    if (deckInitializedRef.current) return;
    
    const username = currentUsername || findActivePlayerUsername(activePlayers);
    if (!username) return;

    deckInitializedRef.current = true;
    
    const initDeck = async () => {
      try {
        const existing = await getDeck(username);
        const cardsPerPlayer = calculateCardsPerPlayer(activePlayers.length);
        
        if (existing && Array.isArray(existing.cards) && existing.cards.length === cardsPerPlayer) {
          const mappedHand = existing.cards
            .map((id) => ListCards.find((c) => c.id === id))
            .filter(Boolean);
          
          if (mappedHand.length === cardsPerPlayer) {
            setHand(mappedHand);
            setAvailableCards(ListCards);
          } else {
            await createNewDeck(username, cardsPerPlayer);
          }
        } else {
          await createNewDeck(username, cardsPerPlayer);
        }
      } catch (e) {
        console.error('Error en initDeck:', e);
        deckInitializedRef.current = false;
      }
    };
    
    const createNewDeck = async (username, cardsPerPlayer) => {
      const newHand = pickRandomNonRotated(ListCards, cardsPerPlayer);
      
      if (newHand.length > 0) {
        const idcartas = newHand.map(card => card.id);
        await postDeck(username, idcartas);
        setHand(newHand);
        setAvailableCards(ListCards);
      }
    };
    
    initDeck();
  }, [currentUsername, activePlayers, isSpectator, ListCards]);

  // Función para coger una carta del mazo
  const drawCard = () => {
    if (deckCount <= 0) {
      console.log('No hay más cartas en el mazo');
      return null;
    }
    const usedCardIds = new Set(hand.map(c => c.id));
    const availablePool = availableCards.filter(c => !usedCardIds.has(c.id));
    
    if (availablePool.length === 0) {
      console.log('No hay cartas disponibles para robar');
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availablePool.length);
    const drawnCard = availablePool[randomIndex];
    console.log('Carta robada:', drawnCard);
    
    return drawnCard;
  };

  const removeCardAndDraw = (cardIndex) => {
    setHand(prevHand => {
      const newHand = [...prevHand];
      newHand.splice(cardIndex, 1);
      const drawnCard = drawCard();
      if (drawnCard) {
        newHand.push(drawnCard);
      }
      // Sincroniza servidor con la nueva mano
      syncServerDeck(newHand);
      return newHand;
    });
    

    setCardRotations(prev => {
      const newRotations = {};
      Object.keys(prev).forEach(key => {
        const idx = parseInt(key);
        if (idx < cardIndex) {
          newRotations[idx] = prev[idx];
        } else if (idx > cardIndex) {
          newRotations[idx - 1] = prev[idx];
        }
      });
      return newRotations;
    });
  };

  const discardCard = () => {
    if (selectedCardIndex === null) {
      console.log('No card selected to discard');
      return false;
    }
    
    setHand(prevHand => {
      const newHand = [...prevHand];
      newHand.splice(selectedCardIndex, 1);
      const drawnCard = drawCard();
      if (drawnCard) {
        newHand.push(drawnCard);
      }
      // Sincroniza servidor con la nueva mano
      syncServerDeck(newHand);
      return newHand;
    });
    
    setSelectedCardIndex(null);
    return true;
  };

  const toggleSelectCard = (index) => {
    setSelectedCardIndex(prev => prev === index ? null : index);
  };

  const toggleCardRotation = async (index) => {
    const currentCard = hand[index];
    if (!currentCard) return;

    const counterpart = findRotationPair(currentCard);

    if (counterpart) {
      const newHand = [...hand];
      newHand[index] = counterpart;
      setHand(newHand);
      setCardRotations(prev => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
      const success = await syncServerDeck(newHand);
      if (!success) {
        toast.error('Failed to sync rotation with server');
      }
      return;
    }

    // No hay carta rotada en el backend, usar rotación visual CSS
    console.warn('[rotation] No rotated card found for:', fileName(currentCard.image));
    const toggledRotation = (cardRotations[index] || 0) === 180 ? 0 : 180;
    setCardRotations(prev => ({
      ...prev,
      [index]: toggledRotation
    }));
  };

  useEffect(() => {
    window.removeCardAndDraw = removeCardAndDraw;
    window.discardSelectedCard = discardCard;
    return () => {
      delete window.removeCardAndDraw;
      delete window.discardSelectedCard;
    };
  });

  const isMyTurn = currentUsername === currentPlayer;

  return (
    <div className="player-cards">
      <div className="cards-label">MY CARDS ({hand.length})</div>
      <div className="cards-list">
        {hand.map((card, i) => (
          <InteractiveCard
            key={card.id ?? `${card.image}-${i}`}
            card={card}
            index={i}
            onTunnelCardDrop={onTunnelCardDrop}
            onActionCardUse={onActionCardUse}
            onMapCardUse={onMapCardUse}
            playerOrder={playerOrder || []}
            currentUsername={currentUsername}
            isMyTurn={isMyTurn}
            deckCount={deckCount}
            isSelected={selectedCardIndex === i}
            onToggleSelect={toggleSelectCard}
            rotation={cardRotations[i] || 0}
            onToggleRotation={toggleCardRotation}
          />
        ))}
      </div>
    </div>
  );
}
