package es.us.dp1.l4_04_24_25.saboteur.message;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;

@Service
public class MessageService {

    private MessageRepository messageRepository;

    @Autowired
    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }
    
    @Transactional
    public Message saveMessage(Message message) {
        messageRepository.save(message);
        return message;
    }

    @Transactional (readOnly = true)
    public Message findMessage(Integer id) {
        return messageRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Message","id",id));

    }

    @Transactional(readOnly = true)
    public Iterable<Message> findAll(){
        return messageRepository.findAll();
    }

    @Transactional
    public Message updateMessage(Message message, Integer idToUpdate){
        Message toUpdate = findMessage(idToUpdate);
        BeanUtils.copyProperties(message, toUpdate,"id");
        messageRepository.save(toUpdate);
        return toUpdate;
    }

    @Transactional
    public void deleteMessage(Integer id) {
        Message toDelete = findMessage(id);
        messageRepository.delete(toDelete);
    }

    @Transactional (readOnly = true)
    public Iterable<Message> findAllByChatId(Integer chatId) {
        return messageRepository.findAllByChatId(chatId);

    }

    @Transactional (readOnly = true)
    public Message findByChatIdAndId(Integer chatId, Integer id) {
        return messageRepository.findByChatIdAndId(chatId, id).orElseThrow(()-> new ResourceNotFoundException("Message","chatId and id",chatId + " and " + id));
    }

    @Transactional (readOnly = true)
    public Iterable<Message> findAllByActivePlayerId(Integer activePlayerId) {
        return messageRepository.findAllByActivePlayerId(activePlayerId);
    }





    
}
