package es.us.dp1.l4_04_24_25.saboteur.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Collection;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.auth.payload.request.SignupRequest;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;

@Epic("Users & Admin Module")
@Feature("Authentication")
@SpringBootTest
@AutoConfigureTestDatabase
class AuthServiceTests {

    @Autowired
    private AuthService authService;
    
    @Autowired
    private ActivePlayerService activePlayerService;

    @Test
    @Transactional
    void shouldCreateAdminUser() {
        SignupRequest request = createRequest("ADMIN", "newAdminUser");
        int countBefore = ((Collection<ActivePlayer>) this.activePlayerService.findAll()).size();
        
        this.authService.createUser(request);
        
        int countAfter = ((Collection<ActivePlayer>) this.activePlayerService.findAll()).size();
        assertEquals(countBefore + 1, countAfter);
    }

    @Test
    @Transactional
    void shouldCreatePlayerUser() {
        SignupRequest request = createRequest("PLAYER", "newPlayerUser");
        int countBefore = ((Collection<ActivePlayer>) this.activePlayerService.findAll()).size();
        
        this.authService.createUser(request);
        
        int countAfter = ((Collection<ActivePlayer>) this.activePlayerService.findAll()).size();
        assertEquals(countBefore + 1, countAfter);
    }
    
    @Test
    void shouldThrowExceptionForFutureBirthDate() {
        SignupRequest request = createRequest("PLAYER", "futureUser");
        request.setBirthDate("2099-01-01"); 
        
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            this.authService.createUser(request);
        });
        assertEquals("Birth date must be before current date", exception.getMessage());
    }

    @Test
    void shouldThrowExceptionForInvalidDateFormat() {
        SignupRequest request = createRequest("PLAYER", "badDateUser");
        request.setBirthDate("fecha-invalida"); 
        
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            this.authService.createUser(request);
        });
        assertEquals("Invalid birth date format. Expected yyyy-MM-dd", exception.getMessage());
    }

    private SignupRequest createRequest(String auth, String username) {
        SignupRequest request = new SignupRequest();
        request.setUsername(username);
        request.setPassword("password123");
        request.setName("Test User");
        request.setBirthDate("2000-01-01");
        request.setEmail(username + "@example.com");
        request.setImage("https://example.com/avatar.png");
        request.setAuthority(auth);
        
        return request;
    }
}