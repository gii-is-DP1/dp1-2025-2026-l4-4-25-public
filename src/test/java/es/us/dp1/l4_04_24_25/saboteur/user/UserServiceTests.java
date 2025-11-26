package es.us.dp1.l4_04_24_25.saboteur.user;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue; // Añadido
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
//@Owner("DP1-tutors")
@SpringBootTest
@AutoConfigureTestDatabase
class UserServiceTests {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthoritiesService authService;


    @Test
    @WithMockUser(username = "Carlosbox2k", authorities = {"PLAYER"}) 
    void shouldFindCurrentUser() {
        User user = this.userService.findCurrentUser();
        assertEquals("Carlosbox2k", user.getUsername());
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
        assertEquals(3, users.size());
    }
    
    
    @Test
    void shouldFindUsersByUsername() {
        UserDTO user = this.userService.findByUsernameDTO("Carlosbox2k");
        assertEquals("Carlosbox2k", user.getUsername());
    }
    
    @Test
    void shouldNotFindUsersByUsername() {
        assertThrows(ResourceNotFoundException.class, () -> this.userService.findByUsernameDTO("Ollama"));
    }
    
    
    @Test
    void shouldFindUsersByAuthority() {
        List<UserDTO> owners = (List<UserDTO>) this.userService.findAllByAuthority("PLAYER");
        assertEquals(2, owners.size());
        List<UserDTO> admins = (List<UserDTO>) this.userService.findAllByAuthority("ADMIN");
        assertEquals(1, admins.size());
    }

    @Test
    void shouldFindSingleUser() {
        User user = this.userService.findUser(4);
        assertEquals("Carlosbox2k", user.getUsername());
    }
    
    @Test
    void shouldNotFindSingleUserWithBadID() {
        assertThrows(ResourceNotFoundException.class, () -> this.userService.findUser(100));
    }

    
    @Test
    void shouldExistUser() {
        assertEquals(true, this.userService.existsUser("mantecaoHacker"));
    }

    
    @Test
    void shouldNotExistUser() {
        assertEquals(false, this.userService.existsUser("player10000"));
    }

    
    @Test
    @Transactional
    void shouldUpdateUser() {
        int idToUpdate = 1;
        String newName="Change";
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
        String newName="Bedilia Estrada";
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
        assertNotEquals(id,savedUser.getId());
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

    /*
    @Test
    @Transactional
    void shouldDeleteUserWithOwner() {
        Integer firstCount = ((List<UserDTO>) userService.findAll()).size();
        User user = new User();
        user.setUsername("Sam");
        user.setPassword("password");
        Authorities auth = authService.findByAuthority("OWNER");
        user.setAuthority(auth);
        Owner owner = new Owner();
        owner.setAddress("Test");
        owner.setFirstName("Test");
        owner.setLastName("Test");
        owner.setPlan(PricingPlan.BASIC);
        owner.setTelephone("999999999");
        user.setCity("Test");
        this.ownerService.saveOwner(owner);

        Integer secondCount = ((Collection<User>) userService.findAll()).size();
        assertEquals(firstCount + 1, secondCount);
        userService.deleteUser(user.getId());
        Integer lastCount = ((Collection<User>) userService.findAll()).size();
        assertEquals(firstCount, lastCount);
    }
    */

    @Test
    @Transactional
    void shouldDeleteUser() {
        
        int id = 5; 

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
        UserDTO dto = userService.findUserDTO(4); // Carlosbox2k
        assertNotNull(dto);
        assertEquals("Carlosbox2k", dto.getUsername());
        assertEquals("PLAYER", dto.getAuthority());
    }

    @Test
    void shouldFailFindUserDTOByInvalidId() {
        assertThrows(ResourceNotFoundException.class, () -> userService.findUserDTO(999));
    }
}