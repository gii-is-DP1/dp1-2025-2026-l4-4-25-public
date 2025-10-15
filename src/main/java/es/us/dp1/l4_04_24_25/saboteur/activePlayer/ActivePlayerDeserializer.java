package es.us.dp1.l4_04_24_25.saboteur.activePlayer;

import java.io.IOException;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

@Component
public class ActivePlayerDeserializer extends JsonDeserializer<ActivePlayer>{

    @Autowired
    private ActivePlayerService activePlayerService;

    @Override
    public ActivePlayer deserialize(JsonParser p, DeserializationContext ctx) throws IOException, JacksonException{
        ActivePlayer result = null;

        try{
            String activePlayerUsername = p.getText();
            result = this.activePlayerService.findByUsername(activePlayerUsername);

        } catch (Exception e){
            throw new IOException ("active player not found");
    }

    return result;
    
}
}