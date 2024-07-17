import { useCallback, useEffect, useState } from "react"
import { useSocket } from "../../provider/SocketProvider"
import { CallAnserType, IncommingCallType, UserDataType } from "../../types";
import ReactPlayer from "react-player";
import webRTCService from "../../service/webRTCService";

export default function Room() {

    const [userStream, setUserStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [remoteUser, setRemoteUser] = useState("")

    const socket = useSocket()

    const handalUserJoin = useCallback(({ email, id }: UserDataType) => {
        setRemoteUser(id)

        console.log({ email, id });

    }, [])

    const handalCall = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })


        const offer = await webRTCService.getOffer()
        socket.emit("user:call", {
            id: remoteUser,
            offer
        })

        setUserStream(stream)
    }, [socket, remoteUser]);

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

    const sendStream = useCallback(() => {
        if (webRTCService.peer) {
            if(userStream) {
                for (let track of userStream.getTracks()) {
                    webRTCService.peer.addTrack(track, userStream)
                }
            }
        }
    }, [userStream])

    const handalCallAccepted = useCallback(async ({ ans }: CallAnserType) => {
        try {
            if (webRTCService.peer && webRTCService.peer.signalingState === "have-remote-offer") {
                await webRTCService.setRemoteDescription(new RTCSessionDescription(ans));
                console.log("call accepted");
                sendStream();
            } else {
                console.log("Cannot set local description, current signaling state: ", webRTCService.peer?.signalingState);
            }
        } catch (err) {
            console.log("error : ", err);
            
        }
        
    }, [sendStream])

    const handalNagotiationneeded = useCallback(async () => {
        const offer = await webRTCService.getOffer()
        socket.emit("peer:nagotiation:needed", {
            offer,
            to: remoteUser
        })
    }, [socket, remoteUser])

    const handalNagotiationIncomming = useCallback(async ({ from, offer }: IncommingCallType) => {
        const ans = await webRTCService.getAnswer(offer)
        socket.emit("peer:nagotiation:ans", {
            to: from,
            ans
        })
    }, [socket])

    const handalNagotiationFinal = useCallback(async ({ ans }: CallAnserType) => {
        await webRTCService.setLocalDescription(ans)
    }, [])

    useEffect(() => {
        if (webRTCService.peer) {
            webRTCService.peer.addEventListener("negotiationneeded", handalNagotiationneeded)
        }
        return () => {
            if (webRTCService.peer) {
                webRTCService.peer.removeEventListener("negotiationneeded", handalNagotiationneeded)
            }
        }
    }, [handalNagotiationneeded])

    useEffect(() => {
        if (webRTCService.peer) {
            webRTCService.peer.addEventListener("track", async (ev) => {
                const remoteStream = ev.streams
                setRemoteStream(remoteStream[0])
            })
        }
    }, [])

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
            <p>{`from: ${socket.id}  to: ${remoteUser}`}</p>
            {
                userStream && <ReactPlayer url={userStream} playing muted height={"100px"} width={"200px"} />
            }
            {
                remoteStream && <ReactPlayer url={remoteStream} playing muted height={"100px"} width={"200px"} />
            }
            {remoteUser && <button onClick={handalCall} >Call</button>}
        </main>
    )
}