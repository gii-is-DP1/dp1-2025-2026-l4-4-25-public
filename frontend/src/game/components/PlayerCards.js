import React, { useEffect, useState, useRef } from 'react';
import { getNonRotatedCards, shuffleInPlace, calculateCardsPerPlayer, findRotatedPair } from '../utils/gameUtils';
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

  const syncServerDeck = async (nextHand) => {
    try {
      const nonRotatedHand = nextHand.map(card => {
        if (card.rotacion === true) {
          const nonRotatedVersion = findRotatedPair(card, ListCards);
          return nonRotatedVersion || card;
        }
        return card;
      });
      
      const ids = nonRotatedHand.map(card => card.id);
      await patchDeck(currentUsername, ids);
    } catch (e) {
      console.error('Error syncing deck on server:', e);
    }
  };

  
  const pickRandomNonRotated = (cards, count = 5) => {
    const pool = getNonRotatedCards(cards).slice();
    shuffleInPlace(pool);
    return pool.slice(0, Math.min(count, pool.length));
  };

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
        console.error('Error in initDeck:', e);
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

  const drawCard = () => {
    if (deckCount <= 0) {
      console.log('No more cards in the deck');
      return null;
    }
    const usedCardIds = new Set(hand.map(c => c.id));
    const availablePool = availableCards.filter(c => !usedCardIds.has(c.id));
    
    if (availablePool.length === 0) {
      console.log('No available cards to draw');
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availablePool.length);
    const drawnCard = availablePool[randomIndex];
    console.log('Card drawn:', drawnCard);
    
    return drawnCard;
  };
  useEffect(() => {
  window.getCurrentHandSize = () => hand.length;
  return () => { delete window.getCurrentHandSize };
}, [hand]);


 const removeCardAndDraw = (cardIndex) => {
  setHand(prevHand => {
    const newHand = [...prevHand];
    newHand.splice(cardIndex, 1);
    const drawnCard = drawCard();
    if (drawnCard) newHand.push(drawnCard);

    syncServerDeck(newHand);
    return newHand; 
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
    const currentCard = hand[index];
    if (!currentCard) return;

    const rotatedPair = findRotatedPair(currentCard, ListCards);
    
    if (rotatedPair) {
      setHand(prevHand => {
        const newHand = [...prevHand];
        newHand[index] = rotatedPair;
        return newHand;
      });
      setTimeout(() => {
        const updatedHand = [...hand];
        updatedHand[index] = rotatedPair;
        syncServerDeck(updatedHand);
      }, 0);
    } else {
      console.warn('⚠️ No rotated pair found for card:', currentCard.id);
    }
  };

  const handleCardReplaced = (index, newCard) => {
    setHand(prevHand => {
      const newHand = [...prevHand];
      newHand[index] = newCard;
      return newHand;
    });
  
    setCardRotations(prev => {
      const newRotations = { ...prev };
      delete newRotations[index];
      return newRotations;
    });
    setTimeout(() => {
      syncServerDeck(hand.map((c, i) => i === index ? newCard : c));
    }, 0);
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
            allCards={ListCards || []}
            onCardReplaced={handleCardReplaced}
          />
        ))}
      </div>
    </div>
  );
}
