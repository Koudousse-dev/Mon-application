import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ParentForm from "@/pages/parent-form";
import NannyForm from "@/pages/nanny-form";
import Services from "@/pages/services";
import Payment from "@/pages/payment";
import Contact from "@/pages/contact";
import AdminLogin from "@/pages/admin-login";
import AdminDirectLogin from "@/pages/admin-direct-login";
import AdminDashboard from "@/pages/admin";
import AdminProfile from "@/pages/admin-profile";
import AdminPrestations from "@/pages/admin-prestations";
import AdminParametres from "@/pages/admin-parametres";
import AdminPaymentConfig from "@/pages/admin-payment-config";
import MatchingPage from "@/pages/matching";
import BottomNavigation from "@/components/bottom-navigation";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/parent-form" component={ParentForm} />
        <Route path="/nanny-form" component={NannyForm} />
        <Route path="/services" component={Services} />
        <Route path="/payment" component={Payment} />
        <Route path="/contact" component={Contact} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/direct-login" component={AdminDirectLogin} />
        <Route path="/admin/profile" component={AdminProfile} />
        <Route path="/admin/prestations" component={AdminPrestations} />
        <Route path="/admin/parametres" component={AdminParametres} />
        <Route path="/admin/payment-config" component={AdminPaymentConfig} />
        <Route path="/admin/matching" component={MatchingPage} />
        <Route path="/admin" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
