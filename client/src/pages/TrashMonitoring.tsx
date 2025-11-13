import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, X, AlertCircle } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function TrashMonitoring() {
  const [selectedBin, setSelectedBin] = useState<any | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const bins = [
    { id: 1, name: "Bin Simpang Lima", lat: -6.9932, lng: 110.4203, status: "normal", fill: 45, type: "Daur Ulang" },
    { id: 2, name: "Bin Tugu Muda", lat: -6.9822, lng: 110.4107, status: "warning", fill: 82, type: "Sampah Umum" },
    { id: 3, name: "Bin Kota Lama", lat: -6.9713, lng: 110.4287, status: "critical", fill: 95, type: "Organik" },
    { id: 4, name: "Bin Pandanaran", lat: -6.9886, lng: 110.4167, status: "normal", fill: 28, type: "Daur Ulang" },
    { id: 5, name: "Bin Taman Indonesia Kaya", lat: -6.9905, lng: 110.4227, status: "warning", fill: 78, type: "Sampah Umum" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "#10b981";
      case "warning":
        return "#f59e0b";
      case "critical":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-500";
      case "warning":
        return "bg-amber-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Pusatkan peta ke Semarang
    const map = L.map(mapContainerRef.current).setView([-6.9932, 110.4203], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    bins.forEach((bin) => {
      const color = getStatusColor(bin.status);
      
      const markerHtml = `
        <div style="
          width: 32px;
          height: 32px;
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([bin.lat, bin.lng], { icon }).addTo(map);
      
      marker.on("click", () => {
        setSelectedBin(bin);
        map.setView([bin.lat, bin.lng], 15);
      });

      const popupContent = `
        <div style="font-family: Poppins, sans-serif; min-width: 150px;">
          <strong style="font-size: 14px; color: #1f2937;">${bin.name}</strong><br/>
          <span style="color: #6b7280; font-size: 12px;">${bin.type}</span><br/>
          <span style="color: ${color}; font-weight: 600; font-size: 12px;">Kepenuhan: ${bin.fill}%</span>
        </div>
      `;
      
      marker.bindPopup(popupContent);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-screen pb-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div ref={mapContainerRef} className="absolute inset-0" style={{ zIndex: 0 }} data-testid="map-container"></div>

      <div className="absolute top-4 left-4 right-4 z-10">
        <Card className="p-4 glassmorphism">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" className="rounded-full" data-testid="button-locate">
              <Navigation className="w-5 h-5" />
            </Button>
            <input
              type="text"
              placeholder="Cari lokasi..."
              className="flex-1 bg-white/80 border-0 rounded-xl h-10 px-4 text-sm"
              data-testid="input-search"
            />
          </div>
        </Card>
      </div>

      <div className="absolute bottom-24 right-4 z-10">
        <Card className="p-4 glassmorphism">
          <h3 className="text-xs font-bold text-foreground mb-3">Status Bak</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              <span className="text-foreground font-medium">Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded-full border-2 border-white"></div>
              <span className="text-foreground font-medium">Hampir Penuh</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
              <span className="text-foreground font-medium">Penuh</span>
            </div>
          </div>
        </Card>
      </div>

      {selectedBin && (
        <div className="absolute bottom-0 left-0 right-0 z-20 animate-in slide-in-from-bottom duration-300">
          <Card className="rounded-t-3xl rounded-b-none p-6 shadow-2xl border-t-4 border-primary">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedBin.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedBin.type}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setSelectedBin(null)} data-testid="button-close-panel">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Tingkat Kepenuhan</span>
                  <span className="text-sm font-bold text-foreground">{selectedBin.fill}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusBgColor(selectedBin.status)} transition-all duration-500`}
                    style={{ width: `${selectedBin.fill}%` }}
                  ></div>
                </div>
              </div>

              {selectedBin.status !== "normal" && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-amber-900">Bak ini memerlukan perhatian segera</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="rounded-xl" data-testid="button-directions">
                  <Navigation className="w-4 h-4 mr-2" />
                  Arah
                </Button>
                <Button className="rounded-xl eco-gradient text-white" data-testid="button-collect">
                  Jadwalkan Pengangkutan
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
