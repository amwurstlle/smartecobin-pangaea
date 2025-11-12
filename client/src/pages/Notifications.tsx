import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, AlertCircle, X, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Notifications() {
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  const notifications = {
    normal: [
      { id: 1, title: "Bin A Collected", message: "Central Park Bin A has been successfully emptied", time: "2 hours ago", icon: CheckCircle },
      { id: 2, title: "System Update", message: "New software version 2.4.1 installed", time: "5 hours ago", icon: Bell },
      { id: 3, title: "Scheduled Maintenance", message: "Routine maintenance completed on sector 3", time: "1 day ago", icon: Bell },
    ],
    fullAlert: [
      { id: 4, title: "Bin B at 85%", message: "Main Street Bin B requires collection within 24 hours", time: "1 hour ago", icon: AlertTriangle },
      { id: 5, title: "Bin E at 78%", message: "Downtown Bin E filling up faster than usual", time: "3 hours ago", icon: AlertTriangle },
    ],
    critical: [
      { id: 6, title: "Bin C Critical", message: "Plaza Bin C is at 95% capacity - immediate action required", time: "30 min ago", icon: AlertCircle },
      { id: 7, title: "Sensor Malfunction", message: "Temperature sensor offline in Park Avenue Bin D", time: "1 hour ago", icon: AlertCircle },
    ],
  };

  const handleDismiss = (id: number) => {
    setDismissedIds([...dismissedIds, id]);
  };

  const NotificationItem = ({ notification, color }: { notification: any; color: string }) => {
    if (dismissedIds.includes(notification.id)) return null;

    const Icon = notification.icon;
    return (
      <Card className={`p-4 border-l-4 ${color} hover-elevate transition-all`} data-testid={`notification-${notification.id}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${color.replace("border-", "bg-")}/10 flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${color.replace("border-", "text-")}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">{notification.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
            <span className="text-xs text-muted-foreground">{notification.time}</span>
          </div>
          <Button size="icon" variant="ghost" className="flex-shrink-0" onClick={() => handleDismiss(notification.id)} data-testid={`button-dismiss-${notification.id}`}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 p-6 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on bin status and system alerts</p>
        </div>
        <Button variant="outline" className="rounded-xl" data-testid="button-mark-all-read">
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12 rounded-xl">
          <TabsTrigger value="all" className="rounded-lg" data-testid="tab-all">
            All
            <Badge className="ml-2 h-5 px-2" variant="secondary">
              {notifications.normal.length + notifications.fullAlert.length + notifications.critical.length - dismissedIds.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="normal" className="rounded-lg" data-testid="tab-normal">
            Normal
            <Badge className="ml-2 h-5 px-2" variant="secondary">
              {notifications.normal.filter((n) => !dismissedIds.includes(n.id)).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="warning" className="rounded-lg" data-testid="tab-warning">
            Alerts
            <Badge className="ml-2 h-5 px-2 bg-amber-500 text-white">
              {notifications.fullAlert.filter((n) => !dismissedIds.includes(n.id)).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="critical" className="rounded-lg" data-testid="tab-critical">
            Critical
            <Badge className="ml-2 h-5 px-2 bg-red-500 text-white">
              {notifications.critical.filter((n) => !dismissedIds.includes(n.id)).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-3">
          {notifications.critical.map((n) => (
            <NotificationItem key={n.id} notification={n} color="border-red-500" />
          ))}
          {notifications.fullAlert.map((n) => (
            <NotificationItem key={n.id} notification={n} color="border-amber-500" />
          ))}
          {notifications.normal.map((n) => (
            <NotificationItem key={n.id} notification={n} color="border-blue-500" />
          ))}
        </TabsContent>

        <TabsContent value="normal" className="mt-6 space-y-3">
          {notifications.normal.map((n) => (
            <NotificationItem key={n.id} notification={n} color="border-blue-500" />
          ))}
        </TabsContent>

        <TabsContent value="warning" className="mt-6 space-y-3">
          {notifications.fullAlert.map((n) => (
            <NotificationItem key={n.id} notification={n} color="border-amber-500" />
          ))}
        </TabsContent>

        <TabsContent value="critical" className="mt-6 space-y-3">
          {notifications.critical.map((n) => (
            <NotificationItem key={n.id} notification={n} color="border-red-500" />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
