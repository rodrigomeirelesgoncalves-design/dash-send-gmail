import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ScheduledSend {
  id: string;
  satellite_id: string;
  scheduled_for: string;
  status: string;
  max_emails: number;
  created_at: string;
  executed_at: string | null;
  result: Record<string, unknown> | null;
  satellites?: {
    alias: string;
  };
}

export function useScheduledSends() {
  const scheduledQuery = useQuery({
    queryKey: ["scheduled-sends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_sends")
        .select(`
          *,
          satellites (
            alias
          )
        `)
        .order("scheduled_for", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ScheduledSend[];
    },
    refetchInterval: 30000,
  });

  return {
    scheduledSends: scheduledQuery.data || [],
    isLoading: scheduledQuery.isLoading,
    error: scheduledQuery.error,
    refetch: scheduledQuery.refetch,
  };
}

export function useSendActions() {
  const queryClient = useQueryClient();

  const scheduleSend = useMutation({
    mutationFn: async ({
      satelliteId,
      scheduledFor,
      maxEmails,
    }: {
      satelliteId: string;
      scheduledFor: string;
      maxEmails: number;
    }) => {
      const { data, error } = await supabase.functions.invoke("trigger-send", {
        body: {
          action: "schedule",
          satelliteId,
          scheduledFor,
          maxEmails,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-sends"] });
      toast.success("Envio programado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao programar: ${error.message}`);
    },
  });

  const forceSend = useMutation({
    mutationFn: async ({
      satelliteId,
      maxEmails,
    }: {
      satelliteId: string;
      maxEmails: number;
    }) => {
      const { data, error } = await supabase.functions.invoke("trigger-send", {
        body: {
          action: "force_send",
          satelliteId,
          maxEmails,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-sends"] });
      if (data?.success) {
        toast.success("Envio forçado executado!");
      } else {
        toast.warning(data?.message || "Envio pode não ter sido executado");
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao forçar envio: ${error.message}`);
    },
  });

  const cancelSchedule = useMutation({
    mutationFn: async (scheduleId: string) => {
      const { error } = await supabase
        .from("scheduled_sends")
        .update({ status: "CANCELLED" })
        .eq("id", scheduleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-sends"] });
      toast.success("Agendamento cancelado!");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const syncData = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-sheets-data");
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["satellite-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["email-responses"] });
      queryClient.invalidateQueries({ queryKey: ["dossie-requests"] });
      toast.success("Dados sincronizados!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao sincronizar: ${error.message}`);
    },
  });

  return { scheduleSend, forceSend, cancelSchedule, syncData };
}
