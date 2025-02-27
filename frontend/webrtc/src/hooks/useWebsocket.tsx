import { useEffect, useRef } from 'react';

type MessageHandler = (message: string) => void
type SignalMessage =
    | { type: 'createOffer'; sdp: RTCSessionDescriptionInit }
    | { type: 'createAnswer'; sdp: RTCSessionDescriptionInit }
    | { type: 'iceCandidate'; candidate: RTCIceCandidateInit }
    | { type: 'unknown' };

const useWebSocket = (url: string, role: string, onMessage: (message: SignalMessage) => void) => {
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        //createing websocket connection
        ws.current = new WebSocket(url);

        //connecting to the websocket
        ws.current.onopen = () => {
            if(ws.current){
                ws.current.send(JSON.stringify({
                    type: role,
                }))
            }
        }

        //listen for message
        ws.current.onmessage = (event) => {
            if(event.data){
                console.log("🚀 ~ useEffect ~ event.data:", event.data)
                const message = JSON.parse(event.data);
                console.log("🚀 ~ useEffect ~ message:", message)
                onMessage(message);
            }
        }

        //on error
        ws.current.onclose = () => {
            console.log('WebSocket disconnected');
        };

        //cleanup on unmount
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        }
        //
    }, [url, onMessage, role])

    const sendSignal = (message: SignalMessage) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
        }
    };
    return { sendSignal };
}
export default useWebSocket;