import { useSatellites } from "@/contexts/SatelliteContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export const SatellitePerformanceTable = () => {
  const { metrics, satellites } = useSatellites();

  const getOpenRate = (opened: number, sent: number) => {
    if (sent === 0) return 0;
    return Math.round((opened / sent) * 100);
  };

  const getReplyRate = (replied: number, sent: number) => {
    if (sent === 0) return 0;
    return Math.round((replied / sent) * 100);
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-lg font-semibold text-foreground">
          Performance por Satélite
        </h3>
        <p className="text-sm text-muted-foreground">
          Métricas detalhadas de cada conta
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[200px]">Satélite</TableHead>
              <TableHead className="text-right">Enviados</TableHead>
              <TableHead className="text-right">Abertos</TableHead>
              <TableHead className="text-right">Taxa Abertura</TableHead>
              <TableHead className="text-right">Respostas</TableHead>
              <TableHead className="text-right">Bounces</TableHead>
              <TableHead className="text-right">Opt-Out</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => {
              const satellite = satellites.find(
                (s) => s.id === metric.satelliteId
              );
              const openRate = getOpenRate(metric.opened, metric.sent);
              const replyRate = getReplyRate(metric.replied, metric.sent);

              return (
                <TableRow
                  key={metric.satelliteId}
                  className="group transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          satellite?.isActive ? "bg-success" : "bg-muted"
                        )}
                      />
                      <span className="truncate max-w-[150px]">
                        {metric.satelliteAlias}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {metric.sent.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {metric.opened.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Progress
                        value={openRate}
                        className="w-16 h-1.5"
                      />
                      <span
                        className={cn(
                          "text-sm font-medium w-10 text-right",
                          openRate >= 30
                            ? "text-success"
                            : openRate >= 15
                            ? "text-warning"
                            : "text-destructive"
                        )}
                      >
                        {openRate}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={replyRate >= 5 ? "default" : "secondary"}
                      className="font-mono"
                    >
                      {metric.replied}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "font-mono",
                        metric.bounced > 10
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {metric.bounced}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {metric.optOut}
                  </TableCell>
                  <TableCell>
                    {satellite?.webUrl && (
                      <a
                        href={satellite.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
