
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./components/Web3Provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import CreateCampaign from "./pages/CreateCampaign";
import Dashboard from "./pages/Dashboard";
import MyCampaigns from "./pages/MyCampaigns";
import Milestones from "./pages/Milestones";
import Community from "./pages/Community";
import Updates from "./pages/Updates";
import Analytics from "./pages/Analytics";
import CreatorProfile from "./pages/CreatorProfile";
import CreatorSettings from "./pages/CreatorSettings";
import About from "./pages/About";
import Admin from "./pages/Admin";

const App = () => (
  <Web3Provider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:slug" element={<CampaignDetail />} />
          <Route path="/create" element={<CreateCampaign />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/campaigns" element={<MyCampaigns />} />
          <Route path="/milestones" element={<Milestones />} />
          <Route path="/community" element={<Community />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/creator/:address" element={<CreatorProfile />} />
          <Route path="/settings" element={<CreatorSettings />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </Web3Provider>
);

export default App;
