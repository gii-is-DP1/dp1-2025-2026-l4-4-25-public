package es.us.dp1.l4_04_24_25.saboteur.deck;



import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;

@Service
public class DeckService {

    private DeckRepository deckRepository;

    @Autowired
    public DeckService(DeckRepository deckRepository) {
        this.deckRepository = deckRepository;
    }

    @Transactional
    public Deck saveDeck(Deck deck){
        deckRepository.save(deck);
        return deck;
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
        BeanUtils.copyProperties(deck, toUpdate, "id");
        deckRepository.save(toUpdate);
        return toUpdate;
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
    public Integer countCardsInDeck(Integer deckId) {
        findDeck(deckId); 
        return deckRepository.countCardsByDeckId(deckId);
    }
}