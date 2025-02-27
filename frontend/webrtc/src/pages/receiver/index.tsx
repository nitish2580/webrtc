import React, { useEffect, useRef, useState } from 'react';
// import useWebSocket from '../hooks/useWebSocket';
import useWebSocket from '../../hooks/useWebsocket';

type SignalMessage =
    | { type: 'createOffer'; sdp: RTCSessionDescriptionInit }
    | { type: 'createAnswer'; sdp: RTCSessionDescriptionInit }
    | { type: 'iceCandidate'; candidate: RTCIceCandidateInit }
    | { type: 'unknown' };

type MessageHandler = (message: SignalMessage) => Promise<void>;

const Receiver = () => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const pc = useRef<RTCPeerConnection | null>(null);

    const handleSignal: MessageHandler = async (message: SignalMessage) => {
        if (!pc.current) return;
        switch (message.type) {
            case 'createOffer': {
                await pc.current.setRemoteDescription(new RTCSessionDescription(message.sdp));
                const answer = await pc.current.createAnswer();
                await pc.current.setLocalDescription(answer);
                console.log("🚀 ~ consthandleSignal:MessageHandler= ~ answer:", answer)
                sendSignal({ type: 'createAnswer', sdp: answer });
                break;
            }
            case 'iceCandidate':
                await pc.current.addIceCandidate(new RTCIceCandidate(message.candidate));
                break;

            default:
                console.warn('Unknown message type:', message.type);
        }
    };

    const { sendSignal } = useWebSocket('ws://localhost:8080', 'receiver', handleSignal);

    // Initialize local media stream
    useEffect(() => {
        const initLocalStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing media devices:', error);
            }
        };

        initLocalStream();
    }, []);

    // Initialize WebRTC peer connection
    useEffect(() => {
        const initializePeerConnection = () => {
            const peerConnection = new RTCPeerConnection(
                {
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
                }
            );

            // Add local stream tracks to the peer connection
            if (localStream) {
                localStream.getTracks().forEach((track) => {
                    peerConnection.addTrack(track, localStream);
                });
            }

            // Handle remote stream
            peerConnection.ontrack = (event) => {
                
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            // Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    sendSignal({ type: 'iceCandidate', candidate: event.candidate });
                }
            };

            peerConnection.onnegotiationneeded = async () => {
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                if (!peerConnection.localDescription) {
                    return;
                }
                sendSignal({
                    type: 'createOffer',
                    sdp: peerConnection.localDescription
                })
            }

            pc.current = peerConnection;
        };

        initializePeerConnection();

        return () => {
            if (pc.current) {
                pc.current.close();
            }
        };
    }, [localStream, sendSignal]);

    return (
        <div>
            <h1>Receiver</h1>
            <div>
                <video ref={localVideoRef} autoPlay muted />
                <video ref={remoteVideoRef} autoPlay />
            </div>
        </div>
    );
};

export default Receiver;