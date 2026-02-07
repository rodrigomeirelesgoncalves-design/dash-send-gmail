import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Satellite, SatelliteMetrics, EmailResponse } from "@/types/satellite";
import { initialSatellites, generateMockMetrics, generateMockResponses } from "@/data/satellites";

interface SatelliteContextType {
  satellites: Satellite[];
  metrics: SatelliteMetrics[];
  responses: EmailResponse[];
  isLoading: boolean;
  lastUpdated: Date | null;
  addSatellite: (satellite: Omit<Satellite, "id" | "createdAt">) => void;
  removeSatellite: (id: string) => void;
  toggleSatellite: (id: string) => void;
  refreshData: () => void;
  getTotalMetrics: () => {
    sent: number;
    opened: number;
    replied: number;
    bounced: number;
    failed: number;
    optOut: number;
  };
}

const SatelliteContext = createContext<SatelliteContextType | undefined>(undefined);

export const SatelliteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [satellites, setSatellites] = useState<Satellite[]>(initialSatellites);
  const [metrics, setMetrics] = useState<SatelliteMetrics[]>([]);
  const [responses, setResponses] = useState<EmailResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshData = useCallback(() => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setMetrics(generateMockMetrics(satellites.filter((s) => s.isActive)));
      setResponses(generateMockResponses());
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 500);
  }, [satellites]);

  // Initial load and auto-refresh every minute
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 60000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const addSatellite = (satellite: Omit<Satellite, "id" | "createdAt">) => {
    const newSatellite: Satellite = {
      ...satellite,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setSatellites((prev) => [...prev, newSatellite]);
  };

  const removeSatellite = (id: string) => {
    setSatellites((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleSatellite = (id: string) => {
    setSatellites((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const getTotalMetrics = () => {
    return metrics.reduce(
      (acc, m) => ({
        sent: acc.sent + m.sent,
        opened: acc.opened + m.opened,
        replied: acc.replied + m.replied,
        bounced: acc.bounced + m.bounced,
        failed: acc.failed + m.failed,
        optOut: acc.optOut + m.optOut,
      }),
      { sent: 0, opened: 0, replied: 0, bounced: 0, failed: 0, optOut: 0 }
    );
  };

  return (
    <SatelliteContext.Provider
      value={{
        satellites,
        metrics,
        responses,
        isLoading,
        lastUpdated,
        addSatellite,
        removeSatellite,
        toggleSatellite,
        refreshData,
        getTotalMetrics,
      }}
    >
      {children}
    </SatelliteContext.Provider>
  );
};

export const useSatellites = () => {
  const context = useContext(SatelliteContext);
  if (!context) {
    throw new Error("useSatellites must be used within a SatelliteProvider");
  }
  return context;
};
