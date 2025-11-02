package es.us.dp1.l4_04_24_25.saboteur.chat;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ch.qos.logback.core.joran.util.beans.BeanUtil;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;


@Service
public class ChatService {

    private ChatRepository chatRepository;

    @Autowired
    public ChatService(ChatRepository chatRepository) {
        this.chatRepository = chatRepository;
    }

    @Transactional
    public Chat saveChat(Chat chat) {
        chatRepository.save(chat);
        return chat;
    }

    @Transactional (readOnly = true)
    public Chat findChat(Integer id) {
        return chatRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Chat","id",id));
    }

    @Transactional (readOnly = true)
    public Iterable<Chat> findAll(){
        return chatRepository.findAll();
    }

    @Transactional
    public Chat updateChat(Chat chat, Integer idToUpdate){
        Chat toUpdate = findChat(idToUpdate);
        BeanUtils.copyProperties(chat, toUpdate,"id","game","messages");
        chatRepository.save(toUpdate);
        return toUpdate;
    }
    
    @Transactional
    public void deleteChat(Integer id) {
        Chat toDelete = findChat(id);
        chatRepository.delete(toDelete);
    }

    @Transactional (readOnly = true)
    public Chat findByGameId(Integer gameId) {
        return chatRepository.findByGameId(gameId).orElseThrow(()-> new ResourceNotFoundException("Chat","gameId",gameId));
    }

    
}
