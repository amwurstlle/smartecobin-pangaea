import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BinCard from "@/components/BinCard";
import NotificationList from "@/components/NotificationList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Bell, Search, Map, List, Locate } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { API_URL } from "@/lib/api";

// Use shared API base URL

interface TrashBin {
  id: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  fill_level: number;
  status: "normal" | "warning" | "full";
  battery_level?: number;
  updated_at?: string;
  distance?: number;
}

interface Notification {
  id: string;
  bin_id: string;
  message: string;
  type: "info" | "warning" | "critical";
  read: boolean;
  created_at: string;
}

// Custom marker icon for better visuals
const createBinIcon = (status: string) => {
  const colorMap: Record<string, string> = {
    normal: "green",
    warning: "orange",
    full: "red",
  };
  
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-${colorMap[status]}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

export default function SmartMonitoring() {
  const navigate = useNavigate();
  const [bins, setBins] = useState<TrashBin[]>([]);
  const [filteredBins, setFilteredBins] = useState<TrashBin[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  // Default peta ke Semarang, Indonesia
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.9932, 110.4203]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Fetch bins using new API
  const fetchBins = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/bins`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        const binsData = Array.isArray(data.bins) ? data.bins : [];
        setBins(binsData);
        
        // Apply filters
        applyFilters(binsData, searchQuery, statusFilter);
      }
    } catch (error) {
      console.error("Error fetching bins:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply search and filter
  const applyFilters = (binsData: TrashBin[], search: string, status: string) => {
    let filtered = binsData;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (bin) =>
          bin.name.toLowerCase().includes(searchLower) ||
          bin.location.toLowerCase().includes(searchLower)
      );
    }

    if (status) {
      filtered = filtered.filter((bin) => bin.status === status);
    }

    setFilteredBins(filtered);
  };

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(bins, query, statusFilter);
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status === statusFilter ? "" : status);
    applyFilters(bins, searchQuery, status === statusFilter ? "" : status);
  };

  // Get user location for nearby search
  const handleGetNearby = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setViewMode("map");

          // Fetch nearby bins
          try {
            const token = localStorage.getItem("token");
            const response = await fetch(
              `${API_URL}/api/bins/search/nearby?latitude=${latitude}&longitude=${longitude}&radius=5`,
              {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              }
            );

            if (response.ok) {
              const data = await response.json();
              setBins(data.bins || []);
              setFilteredBins(data.bins || []);
            }
          } catch (error) {
            console.error("Error fetching nearby bins:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Tidak dapat mendapatkan lokasi Anda. Mohon aktifkan layanan lokasi.");
        }
      );
    }
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchBins();
    fetchNotifications();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchBins();
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchBins, fetchNotifications]);

  // Calculate statistics
  const stats = {
    total: bins.length,
    normal: bins.filter((b) => b.status === "normal").length,
    warning: bins.filter((b) => b.status === "warning").length,
    full: bins.filter((b) => b.status === "full").length,
    avgFill: bins.length > 0 ? Math.round(bins.reduce((sum, b) => sum + b.fill_level, 0) / bins.length) : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pemantauan Sampah Pintar</h1>
          <p className="text-gray-600">Status bak dan peringatan real-time</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-xs text-gray-600">Total Bak</p>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-2xl font-bold text-green-600">{stats.normal}</div>
            <p className="text-xs text-gray-600">Normal</p>
          </Card>
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
            <p className="text-xs text-gray-600">Peringatan</p>
          </Card>
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="text-2xl font-bold text-red-600">{stats.full}</div>
            <p className="text-xs text-gray-600">Penuh</p>
          </Card>
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{unreadCount}</div>
            <p className="text-xs text-gray-600">Peringatan</p>
          </Card>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari bak berdasarkan nama atau lokasi..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
              variant="outline"
              className="gap-2"
            >
              {viewMode === "list" ? <Map className="w-4 h-4" /> : <List className="w-4 h-4" />}
              {viewMode === "list" ? "Peta" : "Daftar"}
            </Button>
            <Button onClick={handleGetNearby} variant="outline" className="gap-2">
              <Locate className="w-4 h-4" /> Terdekat
            </Button>
            <Button onClick={fetchBins} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Muat Ulang
            </Button>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {["normal", "warning", "full"].map((status) => (
              <Button
                key={status}
                onClick={() => handleStatusFilter(status)}
                variant={statusFilter === status ? "default" : "outline"}
                className={`capitalize ${
                  statusFilter === status
                    ? status === "normal"
                      ? "bg-green-600"
                      : status === "warning"
                      ? "bg-yellow-600"
                      : "bg-red-600"
                    : ""
                }`}
              >
                {status === "normal" ? "Normal" : status === "warning" ? "Peringatan" : "Penuh"}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3">
            {viewMode === "list" ? (
              <div className="space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-4 animate-pulse">
                        <div className="h-24 bg-gray-200 rounded"></div>
                      </Card>
                    ))}
                  </div>
                ) : filteredBins.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-gray-600">Tidak ada bak ditemukan</p>
                  </Card>
                ) : (
                  filteredBins.map((bin) => (
                    <Card
                      key={bin.id}
                      className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/bins/${bin.id}`)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{bin.name}</h3>
                          <p className="text-sm text-gray-600">{bin.location}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            bin.status === "normal" ? "text-green-600" :
                            bin.status === "warning" ? "text-yellow-600" :
                            "text-red-600"
                          }`}>
                            {bin.fill_level}%
                          </div>
                          <div className={`text-xs font-semibold capitalize px-2 py-1 rounded ${
                            bin.status === "normal" ? "bg-green-100 text-green-800" :
                            bin.status === "warning" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {bin.status}
                          </div>
                        </div>
                      </div>
                      {bin.distance !== undefined && (
                        <p className="text-xs text-gray-500 mt-2">
                          {bin.distance.toFixed(1)} km dari sini
                        </p>
                      )}
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <Card className="overflow-hidden h-96">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ width: "100%", height: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {filteredBins.map((bin) =>
                    bin.latitude && bin.longitude ? (
                      <Marker
                        key={bin.id}
                        position={[bin.latitude, bin.longitude]}
                        icon={createBinIcon(bin.status)}
                      >
                        <Popup>
                          <div>
                            <p className="font-semibold">{bin.name}</p>
                            <p className="text-sm">{bin.location}</p>
                            <p className="text-sm">Kepenuhan: {bin.fill_level}%</p>
                            <Button
                              onClick={() => navigate(`/bins/${bin.id}`)}
                              className="mt-2 w-full text-xs h-7"
                            >
                              Lihat Detail
                            </Button>
                          </div>
                        </Popup>
                      </Marker>
                    ) : null
                  )}
                  {userLocation && (
                    <Marker position={userLocation} icon={L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", iconSize: [32, 32] })}>
                      <Popup>Lokasi Anda</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </Card>
            )}
          </div>

          {/* Notifications Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Peringatan
                </h2>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <NotificationList
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkRead={() => {}}
                onDelete={() => {}}
                onMarkAllRead={() => {}}
                loading={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
