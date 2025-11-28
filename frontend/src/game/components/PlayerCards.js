import React, { useEffect, useState } from 'react';
import { getNonRotatedCards, shuffleInPlace, calculateCardsPerPlayer } from '../utils/gameUtils';
import InteractiveCard from './InteractiveCard';

export default function PlayerCards({
  game,
  ListCards,
  activePlayers,
  postDeck,
  getDeck,
  patchDeck,
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

  useEffect(() => {
  window.getCurrentHandSize = () => hand.length;
  return () => { delete window.getCurrentHandSize };
}, [hand]);



  // Comprobar si el jugador tiene un mazo en el servidor si lo tiene hace un getDeck para cargarlo
  useEffect(() => {
    if (isSpectator) return;
    const username = currentUsername || (Array.isArray(activePlayers) ? findActivePlayerUsername(activePlayers) : null);
    if (!username) return;

    let cancelled = false;
    (async () => {
      try {
        const existing = await getDeck(username);
        if (cancelled) return;
        if (existing && Array.isArray(existing.cards) && existing.cards.length > 0) {
          setHasServerDeck(true);
        } else {
          setHasServerDeck(false);
        }
        setDeckChecked(true);
      } catch (e) {
        console.error('Error al obtener mazo existente:', e);
        setDeckChecked(true);
      }
    })();

    return () => { cancelled = true; };
  }, [currentUsername, activePlayers, isSpectator]);

  
  // Del deck seteado anteriormente se mapean las cartas para obtener la mano del jugador y se actualizan las availableCards
  useEffect(() => {
    if (!deck || !Array.isArray(deck.cards)) return;
    if (!Array.isArray(ListCards) || ListCards.length === 0) return;

    const mappedHand = deck.cards
      .map((id) => ListCards.find((c) => c.id === id))
      .filter(Boolean);
    if (mappedHand.length > 0) {
      setHand(mappedHand);
      setAvailableCards(ListCards);
    }
  }, [deck, ListCards]);


  //Cuando se entra por primera vez en la partida y no tiene mazo en el servidor se le genera uno nuevo
  useEffect(() => {
    console.log('ListCards:', ListCards);
    
    if (deckChecked && Array.isArray(ListCards) && ListCards.length > 0 && !hasServerDeck) {
      const username = currentUsername || (Array.isArray(activePlayers) ? findActivePlayerUsername(activePlayers) : null);
      console.log('Active Player Username:', username);
      if (!username) return;

      const cardsPerPlayer = calculateCardsPerPlayer(activePlayers.length);
      console.log('Número de jugadores:', activePlayers.length, 'Cartas por jugador:', cardsPerPlayer);
      
      const newHand = pickRandomNonRotated(ListCards, cardsPerPlayer);
      console.log('Generando mano:', newHand);

      const idcartas = newHand.map(card => card.id);
      postDeck(username, idcartas);
      setHand(newHand);
      setAvailableCards(ListCards);
    }
  }, [ListCards, activePlayers, hasServerDeck, deckChecked, currentUsername]);

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
