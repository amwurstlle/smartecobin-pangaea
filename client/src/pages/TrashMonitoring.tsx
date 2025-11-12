import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, X, AlertCircle } from "lucide-react";

export default function TrashMonitoring() {
  const [selectedBin, setSelectedBin] = useState<any | null>(null);

  const bins = [
    { id: 1, name: "Central Park Bin A", lat: 40.7829, lng: -73.9654, status: "normal", fill: 45, type: "Recycling" },
    { id: 2, name: "Main Street Bin B", lat: 40.7589, lng: -73.9851, status: "warning", fill: 82, type: "General Waste" },
    { id: 3, name: "Plaza Bin C", lat: 40.7614, lng: -73.9776, status: "critical", fill: 95, type: "Organic" },
    { id: 4, name: "Park Avenue Bin D", lat: 40.7580, lng: -73.9855, status: "normal", fill: 28, type: "Recycling" },
    { id: 5, name: "Downtown Bin E", lat: 40.7489, lng: -73.9680, status: "warning", fill: 78, type: "General Waste" },
  ];

  const getStatusColor = (status: string) => {
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

  return (
    <div className="relative h-screen pb-20">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100">
        <div className="relative w-full h-full">
          {bins.map((bin) => (
            <button
              key={bin.id}
              className={`absolute w-10 h-10 ${getStatusColor(bin.status)} rounded-full border-4 border-white shadow-lg hover:scale-110 transition-transform cursor-pointer`}
              style={{
                left: `${20 + bin.id * 15}%`,
                top: `${30 + (bin.id % 3) * 20}%`,
              }}
              onClick={() => setSelectedBin(bin)}
              data-testid={`marker-bin-${bin.id}`}
            >
              <MapPin className="w-4 h-4 text-white mx-auto" />
            </button>
          ))}
        </div>

        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="p-4 glassmorphism">
            <div className="flex items-center gap-3">
              <Button size="icon" variant="ghost" className="rounded-full" data-testid="button-locate">
                <Navigation className="w-5 h-5" />
              </Button>
              <input
                type="text"
                placeholder="Search locations..."
                className="flex-1 bg-white/80 border-0 rounded-xl h-10 px-4 text-sm"
                data-testid="input-search"
              />
            </div>
          </Card>
        </div>

        <div className="absolute top-20 right-4 z-10 space-y-2">
          <Card className="p-3 glassmorphism">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-foreground font-medium">Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-foreground font-medium">80% Full</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-foreground font-medium">Critical</span>
              </div>
            </div>
          </Card>
        </div>
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
                  <span className="text-sm font-medium text-foreground">Fill Level</span>
                  <span className="text-sm font-bold text-foreground">{selectedBin.fill}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusColor(selectedBin.status)} transition-all duration-500`}
                    style={{ width: `${selectedBin.fill}%` }}
                  ></div>
                </div>
              </div>

              {selectedBin.status !== "normal" && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-amber-900">This bin requires attention soon</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="rounded-xl" data-testid="button-directions">
                  <Navigation className="w-4 h-4 mr-2" />
                  Directions
                </Button>
                <Button className="rounded-xl eco-gradient text-white" data-testid="button-collect">
                  Schedule Collection
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
