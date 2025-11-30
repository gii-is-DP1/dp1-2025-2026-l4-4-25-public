package es.us.dp1.l4_04_24_25.saboteur.configuration.jwt;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Collections;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import es.us.dp1.l4_04_24_25.saboteur.configuration.services.UserDetailsImpl;
import es.us.dp1.l4_04_24_25.saboteur.user.Authorities;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

class JwtUtilsTests {

    private JwtUtils jwtUtils;

    
    private static final String SECRET = "EstaEsUnaClaveSecretaMuyLargaParaQueElAlgoritmoHS512NoSeQuejeEnLosTestsUnitarios_DebeSerDeAlMenos512BitsPorSeguridad";
    private static final int EXPIRATION_MS = 3600000; 

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", EXPIRATION_MS);
    }

    @Test
    void testGenerateJwtToken() {
        Authentication authentication = mock(Authentication.class);
        UserDetailsImpl userDetails = mock(UserDetailsImpl.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testUser");
        when(userDetails.getAuthorities()).thenReturn(Collections.emptyList());

        String token = jwtUtils.generateJwtToken(authentication);
        assertTrue(token != null && !token.isEmpty());
        assertEquals("testUser", jwtUtils.getUserNameFromJwtToken(token));
    }

    @Test
    void testGenerateTokenFromUsername() {
        Authorities authority = new Authorities();
        authority.setAuthority("PLAYER");
        String token = jwtUtils.generateTokenFromUsername("testUser", authority);
        
        assertTrue(token != null && !token.isEmpty());
        assertEquals("testUser", jwtUtils.getUserNameFromJwtToken(token));
    }

    @Test
    void testValidateJwtTokenValid() {
        Authorities authority = new Authorities();
        authority.setAuthority("PLAYER");
        String token = jwtUtils.generateTokenFromUsername("testUser", authority);
        assertTrue(jwtUtils.validateJwtToken(token));
    }

    @Test
    void testValidateJwtTokenInvalidSignature() {
        String token = Jwts.builder()
                .setSubject("testUser")
                .signWith(SignatureAlgorithm.HS512, "ClaveIncorrecta" + SECRET) 
                .compact();
        assertFalse(jwtUtils.validateJwtToken(token));
    }

    @Test
    void testValidateJwtTokenMalformed() {
        assertFalse(jwtUtils.validateJwtToken("token.invalido.malformado"));
    }

    @Test
    void testValidateJwtTokenExpired() {
        
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", -1000); 
        Authorities authority = new Authorities();
        authority.setAuthority("PLAYER");
        String token = jwtUtils.generateTokenFromUsername("testUser", authority);
        assertFalse(jwtUtils.validateJwtToken(token));
    }
    
    @Test
    void testValidateJwtTokenEmpty() {
        assertFalse(jwtUtils.validateJwtToken(""));
    }
    
    @Test
    void testValidateJwtTokenNull() {
        assertFalse(jwtUtils.validateJwtToken(null));
    }
}