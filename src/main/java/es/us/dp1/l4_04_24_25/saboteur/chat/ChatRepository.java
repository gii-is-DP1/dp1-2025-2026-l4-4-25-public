package es.us.dp1.l4_04_24_25.saboteur.chat;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

public interface ChatRepository extends CrudRepository<Chat, Integer> {

    @Override
    Optional<Chat> findById(Integer id);
    
    Optional<Chat> findByGameId(Integer gameId);

    Iterable<Chat> findAllByGameId(Integer gameId);

    


}
