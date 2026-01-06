package es.us.dp1.l4_04_24_25.saboteur.request;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;

@Service
public class RequestService {

    private final RequestRepository requestRepository;
    
    @Autowired
    public RequestService(RequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }

    @Transactional
    public Request saveRequest(Request request) {
        requestRepository.save(request);
        return request;
    }

    @Transactional
    public Request findRequest(Integer id) {
        return requestRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Request", "id", id));
    }

    @Transactional(readOnly = true)
    public List<Request> findAll() {
        return (List<Request>) requestRepository.findAll();
    }

    @Transactional
    public void deleteRequest(Integer id) {
        Request request = findRequest(id);
        requestRepository.delete(request);
    }

    @Transactional
    public Request updateRequest(Integer id, Request updatedRequest) {
        Request existingRequest = findRequest(id);
        existingRequest.setStatus(updatedRequest.getStatus());
        existingRequest.setSender(updatedRequest.getSender());
        existingRequest.setReceiver(updatedRequest.getReceiver());
        requestRepository.save(existingRequest);
        return existingRequest;
    }

    @Transactional(readOnly = true)
    public Request findBySenderId(Integer senderId) {
        return requestRepository.findBySenderId(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Request", "senderId", senderId));
    }

    @Transactional(readOnly = true)
    public Request findByReceiverId(Integer receiverId) {
        return requestRepository.findByReceiverId(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("Request", "receiverId", receiverId));
    }

    @Transactional(readOnly = true)
    public Request findBySenderUsername(String senderUsername) {
        return requestRepository.findBySenderUsername(senderUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Request", "senderUsername", senderUsername));
    }

    @Transactional(readOnly = true)
    public Request findByReceiverUsername(String receiverUsername) {
        return requestRepository.findByReceiverUsername(receiverUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Request", "receiverUsername", receiverUsername));
    }

    @Transactional(readOnly = true)
    public List<Request> findByStatusAndSenderUsername(RequestStatus status, String senderUsername) {
        return requestRepository.findByStatusAndSenderUsername(status, senderUsername);
    }

    @Transactional(readOnly = true)
    public List<Request> findByStatusAndReceiverUsername(RequestStatus status, String receiverUsername) {
        return requestRepository.findByStatusAndReceiverUsername(status, receiverUsername);
    }

    @Transactional(readOnly = true)
    public boolean existsPendingRequestBetweenPlayers(Player sender, Player receiver) {
        return requestRepository.existsBySenderAndReceiver(sender, receiver) ||
               requestRepository.existsBySenderAndReceiver(receiver, sender);
    }

}