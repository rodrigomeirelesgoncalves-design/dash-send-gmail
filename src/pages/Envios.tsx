import { useSatellitesDB } from "@/hooks/useSatellitesDB";
import { useScheduledSends, useSendActions } from "@/hooks/useScheduledSends";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Calendar, Clock, Loader2, Play, X, RefreshCw, Rocket } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const Envios = () => {
  const { satellites, isLoading: loadingSatellites } = useSatellitesDB();
  const { scheduledSends, isLoading: loadingSchedules } = useScheduledSends();
  const { scheduleSend, forceSend, cancelSchedule, syncData } = useSendActions();
  
  const [selectedSatellite, setSelectedSatellite] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [maxEmails, setMaxEmails] = useState("100");

  const activeSatellites = satellites.filter((s) => s.is_active);

  const handleSchedule = async () => {
    if (!selectedSatellite || !scheduledDate || !scheduledTime) {
      toast.error("Preencha todos os campos");
      return;
    }

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledFor <= new Date()) {
      toast.error("A data deve ser no futuro");
      return;
    }

    scheduleSend.mutate({
      satelliteId: selectedSatellite,
      scheduledFor: scheduledFor.toISOString(),
      maxEmails: parseInt(maxEmails),
    });
  };

  const handleForceSend = async (satelliteId: string) => {
    if (!confirm("Tem certeza que deseja forçar o envio agora?")) return;
    forceSend.mutate({ satelliteId, maxEmails: parseInt(maxEmails) });
  };

  const handleSync = async () => {
    syncData.mutate();
  };

  const isLoading = loadingSatellites || loadingSchedules;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Programação de Envios
          </h1>
          <p className="text-muted-foreground">
            Programe e force envios de e-mails para seus satélites
          </p>
        </div>

        <Button onClick={handleSync} disabled={syncData.isPending}>
          <RefreshCw className={`h-4 w-4 mr-2 ${syncData.isPending ? "animate-spin" : ""}`} />
          Sincronizar Dados
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Schedule Send */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Programar Envio
            </CardTitle>
            <CardDescription>
              Agende um envio para uma data e hora específicas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Satélite
              </label>
              <Select value={selectedSatellite} onValueChange={setSelectedSatellite}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um satélite" />
                </SelectTrigger>
                <SelectContent>
                  {activeSatellites.map((sat) => (
                    <SelectItem key={sat.id} value={sat.id}>
                      {sat.alias}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Data
                </label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Hora
                </label>
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Máximo de E-mails
              </label>
              <Input
                type="number"
                value={maxEmails}
                onChange={(e) => setMaxEmails(e.target.value)}
                min={1}
                max={500}
              />
            </div>

            <Button
              onClick={handleSchedule}
              disabled={scheduleSend.isPending || !selectedSatellite}
              className="w-full"
            >
              {scheduleSend.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Programar Envio
            </Button>
          </CardContent>
        </Card>

        {/* Force Send */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Envio Imediato
            </CardTitle>
            <CardDescription>
              Force o envio agora para um satélite específico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeSatellites.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum satélite ativo encontrado
              </p>
            ) : (
              <div className="grid gap-3">
                {activeSatellites.map((sat) => (
                  <div
                    key={sat.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-foreground">{sat.alias}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {sat.sheet_id}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleForceSend(sat.id)}
                      disabled={forceSend.isPending}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Enviar Agora
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Sends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Envios Programados
          </CardTitle>
          <CardDescription>
            Histórico e agendamentos de envios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scheduledSends.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum envio programado
            </p>
          ) : (
            <div className="space-y-3">
              {scheduledSends.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        schedule.status === "PENDING"
                          ? "secondary"
                          : schedule.status === "EXECUTED"
                          ? "default"
                          : "destructive"
                      }
                      className={
                        schedule.status === "PENDING"
                          ? "bg-yellow-500/10 text-yellow-600"
                          : schedule.status === "EXECUTED"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-red-500/10 text-red-600"
                      }
                    >
                      {schedule.status === "PENDING" && "Pendente"}
                      {schedule.status === "EXECUTED" && "Executado"}
                      {schedule.status === "CANCELLED" && "Cancelado"}
                      {schedule.status === "FAILED" && "Falhou"}
                    </Badge>
                    <div>
                      <p className="font-medium text-foreground">
                        {schedule.satellites?.alias || "Satélite"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(schedule.scheduled_for), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                        {" • "}
                        Máx: {schedule.max_emails} emails
                      </p>
                    </div>
                  </div>
                  
                  {schedule.status === "PENDING" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelSchedule.mutate(schedule.id)}
                      disabled={cancelSchedule.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Envios;
