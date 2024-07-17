import { useCallback, useEffect, useState } from "react"
import { useSocket } from "../../provider/SocketProvider"
import { CallAnserType, IncommingCallType, UserDataType } from "../../types";
import ReactPlayer from "react-player";
import webRTCService from "../../service/webRTCService";

export default function Room() {

    const [userStream, setUserStream] = useState<MediaStream | null>(null)
    const [remoteUser, setRemoteUser] = useState("")

    const socket = useSocket()

    const handalUserJoin = useCallback(({email, id}: UserDataType) => {
        setRemoteUser(id)

        console.log({email, id});
        
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

    const handalIncommingCall = useCallback(async ({from, offer}: IncommingCallType) => {
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

    const handalCallAccepted = useCallback(({from, ans}: CallAnserType) => {
        webRTCService.setLocalDescription(ans)
        console.log("call accepted")
        
    }, [])

    useEffect(() => {
        socket.on("user:join", handalUserJoin)
        socket.on("incomming:call", handalIncommingCall)
        socket.on("call:accepted", handalCallAccepted)

        return () => {
            socket.off("user:join", handalUserJoin)
            socket.off("incomming:call", handalIncommingCall)
            socket.off("call:accepted", handalCallAccepted)
        }
    }, [socket, handalUserJoin, handalIncommingCall, handalCallAccepted])

    return (
        <main>
            <h1>Room: {socket.id}</h1>
            <p>{remoteUser ? "Connected" : "No one can connect"}</p>
            <p>{`from: ${socket.id}  to: ${remoteUser}`}</p>
            {
                userStream && <ReactPlayer url={userStream} playing muted height={"100px"} width={"200px"} />
            }
            {remoteUser && <button onClick={handalCall} >Call</button>}
        </main>
    )
}