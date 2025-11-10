import { useLocation } from "wouter";
import { Link } from "wouter";
import { Home, List, CreditCard, Phone, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const navigationItems = [
  { path: "/", label: "Accueil", icon: Home, testId: "nav-home" },
  { path: "/services", label: "Services", icon: List, testId: "nav-services" },
  { path: "/payment", label: "Paiement", icon: CreditCard, testId: "nav-payment" },
  { path: "/contact", label: "Contact", icon: Phone, testId: "nav-contact" },
];

export default function BottomNavigation() {
  const [location] = useLocation();
  
  // Check if user is authenticated
  const { data: authData } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
    refetchInterval: 60000, // Refresh every minute
    throwOnError: false, // Tolerate 401 errors when not authenticated
  });

  const isAuthenticated = (authData as any)?.user;
  const isAdminPage = location.startsWith('/admin');

  return (
    <div className="floating-nav md:hidden">
      <div className="flex justify-around items-center">
        {navigationItems.map(({ path, label, icon: Icon, testId }) => (
          <Link key={path} href={path}>
            <button
              data-testid={testId}
              className={`nav-item ${location === path ? "active" : ""}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          </Link>
        ))}
        
        {/* Admin button - only visible when authenticated */}
        {isAuthenticated && (
          <Link href="/admin">
            <button
              data-testid="nav-admin"
              className={`nav-item ${isAdminPage ? "active" : ""}`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-xs font-medium">Admin</span>
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
