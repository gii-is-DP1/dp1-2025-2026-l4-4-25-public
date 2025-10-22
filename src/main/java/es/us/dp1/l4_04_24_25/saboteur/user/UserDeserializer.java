package es.us.dp1.l4_04_24_25.saboteur.user;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

@Component
public class UserDeserializer extends JsonDeserializer<User>{

    @Autowired
    private UserService userService;

    @Override
    public User deserialize(JsonParser p, DeserializationContext ctx) throws IOException, JacksonException{
        User result = null;

        try{
            String activePlayerUsername = p.getText();
            result = this.userService.findByUsername(activePlayerUsername);

        } catch (Exception e){
            throw new IOException ("active player not found");
    }

    return result;
    
}
}