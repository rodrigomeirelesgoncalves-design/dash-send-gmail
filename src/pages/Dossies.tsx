import { useDossiesDB, useDossieActions } from "@/hooks/useDossiesDB";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, FileText, CheckCircle, Clock, Loader2, ExternalLink, Building2, Mail, MapPin, Globe } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dossies = () => {
  const { dossies, isLoading } = useDossiesDB();
  const { markAsCompleted, addNote } = useDossieActions();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "PENDENTE" | "CONCLUIDO">("all");

  const filteredDossies = dossies.filter((d) => {
    const matchesSearch =
      d.lead_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.lead_company?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (d.lead_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesFilter = filter === "all" || d.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const pendingCount = dossies.filter((d) => d.status === "PENDENTE").length;
  const completedCount = dossies.filter((d) => d.status === "CONCLUIDO").length;

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
            Dossiês Solicitados
          </h1>
          <p className="text-muted-foreground">
            Leads que demonstraram interesse e solicitaram o dossiê completo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Clock className="h-3.5 w-3.5" />
            {pendingCount} pendentes
          </Badge>
          <Badge variant="outline" className="gap-1.5 bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="h-3.5 w-3.5" />
            {completedCount} concluídos
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por email, empresa ou nome..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Todos
          </Button>
          <Button
            variant={filter === "PENDENTE" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("PENDENTE")}
          >
            Pendentes
          </Button>
          <Button
            variant={filter === "CONCLUIDO" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("CONCLUIDO")}
          >
            Concluídos
          </Button>
        </div>
      </div>

      {/* Dossies Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDossies.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-foreground">
              Nenhum dossiê encontrado
            </p>
            <p className="text-sm text-muted-foreground">
              {searchTerm
                ? "Tente uma busca diferente"
                : "Os dossiês aparecerão aqui quando leads demonstrarem interesse"}
            </p>
          </div>
        ) : (
          filteredDossies.map((dossie) => (
            <div
              key={dossie.id}
              className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <Badge
                  variant={dossie.status === "PENDENTE" ? "secondary" : "default"}
                  className={
                    dossie.status === "PENDENTE"
                      ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                      : "bg-green-500/10 text-green-600 border-green-500/20"
                  }
                >
                  {dossie.status === "PENDENTE" ? (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Pendente
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Concluído
                    </>
                  )}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(dossie.requested_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>

              <div className="space-y-3">
                {dossie.lead_company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{dossie.lead_company}</span>
                  </div>
                )}

                {dossie.lead_name && (
                  <p className="text-sm text-muted-foreground">{dossie.lead_name}</p>
                )}

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${dossie.lead_email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {dossie.lead_email}
                  </a>
                </div>

                {dossie.lead_city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{dossie.lead_city}</span>
                  </div>
                )}

                {dossie.lead_website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={dossie.lead_website.startsWith("http") ? dossie.lead_website : `https://${dossie.lead_website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {dossie.lead_website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {dossie.notes && (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                    {dossie.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border flex gap-2">
                {dossie.status === "PENDENTE" && (
                  <Button
                    size="sm"
                    onClick={() => markAsCompleted.mutate(dossie.id)}
                    disabled={markAsCompleted.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Marcar Concluído
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const note = prompt("Adicionar observação:");
                    if (note) {
                      addNote.mutate({ id: dossie.id, note });
                    }
                  }}
                  className="flex-1"
                >
                  Adicionar Nota
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dossies;
