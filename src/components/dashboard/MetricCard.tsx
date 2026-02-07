import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: number;
  variant?: "default" | "success" | "warning" | "destructive" | "info";
  description?: string;
}

const variantStyles = {
  default: {
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]",
  },
  success: {
    iconBg: "bg-success/10",
    iconColor: "text-success",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--success)/0.2)]",
  },
  warning: {
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--warning)/0.2)]",
  },
  destructive: {
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--destructive)/0.2)]",
  },
  info: {
    iconBg: "bg-info/10",
    iconColor: "text-info",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--info)/0.2)]",
  },
};

export const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
  description,
}: MetricCardProps) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1",
        styles.glow
      )}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {value.toLocaleString("pt-BR")}
            </span>
            {trend !== undefined && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {trend >= 0 ? "+" : ""}
                {trend}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        <div className={cn("rounded-lg p-3", styles.iconBg)}>
          <Icon className={cn("h-6 w-6", styles.iconColor)} />
        </div>
      </div>
    </div>
  );
};
