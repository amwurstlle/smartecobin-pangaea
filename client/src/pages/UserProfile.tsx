import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Globe, LogOut, Edit2, Check } from "lucide-react";

export default function UserProfile({ onLogout }: { onLogout: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  // load persisted profile from localStorage; default lokasi: Semarang, Indonesia
  const saved = (() => {
    try {
      return JSON.parse(localStorage.getItem("profile") || "null");
    } catch {
      return null;
    }
  })();
  const [name, setName] = useState<string>(saved?.name || "Pengguna");
  const [email, setEmail] = useState<string>(saved?.email || "pengguna@contoh.com");
  const [phone, setPhone] = useState<string>(saved?.phone || "+62 812 0000 0000");
  const [language, setLanguage] = useState<string>(saved?.language || "id");
  const [lokasi] = useState<string>(saved?.location || "Semarang, Indonesia");

  const handleSave = () => {
    const profile = { name, email, phone, language, location: lokasi };
    localStorage.setItem("profile", JSON.stringify(profile));
    setIsEditing(false);
    console.log("Profil diperbarui:", profile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 p-6 space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Profil</h1>
        <p className="text-muted-foreground">Kelola akun dan preferensi Anda</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
            <AvatarFallback>SJ</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-foreground">{name}</h2>
          <p className="text-sm text-muted-foreground">Petugas Lapangan</p>
        </div>

        <div className="flex justify-end mb-4">
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="rounded-xl" data-testid="button-edit">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profil
            </Button>
          ) : (
            <Button onClick={handleSave} className="rounded-xl eco-gradient text-white" data-testid="button-save">
              <Check className="w-4 h-4 mr-2" />
              Simpan Perubahan
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4" />
              Nama Lengkap
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
              className="rounded-xl h-11"
              data-testid="input-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isEditing}
              className="rounded-xl h-11"
              data-testid="input-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
              <Phone className="w-4 h-4" />
              Telepon
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isEditing}
              className="rounded-xl h-11"
              data-testid="input-phone"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Preferensi</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl" data-testid="setting-language">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <div>
                <div className="font-semibold text-foreground">Bahasa</div>
                <div className="text-sm text-muted-foreground">Pilih bahasa yang diinginkan</div>
              </div>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Indonesia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Button
        variant="destructive"
        className="w-full h-12 rounded-xl"
        onClick={() => {
          if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            onLogout();
          }
        }}
        data-testid="button-logout"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Keluar
      </Button>
    </div>
  );
}
