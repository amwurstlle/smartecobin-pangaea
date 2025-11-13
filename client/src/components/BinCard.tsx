import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrashBin {
  id: string;
  name: string;
  location: string;
  fill_level: number;
  status: "normal" | "warning" | "full";
  last_updated: string;
}

interface BinCardProps {
  bin: TrashBin;
  onRefresh?: () => void;
}

export default function BinCard({ bin, onRefresh }: BinCardProps) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "full":
        return "bg-red-100 text-red-700 border-red-300";
      case "warning":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "normal":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "full":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "normal":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getProgressColor = (level: number): string => {
    if (level >= 80) return "bg-red-500";
    if (level >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "full":
        return "PENUH";
      case "warning":
        return "PERINGATAN";
      case "normal":
        return "NORMAL";
      default:
        return status.toUpperCase();
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

  return (
    <Card className="p-5 hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon(bin.status)}
            <h3 className="font-bold text-lg text-foreground">{bin.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{bin.location}</p>
        </div>
        <Badge
          className={`whitespace-nowrap border ${getStatusColor(bin.status)}`}
          variant="outline"
        >
          {getStatusLabel(bin.status)}
        </Badge>
      </div>

      {/* Tingkat Kepenuhan */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Tingkat Kepenuhan</span>
          <span className="text-lg font-bold text-foreground">{bin.fill_level}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(
              bin.fill_level
            )}`}
            style={{ width: `${bin.fill_level}%` }}
          ></div>
        </div>
      </div>

      {/* Terakhir diperbarui */}
      <div className="text-xs text-muted-foreground border-t pt-3">
        Terakhir diperbarui: {formatTime(bin.last_updated)}
      </div>
    </Card>
  );
}
