import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "./pages/LoginPage";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import RoleSelection from "./pages/RoleSelection";
import Dashboard from "./pages/Dashboard";
import TrashMonitoring from "./pages/TrashMonitoring";
import ControlCompartment from "./pages/ControlCompartment";
import Notifications from "./pages/Notifications";
import UserProfile from "./pages/UserProfile";
import PublicHome from "./pages/PublicHome";
import PublicControl from "./pages/PublicControl";
import PublicMonitor from "./pages/PublicMonitor";
import SmartMonitoring from "./pages/SmartMonitoring";
import BinDetails from "./pages/BinDetails";
import BottomNav from "./components/BottomNav";
import NotFound from "@/pages/not-found";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token/user on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      setIsAuthenticated(true);
      try {
        const userData = JSON.parse(user);
        setSelectedRole(userData.role);
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setSelectedRole(userData.role);
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  };

  const handleRoleSelect = (role: string) => {
    console.log("Selected role:", role);
    setSelectedRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setSelectedRole(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-green-300 border-t-green-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {!selectedRole ? (
        <Route path="*" element={<RoleSelection onRoleSelect={handleRoleSelect} />} />
      ) : selectedRole === "public" ? (
        <>
          <Route path="/" element={<PublicHome />} />
          <Route path="/home" element={<PublicHome />} />
          <Route path="/control" element={<PublicControl />} />
          <Route path="/monitor" element={<PublicMonitor />} />
          <Route path="/bins/:id" element={<BinDetails />} />
          <Route path="/profile" element={<UserProfile onLogout={handleLogout} />} />
          <Route path="*" element={<NotFound />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/monitoring" element={<TrashMonitoring />} />
          <Route path="/smart-monitoring" element={<SmartMonitoring />} />
          <Route path="/control" element={<ControlCompartment />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/bins/:id" element={<BinDetails />} />
          <Route path="/profile" element={<UserProfile onLogout={handleLogout} />} />
          <Route path="*" element={<NotFound />} />
        </>
      )}
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <div className="flex flex-col h-screen">
            <div className="flex-1 overflow-auto pb-20 sm:pb-0">
              <Router />
            </div>
            {/* BottomNav will be conditionally rendered based on route */}
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
