package es.us.dp1.l4_04_24_25.saboteur.user;
<<<<<<< HEAD

=======
>>>>>>> 934846e376131368950f7d9a4c9030f0447dd1f7
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface AuthoritiesRepository extends  CrudRepository<Authorities, Integer>{
	
	@Query("SELECT DISTINCT auth FROM Authorities auth WHERE auth.authority LIKE :authority%")
	Optional<Authorities> findByName(String authority);
	
}
