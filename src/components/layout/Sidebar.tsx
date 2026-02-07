import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Satellite,
  MessageSquareReply,
  Upload,
  Settings,
  RefreshCw,
  FileText,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSatellitesDB, useRefreshData } from "@/hooks/useSatellitesDB";
import { useDossiesDB } from "@/hooks/useDossiesDB";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Satellite, label: "Satélites", path: "/satellites" },
  { icon: MessageSquareReply, label: "Respostas", path: "/responses" },
  { icon: FileText, label: "Dossiês", path: "/dossies" },
  { icon: Send, label: "Envios", path: "/envios" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

export const Sidebar = () => {
  const location = useLocation();
  const { satellites, isLoading: satellitesLoading } = useSatellitesDB();
  const { dossies } = useDossiesDB();
  const refreshData = useRefreshData();
  const activeSatellites = satellites.filter((s) => s.is_active).length;
  const pendingDossies = dossies.filter((d) => d.status === "PENDENTE").length;
  const isLoading = satellitesLoading || refreshData.isPending;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Satellite className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">
              Satellite
            </h1>
            <p className="text-xs text-muted-foreground">Email Tracker</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {item.label === "Satélites" && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs text-primary">
                    {activeSatellites}
                  </span>
                )}
                {item.label === "Dossiês" && pendingDossies > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive/20 px-1.5 text-xs text-destructive">
                    {pendingDossies}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Status */}
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="status-dot status-dot-success" />
              <span className="text-xs text-muted-foreground">Monitorando</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => refreshData.mutate()}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Última atualização:{" "}
            {new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </aside>
  );
};
