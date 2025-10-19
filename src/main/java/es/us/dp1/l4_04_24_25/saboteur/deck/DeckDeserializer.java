package es.us.dp1.l4_04_24_25.saboteur.deck;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

@Component
public class DeckDeserializer extends JsonDeserializer<Deck> {

    @Autowired
    private DeckService deckService;

    @Override
    public Deck deserialize(JsonParser p, DeserializationContext ctx) throws IOException, JacksonException {
        Deck result = null;

        try {

            Integer deckId = p.getIntValue();
            result = deckService.findDeck(deckId);

        } catch (Exception e) {

            throw new IOException("Deck not found", e);
        }

        return result;
    }
}