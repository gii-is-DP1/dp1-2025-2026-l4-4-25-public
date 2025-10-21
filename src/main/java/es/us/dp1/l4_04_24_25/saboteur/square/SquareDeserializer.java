package es.us.dp1.l4_04_24_25.saboteur.square;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

@Component
public class SquareDeserializer extends JsonDeserializer<Square> {

    @Autowired
    private SquareService squareService; 

    @Override
    public Square deserialize(JsonParser p, DeserializationContext ctx) throws IOException, JacksonException {
        Square result = null;

        try {
            
            Integer squareId = p.getIntValue();
            
            result = squareService.findSquare(squareId);

        } catch (Exception e) {
            throw new IOException("Square not found", e);
        }

        return result;
    }
}