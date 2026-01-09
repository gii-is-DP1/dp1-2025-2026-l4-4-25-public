package es.us.dp1.l4_04_24_25.saboteur.auth.payload.request;

import java.sql.Date;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {
	
	// User
	@NotBlank
	private String username;
	
	@NotBlank
	private String authority;

	@NotBlank
	private String password;

	@NotBlank
	private String image;
	@NotBlank
	private String email;
	
	@NotBlank
	private String name;
	
	@NotNull
	private String birthDate;
		
	
	//Owner
	
	//private String telephone;


}
