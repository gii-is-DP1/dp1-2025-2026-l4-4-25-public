import { useEffect, useState } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import tokenService from '../services/token.service';

const useWebSocket = (topic) => {
    const [data, setData] = useState(null);
    const jwt = tokenService.getLocalAccessToken();

    useEffect(() => {
        if (!topic) return;

        const socket = new SockJS("http://localhost:8080/ws");
        const stompClient = Stomp.over(socket);

        stompClient.connect(
            { Authorization: `Bearer ${jwt}` },
            () => {
                stompClient.subscribe(topic, (message) => {
                    try {
                        const body = JSON.parse(message.body);
                        setData(body);
                    } catch (error) {
                        console.error("Error parsing WS:", error);
                    }
                });
            },
            (error) => console.error("WebSocket error:", error)
        );

        return () => {
            if (stompClient.connected) stompClient.disconnect();
        };
    }, [topic, jwt]);

    return data;
};

export default useWebSocket;
