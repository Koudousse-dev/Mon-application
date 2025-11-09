import { ArrowLeft, Clock, Calendar, CalendarDays, BookOpen, Heart, CreditCard, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Prestation } from "@shared/schema";
import BannerImageEditor from "@/components/admin/BannerImageEditor";
import { useBannerImage } from "@/hooks/useBannerImage";
import servicesImage from "@assets/stock_images/happy_african_childr_f11fd4ba.jpg";

export default function Services() {
  const [, setLocation] = useLocation();

  const { data: prestations = [], isLoading } = useQuery<Prestation[]>({
    queryKey: ["/api/prestations"],
  });

  const { data: authData } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const user = authData?.user;
  const isAdmin = user?.role === "admin";
  const bannerImage = useBannerImage("prestations-page", servicesImage);

  const getServiceIcon = (serviceId: string) => {
    const icons = {
      regulier: Clock,
      occasionnel: Calendar,
      weekend: CalendarDays,
      devoirs: BookOpen,
      personne: Heart,
    };
    return icons[serviceId as keyof typeof icons] || Clock;
  };

  const selectService = (serviceType: string, price: number) => {
    // In a real app, this would pre-fill the parent form
    // For now, we'll navigate to the form with URL params
    setLocation(`/parent-form?service=${serviceType}&price=${price}`);
  };

  return (
    <div className="mobile-container min-h-screen bg-background">
      {/* Header with Image */}
      <div className="relative overflow-hidden">
        <img 
          src={bannerImage} 
          alt="Nos prestations et tarifs" 
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 to-secondary/40 flex items-end p-4 sm:p-6">
          <div className="flex items-center gap-4 w-full">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">Prestations & Tarifs</h2>
              <p className="text-sm text-white/90">Nos services professionnels</p>
            </div>
          </div>
        </div>
        {isAdmin && (
          <BannerImageEditor
            pageKey="prestations-page"
            currentImageUrl={bannerImage}
          />
        )}
      </div>

      {/* Services List */}
      <div className="p-4 sm:p-6 pb-32 w-full">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Chargement des prestations...</p>
        ) : prestations.length === 0 ? (
          <p className="text-center text-muted-foreground">Aucune prestation disponible pour le moment</p>
        ) : (
          prestations.map((service) => {
            const IconComponent = getServiceIcon(service.id);
          
          return (
            <Card key={service.id} className="mb-4 hover:shadow-lg transition-all" data-testid={`service-card-${service.id}`}>
              <CardHeader>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`icon-circle ${service.id === 'regulier' ? 'bg-primary/20' : service.id === 'personne' ? 'bg-accent/30' : 'bg-secondary'}`}>
                    <IconComponent className={`${service.id === 'regulier' ? 'text-primary' : service.id === 'personne' ? 'text-accent-foreground' : 'text-secondary-foreground'} w-6 h-6`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-lg mb-1">{service.nom}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                    <div className="service-badge mb-3">{service.unite}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="price-tag">
                      {service.prix > 0 ? `${service.prix.toLocaleString()} FCFA` : "Sur devis"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {service.unite}
                    </p>
                  </div>
                  <Button
                    onClick={() => selectService(service.id, service.prix)}
                    className="btn-secondary text-sm py-2 px-4"
                    data-testid={`button-select-${service.id}`}
                  >
                    {service.prix > 0 ? "Choisir" : "Contacter"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
          })
        )}

        {/* Payment Button (Disabled) */}
        <div className="mt-6 relative">
          <div className="coming-soon-badge">Bientôt disponible</div>
          <Button 
            disabled 
            className="btn-primary w-full opacity-60 pointer-events-none"
            data-testid="button-payment-disabled"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Procéder au paiement
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-3">
            Le paiement mobile sera bientôt intégré
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-primary/10 rounded-lg p-4 border-2 border-primary/30">
          <div className="flex gap-3">
            <Shield className="text-primary w-5 h-5 mt-0.5" />
            <div>
              <p className="font-medium text-foreground mb-1">Qualité garantie</p>
              <p className="text-sm text-muted-foreground">
                Toutes nos prestations incluent une garantie de satisfaction et un suivi personnalisé.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
