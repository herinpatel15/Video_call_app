import { useCallback, useEffect, useState } from "react"
import { useSocket } from "../../provider/SocketProvider"
import { IncommingCallType, UserDataType } from "../../types";
import ReactPlayer from "react-player";
import webRTCService from "../../service/webRTCService";

export default function Room() {

    const [userStream, setUserStream] = useState<MediaStream | null>(null)
    const [remoteUser, setRemoteUser] = useState("")

    const socket = useSocket()

    // const handalUserJoin = useCallback(({email, id}: UserDataType) => {
    //     console.log({
    //         email,
    //         id
    //     });
    //     setRemoteUser(id)
    //     console.log({
    //         "last": "oh",
    //         email,
    //         id,
    //         remoteUser
    //     });
    // }, [])

    const handalUserJoin = ({email, id}: UserDataType) => {
        console.log({
            email,
            id
        })
        setRemoteUser(prevUser => {
            console.log('Updating remoteUser from', prevUser, 'to', id);
            return id;
        });
    }

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
    }, [setUserStream, socket]);

    const handalIncommingCall = useCallback(({from, offer}: IncommingCallType) => {
        console.log({
            from,
            offer
        });
    }, []);

    useEffect(() => {
        socket.on("user:join", handalUserJoin)
        socket.on("incomming:call", handalIncommingCall)

        return () => {
            socket.off("user:join", handalUserJoin)
            socket.off("incomming:call", handalIncommingCall)
        }
    }, [socket, handalUserJoin, handalIncommingCall])

    return (
        <main>
            <h1>Room</h1>
            <p>{remoteUser ? "Connected" : "No one can connect"}</p>
            {
                userStream && <ReactPlayer url={userStream} playing muted height={"100px"} width={"200px"} />
            }
            <button onClick={handalCall} >Call</button>
        </main>
    )
}