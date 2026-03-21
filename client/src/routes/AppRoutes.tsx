import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Community from "../pages/Community";
import RoadmapDashboard from "../pages/RoadmapDashboard";
import UserDashboard from "../pages/UserDashboard";
import Generate from "../pages/Generate";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Layout Wrapper */}
      <Route element={<MainLayout />}>

      {/* ==========================================
            🌐 PUBLIC ROUTES (Anyone can see these)
            ========================================== */}
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />

        {/* ==========================================
            🔒 PRIVATE ROUTES (Requires Login)
            ========================================== */}

        <Route path="/" element={<Home />} />
         <Route path="/generate" element={<ProtectedRoute><Generate /></ProtectedRoute>} />
        
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/roadmap/:id" element={<ProtectedRoute><RoadmapDashboard /></ProtectedRoute>} />
      
        {/* <Route path="/result" element={<Result />} /> */}
        <Route path="/community" element={<Community />} />
        
       {/* <Route path="/my-generations" element={<MyGenerations />} />*/}
      </Route>

    </Routes>
  );
}