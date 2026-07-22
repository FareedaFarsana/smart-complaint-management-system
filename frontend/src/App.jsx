import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>

          {/* authentication */}
          <Route path="/register" element={<Register />}/>
          <Route path="/" element={<Login/>}/>

          {/* main application */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />

          <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>}/>

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App