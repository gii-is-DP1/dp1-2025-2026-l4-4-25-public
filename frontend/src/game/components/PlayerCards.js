import React, { useEffect, useState, useRef } from 'react';
import { getNonRotatedCards, shuffleInPlace, calculateCardsPerPlayer } from '../utils/gameUtils';
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
  playerCardsCount,
  setPlayerCardsCount,
  isSpectator,
  deck,
}) {
  const [hand, setHand] = useState([]);
  const [availableCards, setAvailableCards] = useState([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [hasServerDeck, setHasServerDeck] = useState(false);
  const [deckChecked, setDeckChecked] = useState(false);
  const [cardRotations, setCardRotations] = useState({}); 

  useEffect(() => {
    if (setPlayerCardsCount && !isSpectator && currentUsername) {
      setPlayerCardsCount(prev => ({
        ...prev,
        [currentUsername]: hand.length}));
      console.log('Updated card count:',currentUsername,':', hand.length);}
  }, [hand.length, setPlayerCardsCount, isSpectator, currentUsername]);

  // Se encarga de realizar el patch del deck en el servidor con la nueva mano
  const syncServerDeck = async (nextHand) => {
    try {
      const ids = nextHand.map(card => card.id);
      await patchDeck(currentUsername, ids);
    } catch (e) {
      console.error('Error sincronizando deck en servidor:', e);
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
  window.getCurrentHandSize = () => hand.length;
  return () => { delete window.getCurrentHandSize };
}, [hand]);



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
  useEffect(() => {
  window.getCurrentHandSize = () => hand.length;
  return () => { delete window.getCurrentHandSize };
}, [hand]);


 const removeCardAndDraw = (cardIndex) => {
  setHand(prevHand => {
    const newHand = [...prevHand];

    // Quita carta SIEMPRE
    newHand.splice(cardIndex, 1);

    // Intenta robar, pero si no hay mazo, NO repone carta
    const drawnCard = drawCard();
    if (drawnCard) newHand.push(drawnCard);

    syncServerDeck(newHand);
    return newHand; // Aquí sí puede quedar en 0 cartas
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

  const toggleCardRotation = (index) => {
    setCardRotations(prev => ({
      ...prev,
      [index]: prev[index] === 180 ? 0 : 180
    }));
    console.log(`🔄 Card ${index} rotated to ${cardRotations[index] === 180 ? 0 : 180}°`);
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
