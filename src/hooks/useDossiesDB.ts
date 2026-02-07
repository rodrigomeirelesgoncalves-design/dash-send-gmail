import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DossieRequest {
  id: string;
  satellite_id: string;
  lead_email: string;
  lead_name: string | null;
  lead_company: string | null;
  lead_website: string | null;
  lead_city: string | null;
  response_id: string | null;
  status: string;
  requested_at: string;
  completed_at: string | null;
  notes: string | null;
  satellites?: {
    alias: string;
  };
}

export function useDossiesDB() {
  const dossiesQuery = useQuery({
    queryKey: ["dossie-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossie_requests")
        .select(`
          *,
          satellites (
            alias
          )
        `)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      return data as DossieRequest[];
    },
    refetchInterval: 30000,
  });

  return {
    dossies: dossiesQuery.data || [],
    isLoading: dossiesQuery.isLoading,
    error: dossiesQuery.error,
    refetch: dossiesQuery.refetch,
  };
}

export function useDossieActions() {
  const queryClient = useQueryClient();

  const markAsCompleted = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("dossie_requests")
        .update({
          status: "CONCLUIDO",
          completed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dossie-requests"] });
      toast.success("Dossiê marcado como concluído!");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const addNote = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const { data: current } = await supabase
        .from("dossie_requests")
        .select("notes")
        .eq("id", id)
        .single();

      const existingNotes = current?.notes || "";
      const timestamp = new Date().toLocaleString("pt-BR");
      const newNotes = existingNotes
        ? `${existingNotes}\n\n[${timestamp}]\n${note}`
        : `[${timestamp}]\n${note}`;

      const { error } = await supabase
        .from("dossie_requests")
        .update({ notes: newNotes })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dossie-requests"] });
      toast.success("Nota adicionada!");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  return { markAsCompleted, addNote };
}
