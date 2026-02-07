import { useState, useCallback } from "react";
import { useSatellites } from "@/contexts/SatelliteContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload as UploadIcon,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UploadedLead } from "@/types/satellite";

const Upload = () => {
  const { satellites } = useSatellites();
  const [file, setFile] = useState<File | null>(null);
  const [parsedLeads, setParsedLeads] = useState<UploadedLead[]>([]);
  const [selectedSatellites, setSelectedSatellites] = useState<string[]>(
    satellites.filter((s) => s.isActive).map((s) => s.id)
  );
  const [isDistributing, setIsDistributing] = useState(false);
  const [distributionComplete, setDistributionComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setDistributionComplete(false);

    // Simulate parsing CSV/Excel file
    // In production, use a proper parser like Papa Parse or SheetJS
    const mockLeads: UploadedLead[] = [
      { email: "lead1@empresa.com", company: "Empresa ABC", name: "João Silva" },
      { email: "lead2@startup.io", company: "Startup XYZ", name: "Maria Santos" },
      { email: "lead3@tech.com", company: "Tech Solutions", name: "Carlos Oliveira" },
      { email: "lead4@negocio.com.br", company: "Negócios BR", name: "Ana Costa" },
      { email: "lead5@vendas.com", company: "Vendas Pro", name: "Pedro Lima" },
    ];

    // Simulate more leads based on file size
    const additionalLeads = Math.floor(Math.random() * 50) + 10;
    for (let i = 6; i <= additionalLeads; i++) {
      mockLeads.push({
        email: `lead${i}@example${i}.com`,
        company: `Company ${i}`,
        name: `Lead ${i}`,
      });
    }

    setParsedLeads(mockLeads);
    toast.success(`Arquivo processado: ${mockLeads.length} leads encontrados`);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, []);

  const toggleSatellite = (id: string) => {
    setSelectedSatellites((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleDistribute = async () => {
    if (selectedSatellites.length === 0) {
      toast.error("Selecione pelo menos um satélite");
      return;
    }

    setIsDistributing(true);

    // Simulate distribution process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const leadsPerSatellite = Math.ceil(
      parsedLeads.length / selectedSatellites.length
    );

    toast.success(
      `${parsedLeads.length} leads distribuídos para ${selectedSatellites.length} satélites (~${leadsPerSatellite} cada)`
    );

    setIsDistributing(false);
    setDistributionComplete(true);
  };

  const resetUpload = () => {
    setFile(null);
    setParsedLeads([]);
    setDistributionComplete(false);
  };

  const activeSatellites = satellites.filter((s) => s.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Upload de Leads
        </h1>
        <p className="text-muted-foreground">
          Faça upload de uma planilha e distribua os leads entre os satélites
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Area */}
        <div className="space-y-4">
          <div
            className={cn(
              "relative rounded-xl border-2 border-dashed bg-card p-8 text-center transition-all",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50",
              file && "border-success bg-success/5"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {distributionComplete ? (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-success/10 p-4">
                  <CheckCircle2 className="h-12 w-12 text-success" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Distribuição Concluída!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {parsedLeads.length} leads foram distribuídos com sucesso
                  </p>
                </div>
                <Button variant="outline" onClick={resetUpload}>
                  Fazer novo upload
                </Button>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <FileSpreadsheet className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {parsedLeads.length} leads encontrados
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={resetUpload}>
                  <X className="mr-2 h-4 w-4" />
                  Remover arquivo
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-muted p-4">
                  <UploadIcon className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Arraste sua planilha aqui
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ou clique para selecionar (CSV, XLSX)
                  </p>
                </div>
                <Label htmlFor="file-upload">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button variant="secondary" asChild>
                    <span>Selecionar Arquivo</span>
                  </Button>
                </Label>
              </div>
            )}
          </div>

          {/* Preview */}
          {parsedLeads.length > 0 && !distributionComplete && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 font-medium text-foreground">
                Preview dos Leads
              </h3>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {parsedLeads.slice(0, 5).map((lead, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-lg bg-muted/50 p-2 text-sm"
                  >
                    <span className="font-mono text-primary">{lead.email}</span>
                    <span className="text-muted-foreground">{lead.company}</span>
                    <span className="text-muted-foreground">{lead.name}</span>
                  </div>
                ))}
                {parsedLeads.length > 5 && (
                  <p className="text-center text-sm text-muted-foreground">
                    + {parsedLeads.length - 5} leads adicionais
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Satellite Selection */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-medium text-foreground">
              Selecione os Satélites
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Os leads serão distribuídos igualmente entre os satélites
              selecionados.
            </p>

            {activeSatellites.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <AlertCircle className="h-8 w-8 text-warning" />
                <p className="text-sm text-muted-foreground">
                  Nenhum satélite ativo. Ative os satélites na página de
                  gerenciamento.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {activeSatellites.map((satellite) => (
                  <div
                    key={satellite.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer",
                      selectedSatellites.includes(satellite.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => toggleSatellite(satellite.id)}
                  >
                    <Checkbox
                      checked={selectedSatellites.includes(satellite.id)}
                      onCheckedChange={() => toggleSatellite(satellite.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {satellite.alias}
                      </p>
                    </div>
                    {selectedSatellites.includes(satellite.id) &&
                      parsedLeads.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ~
                          {Math.ceil(
                            parsedLeads.length / selectedSatellites.length
                          )}{" "}
                          leads
                        </span>
                      )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <div className="text-sm text-muted-foreground">
                {selectedSatellites.length} satélites selecionados
              </div>
              <Button
                onClick={handleDistribute}
                disabled={
                  !file ||
                  parsedLeads.length === 0 ||
                  selectedSatellites.length === 0 ||
                  isDistributing ||
                  distributionComplete
                }
                className="gap-2"
              >
                {isDistributing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Distribuindo...
                  </>
                ) : (
                  <>
                    Distribuir Leads
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Distribution Info */}
          {parsedLeads.length > 0 && selectedSatellites.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h4 className="mb-2 font-medium text-foreground">
                Resumo da Distribuição
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total de Leads</p>
                  <p className="text-2xl font-bold text-foreground">
                    {parsedLeads.length}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Leads por Satélite</p>
                  <p className="text-2xl font-bold text-primary">
                    ~{Math.ceil(parsedLeads.length / selectedSatellites.length)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
