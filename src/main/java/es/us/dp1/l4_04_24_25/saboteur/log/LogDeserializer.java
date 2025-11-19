package es.us.dp1.l4_04_24_25.saboteur.log;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

@Component
public class LogDeserializer extends JsonDeserializer<Log>{

    @Autowired
    private LogService logService;

    @Override
    public Log deserialize(JsonParser p, DeserializationContext ctx) throws IOException, JacksonException{
        Log result = null;
        try{
            Integer logId = p.getIntValue();
            result = logService.findLog(logId);

        } catch (Exception e){
            throw new IOException ("Log not found");
    }

    return result;
    
}
}