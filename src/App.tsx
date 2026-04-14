import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider, useUser } from "@/contexts/UserContext";
import UserSelectPage from "./pages/UserSelectPage";
import DashboardPage from "./pages/DashboardPage";
import OnboardingPage from "./pages/OnboardingPage";
import FillupFormPage from "./pages/FillupFormPage";
import VehiclesPage from "./pages/VehiclesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { currentUser } = useUser();

  if (!currentUser) {
    return <UserSelectPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/fillup/:id" element={<FillupFormPage />} />
      <Route path="/vehicles" element={<VehiclesPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
