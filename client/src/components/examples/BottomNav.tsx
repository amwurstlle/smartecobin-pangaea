import { Router } from "wouter";
import BottomNav from "../BottomNav";

export default function BottomNavExample() {
  return (
    <Router>
      <div className="h-screen bg-background">
        <div className="p-6 pb-24">
          <h2 className="text-2xl font-bold">Bottom Navigation Example</h2>
          <p className="text-muted-foreground">Click the navigation items below to see the active state</p>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}
