package es.us.dp1.l4_04_24_25.saboteur.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Prefijos de los destinos donde se pueden suscribir los clientes
        config.enableSimpleBroker("/topic");
        // Prefijo de los endpoints que recibirán mensajes desde el frontend
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint del websocket (con fallback a SockJS)
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }
}
