import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle, CheckCircle, TrendingUp, Leaf, Recycle, Phone } from "lucide-react";

export default function PublicMonitor() {
  const monitoringData = [
    {
      area: "Semarang Tengah",
      binsTotal: 45,
      binsClean: 38,
      binsFull: 5,
      binsUnderMaintenance: 2,
      collectionRate: 92,
      trend: "+5%",
    },
    {
      area: "Semarang Selatan",
      binsTotal: 52,
      binsClean: 45,
      binsFull: 4,
      binsUnderMaintenance: 3,
      collectionRate: 89,
      trend: "+2%",
    },
    {
      area: "Semarang Timur",
      binsTotal: 38,
      binsClean: 32,
      binsFull: 4,
      binsUnderMaintenance: 2,
      collectionRate: 86,
      trend: "-1%",
    },
  ];

  const issues = [
    {
      id: 1,
      location: "Jl. Pandanaran",
      issue: "Bak penuh",
      severity: "high",
      reported: "2 jam lalu",
      status: "Dalam Proses",
    },
    {
      id: 2,
      location: "Simpang Lima",
      issue: "Sensor bermasalah",
      severity: "medium",
      reported: "4 jam lalu",
      status: "Tertunda",
    },
    {
      id: 3,
      location: "Kota Lama",
      issue: "Tutup macet",
      severity: "low",
      reported: "6 jam lalu",
      status: "Dijadwalkan",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      case "low":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6 space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Pemantauan</h1>
        <p className="text-muted-foreground">Lacak performa eco-bin di wilayah Anda</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-foreground">345</div>
          <div className="text-xs text-muted-foreground">Total Bak Dipantau</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-foreground">13</div>
          <div className="text-xs text-muted-foreground">Peringatan Aktif</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Leaf className="w-5 h-5 text-emerald-600" />
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-foreground">89%</div>
          <div className="text-xs text-muted-foreground">Tingkat Pengangkutan</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Recycle className="w-5 h-5 text-blue-600" />
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-foreground">12.5t</div>
          <div className="text-xs text-muted-foreground">Terkumpul Hari Ini</div>
        </Card>
      </div>

      {/* Areas Performance */}
      <Card className="p-6">
  <h2 className="text-xl font-bold text-foreground mb-4">Performa Area</h2>
        <div className="space-y-4">
          {monitoringData.map((area, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-foreground">{area.area}</h3>
                    <p className="text-xs text-muted-foreground">{area.binsTotal} total bak</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">{area.collectionRate}%</div>
                  <p className={`text-xs font-semibold ${area.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {area.trend}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-green-100 text-green-700 px-3 py-2 rounded text-center">
                  <div className="font-bold">{area.binsClean}</div>
                  <div className="text-xs">Bersih</div>
                </div>
                <div className="bg-amber-100 text-amber-700 px-3 py-2 rounded text-center">
                  <div className="font-bold">{area.binsFull}</div>
                  <div className="text-xs">Penuh</div>
                </div>
                <div className="bg-blue-100 text-blue-700 px-3 py-2 rounded text-center">
                  <div className="font-bold">{area.binsUnderMaintenance}</div>
                  <div className="text-xs">Perawatan</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Active Issues */}
      <Card className="p-6">
  <h2 className="text-xl font-bold text-foreground mb-4">Permasalahan Aktif</h2>
        <div className="space-y-3">
          {issues.map((issue) => (
            <div key={issue.id} className="p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`w-5 h-5 ${getSeverityColor(issue.severity)}`} />
                    <h3 className="font-bold text-foreground">{issue.issue}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getSeverityColor(issue.severity)}`}>
                      {issue.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {issue.location}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{issue.reported}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-blue-600 mb-2">{issue.status}</p>
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    <Phone className="w-3 h-3 mr-1" />
                    Telepon
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Contact */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <h2 className="text-lg font-bold text-foreground mb-3">Butuh Bantuan?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Hubungi petugas lapangan untuk bantuan segera
        </p>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <Phone className="w-4 h-4 mr-2" />
          Telepon Petugas
        </Button>
      </Card>
    </div>
  );
}
