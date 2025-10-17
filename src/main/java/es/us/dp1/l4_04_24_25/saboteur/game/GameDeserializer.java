package es.us.dp1.l4_04_24_25.saboteur.game;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

@Component
public class GameDeserializer extends JsonDeserializer<Game>{

    @Autowired
    private GameService gameService;

    @Override
    public Game deserialize(JsonParser p, DeserializationContext ctx) throws IOException, JacksonException{
        Game result = null;

        try{
            Integer gameId = p.getIntValue();
            result = gameService.findGame(gameId);

        } catch (Exception e){
            throw new IOException ("active player not found");
    }

    return result;
    
}
}