import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "./pages/LoginPage";
import RoleSelection from "./pages/RoleSelection";
import Dashboard from "./pages/Dashboard";
import TrashMonitoring from "./pages/TrashMonitoring";
import ControlCompartment from "./pages/ControlCompartment";
import Notifications from "./pages/Notifications";
import UserProfile from "./pages/UserProfile";
import BottomNav from "./components/BottomNav";
import NotFound from "@/pages/not-found";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSelectedRole, setHasSelectedRole] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleRoleSelect = (role: string) => {
    console.log("Selected role:", role);
    setHasSelectedRole(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setHasSelectedRole(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (!hasSelectedRole) {
    return <RoleSelection onRoleSelect={handleRoleSelect} />;
  }

  return (
    <>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/monitoring" component={TrashMonitoring} />
        <Route path="/control" component={ControlCompartment} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/profile">
          {() => <UserProfile onLogout={handleLogout} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
