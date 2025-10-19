package es.us.dp1.l4_04_24_25.saboteur.round;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;


@Component
public class RoundDeserializer extends JsonDeserializer<Round> {

    @Autowired
    private RoundService roundService; 

    @Override
    public Round deserialize(JsonParser p, DeserializationContext ctx) throws IOException, JacksonException {
        Round result = null;

        try {
            
            Integer roundId = p.getIntValue();
            
            result = roundService.findRound(roundId);

        } catch (Exception e) {
            
            throw new IOException("Round not found", e);
        }

        return result;
    }
}