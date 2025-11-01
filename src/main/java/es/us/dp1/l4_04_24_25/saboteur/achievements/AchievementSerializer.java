package es.us.dp1.l4_04_24_25.saboteur.achievements;

import java.io.IOException;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

@Component
public class AchievementSerializer extends JsonSerializer<Achievement> {

    @Override
    public void serialize(Achievement value, JsonGenerator gen, SerializerProvider serializers) throws IOException{
        gen.writeString(value.getTittle());
    }
    
}