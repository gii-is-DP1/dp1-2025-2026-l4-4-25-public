package es.us.dp1.l4_04_24_25.saboteur.message;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

@Component
public class MessageDeserializer extends JsonDeserializer<Message>{

    @Autowired
    private MessageService messageService;

    @Override
    public Message deserialize(JsonParser p, DeserializationContext ctx) throws IOException, JacksonException{
        Message result = null;

        try{
            Integer messageId = p.getIntValue();
            result = messageService.findMessage(messageId);
        }catch (Exception e){
            throw new IOException ("message not found");
        }
        return result;
    }
    
}
