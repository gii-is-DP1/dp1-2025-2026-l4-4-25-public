package es.us.dp1.l4_04_24_25.saboteur.user;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO{

    private String username;
    private String name;
    private String birthDate;
    private LocalDateTime joined;
    private String image;
    private String email;
    private Authorities authority;

    public UserDTO() {
    }

    public UserDTO(String username, String name, String birthDate, LocalDateTime joined, String image, String email, Authorities authority) {
        this.username = username;
        this.name = name;
        this.birthDate = birthDate;
        this.joined = joined;
        this.image = image;
        this.email = email;
        this.authority = authority;
    }
}