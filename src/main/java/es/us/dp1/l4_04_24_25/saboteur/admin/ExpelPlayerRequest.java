package es.us.dp1.l4_04_24_25.saboteur.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExpelPlayerRequest {
    private String username;
    private String reason;
}
