import express, {Express, Request, Response} from "express"

const app: Express = express()

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!")
})

app.listen(8080, () => {
    console.log("app running on 8080");
    
})