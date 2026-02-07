import { useSatellites } from "@/contexts/SatelliteContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquareReply, Clock } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Responses = () => {
  const { responses } = useSatellites();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResponses = responses.filter(
    (r) =>
      r.senderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.responseContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.satelliteAlias.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Respostas
          </h1>
          <p className="text-muted-foreground">
            Visualize todas as respostas dos leads em um só lugar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <MessageSquareReply className="h-3.5 w-3.5" />
            {responses.length} respostas
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por email, conteúdo ou satélite..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Responses Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_2fr] gap-4 border-b border-border bg-muted/50 px-6 py-3">
          <div className="text-sm font-medium text-muted-foreground">
            E-mail Remetente
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            E-mail do Lead
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Resposta
          </div>
        </div>

        <div className="divide-y divide-border">
          {filteredResponses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquareReply className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground">
                Nenhuma resposta encontrada
              </p>
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? "Tente uma busca diferente"
                  : "As respostas aparecerão aqui quando os leads responderem"}
              </p>
            </div>
          ) : (
            filteredResponses.map((response) => (
              <div
                key={response.id}
                className="grid grid-cols-[1fr_1fr_2fr] gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
              >
                <div>
                  <p className="font-medium text-foreground truncate">
                    {response.senderEmail}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {response.satelliteAlias}
                  </Badge>
                </div>

                <div>
                  <p className="font-medium text-primary truncate">
                    {response.recipientEmail}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(response.receivedAt, {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                </div>

                <div className="flex items-start">
                  <p className="text-sm text-foreground leading-relaxed">
                    {response.responseContent}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Responses;
