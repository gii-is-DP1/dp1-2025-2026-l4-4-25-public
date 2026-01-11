package es.us.dp1.l4_04_24_25.saboteur.configuration.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.user.User;
import es.us.dp1.l4_04_24_25.saboteur.user.Authorities;
import es.us.dp1.l4_04_24_25.saboteur.user.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserDetailsTests {
    @Mock
    UserRepository userRepository;
    @InjectMocks
    UserDetailsServiceImpl service;

    @Test
    void testLoadUserByUsername() {
        User user = new User();
        user.setId(1);
        user.setUsername("u");
        user.setPassword("p");
        Authorities auth = new Authorities();
        auth.setAuthority("ADMIN");
        user.setAuthority(auth);

        when(userRepository.findByUsername("u")).thenReturn(Optional.of(user));

        UserDetails ud = service.loadUserByUsername("u");
        assertNotNull(ud);
        assertEquals("u", ud.getUsername());
        assertEquals("p", ud.getPassword());
        assertTrue(ud.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ADMIN")));

        // Test UserDetailsImpl methods
        assertTrue(ud.isAccountNonExpired());
        assertTrue(ud.isAccountNonLocked());
        assertTrue(ud.isCredentialsNonExpired());
        assertTrue(ud.isEnabled());

        UserDetails ud2 = service.loadUserByUsername("u");
        assertEquals(ud, ud2);
        assertEquals(ud.hashCode(), ud2.hashCode());
    }

    @Test
    void testLoadUserNotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());
        assertThrows(UsernameNotFoundException.class, () -> service.loadUserByUsername("unknown"));
    }
}
