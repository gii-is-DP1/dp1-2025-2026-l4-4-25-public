package es.us.dp1.l4_04_24_25.saboteur.round;

import java.io.IOException;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

@Component
public class RoundSerializer extends JsonSerializer<Round>{

    @Override
    public void serialize(Round value, JsonGenerator gen, SerializerProvider serializers) throws IOException{
        
        gen.writeNumber(value.getId());
    }
}