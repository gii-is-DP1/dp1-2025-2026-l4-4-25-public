package es.us.dp1.l4_04_24_25.saboteur.user;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.WebSecurityConfigurer;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;

import es.us.dp1.l4_04_24_25.saboteur.achievements.AchievementService;
import es.us.dp1.l4_04_24_25.saboteur.configuration.SecurityConfiguration;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.AccessDeniedException;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;

@Epic("Users & Admin Module")
@Feature("Users Management")
@Owner("DP1-tutors")
@WebMvcTest(controllers = UserRestController.class, 
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = WebSecurityConfigurer.class), 
    excludeAutoConfiguration = SecurityConfiguration.class)
class UserControllerTests {

    private static final int TEST_USER_ID = 1;
    private static final int TEST_AUTH_ID = 1;
    private static final String BASE_URL = "/api/v1/users";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private AuthoritiesService authService;

    
    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private AchievementService achievementService;

    private Authorities auth;
    private User user;
    private UserDTO userDTO;

    @BeforeEach
    void setup() {
        auth = new Authorities();
        auth.setId(TEST_AUTH_ID);
        auth.setAuthority("PLAYER");

        user = new User();
        user.setId(TEST_USER_ID);
        user.setUsername("user");
        user.setPassword("password");
        user.setName("User Name");
        user.setBirthDate("2000-01-01");
        user.setImage("img.png");
        user.setEmail("user@test.com");
        user.setAuthority(auth);

        
        userDTO = new UserDTO(TEST_USER_ID, "user", "User Name", "2000-01-01", null, "img.png", "user@test.com", "PLAYER");
    }

