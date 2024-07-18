import { useCallback, useEffect, useState } from "react"
import { useSocket } from "../../provider/SocketProvider"
import { CallAnserType, IncommingCallType, UserDataType } from "../../types";
import ReactPlayer from "react-player";
import webRTCService from "../../service/webRTCService";

export default function Room() {

    const [userStream, setUserStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream| null>(null)
    const [remoteUser, setRemoteUser] = useState("")

    const socket = useSocket()

    const handalUserJoin = useCallback(({ email, id }: UserDataType) => {
        setRemoteUser(id)

        console.log({ email, id });

    }, [])

    const sendStream = useCallback(() => {
        if (webRTCService.peer && userStream) {
            userStream.getTracks().forEach(track => {
                webRTCService.peer?.addTrack(track, userStream);
            });
            console.log("All tracks added to peer connection");
        }
    }, [userStream]);

    const handalCall = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })
        setUserStream(stream)
        sendStream()

        const offer = await webRTCService.getOffer()
        socket.emit("user:call", {
            id: remoteUser,
            offer
        })
    }, [socket, remoteUser, sendStream]);

    const handalIncommingCall = useCallback(async ({ from, offer }: IncommingCallType) => {
        console.log({
            from,
            offer
        });
        setRemoteUser(from)
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })
        setUserStream(stream)
        const ans = await webRTCService.getAnswer(offer)
        socket.emit("call:accepted", {
            to: from,
            ans
        })
    }, [socket]);


    const handalCallAccepted = useCallback(async ({ ans }: CallAnserType) => {
        if (webRTCService.peer) {
            await webRTCService.setLocalDescription(ans);
            sendStream();
        }
    }, [sendStream]);

    const handleICECandidate = useCallback((event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
            console.log("New ICE candidate: ", event.candidate);
            socket.emit("ice-candidate", { candidate: event.candidate, to: remoteUser });
        }
    }, [socket, remoteUser]);
    
    const handleNewICECandidate = useCallback((incoming: { candidate: RTCIceCandidate }) => {
        const candidate = new RTCIceCandidate(incoming.candidate);
        webRTCService.peer?.addIceCandidate(candidate)
            .catch(e => console.error("Error adding ICE candidate:", e));
    }, []);

    const handalNagotiationneeded = useCallback(async () => {
        const offer = await webRTCService.getOffer()
        socket.emit("peer:nagotiation:needed", {
            offer,
            to: remoteUser
        })
    }, [socket, remoteUser]);

    const handalNagotiationIncomming = useCallback(async ({ from, offer }: IncommingCallType) => {
        await webRTCService.peer?.setRemoteDescription(new RTCSessionDescription(offer));
        const ans = await webRTCService.getAnswer(offer)
        socket.emit("peer:nagotiation:ans", {
            to: from,
            ans
        })
    }, [socket]);

    const handalNagotiationFinal = useCallback(async ({ ans }: CallAnserType) => {
        await webRTCService.setLocalDescription(ans)
    }, []);

    const handleTrack = useCallback((ev: RTCTrackEvent) => {
        console.log("Track event received:", ev.track.kind);
        const [stream] = ev.streams;
        console.log("Remote stream received:", stream.id);
        setRemoteStream(stream);
    }, []);


    //* All useEffect 
    useEffect(() => {
        if (webRTCService.peer) {
            webRTCService.peer.addEventListener("icecandidate", handleICECandidate);
        }
        socket.on("new-ice-candidate", handleNewICECandidate);
    
        return () => {
            webRTCService.peer?.removeEventListener("icecandidate", handleICECandidate);
            socket.off("new-ice-candidate", handleNewICECandidate);
        };
    }, [handleICECandidate, handleNewICECandidate, socket]);

    useEffect(() => {
        if (webRTCService.peer) {
            webRTCService.peer.addEventListener("negotiationneeded", handalNagotiationneeded)
        }
        return () => {
            if (webRTCService.peer) {
                webRTCService.peer.removeEventListener("negotiationneeded", handalNagotiationneeded)
            }
        }
    }, [handalNagotiationneeded]);

    useEffect(() => {
        if (webRTCService.peer) {
            webRTCService.peer.addEventListener("track", handleTrack)
        }
        return () => {
            webRTCService.peer?.removeEventListener("track", handleTrack)
        }
    }, []);

    useEffect(() => {
        socket.on("user:join", handalUserJoin)
        socket.on("incomming:call", handalIncommingCall)
        socket.on("call:accepted", handalCallAccepted)
        socket.on("peer:nagotiation:needed", handalNagotiationIncomming)
        socket.on("peer:nagotiation:final", handalNagotiationFinal)

        return () => {
            socket.off("user:join", handalUserJoin)
            socket.off("incomming:call", handalIncommingCall)
            socket.off("call:accepted", handalCallAccepted)
            socket.off("peer:nagotiation:needed", handalNagotiationIncomming)
            socket.off("peer:nagotiation:final", handalNagotiationFinal)
        }
    },
        [
            socket,
            handalUserJoin,
            handalIncommingCall,
            handalCallAccepted,
            handalNagotiationIncomming,
            handalNagotiationFinal
        ]
    )

    return (
        <main>
            <h1>Room: {socket.id}</h1>
            <p>{remoteUser ? "Connected" : "No one can connect"}</p>
            {userStream && (
                <div>
                    <p>Local Stream</p>
                    <ReactPlayer url={userStream} playing muted height={"100px"} width={"200px"} />
                </div>
            )}
            {remoteStream && (
                <div>
                    <p>Remote Stream</p>
                    <ReactPlayer 
                        url={remoteStream} 
                        playing 
                        muted
                        height={"100px"} 
                        width={"200px"} 
                        onError={(e) => console.log("ReactPlayer error:", e)}
                    />
                </div>
            )}
            {remoteUser && <button onClick={handalCall}>Call</button>}
            {remoteUser && <button onClick={sendStream}>send vid</button>}
        </main>
    )
}