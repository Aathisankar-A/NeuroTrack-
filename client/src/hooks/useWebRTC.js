import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import useAuth from './useAuth';

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

export const useWebRTC = (roomId) => {
    const socket = useSocket();
    const { user } = useAuth();
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({});
    const [mediaState, setMediaState] = useState({ video: true, audio: true, screen: false });
    
    const peersRef = useRef({});
    
    // Cleanup function
    const cleanupMedia = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        Object.values(peersRef.current).forEach(peer => peer.close());
        peersRef.current = {};
        setRemoteStreams({});
        if (socket && user) {
            socket.emit('webrtc:leave-media', { roomId, userId: user.id });
        }
    }, [localStream, roomId, socket, user]);

    useEffect(() => {
        if (!socket || !user) return;

        // Initialize local media
        const startLocalMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                socket.emit('webrtc:join-media', { roomId, userId: user.id });
            } catch (err) {
                console.error("Failed to get local media", err);
                setMediaState(prev => ({ ...prev, video: false, audio: false }));
            }
        };

        startLocalMedia();

        return cleanupMedia;
    }, [socket, roomId, user]);

    useEffect(() => {
        if (!socket || !localStream || !user) return;

        const createPeer = (targetUserId, caller) => {
            const peer = new RTCPeerConnection(STUN_SERVERS);
            
            // Add local tracks
            localStream.getTracks().forEach(track => {
                peer.addTrack(track, localStream);
            });

            // Handle incoming remote tracks
            peer.ontrack = (event) => {
                setRemoteStreams(prev => ({
                    ...prev,
                    [targetUserId]: event.streams[0]
                }));
            };

            // Handle ICE candidates
            peer.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('webrtc:ice-candidate', {
                        to: targetUserId,
                        from: user.id,
                        candidate: event.candidate
                    });
                }
            };

            return peer;
        };

        // When a new user joins with media, we initiate the call to them
        const handleUserJoined = async ({ userId }) => {
            if (userId === user.id || peersRef.current[userId]) return;

            const peer = createPeer(userId, true);
            peersRef.current[userId] = peer;

            try {
                const offer = await peer.createOffer();
                await peer.setLocalDescription(offer);
                socket.emit('webrtc:offer', { to: userId, from: user.id, offer });
            } catch (err) {
                console.error("Error creating offer", err);
            }
        };

        // Handle incoming offers
        const handleReceiveOffer = async ({ from, offer }) => {
            if (peersRef.current[from]) return;

            const peer = createPeer(from, false);
            peersRef.current[from] = peer;

            try {
                await peer.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                socket.emit('webrtc:answer', { to: from, from: user.id, answer });
            } catch (err) {
                console.error("Error handling offer", err);
            }
        };

        // Handle incoming answers
        const handleReceiveAnswer = async ({ from, answer }) => {
            const peer = peersRef.current[from];
            if (peer) {
                try {
                    await peer.setRemoteDescription(new RTCSessionDescription(answer));
                } catch (err) {
                    console.error("Error setting remote description", err);
                }
            }
        };

        // Handle incoming ICE candidates
        const handleReceiveIceCandidate = async ({ from, candidate }) => {
            const peer = peersRef.current[from];
            if (peer) {
                try {
                    await peer.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error("Error adding ice candidate", err);
                }
            }
        };

        // Handle user leaving media
        const handleUserLeft = ({ userId }) => {
            if (peersRef.current[userId]) {
                peersRef.current[userId].close();
                delete peersRef.current[userId];
                
                setRemoteStreams(prev => {
                    const newStreams = { ...prev };
                    delete newStreams[userId];
                    return newStreams;
                });
            }
        };

        socket.on('webrtc:user-joined-media', handleUserJoined);
        socket.on('webrtc:offer:received', handleReceiveOffer);
        socket.on('webrtc:answer:received', handleReceiveAnswer);
        socket.on('webrtc:ice-candidate:received', handleReceiveIceCandidate);
        socket.on('webrtc:user-left-media', handleUserLeft);

        return () => {
            socket.off('webrtc:user-joined-media', handleUserJoined);
            socket.off('webrtc:offer:received', handleReceiveOffer);
            socket.off('webrtc:answer:received', handleReceiveAnswer);
            socket.off('webrtc:ice-candidate:received', handleReceiveIceCandidate);
            socket.off('webrtc:user-left-media', handleUserLeft);
        };
    }, [socket, localStream, user]);

    // Media Controls
    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setMediaState(prev => ({ ...prev, video: videoTrack.enabled }));
            }
        }
    };

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setMediaState(prev => ({ ...prev, audio: audioTrack.enabled }));
            }
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (!mediaState.screen) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = screenStream.getVideoTracks()[0];

                // Replace video track in all peer connections
                Object.values(peersRef.current).forEach(peer => {
                    const sender = peer.getSenders().find(s => s.track.kind === 'video');
                    if (sender) sender.replaceTrack(screenTrack);
                });

                // Replace local stream video track to update own view
                const currentVideoTrack = localStream.getVideoTracks()[0];
                localStream.removeTrack(currentVideoTrack);
                localStream.addTrack(screenTrack);
                
                setMediaState(prev => ({ ...prev, screen: true }));

                screenTrack.onended = () => {
                    // Revert back to camera when screen share stops via browser UI
                    stopScreenShare(currentVideoTrack);
                };
            } else {
                // Manually stopped screen share
                const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
                const cameraTrack = cameraStream.getVideoTracks()[0];
                stopScreenShare(cameraTrack);
            }
        } catch (err) {
            console.error("Error sharing screen", err);
        }
    };

    const stopScreenShare = (cameraTrack) => {
        Object.values(peersRef.current).forEach(peer => {
            const sender = peer.getSenders().find(s => s.track.kind === 'video');
            if (sender) sender.replaceTrack(cameraTrack);
        });

        const currentVideoTrack = localStream.getVideoTracks()[0];
        localStream.removeTrack(currentVideoTrack);
        localStream.addTrack(cameraTrack);
        
        setMediaState(prev => ({ ...prev, screen: false }));
    };

    return {
        localStream,
        remoteStreams,
        mediaState,
        toggleVideo,
        toggleAudio,
        toggleScreenShare,
        cleanupMedia
    };
};
