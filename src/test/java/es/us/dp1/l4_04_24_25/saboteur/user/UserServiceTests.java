package es.us.dp1.l4_04_24_25.saboteur.user;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.BeanUtils;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;

@Epic("Users & Admin Module")
@Feature("Users Management")
@SpringBootTest
@AutoConfigureTestDatabase
class UserServiceTests {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthoritiesService authService;

    @Test
    @WithMockUser(username = "player1", authorities = { "PLAYER" })
    void shouldFindCurrentUser() {
        User user = this.userService.findCurrentUser();
        assertEquals("player1", user.getUsername());
    }

    @Test
    @WithMockUser(username = "prueba")
    void shouldNotFindCorrectCurrentUser() {
        assertThrows(ResourceNotFoundException.class, () -> this.userService.findCurrentUser());
    }

    @Test
    void shouldNotFindAuthenticated() {
        assertThrows(ResourceNotFoundException.class, () -> this.userService.findCurrentUser());
    }

    @Test
    void shouldFindAllUsers() {
        List<UserDTO> users = (List<UserDTO>) this.userService.findAll();
        assertEquals(12, users.size()); // admin1, players and devs
    }

    @Test
    void shouldFindUsersByUsername() {
        UserDTO user = this.userService.findByUsernameDTO("player1");
        assertEquals("player1", user.getUsername());
    }

    @Test
    void shouldNotFindUsersByUsername() {
        assertThrows(ResourceNotFoundException.class, () -> this.userService.findByUsernameDTO("Ollama"));
    }

    @Test
    void shouldFindUsersByAuthority() {
        List<UserDTO> owners = (List<UserDTO>) this.userService.findAllByAuthority("PLAYER");
        assertEquals(11, owners.size()); // player1-5 + devs
        List<UserDTO> admins = (List<UserDTO>) this.userService.findAllByAuthority("ADMIN");
        assertEquals(1, admins.size());
    }

    @Test
    void shouldFindSingleUser() {
        User user = this.userService.findUser(6);
        assertEquals("player1", user.getUsername());
    }

    @Test
    void shouldNotFindSingleUserWithBadID() {
        assertThrows(ResourceNotFoundException.class, () -> this.userService.findUser(100));
    }

    @Test
    void shouldExistUser() {
        assertEquals(true, this.userService.existsUser("player1"));
    }

    @Test
    void shouldNotExistUser() {
        assertEquals(false, this.userService.existsUser("player10000"));
    }

    @Test
    @Transactional
    void shouldUpdateUser() {
        int idToUpdate = 1;
        String newName = "Change";
        User user = this.userService.findUser(idToUpdate);
        user.setUsername(newName);
        userService.updateUser(user, idToUpdate);
        user = this.userService.findUser(idToUpdate);
        assertEquals(newName, user.getUsername());
    }

    @Test
    @Transactional
    void shouldUpdateUserToBeLikeTheBegining() {
        int idToUpdate = 1;
        String newName = "Bedilia Estrada";
        User user = this.userService.findUser(idToUpdate);
        user.setUsername(newName);
        userService.updateUser(user, idToUpdate);
        user = this.userService.findUser(idToUpdate);
        assertEquals(newName, user.getUsername());
    }

    @Test
    @Transactional
    void shouldInsertUser() {

        int count = ((List<UserDTO>) this.userService.findAll()).size();

        Integer id = 1000;
        User user = new User();
        user.setId(id);
        user.setUsername("Sam");
        user.setName("Sam Sulek");
        user.setPassword("password");
        user.setBirthDate("2005-03-12");
        user.setEmail("sam@hotmail.com");
        user.setImage("src/SamImage.png");
        user.setAuthority(authService.findByAuthority("ADMIN"));

        User savedUser = this.userService.saveUser(user);

        assertNotNull(savedUser.getId());
        assertNotEquals(0, savedUser.getId().longValue());

        assertEquals(authService.findByAuthority("ADMIN").getAuthority(), user.getAuthority().getAuthority());

        int finalCount = ((List<UserDTO>) this.userService.findAll()).size();
        assertEquals(count + 1, finalCount);
    }

    @Test
    @Transactional
    void shouldUpdateUserPassword() {
        int idToUpdate = 1;
        User userToUpdate = this.userService.findUser(idToUpdate);
        String oldPassword = userToUpdate.getPassword();

        User inputUser = new User();
        BeanUtils.copyProperties(userToUpdate, inputUser);
        inputUser.setPassword("newSuperSecretPassword");

        User updatedUser = userService.updateUser(inputUser, idToUpdate);

        assertNotEquals(oldPassword, updatedUser.getPassword());
    }

