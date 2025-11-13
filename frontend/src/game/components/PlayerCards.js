import React, { useEffect, useState } from 'react';
import { getNonRotatedCards, shuffleInPlace, calculateCardsPerPlayer } from '../utils/gameUtils';
import InteractiveCard from './InteractiveCard';

export default function PlayerCards({
  game,
  ListCards,
  activePlayers,
  postDeck,
  getDeck,
  findActivePlayerUsername,
  onTunnelCardDrop,
  onActionCardUse,
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

  const pickRandomNonRotated = (cards, count = 5) => {
    const pool = getNonRotatedCards(cards).slice();
    shuffleInPlace(pool);
    return pool.slice(0, Math.min(count, pool.length));
  };

  // Intenta cargar el mazo del servidor lo antes posible (sin depender de ListCards)
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
      } catch (e) {
        console.error('Error al obtener mazo existente:', e);
      }
    })();

    return () => { cancelled = true; };
  }, [currentUsername, activePlayers, isSpectator]);

  // Cuando deck esté disponible y tengamos ListCards, mapear IDs a objetos
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

  useEffect(() => {
    console.log('ListCards:', ListCards);
    
    if (Array.isArray(ListCards) && ListCards.length > 0 && !hasServerDeck) {
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
  }, [ListCards, activePlayers, hasServerDeck]);

  // Función para robar una carta del mazo
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
        newHand.push(drawnCard);}
      
      return newHand;});};

  // Función para descartar una carta seleccionada
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
      
      return newHand;
    });
    
    setSelectedCardIndex(null);
    return true;
  };

  // Función para seleccionar/deseleccionar carta
  const toggleSelectCard = (index) => {
    setSelectedCardIndex(prev => prev === index ? null : index);
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
            playerOrder={playerOrder || []}
            currentUsername={currentUsername}
            isMyTurn={isMyTurn}
            deckCount={deckCount}
            isSelected={selectedCardIndex === i}
            onToggleSelect={toggleSelectCard}
          />
        ))}
      </div>
    </div>
  );
}
