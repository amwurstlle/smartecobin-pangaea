import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Gagal masuk");
        return;
      }

      // Store token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin();
      navigate("/dashboard");
    } catch (err) {
  setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (password.length < 6) {
        setError("Kata sandi minimal 6 karakter");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone: phone || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Pendaftaran gagal");
        return;
      }

      // Store token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin();
      navigate("/dashboard");
    } catch (err) {
  setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen eco-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-xs sm:max-w-md glassmorphism rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/30 mb-4">
            <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">SmartEcoBin</h1>
          <p className="text-white/90 text-sm">Sistem Manajemen Sampah Pintar</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white text-sm font-medium">
                Nama Lengkap
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/90 border-0 h-10 sm:h-12 rounded-xl"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/90 border-0 h-10 sm:h-12 rounded-xl"
              required
            />
          </div>

          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white text-sm font-medium">
                Telepon (Opsional)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+62 812 3456 7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white/90 border-0 h-10 sm:h-12 rounded-xl"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white text-sm font-medium">
              Kata Sandi
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/90 border-0 h-10 sm:h-12 rounded-xl"
              required
            />
            {isRegister && (
              <p className="text-white/70 text-xs">Minimal 6 karakter</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 sm:h-12 rounded-xl bg-white text-primary font-semibold hover:bg-white/90 transition-all disabled:opacity-50"
          >
            {loading ? "Memuat..." : isRegister ? "Buat Akun" : "Masuk"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/80">
            {isRegister ? "Sudah punya akun?" : "Belum punya akun?"} {" "}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
                setEmail("");
                setPassword("");
                setName("");
                setPhone("");
              }}
              className="font-semibold text-white hover:underline"
            >
              {isRegister ? "Masuk" : "Daftar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
