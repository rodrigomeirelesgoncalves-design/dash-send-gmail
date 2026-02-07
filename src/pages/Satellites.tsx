import { useState } from "react";
import { useSatellites } from "@/contexts/SatelliteContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  Satellite as SatelliteIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Satellites = () => {
  const { satellites, addSatellite, removeSatellite, toggleSatellite } =
    useSatellites();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSatellite, setNewSatellite] = useState({
    alias: "",
    sheetId: "",
    webUrl: "",
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newSatellite.alias || !newSatellite.sheetId) {
      toast.error("Preencha o alias e o ID da planilha");
      return;
    }

    addSatellite({
      ...newSatellite,
      isActive: true,
    });

    toast.success("Satélite adicionado com sucesso!");
    setNewSatellite({ alias: "", sheetId: "", webUrl: "" });
    setIsDialogOpen(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("ID copiado!");
  };

  const handleRemove = (id: string, alias: string) => {
    if (confirm(`Tem certeza que deseja remover "${alias}"?`)) {
      removeSatellite(id);
      toast.success("Satélite removido");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Satélites
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas contas de envio Google Sheets
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Satélite
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Satélite</DialogTitle>
              <DialogDescription>
                Adicione uma nova conta de envio conectando a planilha Google
                Sheets.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="alias">Alias (Nome de identificação)</Label>
                <Input
                  id="alias"
                  placeholder="Ex: 12 - nova-conta"
                  value={newSatellite.alias}
                  onChange={(e) =>
                    setNewSatellite({ ...newSatellite, alias: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sheetId">ID da Planilha</Label>
                <Input
                  id="sheetId"
                  placeholder="Ex: 1V2ywFAezKhMjYAYGb7Lem48I1fshgSUhYnE6m95Y_1I"
                  value={newSatellite.sheetId}
                  onChange={(e) =>
                    setNewSatellite({
                      ...newSatellite,
                      sheetId: e.target.value,
                    })
                  }
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="webUrl">URL (opcional)</Label>
                <Input
                  id="webUrl"
                  placeholder="https://docs.google.com/spreadsheets/..."
                  value={newSatellite.webUrl}
                  onChange={(e) =>
                    setNewSatellite({ ...newSatellite, webUrl: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAdd}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <SatelliteIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {satellites.length}
              </p>
              <p className="text-sm text-muted-foreground">Total de Satélites</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-3">
              <Check className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {satellites.filter((s) => s.isActive).length}
              </p>
              <p className="text-sm text-muted-foreground">Ativos</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-3">
              <SatelliteIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {satellites.filter((s) => !s.isActive).length}
              </p>
              <p className="text-sm text-muted-foreground">Inativos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[50px]">Status</TableHead>
              <TableHead>Alias</TableHead>
              <TableHead>ID da Planilha</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {satellites.map((satellite) => (
              <TableRow key={satellite.id} className="group">
                <TableCell>
                  <Switch
                    checked={satellite.isActive}
                    onCheckedChange={() => toggleSatellite(satellite.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        satellite.isActive ? "bg-success" : "bg-muted-foreground"
                      )}
                    />
                    <span className="font-medium">{satellite.alias}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                      {satellite.sheetId.slice(0, 20)}...
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleCopy(satellite.sheetId, satellite.id)}
                    >
                      {copiedId === satellite.id ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {satellite.createdAt.toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {satellite.webUrl && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a
                          href={satellite.webUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemove(satellite.id, satellite.alias)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Satellites;
