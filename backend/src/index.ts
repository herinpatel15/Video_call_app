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

io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
})