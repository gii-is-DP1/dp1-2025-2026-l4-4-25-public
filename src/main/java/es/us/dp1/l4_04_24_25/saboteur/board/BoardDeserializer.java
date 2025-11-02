package es.us.dp1.l4_04_24_25.saboteur.board;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

@Component
public class BoardDeserializer extends JsonDeserializer<Board> {

    @Autowired
    private BoardService boardService; 

    @Override
    public Board deserialize(JsonParser p, DeserializationContext ctx) throws IOException, JacksonException {
        Board result = null;

        try {
           
            Integer boardId = p.getIntValue();
            
            result = boardService.findBoard(boardId);

        } catch (Exception e) {
            
            throw new IOException("Board not found", e);
        }

        return result;
    }
}