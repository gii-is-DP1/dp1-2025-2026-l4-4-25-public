package es.us.dp1.l4_04_24_25.saboteur.card;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;

@Service
public class CardService {

    private final CardRepository cardRepository;

    @Autowired
    public CardService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    @Transactional
    public Card saveCard(@Valid Card card) {
        cardRepository.save(card);
        return card;
    }

    @Transactional(readOnly = true)
    public Card findCard(Integer id) {
        return cardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Card", "id", id));
    }

    @Transactional(readOnly = true)
    public Iterable<Card> findAll() {
        return cardRepository.findAll();
    }

    @Transactional
    public Card updateCard(@Valid Card card, Integer idToUpdate) {
        Card toUpdate = findCard(idToUpdate);
        BeanUtils.copyProperties(card, toUpdate, "id");
        cardRepository.save(toUpdate);
        return toUpdate;
    }

    @Transactional
    public void deleteCard(Integer id) {
        Card toDelete = findCard(id);
        cardRepository.delete(toDelete);
    }
}