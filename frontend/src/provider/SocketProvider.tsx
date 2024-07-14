import { createContext, useContext, useMemo } from "react";
import { io, Socket} from "socket.io-client"
import { SocketProviderProps } from "../types";

const SocketContext = createContext<Socket | null>(null)

export const useSocket = () => {
    const socket = useContext(SocketContext)
    return socket
}

export const SocketProvider: React.FC<SocketProviderProps> = ({children}) => {

    const socket = useMemo(() => io(import.meta.env.VITE_SERVER_URL), [])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}