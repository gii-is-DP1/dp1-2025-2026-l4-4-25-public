package es.us.dp1.l4_04_24_25.saboteur.activePlayer;

import java.io.IOException;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

@Component
public class ActivePlayerSerializer extends JsonSerializer<ActivePlayer>{

    @Override
    public void serialize(ActivePlayer value, JsonGenerator gen, SerializerProvider serializers) throws IOException{
        
        gen.writeString(value.getUsername());
    }
}