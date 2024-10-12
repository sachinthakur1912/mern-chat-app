import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Chats from "./pages/Chats";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chats" element={<Chats />} />
      </Routes>
    </div>
  );
}

export default App;
