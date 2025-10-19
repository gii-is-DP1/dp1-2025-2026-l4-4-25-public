package es.us.dp1.l4_04_24_25.saboteur.tunnel;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

@Component
public class TunnelDeserializer extends JsonDeserializer<Tunnel> {

    @Autowired
    private TunnelService tunnelService;

    @Override
    public Tunnel deserialize(JsonParser p, DeserializationContext ctx) throws IOException, JacksonException {
        Tunnel result = null;

        try {
            
            Integer tunnelId = p.getIntValue();
            
            result = tunnelService.findTunnel(tunnelId);

        } catch (Exception e) {
           
            throw new IOException("Tunnel not found", e);
        }

        return result;
    }
}