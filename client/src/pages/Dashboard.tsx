import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { TrendingUp, Trash2, CheckCircle, Recycle } from "lucide-react";
import { API_URL } from "@/lib/api";

export default function Dashboard() {
  const stats = [
    { label: "Total Bak", value: "248", change: "+12%", icon: Trash2, color: "text-emerald-600" },
    { label: "Terkumpul Hari Ini", value: "1.8t", change: "+18%", icon: CheckCircle, color: "text-blue-600" },
    { label: "Efisiensi", value: "94%", change: "+5%", icon: TrendingUp, color: "text-primary" },
  ];

  const collectedToday = stats.find((s) => s.label === "Terkumpul Hari Ini")?.value || "-";

  const trashData = [
    { day: "Sen", volume: 65 },
    { day: "Sel", volume: 78 },
    { day: "Rab", volume: 58 },
    { day: "Kam", volume: 85 },
    { day: "Jum", volume: 92 },
    { day: "Sab", volume: 70 },
    { day: "Min", volume: 55 },
  ];

  const maxVolume = Math.max(...trashData.map((d) => d.volume));

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6 space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Pantau performa jaringan bak sampah pintar Anda</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-5 hover-elevate transition-all" data-testid={`card-stat-${index}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-primary/10 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-semibold ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
        {/* Action card placed next to Efficiency */}
        <Card
          className="p-5 hover-elevate transition-all"
          data-testid="card-empty-bin"
          aria-label="Kosongkan Bak"
          title="Kosongkan Bak"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Recycle className="w-5 h-5" />
            </div>
            {/* no change badge for action card */}
          </div>
          <div className="text-2xl font-bold text-foreground mb-3">Kosongkan Bak</div>
          <Button
            className="w-full h-10 rounded-xl"
            onClick={async () => {
              const token = localStorage.getItem("token");
              try {
                const resp = await fetch(`${API_URL}/api/actions/empty`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                  body: JSON.stringify({ notes: 'Kosongkan Bak dari Dashboard' })
                });
                if (!resp.ok) {
                  const data = await resp.json().catch(() => ({}));
                  const msg = data.error || data.details || 'Gagal merekam aksi.';
                  alert(msg);
                } else {
                  alert('Aksi dikirim. Histori diperbarui.');
                }
              } catch (e) {
                alert(e instanceof Error ? e.message : String(e));
              }
            }}
            data-testid="button-empty-bin"
          >
            Kosongkan
          </Button>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Volume Koleksi Mingguan</h2>
        <div className="flex items-end justify-between h-64 gap-3">
          {trashData.map((data, index) => {
            const heightPercent = (data.volume / maxVolume) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2" data-testid={`bar-${index}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full relative">
                      <div
                        className="w-full eco-gradient rounded-t-lg transition-all duration-500 hover:opacity-80"
                        style={{ height: `${heightPercent * 2}px` }}
                        aria-label={`${data.day}: ${data.volume}`}
                      ></div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <div className="font-semibold">{data.day}</div>
                      <div>Volume: {data.volume}</div>
                      <div>Terkumpul Hari Ini: {collectedToday}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
                <span className="text-xs font-medium text-muted-foreground">{data.day}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Removed Kategori Sampah section as requested */}
    </div>
  );
}
