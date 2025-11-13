import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, Phone, MapPin, Trash2 } from "lucide-react";

export default function PublicControl() {
  const bins = [
    {
      id: 1,
      location: "Jl. Gajah Mada",
      fillLevel: 45,
      status: "operating",
      lastCollection: "2 jam yang lalu",
      nextCollection: "Besok 10:00",
      type: "Organik",
    },
    {
      id: 2,
      location: "Simpang Lima",
      fillLevel: 85,
      status: "full",
      lastCollection: "5 jam yang lalu",
      nextCollection: "Hari ini 18:00",
      type: "Inorganik",
    },
    {
      id: 3,
      location: "Taman Indonesia Kaya",
      fillLevel: 30,
      status: "operating",
      lastCollection: "12 jam yang lalu",
      nextCollection: "Besok 14:00",
      type: "Campuran",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "full":
        return "bg-red-100 text-red-700 border-red-300";
      case "operating":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    return status === "full" ? (
      <AlertCircle className="w-5 h-5" />
    ) : (
      <CheckCircle className="w-5 h-5" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6 space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Kontrol Bak</h1>
        <p className="text-muted-foreground">Pantau dan kelola eco-bin terdekat</p>
      </div>

      {/* Filter & Actions */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button variant="default" className="whitespace-nowrap eco-gradient">
          Semua Bak
        </Button>
        <Button variant="outline" className="whitespace-nowrap">
          Penuh
        </Button>
        <Button variant="outline" className="whitespace-nowrap">
          Beroperasi
        </Button>
        <Button variant="outline" className="whitespace-nowrap">
          Perawatan
        </Button>
      </div>

      {/* Bins List */}
      <div className="space-y-4">
        {bins.map((bin) => (
          <Card key={bin.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Bin Header */}
            <div className="p-4 pb-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Trash2 className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-foreground">{bin.location}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Jenis: {bin.type}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                    bin.status
                  )} flex items-center gap-1`}
                >
                  {getStatusIcon(bin.status)}
                  {bin.status === "full" ? "Penuh" : "Beroperasi"}
                </div>
              </div>
            </div>

            {/* Fill Level */}
            <div className="p-4 pb-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Tingkat Kepenuhan</span>
                <span className="text-lg font-bold text-foreground">{bin.fillLevel}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    bin.fillLevel > 80
                      ? "bg-red-500"
                      : bin.fillLevel > 50
                        ? "bg-amber-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${bin.fillLevel}%` }}
                ></div>
              </div>
            </div>

            {/* Collection Info */}
            <div className="p-4 pb-3 bg-gray-50">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pengangkutan Terakhir</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">{bin.lastCollection}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pengangkutan Berikutnya</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium">{bin.nextCollection}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 pt-3 flex gap-2 bg-white border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => alert(`Lihat detail untuk ${bin.location}`)}
              >
                Lihat Detail
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-blue-50"
                onClick={() => alert(`Hubungi petugas lapangan untuk ${bin.location}`)}
              >
                <Phone className="w-4 h-4 text-blue-600" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Alert Box */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Peringatan!</p>
            <p className="text-sm text-amber-800">
              1 bak hampir penuh. Petugas lapangan Anda telah diberi tahu dan akan segera mengangkutnya.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
