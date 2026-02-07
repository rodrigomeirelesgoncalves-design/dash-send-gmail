import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Key, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus("idle");

    try {
      const { data, error } = await supabase.functions.invoke("fetch-sheets-data");

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        setConnectionStatus("success");
        toast.success("Conexão com Google Sheets estabelecida com sucesso!");
      } else {
        throw new Error(data?.error || "Falha na conexão");
      }
    } catch (error: any) {
      setConnectionStatus("error");
      toast.error(`Erro na conexão: ${error.message}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Configure as credenciais de integração com Google Sheets
        </p>
      </div>

      {/* Service Account Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Google Service Account</CardTitle>
              <CardDescription>
                Credenciais para acessar as planilhas Google Sheets
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <h4 className="font-medium text-foreground mb-2">Como configurar:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                Acesse o{" "}
                <a
                  href="https://console.cloud.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Cloud Console
                </a>
              </li>
              <li>Crie um novo projeto ou selecione um existente</li>
              <li>Ative a API do Google Sheets</li>
              <li>Vá em "IAM & Admin" → "Service Accounts"</li>
              <li>Crie uma nova conta de serviço</li>
              <li>Gere uma chave JSON para a conta</li>
              <li>Compartilhe cada planilha com o email da conta de serviço</li>
            </ol>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Status da Conexão</h4>
                <p className="text-sm text-muted-foreground">
                  A credencial é armazenada de forma segura no backend
                </p>
              </div>
              <Badge
                variant={
                  connectionStatus === "success"
                    ? "default"
                    : connectionStatus === "error"
                    ? "destructive"
                    : "secondary"
                }
                className="gap-1"
              >
                {connectionStatus === "success" && (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Conectado
                  </>
                )}
                {connectionStatus === "error" && (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    Erro
                  </>
                )}
                {connectionStatus === "idle" && "Não testado"}
              </Badge>
            </div>

            <Button onClick={handleTestConnection} disabled={isTestingConnection}>
              {isTestingConnection ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                "Testar Conexão"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notas Importantes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>
                Cada planilha Google Sheets deve ser compartilhada com o email da
                conta de serviço (geralmente termina em @*.iam.gserviceaccount.com)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>
                A planilha deve ter uma aba principal com os dados e opcionalmente
                uma aba "Respostas" para as respostas dos leads
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>
                O sistema busca automaticamente métricas como: enviados, abertos,
                respondidos, bounces, erros e opt-outs
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>
                Os dados são atualizados automaticamente a cada 1 minuto
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
