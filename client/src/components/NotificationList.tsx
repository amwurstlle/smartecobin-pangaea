import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  bin_id: string;
  message: string;
  type: "info" | "warning" | "critical";
  read: boolean;
  created_at: string;
  trash_bins?: {
    id: string;
    name: string;
    location: string;
  };
}

interface NotificationListProps {
  notifications: Notification[];
  unreadCount?: number;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkAllRead?: () => void;
  loading?: boolean;
}

export default function NotificationList({
  notifications,
  unreadCount = 0,
  onMarkRead,
  onDelete,
  onMarkAllRead,
  loading = false,
}: NotificationListProps) {
  const getTypeColor = (type: string): string => {
    switch (type) {
      case "critical":
        return "bg-red-50 border-red-200 text-red-900";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-900";
      default:
        return "bg-gray-50 border-gray-200 text-gray-900";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 bg-gray-50 animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="text-muted-foreground">Belum ada notifikasi</p>
        <p className="text-xs text-muted-foreground mt-1">
          Semua bak sampah dalam kondisi baik
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with unread count and mark all read */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-foreground">Notifikasi</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {unreadCount} notifikasi belum dibaca
            </p>
          )}
        </div>
        {unreadCount > 0 && onMarkAllRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllRead}
            className="text-xs"
          >
            Tandai semua sudah dibaca
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`p-4 border-l-4 transition-all ${
            getTypeColor(notification.type)
          } ${notification.read ? "opacity-75" : "ring-1 ring-offset-1 ring-offset-background"}`}
        >
          <div className="flex gap-3">
            <div className="mt-0.5">{getTypeIcon(notification.type)}</div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <p className="font-semibold text-sm">{notification.message}</p>
                <button
                  onClick={() => onDelete?.(notification.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Hapus notifikasi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {notification.trash_bins && (
                <p className="text-xs text-muted-foreground mb-2">
                  {notification.trash_bins.name} •{" "}
                  {notification.trash_bins.location}
                </p>
              )}

              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {formatTime(notification.created_at)}
                </p>

                {!notification.read && onMarkRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkRead(notification.id)}
                    className="h-6 text-xs"
                  >
                    Tandai sudah dibaca
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
