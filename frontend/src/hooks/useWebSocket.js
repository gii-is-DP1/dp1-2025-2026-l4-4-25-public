import { useEffect, useState } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import tokenService from '../services/token.service';

const useWebSocket = (topic) => {
    const [data, setData] = useState(null);
    const jwt = tokenService.getLocalAccessToken();

    useEffect(() => {
        if (!topic) return;

        console.log('🔌 Connecting to WS topic:', topic);
        const socket = new SockJS("http://localhost:8080/ws");
        const stompClient = Stomp.over(socket);

        stompClient.connect(
            { Authorization: `Bearer ${jwt}` },
            () => {
                console.log('✅ WS Connected to topic:', topic);
                stompClient.subscribe(topic, (message) => {
                    try {
                        const body = JSON.parse(message.body);
                        console.log('📨 WS Message received on', topic, ':', body);
                        setData(body);
                    } catch (error) {
                        console.error("❌ Error parsing WS message:", error);
                    }
                });
            },
            (error) => {
                console.error("❌ WS Connection error for topic", topic, ":", error);
            }
        );

        return () => {
            if (stompClient.connected) {
                console.log('🔌 WS Disconnecting from topic:', topic);
                stompClient.disconnect();
            }
        };
    }, [topic, jwt]);

    return data;
};

export default useWebSocket;
