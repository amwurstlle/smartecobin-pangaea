import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { API_URL } from "@/lib/api";

type ActionItem = {
  id: string;
  action: string;
  notes?: string | null;
  created_at: string;
  users?: { name?: string | null; email?: string | null } | null;
  trash_bins?: { id: string; name: string; location?: string | null } | null;
}

export default function History() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const resp = await fetch(`${API_URL}/api/actions/history?limit=50`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Gagal memuat histori');
        setItems(data.history || []);
      } catch (e: any) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 p-6 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Histori</h1>
          <p className="text-muted-foreground">Riwayat aksi seperti Kosongkan Bak</p>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={() => window.location.reload()}>
          Muat Ulang
        </Button>
      </div>

      {error && (
        <Card className="p-4 border-red-500">
          <div className="text-red-600 text-sm">{error}</div>
        </Card>
      )}

      {loading ? (
        <Card className="p-4">Memuat…</Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="p-4 border-l-4 border-blue-500 hover-elevate transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">{item.action === 'EMPTY_BIN' ? 'Kosongkan Bak' : item.action}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.notes || (item.trash_bins?.name ? `Aksi pada ${item.trash_bins.name}` : 'Aksi terekam')}
                  </p>
                  <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</span>
                </div>
                {item.users?.name && (
                  <Badge variant="secondary" className="flex-shrink-0">{item.users.name}</Badge>
                )}
              </div>
            </Card>
          ))}
          {items.length === 0 && (
            <Card className="p-4">Belum ada histori.</Card>
          )}
        </div>
      )}
    </div>
  );
}