package es.us.dp1.l4_04_24_25.saboteur.message;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
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

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.chat.Chat;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;

@ExtendWith(MockitoExtension.class)
class MessageServiceTests {

    @Mock
    private MessageRepository messageRepository;

    @InjectMocks
    private MessageService messageService;

    private Message message;
    private Chat chat;
    private ActivePlayer activePlayer;

    @BeforeEach
    void setup() {
        
        chat = new Chat();
        chat.setId(1);

        activePlayer = new ActivePlayer();
        activePlayer.setId(1);

        message = new Message();
        message.setId(1);
        message.setContent("Hello World");
        message.setChat(chat);
        message.setActivePlayer(activePlayer);
    }

    @Test
    void shouldSaveMessage() {
        
        when(messageRepository.save(any(Message.class))).thenReturn(message);
        Message savedMessage = messageService.saveMessage(message);
        assertThat(savedMessage).isNotNull();
        assertThat(savedMessage.getContent()).isEqualTo("Hello World");
        verify(messageRepository).save(message);
    }

    @Test
    void shouldFindMessageById() {
        
        when(messageRepository.findById(1)).thenReturn(Optional.of(message));
        Message result = messageService.findMessage(1);
        assertThat(result).isEqualTo(message);
        verify(messageRepository).findById(1);
    }

    @Test
    void shouldThrowExceptionWhenMessageNotFound() {
        
        when(messageRepository.findById(99)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> messageService.findMessage(99));
    }

    @Test
    void shouldFindAllMessages() {
        
        when(messageRepository.findAll()).thenReturn(List.of(message));
        Iterable<Message> result = messageService.findAll();
        assertThat(result).hasSize(1);
        verify(messageRepository).findAll();
    }

    @Test
    void shouldUpdateMessage() {
        
        Message updateInfo = new Message();
        updateInfo.setContent("Updated Content");
        when(messageRepository.findById(1)).thenReturn(Optional.of(message));
        when(messageRepository.save(any(Message.class))).thenReturn(message);

        Message updatedMessage = messageService.updateMessage(updateInfo, 1);

        assertThat(updatedMessage.getContent()).isEqualTo("Updated Content");
        verify(messageRepository).save(message);
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistentMessage() {
        
        Message updateInfo = new Message();
        when(messageRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> messageService.updateMessage(updateInfo, 99));
    }

    @Test
    void shouldDeleteMessage() {
        
        when(messageRepository.findById(1)).thenReturn(Optional.of(message));
        doNothing().when(messageRepository).delete(message);

        messageService.deleteMessage(1);

        verify(messageRepository).delete(message);
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistentMessage() {
        
        when(messageRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> messageService.deleteMessage(99));
    }

    @Test
    void shouldFindAllByChatId() {
        
        when(messageRepository.findAllByChatId(1)).thenReturn(List.of(message));
        Iterable<Message> result = messageService.findAllByChatId(1);
        assertThat(result).isNotEmpty();
        verify(messageRepository).findAllByChatId(1);
    }

    @Test
    void shouldFindAllByActivePlayerId() {
        
        when(messageRepository.findAllByActivePlayerId(1)).thenReturn(List.of(message));

        Iterable<Message> result = messageService.findAllByActivePlayerId(1);
        assertThat(result).isNotEmpty();
        verify(messageRepository).findAllByActivePlayerId(1);
    }

    @Test
    void shouldFindByChatIdAndId() {
       
        when(messageRepository.findByChatIdAndId(1, 1)).thenReturn(Optional.of(message));
        Message result = messageService.findByChatIdAndId(1, 1);

        assertThat(result).isEqualTo(message);
        verify(messageRepository).findByChatIdAndId(1, 1);
    }

    @Test
    void shouldThrowExceptionWhenFindByChatIdAndIdNotFound() {
       
        when(messageRepository.findByChatIdAndId(1, 99)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> messageService.findByChatIdAndId(1, 99));
    }
}