import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, Zap, Trash2, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Bin {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  fill_level: number;
  status: "normal" | "warning" | "full";
  sensor_id: string;
  battery_level: number;
  capacity: number;
  images: string[];
  notes: string;
  last_collection: string;
  next_collection: string;
  field_officer_id: string;
  created_at: string;
  updated_at: string;
}

interface FieldOfficer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
}

interface Notification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

interface BinDetailsResponse {
  bin: Bin & {
    fieldOfficer: FieldOfficer | null;
    recentNotifications: Notification[];
  };
}

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function BinDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bin, setBin] = useState<Bin | null>(null);
  const [fieldOfficer, setFieldOfficer] = useState<FieldOfficer | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBinDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/bins/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil detail bak");
        }

        const data: BinDetailsResponse = await response.json();
        setBin(data.bin);
        setFieldOfficer(data.bin.fieldOfficer);
        setRecentNotifications(data.bin.recentNotifications);
      } catch (err) {
  setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBinDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-green-300 border-t-green-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail bak...</p>
        </div>
      </div>
    );
  }

  if (error || !bin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center text-green-600 hover:text-green-700"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Kembali
          </button>
          <Card className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error || "Bak tidak ditemukan"}</p>
          </Card>
        </div>
      </div>
    );
  }

  const statusConfig = {
    normal: { color: "bg-green-100", textColor: "text-green-800", label: "Normal", icon: CheckCircle },
    warning: { color: "bg-yellow-100", textColor: "text-yellow-800", label: "Peringatan", icon: AlertCircle },
    full: { color: "bg-red-100", textColor: "text-red-800", label: "Penuh", icon: AlertCircle },
  };

  const config = statusConfig[bin.status];
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Kembali
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{bin.name}</h1>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{bin.location}</span>
              </div>
            </div>

            <div className={`${config.color} ${config.textColor} px-4 py-2 rounded-full flex items-center gap-2`}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-semibold">{config.label}</span>
            </div>
          </div>
        </div>

        {/* Map */}
        {bin.latitude && bin.longitude && (
          <Card className="mb-6 overflow-hidden h-80">
            <MapContainer
              center={[bin.latitude, bin.longitude]}
              zoom={15}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[bin.latitude, bin.longitude]} icon={customIcon}>
                <Popup>{bin.name}</Popup>
              </Marker>
            </MapContainer>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Tingkat Kepenuhan */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Tingkat Kepenuhan</h3>
              <Trash2 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">{bin.fill_level}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  bin.fill_level < 60
                    ? "bg-green-500"
                    : bin.fill_level < 80
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${bin.fill_level}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Kapasitas {bin.capacity}L</p>
          </Card>

          {/* Baterai */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Baterai</h3>
              <Zap className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{bin.battery_level}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  bin.battery_level > 50 ? "bg-green-500" : bin.battery_level > 25 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${bin.battery_level}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">ID Sensor: {bin.sensor_id}</p>
          </Card>

          {/* Pembaruan */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Terakhir Diperbarui</h3>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {new Date(bin.updated_at).toLocaleString()}
            </p>
            <div className="space-y-1 text-xs text-gray-500">
              <p>Dibuat: {new Date(bin.created_at).toLocaleDateString()}</p>
            </div>
          </Card>
        </div>

        {/* Jadwal Pengangkutan */}
        {(bin.last_collection || bin.next_collection) && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Jadwal Pengangkutan</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {bin.last_collection && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Pengangkutan Terakhir</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(bin.last_collection).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(bin.last_collection).toLocaleTimeString()}
                  </p>
                </div>
              )}
              {bin.next_collection && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Pengangkutan Berikutnya</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(bin.next_collection).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(bin.next_collection).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Petugas Lapangan */}
        {fieldOfficer && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Petugas Lapangan Penanggung Jawab</h3>
            <div className="flex items-center gap-4">
              {fieldOfficer.avatar_url && (
                <img
                  src={fieldOfficer.avatar_url}
                  alt={fieldOfficer.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{fieldOfficer.name}</p>
                <p className="text-sm text-gray-600">{fieldOfficer.email}</p>
                {fieldOfficer.phone && (
                  <p className="text-sm text-gray-600">{fieldOfficer.phone}</p>
                )}
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Hubungi Petugas
              </Button>
            </div>
          </Card>
        )}

        {/* Catatan */}
        {bin.notes && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Catatan</h3>
            <p className="text-gray-700">{bin.notes}</p>
          </Card>
        )}

        {/* Peringatan Terbaru */}
        {recentNotifications.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Peringatan Terbaru</h3>
            <div className="space-y-3">
              {recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg ${
                    notif.type === "critical"
                      ? "bg-red-50 border border-red-200"
                      : notif.type === "warning"
                      ? "bg-yellow-50 border border-yellow-200"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <p className="text-sm text-gray-800">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
