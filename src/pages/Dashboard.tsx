import { useSatellites } from "@/contexts/SatelliteContext";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SatellitePerformanceTable } from "@/components/dashboard/SatellitePerformanceTable";
import { MetricsChart } from "@/components/dashboard/MetricsChart";
import {
  Send,
  MailOpen,
  MessageSquareReply,
  AlertTriangle,
  XCircle,
  UserMinus,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { getTotalMetrics, isLoading, lastUpdated, refreshData, satellites } =
    useSatellites();
  const totals = getTotalMetrics();
  const activeSatellites = satellites.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitorando{" "}
            <span className="font-medium text-primary">{activeSatellites}</span>{" "}
            satélites ativos
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Atualizado às{" "}
                {lastUpdated.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
          <Button
            onClick={refreshData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw
              className={cn("h-4 w-4", isLoading && "animate-spin")}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-4 py-2.5">
        <div className="status-dot status-dot-success" />
        <span className="text-sm font-medium text-success">
          Monitoramento em tempo real ativo
        </span>
        <span className="text-sm text-muted-foreground">
          — atualização automática a cada 1 minuto
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Total Enviados"
          value={totals.sent}
          icon={Send}
          variant="info"
          description="E-mails disparados"
        />
        <MetricCard
          title="Aberturas"
          value={totals.opened}
          icon={MailOpen}
          variant="success"
          trend={Math.round((totals.opened / totals.sent) * 100) || 0}
          description={`${Math.round((totals.opened / totals.sent) * 100) || 0}% taxa de abertura`}
        />
        <MetricCard
          title="Respostas"
          value={totals.replied}
          icon={MessageSquareReply}
          variant="success"
          description="Leads engajados"
        />
        <MetricCard
          title="Bounces"
          value={totals.bounced}
          icon={AlertTriangle}
          variant="warning"
          description="E-mails rejeitados"
        />
        <MetricCard
          title="Falhas"
          value={totals.failed}
          icon={XCircle}
          variant="destructive"
          description="Erros de envio"
        />
        <MetricCard
          title="Opt-Out"
          value={totals.optOut}
          icon={UserMinus}
          variant="default"
          description="Descadastramentos"
        />
      </div>

      {/* Chart and Table */}
      <div className="grid gap-6 xl:grid-cols-2">
        <MetricsChart />
        <div className="xl:col-span-2">
          <SatellitePerformanceTable />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
