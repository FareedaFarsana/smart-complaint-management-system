import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";
import CreateComplaint from "./pages/CreateComplaint";
import Notifications from "./pages/Notifications";
import AdminUsers from "./pages/AdminUsers";
import Profile from "./pages/Profile";
import Feedback from "./pages/Feedback";
import ComplaintTimeline from "./pages/ComplaintTimeline";
import DeadlineManagement from "./pages/DeadlineManagement";

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

          <Route
            path="/create"
            element={
                <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
                    <CreateComplaint />
                </ProtectedRoute>
            }
        />

          <Route path="/notifications" element={<ProtectedRoute><Notifications/></ProtectedRoute>} />

          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminUsers/></ProtectedRoute>}/>

          <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />

          <Route path="/feedback" element={<ProtectedRoute allowedRoles={["ADMIN", "USER"]}><Feedback /> </ProtectedRoute> } />

          <Route path="/complaint-timeline" element={<ProtectedRoute allowedRoles={["USER"]}><ComplaintTimeline /></ProtectedRoute> }/>

          <Route path="/admin/deadlines" element={<ProtectedRoute allowedRoles={["ADMIN"]}><DeadlineManagement /></ProtectedRoute>}/>

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App