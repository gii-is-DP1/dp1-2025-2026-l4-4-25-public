import { useEffect, useState } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import tokenService from '../services/token.service';

const useWebSocket = (endpoint, topic, payload = {}) => {
    const [data, setData] = useState(null);
    const jwt = tokenService.getLocalAccessToken();

    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = Stomp.over(() => socket);

        stompClient.connect({ Authorization: `Bearer ${jwt}` }, (frame) => {
            // Nos suscribimos al tema específico del lobby
            stompClient.subscribe(topic, (response) => {
                setData(JSON.parse(response.body));
            });

            // Envía el payload una sola vez al conectar
            stompClient.send(endpoint, {}, JSON.stringify(payload));
        }, (error) => {
             console.error('WebSocket connection error:', error);
             setTimeout(() => {
                 console.log("Reconnecting...");
                 stompClient.activate(); // Intenta reconectar
             }, 5000);
         });

        return () => {
            if (stompClient) {
                stompClient.disconnect();
            }
        };
    }, [endpoint, topic, jwt]); // Dependencias para que se ejecute solo cuando cambian estos valores

    return data;
};

export default useWebSocket;