    @Test
    @WithMockUser("admin")
    void shouldFindAll() throws Exception {
        
        UserDTO sara = new UserDTO(2, "Sara", "Sara Name", "2000-01-01", null, "img", "sara@mail.com", "PLAYER");
        UserDTO juan = new UserDTO(3, "Juan", "Juan Name", "2000-01-01", null, "img", "juan@mail.com", "PLAYER");

        when(this.userService.findAll()).thenReturn(List.of(userDTO, sara, juan));

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(3))
                .andExpect(jsonPath("$[?(@.id == 1)].username").value("user"))
                .andExpect(jsonPath("$[?(@.id == 2)].username").value("Sara"))
                .andExpect(jsonPath("$[?(@.id == 3)].username").value("Juan"));
    }

    @Test
    @WithMockUser("admin")
    void shouldFindAllWithAuthority() throws Exception {
        UserDTO juan = new UserDTO(3, "Juan", "Juan Name", "2000-01-01", null, "img", "juan@mail.com", "PLAYER");

        when(this.userService.findAllByAuthority("PLAYER")).thenReturn(List.of(userDTO, juan));

        mockMvc.perform(get(BASE_URL).param("auth", "PLAYER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[?(@.id == 1)].username").value("user"))
                .andExpect(jsonPath("$[?(@.id == 3)].username").value("Juan"));
    }

    @Test
    @WithMockUser("admin")
    void shouldFindAllAuths() throws Exception {
        Authorities aux = new Authorities();
        aux.setId(2);
        aux.setAuthority("ADMIN");

        when(this.authService.findAll()).thenReturn(List.of(auth, aux));

        mockMvc.perform(get(BASE_URL + "/authorities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[?(@.id == 1)].authority").value("PLAYER"))
                .andExpect(jsonPath("$[?(@.id == 2)].authority").value("ADMIN"));
    }

    @Test
    @WithMockUser("admin")
    void shouldReturnUserById() throws Exception {
        when(this.userService.findUserDTO(TEST_USER_ID)).thenReturn(userDTO);
        
        mockMvc.perform(get(BASE_URL + "/{id}", TEST_USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(TEST_USER_ID))
                .andExpect(jsonPath("$.username").value("user"))
                .andExpect(jsonPath("$.authority").value("PLAYER"));
    }

    @Test
    @WithMockUser("admin")
    void shouldReturnUserByUsername() throws Exception {
        when(this.userService.findByUsernameDTO("user")).thenReturn(userDTO);
        
        mockMvc.perform(get(BASE_URL + "/byUsername").param("username", "user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("user"));
    }

    @Test
    @WithMockUser("admin")
    void shouldReturnNotFoundUser() throws Exception {
        when(this.userService.findUserDTO(999)).thenThrow(new ResourceNotFoundException("User", "id", 999));
        
        mockMvc.perform(get(BASE_URL + "/{id}", 999))
                .andExpect(status().isNotFound());
    }


    @Test
    @WithMockUser("admin")
    void shouldCreateUser() throws Exception {
        User newUser = new User();
        newUser.setUsername("NewUser");
        newUser.setPassword("Pass123");
        newUser.setEmail("new@test.com");
        newUser.setName("New Name");
        newUser.setBirthDate("2000-01-01");
        newUser.setImage("img.png");
        newUser.setAuthority(auth);

        when(userService.existsUser("NewUser")).thenReturn(false);
        when(userService.findAll()).thenReturn(List.of()); // Lista vacía = no hay emails duplicados
        when(passwordEncoder.encode("Pass123")).thenReturn("EncodedPass");
        when(userService.saveUser(any(User.class))).thenReturn(newUser);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newUser)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser("admin")
    void shouldFailCreateDuplicateUsername() throws Exception {
        User duplicateUser = new User();
        duplicateUser.setUsername("ExistingUser");
        duplicateUser.setPassword("pass");
        duplicateUser.setEmail("mail@test.com");
        duplicateUser.setName("Name");
        duplicateUser.setBirthDate("2000-01-01");
        duplicateUser.setImage("img.png");
        duplicateUser.setAuthority(auth);

        when(userService.existsUser("ExistingUser")).thenReturn(true);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicateUser)))
                
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedUserException)); 
    }

    @Test
    @WithMockUser("admin")
    void shouldFailCreateDuplicateEmail() throws Exception {
        User duplicateEmailUser = new User();
        duplicateEmailUser.setUsername("UniqueUser");
        duplicateEmailUser.setEmail("existing@test.com");
        duplicateEmailUser.setPassword("pass");
        duplicateEmailUser.setName("Name");
        duplicateEmailUser.setBirthDate("2000-01-01");
        duplicateEmailUser.setImage("img.png");
        duplicateEmailUser.setAuthority(auth);

        UserDTO existingUser = new UserDTO();
        existingUser.setEmail("existing@test.com");

        when(userService.existsUser("UniqueUser")).thenReturn(false);
        when(userService.findAll()).thenReturn(List.of(existingUser));

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicateEmailUser)))
                
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedUserException));
    }
    
    @Test
    @WithMockUser("admin")
    void shouldUpdateUser() throws Exception {
        user.setUsername("UPDATED");
        user.setPassword("CHANGED");

        when(this.userService.findUser(TEST_USER_ID)).thenReturn(user);
        when(this.userService.updateUser(any(User.class), any(Integer.class))).thenReturn(user);

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_USER_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("UPDATED"));
    }

    @Test
    @WithMockUser("admin")
    void shouldReturnNotFoundUpdateUser() throws Exception {
        user.setUsername("UPDATED");
        
        when(this.userService.findUser(TEST_USER_ID)).thenThrow(new ResourceNotFoundException("User", "id", TEST_USER_ID));

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_USER_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isNotFound());
    }


    @Test
    @WithMockUser("admin")
    void shouldPatchUsername() throws Exception {
        
        Map<String, Object> updates = new HashMap<>();
        updates.put("username", "PatchedName");

        when(this.userService.findUser(TEST_USER_ID)).thenReturn(user);
        when(this.userService.updateUser(any(User.class), eq(TEST_USER_ID))).thenReturn(user);

        mockMvc.perform(patch(BASE_URL + "/{id}", TEST_USER_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user", authorities = "PLAYER")
    void shouldPatchPasswordIfSameUser() throws Exception {
        
        Map<String, Object> updates = new HashMap<>();
        updates.put("password", "NewPass");

        when(this.userService.findUser(TEST_USER_ID)).thenReturn(user);
        when(this.userService.findCurrentUser()).thenReturn(user); 
        when(this.userService.updateUser(any(User.class), eq(TEST_USER_ID))).thenReturn(user);

        mockMvc.perform(patch(BASE_URL + "/{id}", TEST_USER_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk());
    }


    @Test
    @WithMockUser("admin")
    void shouldDeleteOtherUser() throws Exception {
        
        User admin = new User();
        admin.setId(99);
        
        when(this.userService.findUser(TEST_USER_ID)).thenReturn(user);
        when(this.userService.findCurrentUser()).thenReturn(admin);
        doNothing().when(this.userService).deleteUser(TEST_USER_ID);

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_USER_ID)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User deleted!"));
    }

    @Test
    @WithMockUser("admin")
    void shouldFailDeleteSelf() throws Exception {
        
        when(this.userService.findUser(TEST_USER_ID)).thenReturn(user);
        when(this.userService.findCurrentUser()).thenReturn(user); 
        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_USER_ID)
                .with(csrf()))
                .andExpect(status().isForbidden())
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof AccessDeniedException));
    }
}