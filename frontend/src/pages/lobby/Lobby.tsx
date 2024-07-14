import { useCallback, useState } from "react"

export default function Lobby() {
    const [email, setEmail] = useState("")
    const [room, setRoom] = useState("")

    const handalJoin = useCallback((e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            console.log({email, room})
        }, 
        [email, room]
    )

    return (
        <main>
            <h1>LOBBY</h1>
            <form onSubmit={handalJoin}>
                <label htmlFor="email">Email Id: </label>
                <input type="email" name="email" onChange={e => setEmail(e.target.value)} />
                <label htmlFor="room">Room Id: </label>
                <input type="email" name="room" onChange={e => setRoom(e.target.value)} />
                <input type="submit" value="Join" />
            </form>
        </main>
    )
}