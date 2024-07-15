import {Route, Routes} from "react-router-dom"
import Lobby from "./pages/lobby/Lobby"
import Room from "./pages/room/Room"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </>
  )
}

export default App
