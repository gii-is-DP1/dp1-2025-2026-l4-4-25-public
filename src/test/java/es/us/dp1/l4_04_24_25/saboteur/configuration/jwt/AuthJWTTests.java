package es.us.dp1.l4_04_24_25.saboteur.configuration.jwt;

import static org.mockito.Mockito.*;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;

import es.us.dp1.l4_04_24_25.saboteur.configuration.services.UserDetailsServiceImpl;

@ExtendWith(MockitoExtension.class)
class AuthJWTTests {

    @InjectMocks
    private AuthTokenFilter authTokenFilter;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @Mock
    private UserDetails userDetails;

    @Test
    void testDoFilterInternalValidToken() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn("Bearer valid.token");
        when(jwtUtils.validateJwtToken("valid.token")).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken("valid.token")).thenReturn("user");
        when(userDetailsService.loadUserByUsername("user")).thenReturn(userDetails);

        authTokenFilter.doFilter(request, response, filterChain);

        verify(userDetailsService).loadUserByUsername("user");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testDoFilterInternalInvalidToken() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn("Bearer invalid.token");
        when(jwtUtils.validateJwtToken("invalid.token")).thenReturn(false);

        authTokenFilter.doFilter(request, response, filterChain);

        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testDoFilterInternalNoHeader() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn(null);

        authTokenFilter.doFilter(request, response, filterChain);

        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(filterChain).doFilter(request, response);
    }
}
