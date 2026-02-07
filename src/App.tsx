import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SatelliteProvider } from "@/contexts/SatelliteContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Satellites from "./pages/Satellites";
import Responses from "./pages/Responses";
import Upload from "./pages/Upload";
import Settings from "./pages/Settings";
import Dossies from "./pages/Dossies";
import Envios from "./pages/Envios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SatelliteProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/satellites" element={<Satellites />} />
              <Route path="/responses" element={<Responses />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/dossies" element={<Dossies />} />
              <Route path="/envios" element={<Envios />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </SatelliteProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
