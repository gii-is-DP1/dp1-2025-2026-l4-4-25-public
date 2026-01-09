package es.us.dp1.l4_04_24_25.saboteur.request;


import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import es.us.dp1.l4_04_24_25.saboteur.player.Player;

public interface RequestRepository extends CrudRepository<Request, Integer> {

    @Override
    Optional<Request> findById(Integer id);
    
    Optional<Request> findBySenderId(Integer senderId);

    Optional<Request> findByReceiverId(Integer receiverId);

    Optional<Request> findBySenderUsername (String senderUsername);

    Optional<Request> findByReceiverUsername (String receiverUsername);

    List<Request> findByStatusAndSenderUsername (RequestStatus status, String senderUsername);

    List<Request> findByStatusAndReceiverUsername (RequestStatus status, String receiverUsername);

    boolean existsBySenderAndReceiver(Player sender, Player receiver);
    
}
