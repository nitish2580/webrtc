import WebSocket, { WebSocketServer } from "ws";

const PORT = 8080;

const socket = new WebSocketServer({ port: PORT });

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;
socket.on("connection", (ws) => {
    ws.on("message", (data: any) => {
        const message = JSON.parse(data);
        if (message.type === "sender") {
            console.log("🚀 ~ ws.on ~ message.type:", message.type)
            senderSocket = ws;
        } else if (message.type === "receiver") {
            console.log("🚀 ~ ws.on ~ message.type:", message.type)
            receiverSocket = ws;
        } else if (message.type === "createOffer") {
            if (ws !== senderSocket) {
                return;
            }
            console.log("🚀 ~ ws.on ~ message.type: sending to receiver", message.type)
            receiverSocket?.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp }));
        } else if (message.type === "createAnswer") {
            console.log("in create anser")
            if (ws !== receiverSocket) {
            return;
            }
            senderSocket?.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp }));
        } else if(message.type === "iceCandidate") {
            if (ws === senderSocket) {
                receiverSocket?.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }));
            } else if (ws === receiverSocket) {
                senderSocket?.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }));
            }
        }
    });

    ws.on("close", (message) => {
        console.log(`Connection closed => ${message}`);
    })

    ws.send("something");
});