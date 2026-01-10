package es.us.dp1.l4_04_24_25.saboteur.configuration.jwt;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.Collections;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import es.us.dp1.l4_04_24_25.saboteur.configuration.services.UserDetailsImpl;

@ExtendWith(MockitoExtension.class)
class JwtComponentsTests {

    @InjectMocks
    private JwtUtils jwtUtils;

    @Mock
    private Authentication authentication;

    @Test
    void testGenerateAndValidateToken() {
        // Set properties
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret",
                "mySuperSecretKeyThatIsLongEnoughToSatisfyHS512AlgorithmRequirements");
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000);

        // Mock Authentication
        UserDetailsImpl userPrincipal = new UserDetailsImpl(1, "testuser", "password", Collections.emptyList());
        when(authentication.getPrincipal()).thenReturn(userPrincipal);

        // Generate Token
        String token = jwtUtils.generateJwtToken(authentication);
        assertNotNull(token);
        assertTrue(token.length() > 0);

        // Validate Token
        assertTrue(jwtUtils.validateJwtToken(token));

        // Get Username
        String username = jwtUtils.getUserNameFromJwtToken(token);
        assertEquals("testuser", username);
    }
}
