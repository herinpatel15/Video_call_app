// import express, {Express, Request, Response} from "express"

// const app: Express = express()

// app.get("/", (req: Request, res: Response) => {
//     res.send("Hello World!")
// })

// app.listen(8080, () => {
//     console.log("app running on 8080");
    
// })

import { Server, Socket } from "socket.io"

const io = new Server(8000, {
    cors: {
        origin: "http://localhost:5173"
    }
})

const emailToSocketMap = new Map()
const socketToEmailMap = new Map()

io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("room:join", (data) => {
        const { email, room } = data;
        emailToSocketMap.set(email, socket.id)
        socketToEmailMap.set(socket.id, email)
        io.to(room).emit("user:join", {
            email,
            id: socket.id
        })
        socket.join(room)
        io.to(socket.id).emit("room:join", {
            email,
            room
        })
    });

    socket.on("user:call", ({id, offer}) => {
        console.log("incomming call: ", id);
        
        io.to(id).emit("incomming:call", {
            from: socket.id,
            offer
        })
    });
    
    socket.on("call:accepted", ({to, ans}) => {
        console.log("call accepted: ", to);

        io.to(to).emit("call:accepted", {
            from: socket.id,
            ans
        })
    })
})