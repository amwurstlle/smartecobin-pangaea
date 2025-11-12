import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Power, Lock, Unlock, AlertTriangle, Cpu, Thermometer, Zap, Wifi } from "lucide-react";

export default function ControlCompartment() {
  const [autoMode, setAutoMode] = useState(true);
  const [locked, setLocked] = useState(false);
  const [power, setPower] = useState(true);

  const metrics = [
    { label: "CPU Usage", value: "42%", icon: Cpu, color: "text-blue-600" },
    { label: "Temperature", value: "28°C", icon: Thermometer, color: "text-orange-600" },
    { label: "Power", value: "85%", icon: Zap, color: "text-green-600" },
    { label: "Signal", value: "Strong", icon: Wifi, color: "text-purple-600" },
  ];

  const commands = [
    { label: "Empty Bin", action: "empty", variant: "default" as const },
    { label: "Reset Sensors", action: "reset", variant: "outline" as const },
    { label: "Run Diagnostic", action: "diagnostic", variant: "outline" as const },
    { label: "Force Sync", action: "sync", variant: "outline" as const },
  ];

  return (
    <div className="p-6 space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Control Panel</h1>
        <p className="text-muted-foreground">Manage bin operations and system settings</p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Quick Controls</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl" data-testid="control-power">
            <div className="flex items-center gap-3">
              <Power className={`w-5 h-5 ${power ? "text-green-600" : "text-gray-400"}`} />
              <div>
                <div className="font-semibold text-foreground">Power</div>
                <div className="text-sm text-muted-foreground">System power control</div>
              </div>
            </div>
            <Switch checked={power} onCheckedChange={setPower} />
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl" data-testid="control-lock">
            <div className="flex items-center gap-3">
              {locked ? <Lock className="w-5 h-5 text-red-600" /> : <Unlock className="w-5 h-5 text-green-600" />}
              <div>
                <div className="font-semibold text-foreground">Lock Status</div>
                <div className="text-sm text-muted-foreground">{locked ? "Compartment locked" : "Compartment unlocked"}</div>
              </div>
            </div>
            <Switch checked={locked} onCheckedChange={setLocked} />
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl" data-testid="control-auto">
            <div className="flex items-center gap-3">
              <Cpu className={`w-5 h-5 ${autoMode ? "text-blue-600" : "text-gray-400"}`} />
              <div>
                <div className="font-semibold text-foreground">Auto Mode</div>
                <div className="text-sm text-muted-foreground">Automatic collection scheduling</div>
              </div>
            </div>
            <Switch checked={autoMode} onCheckedChange={setAutoMode} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">System Metrics</h2>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="p-4 bg-secondary/50 rounded-xl" data-testid={`metric-${index}`}>
                <Icon className={`w-6 h-6 mb-2 ${metric.color}`} />
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Commands</h2>
        <div className="grid grid-cols-2 gap-3">
          {commands.map((cmd, index) => (
            <Button
              key={index}
              variant={cmd.variant}
              className="h-12 rounded-xl"
              onClick={() => console.log(`${cmd.action} triggered`)}
              data-testid={`button-${cmd.action}`}
            >
              {cmd.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-6 border-destructive bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground mb-2">Emergency Controls</h2>
            <p className="text-sm text-muted-foreground mb-4">Use these controls only in emergency situations</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="destructive"
                className="h-12 rounded-xl"
                onClick={() => console.log("Emergency stop triggered")}
                data-testid="button-emergency-stop"
              >
                Emergency Stop
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-xl border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => console.log("Override triggered")}
                data-testid="button-override"
              >
                Manual Override
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
