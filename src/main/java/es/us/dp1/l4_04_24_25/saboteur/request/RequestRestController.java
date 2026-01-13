package es.us.dp1.l4_04_24_25.saboteur.request;

import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/requests")
@SecurityRequirement(name = "bearerAuth")
public class RequestRestController {

    private final RequestService requestService;
    private final ObjectMapper objectMapper;

    @Autowired
    public RequestRestController(RequestService requestService, ObjectMapper objectMapper) {
        this.requestService = requestService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<List<Request>> findAll(){
        List<Request> res;
        res = requestService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("bySenderId")
    public ResponseEntity<Request> findBySenderId(Integer senderId){
        Request res;
        res = requestService.findBySenderId(senderId);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byReceiverId")
    public ResponseEntity<Request> findByReceiverId(Integer receiverId){
        Request res;
        res = requestService.findByReceiverId(receiverId);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Request> findRequest(@PathVariable("id")Integer id){
        return new ResponseEntity<>(requestService.findRequest(id), HttpStatus.OK);
    }

    @GetMapping("bySenderUsername")
    public ResponseEntity<Request> findBySenderUsername(String senderUsername){
        Request res;
        res = requestService.findBySenderUsername(senderUsername);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byReceiverUsername")
    public ResponseEntity<Request> findByReceiverUsername(String receiverUsername){
        Request res;
        res = requestService.findByReceiverUsername(receiverUsername);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byStatusAndSenderUsername")
    public ResponseEntity<List<Request>> findByStatusAndSenderUsername(RequestStatus status, String senderUsername){
        List<Request> res;
        res = requestService.findByStatusAndSenderUsername(status, senderUsername);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byStatusAndReceiverUsername")
    public ResponseEntity<List<Request>> findByStatusAndReceiverUsername(RequestStatus status, String receiverUsername){
        List<Request> res;
        res = requestService.findByStatusAndReceiverUsername(status, receiverUsername);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Request> create(@RequestBody @Valid Request request) throws DataAccessException {

        if(request.getReceiver().equals(request.getSender())){
            throw new DataAccessException("Sender and Receiver cannot be the same") {
            };
        }

        if( requestService.existsPendingRequestBetweenPlayers(request.getSender(), request.getReceiver()) ){
            throw new DataAccessException("There is already a pending request between these players") {
            };
        }

        if( request.getStatus() != RequestStatus.PENDING ){
            throw new DataAccessException("New requests must have PENDING status") {
            };
        }

        if (request.getSender().getFriends().contains(request.getReceiver())){
            throw new DataAccessException("Sender and Receiver are already friends") {
            };
        }
        
        Request newRequest = new Request();
        Request savedRequest;
        BeanUtils.copyProperties(request, newRequest, "id" );
        savedRequest = requestService.saveRequest(newRequest);
        return new ResponseEntity<>(savedRequest, HttpStatus.CREATED);
    }

    @PutMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Request> update(@PathVariable("id") Integer id, @RequestBody @Valid Request request) {
        RestPreconditions.checkNotNull(requestService.findRequest(id), "Request", "ID", id);
        return new ResponseEntity<>(requestService.updateRequest(id, request), HttpStatus.OK);
    }

    @PatchMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Request> patch(@PathVariable("id") Integer id, @RequestBody Map<String, Object> updates)  throws JsonMappingException{
        RestPreconditions.checkNotNull(requestService.findRequest(id), "Request", "ID", id);
        Request request = requestService.findRequest(id);
        Request requestPatched = objectMapper.updateValue(request, updates);
        requestService.updateRequest(id, requestPatched);
        return new ResponseEntity<>(requestPatched, HttpStatus.OK);   
    }

    @DeleteMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("id") int id) {
        RestPreconditions.checkNotNull(requestService.findRequest(id), "Request", "ID", id);
        requestService.deleteRequest(id);
        return new ResponseEntity<>(new MessageResponse("Request deleted!"), HttpStatus.OK);
    }


        
}
