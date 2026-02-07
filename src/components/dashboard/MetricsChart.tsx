import { useMetricsDB } from "@/hooks/useSatellitesDB";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

export const MetricsChart = () => {
  const { metrics, isLoading } = useMetricsDB();

  const chartData = metrics.slice(0, 8).map((m) => ({
    name: m.satellites?.alias?.split(" - ")[1] || m.satellites?.alias || "Satélite",
    enviados: m.sent,
    abertos: m.opened,
    respostas: m.replied,
  }));

  const colors = {
    enviados: "hsl(217, 91%, 60%)",
    abertos: "hsl(185, 80%, 50%)",
    respostas: "hsl(142, 76%, 45%)",
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 h-[400px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Comparativo de Satélites
        </h3>
        <p className="text-sm text-muted-foreground">
          Enviados, abertos e respostas por conta
        </p>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: colors.enviados }}
          />
          <span className="text-xs text-muted-foreground">Enviados</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: colors.abertos }}
          />
          <span className="text-xs text-muted-foreground">Abertos</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: colors.respostas }}
          />
          <span className="text-xs text-muted-foreground">Respostas</span>
        </div>
      </div>

      <div className="h-[300px]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Adicione satélites para visualizar o gráfico
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))",
                }}
                cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
              />
              <Bar
                dataKey="enviados"
                fill={colors.enviados}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="abertos"
                fill={colors.abertos}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="respostas"
                fill={colors.respostas}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
