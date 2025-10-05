package es.us.dp1.l4_04_24_25.saboteur.user;

import java.util.Collection;
import java.util.List;

import static org.junit.Assert.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;

@Epic("Users & Admin Module")
@Feature("Authorization")
@Owner("DP1-tutors")
@SpringBootTest
@AutoConfigureTestDatabase
class AuthoritiesServiceTests {

//	@Autowired
//	private UserService userService;

	@Autowired
	private AuthoritiesService authService;

	@Test
	void shouldFindAllAuthorities() {
		List<Authorities> auths = (List<Authorities>) this.authService.findAll();
		assertEquals(2, auths.size());
	}

	@Test
	void shouldFindAuthoritiesByAuthority() {
		Authorities auth = this.authService.findByAuthority("ADMIN");
		assertEquals("ADMIN", auth.getAuthority());
	}

	@Test
	void shouldNotFindAuthoritiesByIncorrectAuthority() {
		assertThrows(ResourceNotFoundException.class, () -> this.authService.findByAuthority("authnotexists"));
	}

	@Test
	@Transactional
	void shouldInsertAuthorities() {
		int count = ((Collection<Authorities>) this.authService.findAll()).size();

		Authorities auth = new Authorities();
		auth.setAuthority("CLIENT");

		this.authService.saveAuthorities(auth);
		assertNotEquals(0, auth.getId().longValue());
		assertNotNull(auth.getId());

		int finalCount = ((Collection<Authorities>) this.authService.findAll()).size();
		assertEquals(count + 1, finalCount);
	}

}
