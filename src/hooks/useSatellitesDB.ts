import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SatelliteDB {
  id: string;
  alias: string;
  sheet_id: string;
  web_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SatelliteMetricsDB {
  id: string;
  satellite_id: string;
  sent: number;
  opened: number;
  replied: number;
  bounced: number;
  failed: number;
  opt_out: number;
  recorded_at: string;
}

export interface EmailResponseDB {
  id: string;
  satellite_id: string;
  sender_email: string;
  recipient_email: string;
  response_content: string | null;
  received_at: string;
  lead_name: string | null;
  lead_company: string | null;
  lead_website: string | null;
  lead_city: string | null;
  lead_tag: string | null;
  gpt_response: string | null;
  gpt_responded_at: string | null;
}

export function useSatellitesDB() {
  const queryClient = useQueryClient();

  const satellitesQuery = useQuery({
    queryKey: ["satellites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("satellites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SatelliteDB[];
    },
  });

  const addSatellite = useMutation({
    mutationFn: async (satellite: { alias: string; sheet_id: string; web_url?: string }) => {
      const { data, error } = await supabase
        .from("satellites")
        .insert({
          alias: satellite.alias,
          sheet_id: satellite.sheet_id,
          web_url: satellite.web_url || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["satellites"] });
      toast.success("Satélite adicionado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar satélite: ${error.message}`);
    },
  });

  const removeSatellite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("satellites").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["satellites"] });
      toast.success("Satélite removido!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover satélite: ${error.message}`);
    },
  });

  const toggleSatellite = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("satellites")
        .update({ is_active: !isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["satellites"] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar satélite: ${error.message}`);
    },
  });

  return {
    satellites: satellitesQuery.data || [],
    isLoading: satellitesQuery.isLoading,
    error: satellitesQuery.error,
    addSatellite,
    removeSatellite,
    toggleSatellite,
    refetch: satellitesQuery.refetch,
  };
}

export function useMetricsDB() {
  const metricsQuery = useQuery({
    queryKey: ["satellite-metrics"],
    queryFn: async () => {
      // Get the latest metrics for each satellite
      const { data, error } = await supabase
        .from("satellite_metrics")
        .select(`
          *,
          satellites (
            id,
            alias
          )
        `)
        .order("recorded_at", { ascending: false });

      if (error) throw error;

      // Group by satellite and get the latest
      const latestBysat: Record<string, SatelliteMetricsDB & { satellites: { id: string; alias: string } }> = {};
      for (const metric of data || []) {
        if (!latestBysat[metric.satellite_id]) {
          latestBysat[metric.satellite_id] = metric;
        }
      }

      return Object.values(latestBysat);
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const getTotalMetrics = () => {
    const metrics = metricsQuery.data || [];
    return metrics.reduce(
      (acc, m) => ({
        sent: acc.sent + m.sent,
        opened: acc.opened + m.opened,
        replied: acc.replied + m.replied,
        bounced: acc.bounced + m.bounced,
        failed: acc.failed + m.failed,
        optOut: acc.optOut + m.opt_out,
      }),
      { sent: 0, opened: 0, replied: 0, bounced: 0, failed: 0, optOut: 0 }
    );
  };

  return {
    metrics: metricsQuery.data || [],
    isLoading: metricsQuery.isLoading,
    error: metricsQuery.error,
    getTotalMetrics,
    refetch: metricsQuery.refetch,
  };
}

export function useResponsesDB() {
  const responsesQuery = useQuery({
    queryKey: ["email-responses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_responses")
        .select(`
          *,
          satellites (
            alias
          )
        `)
        .order("received_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as (EmailResponseDB & { satellites: { alias: string } })[];
    },
    refetchInterval: 60000,
  });

  return {
    responses: responsesQuery.data || [],
    isLoading: responsesQuery.isLoading,
    error: responsesQuery.error,
    refetch: responsesQuery.refetch,
  };
}

export function useRefreshData() {
  const queryClient = useQueryClient();

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-sheets-data");
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["satellite-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["email-responses"] });
      toast.success("Dados atualizados!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar dados: ${error.message}`);
    },
  });

  return refreshMutation;
}
