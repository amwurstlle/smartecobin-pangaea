import { Card } from "@/components/ui/card";
import { TrendingUp, Trash2, AlertTriangle, CheckCircle, Leaf, Recycle, Droplet } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { label: "Total Bins", value: "248", change: "+12%", icon: Trash2, color: "text-emerald-600" },
    { label: "Active Alerts", value: "8", change: "-3%", icon: AlertTriangle, color: "text-amber-600" },
    { label: "Collected Today", value: "1.8t", change: "+18%", icon: CheckCircle, color: "text-blue-600" },
    { label: "Efficiency", value: "94%", change: "+5%", icon: TrendingUp, color: "text-primary" },
  ];

  const trashData = [
    { day: "Mon", volume: 65 },
    { day: "Tue", volume: 78 },
    { day: "Wed", volume: 58 },
    { day: "Thu", volume: 85 },
    { day: "Fri", volume: 92 },
    { day: "Sat", volume: 70 },
    { day: "Sun", volume: 55 },
  ];

  const categories = [
    { name: "Plastic", percentage: 35, icon: Recycle, color: "bg-blue-500" },
    { name: "Paper", percentage: 28, icon: Leaf, color: "bg-emerald-500" },
    { name: "Glass", percentage: 18, icon: Droplet, color: "bg-cyan-500" },
    { name: "Metal", percentage: 12, icon: Trash2, color: "bg-gray-500" },
    { name: "Organic", percentage: 7, icon: Leaf, color: "bg-green-600" },
  ];

  const maxVolume = Math.max(...trashData.map((d) => d.volume));

  return (
    <div className="p-6 space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Monitor your eco-bin network performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-5 hover-elevate transition-all" data-testid={`card-stat-${index}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-primary/10 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-semibold ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Weekly Collection Volume</h2>
        <div className="flex items-end justify-between h-64 gap-3">
          {trashData.map((data, index) => {
            const heightPercent = (data.volume / maxVolume) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2" data-testid={`bar-${index}`}>
                <div className="w-full relative">
                  <div
                    className="w-full eco-gradient rounded-t-lg transition-all duration-500 hover:opacity-80"
                    style={{ height: `${heightPercent * 2}px` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-muted-foreground">{data.day}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Trash Categories</h2>
        <div className="space-y-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div key={index} className="space-y-2" data-testid={`category-${index}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{category.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{category.percentage}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${category.color} rounded-full transition-all duration-500`} style={{ width: `${category.percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
