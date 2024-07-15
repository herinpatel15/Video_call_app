import { useCallback, useEffect, useState } from "react"
import { useSocket } from "../../provider/SocketProvider"
import { UserDataType } from "../../types";
import ReactPlayer from "react-player";

export default function Room() {

    const [remoteUserId, setRemoteUserId] = useState<string | null>(null)
    const [userStream, setUserStream] = useState<MediaStream | null>(null)

    const socket = useSocket()

    const handalUserJoin = useCallback(({email, id}: UserDataType) => {
        console.log(email, id);
        setRemoteUserId(id)
    }, [])

    const handalCall = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })

        setUserStream(stream)
    }, [setUserStream])

    useEffect(() => {
        socket.on("user-join", handalUserJoin)

        return () => {
            socket.off("user-join", handalUserJoin)
        }
    }, [socket, handalUserJoin])

    return (
        <main>
            <h1>Room</h1>
            <p>{remoteUserId ? "Connected" : "No one can connect"}</p>
            {
                userStream && <ReactPlayer url={userStream} playing muted height={"100px"} width={"200px"} />
            }
            <button onClick={handalCall} >Call</button>
        </main>
    )
}