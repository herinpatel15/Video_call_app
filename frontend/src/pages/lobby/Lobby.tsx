import { useCallback, useEffect, useState } from "react"
import { useSocket } from "../../provider/SocketProvider"
import { ClientDataType } from "../../types"
import { useNavigate } from "react-router-dom"

export default function Lobby() {
    const [email, setEmail] = useState("")
    const [room, setRoom] = useState("")

    const socket = useSocket()
    const navigate = useNavigate()

    const handalJoin = useCallback((e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            socket.emit("room:join", {email, room})
        }, 
        [email, room, socket]
    )

    const handalRoomJoin = useCallback((data: ClientDataType) => {
        const { room } = data
        navigate(`/room/${room}`)
        
    }, [navigate])

    useEffect(() => {
        socket.on("room:join", handalRoomJoin)

        return () => {
            socket.off("room:join", handalRoomJoin)
        }
    }, [socket, handalRoomJoin])

    return (
        <main>
            <h1>LOBBY</h1>
            <form onSubmit={handalJoin}>
                <label htmlFor="email">Email Id: </label>
                <input type="email" name="email" onChange={e => setEmail(e.target.value)} />
                <label htmlFor="room">Room Id: </label>
                <input type="text" name="room" onChange={e => setRoom(e.target.value)} />
                <input type="submit" value="Join" />
            </form>
        </main>
    )
}