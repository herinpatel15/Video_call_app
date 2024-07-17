import { Socket } from "socket.io-client"

export interface SocketProviderProps {
    children: React.ReactNode
}

export interface SocketContextType {
    socket: Socket | undefined
}

export interface ClientDataType {
    email: string,
    room: string
}

export interface UserDataType {
    email: string,
    id: string
}

export interface IncommingCallType {
    from: string,
    offer: RTCSessionDescription
}

export interface CallAnserType {
    from: string,
    ans: RTCSessionDescription
}