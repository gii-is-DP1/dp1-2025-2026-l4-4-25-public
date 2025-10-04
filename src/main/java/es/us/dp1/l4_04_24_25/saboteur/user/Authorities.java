package es.us.dp1.l4_04_24_25.saboteur.user;
<<<<<<< HEAD

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import es.us.dp1.l4_04_24_25.saboteur.model.BaseEntity;

=======
import es.us.dp1.l4_04_24_25.saboteur.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
>>>>>>> 934846e376131368950f7d9a4c9030f0447dd1f7
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "authorities")
public class Authorities extends BaseEntity{
	
//	@ManyToOne
//	@JoinColumn(name = "username")
//	User user;
	
//	@Enumerated(EnumType.STRING)
	@Column(length = 20)
	String authority;
	
	
}
