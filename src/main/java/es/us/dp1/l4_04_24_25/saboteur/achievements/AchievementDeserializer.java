package es.us.dp1.l4_04_24_25.saboteur.achievements;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

@Component
public class AchievementDeserializer extends JsonDeserializer<Achievement>{

    @Autowired
    private AchievementService achievementService;
    
    @Override
    public Achievement deserialize(JsonParser p, DeserializationContext ctx) throws IOException, JacksonException{
        Achievement result = null;

        try{
            String achievementTittle = p.getText();
            result = this.achievementService.findByTittle(achievementTittle);
        } catch (Exception e){
            throw new IOException ("Achievement not found");
        }
        return result;
    }
    
}