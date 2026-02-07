import { useResponsesDB } from "@/hooks/useSatellitesDB";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquareReply, Clock, Loader2, Building2, Mail, MapPin, Globe, Bot, User } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

const Responses = () => {
  const { responses, isLoading } = useResponsesDB();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredResponses = responses.filter(
    (r) =>
      r.sender_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.response_content?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      r.satellites.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.lead_company?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (r.lead_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const tagColors: Record<string, string> = {
    INTERESSE: "bg-green-500/10 text-green-600 border-green-500/20",
    DESINTERESSE: "bg-red-500/10 text-red-600 border-red-500/20",
    CURIOSO: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    DÚVIDA: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    DUVIDA: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    OPT_OUT: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    REDIRECIONAMENTO: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    FORA_DO_ESCRITÓRIO: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  };

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
            Respostas
          </h1>
          <p className="text-muted-foreground">
            Visualize todas as respostas dos leads com dados completos e respostas da IA
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
          placeholder="Buscar por email, empresa, nome ou satélite..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Responses List */}
      <div className="space-y-4">
        {filteredResponses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-border bg-card">
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
            <Collapsible
              key={response.id}
              open={expandedId === response.id}
              onOpenChange={() => setExpandedId(expandedId === response.id ? null : response.id)}
            >
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Satellite Badge */}
                      <Badge variant="secondary" className="shrink-0">
                        {response.satellites.alias}
                      </Badge>
                      
                      {/* Lead Info */}
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {response.lead_name || response.recipient_email}
                          </span>
                          {response.lead_tag && (
                            <Badge
                              variant="outline"
                              className={tagColors[response.lead_tag] || "bg-muted"}
                            >
                              {response.lead_tag}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {response.lead_company && (
                            <>
                              <Building2 className="h-3 w-3" />
                              <span>{response.lead_company}</span>
                              <span>•</span>
                            </>
                          )}
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(response.received_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        expandedId === response.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-border p-4 space-y-4">
                    {/* Lead Details */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">E-mail do Lead</p>
                          <p className="text-sm font-medium text-primary">{response.recipient_email}</p>
                        </div>
                      </div>
                      
                      {response.lead_company && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Empresa</p>
                            <p className="text-sm font-medium">{response.lead_company}</p>
                          </div>
                        </div>
                      )}
                      
                      {response.lead_city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Cidade</p>
                            <p className="text-sm font-medium">{response.lead_city}</p>
                          </div>
                        </div>
                      )}
                      
                      {response.lead_website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Site</p>
                            <a
                              href={response.lead_website.startsWith("http") ? response.lead_website : `https://${response.lead_website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              {response.lead_website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Response Content */}
                    <div className="space-y-3">
                      <div className="rounded-lg bg-muted/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">Resposta do Lead</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {response.response_content || "Sem conteúdo"}
                        </p>
                      </div>

                      {response.gpt_response && (
                        <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">Resposta da IA</span>
                            {response.gpt_responded_at && (
                              <span className="text-xs text-muted-foreground">
                                • {formatDistanceToNow(new Date(response.gpt_responded_at), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                            {response.gpt_response}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Satellite Info */}
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Enviado por: <span className="font-medium">{response.sender_email}</span>
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
};

export default Responses;
