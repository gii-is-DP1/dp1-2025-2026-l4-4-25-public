import { useEffect, useState, useRef } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import tokenService from '../services/token.service';

const useWebSocket = (topic) => {
    const [data, setData] = useState(null);
    const jwtRef = useRef(tokenService.getLocalAccessToken());
    const stompClientRef = useRef(null);

    useEffect(() => {
        if (!topic) return;
        setData(null);

        const socket = new SockJS("http://localhost:8080/ws");
        const stompClient = Stomp.over(socket);
        stompClientRef.current = stompClient;

        stompClient.connect(
            { Authorization: `Bearer ${jwtRef.current}` },
            () => {
                stompClient.subscribe(topic, (message) => {
                    try {
                        const body = JSON.parse(message.body);
                        setData({ ...body, _ts: Date.now() });
                    } catch (error) {
                        console.error("Error parsing WS message:", error);
                    }
                });
            },
            (error) => {
                console.error("WS Connection error for topic", topic, ":", error);
            }
        );

        return () => {
            if (stompClient.connected) {
                stompClient.disconnect();
            }
            stompClientRef.current = null;
        };
    }, [topic]);

    return data;
};

export default useWebSocket;
