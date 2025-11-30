package es.us.dp1.l4_04_24_25.saboteur.request;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;

@ExtendWith(MockitoExtension.class)
class RequestServiceTests {

    @InjectMocks
    private RequestService requestService;

    @Mock
    private RequestRepository requestRepository;

    private Request request;
    private Player sender;
    private Player receiver;

    private static final int TEST_REQUEST_ID = 1;
    private static final int TEST_SENDER_ID = 10;
    private static final int TEST_RECEIVER_ID = 20;
    private static final String TEST_SENDER_USERNAME = "sender";
    private static final String TEST_RECEIVER_USERNAME = "receiver";

    @BeforeEach
    void setup() {
        sender = new Player();
        sender.setId(TEST_SENDER_ID);
        sender.setUsername(TEST_SENDER_USERNAME);

        receiver = new Player();
        receiver.setId(TEST_RECEIVER_ID);
        receiver.setUsername(TEST_RECEIVER_USERNAME);

        request = new Request();
        request.setId(TEST_REQUEST_ID);
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setStatus(RequestStatus.PENDING);
    }


    @Test
    void shouldSaveRequest() {
        when(requestRepository.save(any(Request.class))).thenReturn(request);
        Request saved = requestService.saveRequest(request);
        assertNotNull(saved);
        assertEquals(TEST_REQUEST_ID, saved.getId());
    }

    @Test
    void shouldFindRequestById() {
        when(requestRepository.findById(TEST_REQUEST_ID)).thenReturn(Optional.of(request));
        Request found = requestService.findRequest(TEST_REQUEST_ID);
        assertEquals(TEST_REQUEST_ID, found.getId());
    }

    @Test
    void shouldThrowExceptionWhenRequestNotFound() {
        when(requestRepository.findById(999)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> requestService.findRequest(999));
    }

    @Test
    void shouldFindAllRequests() {
        when(requestRepository.findAll()).thenReturn(List.of(request));
        List<Request> requests = requestService.findAll();
        assertFalse(requests.isEmpty());
        assertEquals(1, requests.size());
    }

    @Test
    void shouldUpdateRequest() {
        Request updateInfo = new Request();
        updateInfo.setStatus(RequestStatus.APPROVED);
        updateInfo.setSender(sender);
        updateInfo.setReceiver(receiver);

        when(requestRepository.findById(TEST_REQUEST_ID)).thenReturn(Optional.of(request));
        when(requestRepository.save(any(Request.class))).thenReturn(request);

        Request updated = requestService.updateRequest(TEST_REQUEST_ID, updateInfo);
        
        assertEquals(RequestStatus.APPROVED, updated.getStatus());
        verify(requestRepository).save(request);
    }

    @Test
    void shouldDeleteRequest() {
        when(requestRepository.findById(TEST_REQUEST_ID)).thenReturn(Optional.of(request));
        requestService.deleteRequest(TEST_REQUEST_ID);
        verify(requestRepository).delete(request);
    }

    @Test
    void shouldFindBySenderId() {
        when(requestRepository.findBySenderId(TEST_SENDER_ID)).thenReturn(Optional.of(request));
        Request found = requestService.findBySenderId(TEST_SENDER_ID);
        assertEquals(TEST_SENDER_ID, found.getSender().getId());
    }

    @Test
    void shouldThrowExceptionWhenSenderIdNotFound() {
        when(requestRepository.findBySenderId(999)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> requestService.findBySenderId(999));
    }

    @Test
    void shouldFindByReceiverId() {
        when(requestRepository.findByReceiverId(TEST_RECEIVER_ID)).thenReturn(Optional.of(request));
        Request found = requestService.findByReceiverId(TEST_RECEIVER_ID);
        assertEquals(TEST_RECEIVER_ID, found.getReceiver().getId());
    }

    @Test
    void shouldThrowExceptionWhenReceiverIdNotFound() {
        when(requestRepository.findByReceiverId(999)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> requestService.findByReceiverId(999));
    }

    @Test
    void shouldFindBySenderUsername() {
        when(requestRepository.findBySenderUsername(TEST_SENDER_USERNAME)).thenReturn(Optional.of(request));
        Request found = requestService.findBySenderUsername(TEST_SENDER_USERNAME);
        assertEquals(TEST_SENDER_USERNAME, found.getSender().getUsername());
    }
    
    @Test
    void shouldThrowExceptionWhenSenderUsernameNotFound() {
        when(requestRepository.findBySenderUsername("unknown")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> requestService.findBySenderUsername("unknown"));
    }

    @Test
    void shouldFindByReceiverUsername() {
        when(requestRepository.findByReceiverUsername(TEST_RECEIVER_USERNAME)).thenReturn(Optional.of(request));
        Request found = requestService.findByReceiverUsername(TEST_RECEIVER_USERNAME);
        assertEquals(TEST_RECEIVER_USERNAME, found.getReceiver().getUsername());
    }

    @Test
    void shouldThrowExceptionWhenReceiverUsernameNotFound() {
        when(requestRepository.findByReceiverUsername("unknown")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> requestService.findByReceiverUsername("unknown"));
    }

    @Test
    void shouldFindByStatusAndSenderUsername() {
        when(requestRepository.findByStatusAndSenderUsername(RequestStatus.PENDING, TEST_SENDER_USERNAME))
                .thenReturn(Optional.of(request));
        
        Request found = requestService.findByStatusAndSenderUsername(RequestStatus.PENDING, TEST_SENDER_USERNAME);
        assertEquals(RequestStatus.PENDING, found.getStatus());
    }
    
    @Test
    void shouldThrowExceptionWhenStatusAndSenderNotFound() {
        when(requestRepository.findByStatusAndSenderUsername(any(), any())).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, 
            () -> requestService.findByStatusAndSenderUsername(RequestStatus.APPROVED, "unknown"));
    }

    @Test
    void shouldFindByStatusAndReceiverUsername() {
        when(requestRepository.findByStatusAndReceiverUsername(RequestStatus.PENDING, TEST_RECEIVER_USERNAME))
                .thenReturn(Optional.of(request));
        
        Request found = requestService.findByStatusAndReceiverUsername(RequestStatus.PENDING, TEST_RECEIVER_USERNAME);
        assertEquals(RequestStatus.PENDING, found.getStatus());
    }

    @Test
    void shouldThrowExceptionWhenStatusAndReceiverNotFound() {
        when(requestRepository.findByStatusAndReceiverUsername(any(), any())).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, 
            () -> requestService.findByStatusAndReceiverUsername(RequestStatus.APPROVED, "unknown"));
    }


    @Test
    void shouldReturnTrueIfPendingRequestExistsForward() {
        
        when(requestRepository.existsBySenderAndReceiver(sender, receiver)).thenReturn(true);
        assertTrue(requestService.existsPendingRequestBetweenPlayers(sender, receiver));
    }

    @Test
    void shouldReturnTrueIfPendingRequestExistsBackward() {
        
        when(requestRepository.existsBySenderAndReceiver(sender, receiver)).thenReturn(false);
        when(requestRepository.existsBySenderAndReceiver(receiver, sender)).thenReturn(true);
        
        assertTrue(requestService.existsPendingRequestBetweenPlayers(sender, receiver));
    }

    @Test
    void shouldReturnFalseIfNoPendingRequestExists() {
        when(requestRepository.existsBySenderAndReceiver(sender, receiver)).thenReturn(false);
        when(requestRepository.existsBySenderAndReceiver(receiver, sender)).thenReturn(false);
        
        assertFalse(requestService.existsPendingRequestBetweenPlayers(sender, receiver));
    }
}