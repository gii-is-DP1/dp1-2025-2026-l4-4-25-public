package es.us.dp1.l4_04_24_25.saboteur.deck;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.card.Card;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;

@Service
public class DeckService {

    private final DeckRepository deckRepository;

    @Autowired
    public DeckService(DeckRepository deckRepository) {
        this.deckRepository = deckRepository;
    }

    @Transactional
    public Deck saveDeck(@Valid Deck deck) {
        
        if (deck.getCards() != null) {
            for (Card card : deck.getCards()) {
                card.setDeck(deck);
            }
        }
        
        Deck savedDeck = deckRepository.save(deck);
        
        if (savedDeck.getActivePlayer() != null) {
            savedDeck.getActivePlayer().setDeck(savedDeck);
        }
        
        return savedDeck;
    }

    @Transactional(readOnly = true)
    public Deck findDeck(Integer id) {
        return deckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deck", "id", id));
    }

    @Transactional(readOnly = true)
    public Iterable<Deck> findAll() {
        return deckRepository.findAll();
    }

    @Transactional
    public Deck updateDeck(@Valid Deck deck, Integer idToUpdate) {
        Deck toUpdate = findDeck(idToUpdate);
        
        if (deck.getCards() != null) {

            toUpdate.getCards().clear(); 
            for (Card card : deck.getCards()) {
                card.setDeck(toUpdate);
                toUpdate.getCards().add(card);
            }
        }
        
        
        BeanUtils.copyProperties(deck, toUpdate, "id", "cards", "activePlayer"); 
    
        
        Deck updatedDeck = deckRepository.save(toUpdate);

        if (updatedDeck.getActivePlayer() != null) {
            updatedDeck.getActivePlayer().setDeck(updatedDeck);
        }
        
        return updatedDeck;
    }

    @Transactional
    public void deleteDeck(Integer id) {
        Deck toDelete = findDeck(id);
        deckRepository.delete(toDelete);
    }
    
    
    @Transactional(readOnly = true)
    public Deck findByActivePlayerId(Integer activePlayerId) {
        return deckRepository.findByActivePlayerId(activePlayerId)
                .orElseThrow(() -> new ResourceNotFoundException("Deck", "ActivePlayerId", activePlayerId));
    }
    
    @Transactional(readOnly = true)
    public Deck findDeckByCardId(Integer cardId) {
        return deckRepository.findDeckByCardId(cardId) 
                .orElseThrow(() -> new ResourceNotFoundException("Deck", "CardId", cardId));
    }

    @Transactional(readOnly = true)
    public Integer countCardsInDeck(Integer deckId) {
        findDeck(deckId); 
        return deckRepository.countCardsByDeckId(deckId);
    }
}