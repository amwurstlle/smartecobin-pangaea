import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RoleSelection({ onRoleSelect }: { onRoleSelect: (role: string) => void }) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    {
      id: "public",
      title: "Pengguna Publik",
      description: "Akses lokasi eco-bin publik dan laporkan masalah",
      icon: Users,
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: "officer",
      title: "Petugas Lapangan",
      description: "Kelola bak, pantau sistem, dan tanggapi peringatan",
      icon: Shield,
      color: "from-blue-500 to-cyan-600",
    },
  ];

  const handleContinue = () => {
    if (selectedRole) {
      sessionStorage.setItem("userRole", selectedRole);
      onRoleSelect(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">Pilih Peran Anda</h1>
          <p className="text-muted-foreground text-lg">Pilih cara Anda menggunakan Smecopop</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <Card
                key={role.id}
                className={`p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  isSelected ? "ring-2 ring-primary shadow-2xl" : ""
                }`}
                onClick={() => setSelectedRole(role.id)}
                data-testid={`card-role-${role.id}`}
              >
                <div className="text-center">
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${role.color} mb-6`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">{role.title}</h2>
                  <p className="text-muted-foreground mb-6">{role.description}</p>
                  <div className="h-1 w-16 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button
            size="lg"
            className="px-12 h-14 rounded-xl eco-gradient text-white font-semibold"
            disabled={!selectedRole}
            onClick={handleContinue}
            data-testid="button-continue"
          >
            Lanjut
          </Button>
        </div>
      </div>
    </div>
  );
}
