package es.us.dp1.l4_04_24_25.saboteur.chat;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

@Component
public class ChatDeserializer extends JsonDeserializer<Chat>{

    @Autowired
    private ChatService chatService;

    @Override
    public Chat deserialize(JsonParser p, DeserializationContext ctx) throws IOException, JacksonException{
        Chat result = null;

        try{
            Integer chatId = p.getIntValue();
            result = chatService.findChat(chatId);

        } catch (Exception e){
            throw new IOException ("active player not found");
    }

    return result;
    
}
}