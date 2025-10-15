package es.us.dp1.l4_04_24_25.saboteur.message;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

public interface MessageRepository extends CrudRepository<Message, Integer> {


    @Override
    Optional<Message> findById(Integer id);

    Optional<Message> findByChatIdAndId(Integer chatId, Integer id);

    Iterable<Message> findAllByChatId(Integer chatId);

    Iterable<Message> findAllByActivePlayerId(Integer activePlayerId);

    
}
