package es.us.dp1.l4_04_24_25.saboteur.card;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

@Component
public class CardDeserializer extends JsonDeserializer<Card> {

    
    @Autowired
    private CardService cardService; 

    @Override
    public Card deserialize(JsonParser p, DeserializationContext ctx) throws IOException, JacksonException {
        Card result = null;

        try {
            
            Integer cardId = p.getIntValue();
            
            result = this.cardService.findCard(cardId);

        } catch (Exception e) {
            throw new IOException("Card not found", e);
        }

        return result;
    }
}