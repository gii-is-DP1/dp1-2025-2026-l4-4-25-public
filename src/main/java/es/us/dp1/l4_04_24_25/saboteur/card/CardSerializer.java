package es.us.dp1.l4_04_24_25.saboteur.card;

import java.io.IOException;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

@Component
public class CardSerializer extends JsonSerializer<Card> {

    @Override
    public void serialize(Card value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        if (value.getId() != null) {
            gen.writeNumber(value.getId());
        } else {
            gen.writeNull();
        }
    }
}