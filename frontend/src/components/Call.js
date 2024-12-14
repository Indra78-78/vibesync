import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer';

const ENDPOINT = `http://localhost:3000`;

let socket;

const Call = ({ user, receiver, onlineUsers }) => {
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState({});
    const [callAccepted, setCallAccepted] = useState(false);
    const [stream, setStream] = useState(null);
    const userVideo = useRef();
    const partnerVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        socket = io(ENDPOINT);

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
            setStream(currentStream);
            userVideo.current.srcObject = currentStream;
        });

        socket.on('CallUser', ({ from, name: callerName, signal }) => {
            setReceivingCall(true);
            setCaller({ isReceivingCall: true, from, name: callerName, signal });
        });

        socket.on('CallAccepted', (signal) => {
            setCallAccepted(true);
            connectionRef.current.signal(signal);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const callUser = (id) => {
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: stream,
        });

        peer.on('signal', (data) => {
            socket.emit('CallUser', {
                userToCall: id,
                signalData: data,
                from: user._id,
                name: user.name,
            });
        });

        peer.on('stream', (currentStream) => {
            partnerVideo.current.srcObject = currentStream;
        });

        socket.on('CallAccepted', (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: stream,
        });

        peer.on('signal', (data) => {
            socket.emit('AcceptCall', { signal: data, to: caller.from });
        });

        peer.on('stream', (currentStream) => {
            partnerVideo.current.srcObject = currentStream;
        });

        peer.signal(caller.signal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallAccepted(false);
        setReceivingCall(false);
        connectionRef.current.destroy();
    };

    return (
        <div className="call-container">
            <div className="video-container">
                <video playsInline muted ref={userVideo} autoPlay style={{ width: "300px" }} />
                <video playsInline ref={partnerVideo} autoPlay style={{ width: "300px" }} />
            </div>
            <div className="call-controls">
                {receivingCall && !callAccepted ? (
                    <div className="caller">
                        <h1>{caller.name} is calling...</h1>
                        <button onClick={answerCall}>Answer</button>
                    </div>
                ) : (
                    <button onClick={() => callUser(receiver._id)}>Call {receiver?.name}</button>
                )}
                {callAccepted && <button onClick={leaveCall}>End Call</button>}
            </div>
        </div>
    );
};

export default Call;