    @Test
    @Transactional
    void shouldNotUpdateUserPasswordIfEmpty() {
        int idToUpdate = 1;
        User originalUser = this.userService.findUser(idToUpdate);
        String oldPassword = originalUser.getPassword();

        User inputUser = new User();
        BeanUtils.copyProperties(originalUser, inputUser);
        inputUser.setPassword("");

        User updatedUser = userService.updateUser(inputUser, idToUpdate);

        assertEquals(oldPassword, updatedUser.getPassword());
    }

    @Test
    @Transactional
    void shouldUpdateUserAuthority() {
        int idToUpdate = 1;
        User userToUpdate = this.userService.findUser(idToUpdate);

        User inputUser = new User();
        BeanUtils.copyProperties(userToUpdate, inputUser);

        Authorities adminAuth = authService.findByAuthority("ADMIN");
        inputUser.setAuthority(adminAuth);

        User updatedUser = userService.updateUser(inputUser, idToUpdate);

        assertEquals("ADMIN", updatedUser.getAuthority().getAuthority());
    }

    @Test
    @Transactional
    void shouldSaveUserAsAdmin() {
        User adminUser = new User();
        adminUser.setUsername("AdminTest");
        adminUser.setName("Admin Name");
        adminUser.setPassword("pass");
        adminUser.setBirthDate("2000-01-01");
        adminUser.setEmail("admin@test.com");
        adminUser.setImage("img.png");
        adminUser.setAuthority(authService.findByAuthority("ADMIN"));

        User saved = userService.saveUser(adminUser);

        assertNotNull(saved.getId());
        assertEquals("ADMIN", saved.getAuthority().getAuthority());
    }

    @Test
    @Transactional
    void shouldSaveUserAsPlayerDefault() {
        User playerUser = new User();
        playerUser.setUsername("PlayerTestNew");
        playerUser.setName("Player Name");
        playerUser.setPassword("pass");
        playerUser.setBirthDate("2000-01-01");
        playerUser.setEmail("player@test.com");
        playerUser.setImage("img.png");

        playerUser.setAuthority(authService.findByAuthority("PLAYER"));

        User saved = userService.saveUser(playerUser);

        assertNotNull(saved.getId());
        assertEquals("PLAYER", saved.getAuthority().getAuthority());
    }

    @Test
    @Transactional
    void shouldDeleteUser() {
        int id = 8; // player3
        assertNotNull(userService.findUser(id));
        userService.deleteUser(id);
        assertThrows(ResourceNotFoundException.class, () -> userService.findUser(id));
    }

    @Test
    void shouldReturnEmptyListForUnknownAuthority() {
        List<UserDTO> users = userService.findAllByAuthority("UNKNOWN_AUTH");
        assertTrue(users.isEmpty());
    }

    @Test
    void shouldFindUserDTOById() {
        UserDTO dto = userService.findUserDTO(6); // player1
        assertNotNull(dto);
        assertEquals("player1", dto.getUsername());
        assertEquals("PLAYER", dto.getAuthority());
    }

    @Test
    void shouldFailFindUserDTOByInvalidId() {
        assertThrows(ResourceNotFoundException.class, () -> userService.findUserDTO(999));
    }

    @Test
    void shouldThrowExceptionForFutureBirthDateInSave() {
        User user = new User();
        user.setUsername("FutureUser");
        user.setPassword("password");

        user.setBirthDate(LocalDate.now().plusDays(1).toString());
        user.setAuthority(authService.findByAuthority("PLAYER"));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.saveUser(user);
        });
        assertEquals("Birth date must be before current date", exception.getMessage());
    }

    @Test
    void shouldThrowExceptionForInvalidBirthDateFormatInSave() {
        User user = new User();
        user.setUsername("BadFormatUser");
        user.setPassword("password");

        user.setBirthDate("12/12/2025");
        user.setAuthority(authService.findByAuthority("PLAYER"));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.saveUser(user);
        });
        assertEquals("Invalid birth date format. Expected yyyy-MM-dd", exception.getMessage());
    }

    @Test
    @Transactional
    void shouldThrowExceptionForFutureBirthDateInUpdate() {
        int idToUpdate = 1;
        User userToUpdate = userService.findUser(idToUpdate);

        User inputUser = new User();
        BeanUtils.copyProperties(userToUpdate, inputUser);

        inputUser.setBirthDate(LocalDate.now().plusDays(1).toString());

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.updateUser(inputUser, idToUpdate);
        });
        assertEquals("Birth date must be before current date", exception.getMessage());
    }

    @Test
    @Transactional
    void shouldThrowExceptionForInvalidBirthDateFormatInUpdate() {
        int idToUpdate = 1;
        User userToUpdate = userService.findUser(idToUpdate);

        User inputUser = new User();
        BeanUtils.copyProperties(userToUpdate, inputUser);

        inputUser.setBirthDate("bad-date-format");

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.updateUser(inputUser, idToUpdate);
        });
        assertEquals("Invalid birth date format. Expected yyyy-MM-dd", exception.getMessage());
    }
}