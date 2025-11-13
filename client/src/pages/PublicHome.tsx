import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, AlertCircle, CheckCircle, Star } from "lucide-react";

export default function PublicHome() {
  const fieldOfficer = {
    name: "Ahmad Santoso",
    phone: "+62 812-3456-7890",
    area: "Semarang, Jawa Tengah",
    status: "Tersedia",
  };

  const recentBins = [
    { location: "Simpang Lima", status: "Clean", distance: "0.5 km" },
    { location: "Tugu Muda", status: "Medium", distance: "1.2 km" },
    { location: "Kota Lama", status: "Clean", distance: "0.8 km" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6 space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Smart Eco Bin</h1>
        <p className="text-muted-foreground">Asisten pengelolaan sampah lokal Anda</p>
      </div>

      {/* Field Officer Card */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">Petugas Lapangan Anda</h2>
            <p className="text-sm text-muted-foreground">{fieldOfficer.area}</p>
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            {fieldOfficer.status}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 space-y-3">
          <div className="text-lg font-bold text-foreground">{fieldOfficer.name}</div>
          <a
            href={`tel:${fieldOfficer.phone}`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Phone className="w-4 h-4" />
            {fieldOfficer.phone}
          </a>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Hubungi Petugas
          </Button>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600 mb-1">12</div>
          <div className="text-xs text-muted-foreground">Bak Terdekat</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">8</div>
          <div className="text-xs text-muted-foreground">Bersih</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-600 mb-1">4</div>
          <div className="text-xs text-muted-foreground">Hampir Penuh</div>
        </Card>
      </div>

      {/* Recent Bins */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Bak Terdekat</h2>
        <div className="space-y-3">
          {recentBins.map((bin, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">{bin.location}</p>
                  <p className="text-sm text-muted-foreground">{bin.distance} dari sini</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {bin.status === "Clean" ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
                <span className="text-sm font-medium">{bin.status === "Clean" ? "Bersih" : bin.status === "Medium" ? "Sedang" : bin.status}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Features */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Apa yang Bisa Anda Lakukan</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-auto py-4">
            <div className="text-center">
              <MapPin className="w-5 h-5 mx-auto mb-2 text-emerald-600" />
              <div className="text-sm font-medium">Cari Bak</div>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4">
            <div className="text-center">
              <AlertCircle className="w-5 h-5 mx-auto mb-2 text-amber-600" />
              <div className="text-sm font-medium">Laporkan Masalah</div>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4">
            <div className="text-center">
              <Star className="w-5 h-5 mx-auto mb-2 text-blue-600" />
              <div className="text-sm font-medium">Nilai Petugas</div>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4">
            <div className="text-center">
              <Phone className="w-5 h-5 mx-auto mb-2 text-green-600" />
              <div className="text-sm font-medium">Kontak</div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}
