import { Link } from "wouter";
import { Search, UserPlus, ClipboardList, Phone, CreditCard, Baby, Info } from "lucide-react";

export default function Home() {
  return (
    <div className="mobile-container min-h-screen bg-gradient-to-b from-background to-white">
      {/* Hero Header with Gradient */}
      <div className="hero-gradient py-12 sm:py-16 px-4 sm:px-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-white/95 rounded-full flex items-center justify-center mb-4 shadow-lg animate-float">
            <Baby className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 font-heading drop-shadow-lg">
            Dieu veille<br />sur nos enfants
          </h1>
          <p className="text-white font-medium drop-shadow">
            Service de garde d'enfants au Gabon
          </p>
        </div>
      </div>

      {/* Main Navigation Cards */}
      <div className="px-4 sm:px-6 -mt-6 pb-28">
        <div className="grid gap-4 sm:gap-6 w-full">
          {/* Parent Request Card */}
          <Link href="/parent-form">
            <div 
              data-testid="card-parent-request"
              className="nav-card nav-card-animated nav-card-delay-1"
            >
              <div className="flex items-center gap-4">
                <div className="icon-circle bg-primary/20">
                  <Search className="text-primary w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-lg mb-1">
                    Je cherche une nounou
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Trouvez la personne idéale pour vos enfants
                  </p>
                </div>
                <i className="fas fa-chevron-right text-muted-foreground"></i>
              </div>
            </div>
          </Link>

          {/* Nanny Application Card */}
          <Link href="/nanny-form">
            <div 
              data-testid="card-nanny-application"
              className="nav-card nav-card-animated nav-card-delay-2"
            >
              <div className="flex items-center gap-4">
                <div className="icon-circle bg-accent/30">
                  <UserPlus className="text-accent-foreground w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-lg mb-1">
                    Je veux postuler
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Rejoignez notre équipe de professionnels
                  </p>
                </div>
                <i className="fas fa-chevron-right text-muted-foreground"></i>
              </div>
            </div>
          </Link>

          {/* Services Card */}
          <Link href="/services">
            <div 
              data-testid="card-services"
              className="nav-card nav-card-animated nav-card-delay-3"
            >
              <div className="flex items-center gap-4">
                <div className="icon-circle bg-secondary">
                  <ClipboardList className="text-secondary-foreground w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-lg mb-1">
                    Prestations & tarifs
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Découvrez nos services et tarifs
                  </p>
                </div>
                <i className="fas fa-chevron-right text-muted-foreground"></i>
              </div>
            </div>
          </Link>

          {/* Contact Card */}
          <Link href="/contact">
            <div 
              data-testid="card-contact"
              className="nav-card nav-card-animated nav-card-delay-4"
            >
              <div className="flex items-center gap-4">
                <div className="icon-circle bg-muted">
                  <Phone className="text-foreground w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-lg mb-1">
                    Nous contacter
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Une question ? Écrivez-nous
                  </p>
                </div>
                <i className="fas fa-chevron-right text-muted-foreground"></i>
              </div>
            </div>
          </Link>
        </div>

        {/* Payment Section (Disabled) */}
        <div className="mt-6 relative w-full">
          <div className="coming-soon-badge">Bientôt</div>
          <Link href="/payment">
            <div 
              data-testid="card-payment-disabled"
              className="card opacity-60 pointer-events-none"
            >
              <div className="flex items-center gap-4">
                <div className="icon-circle bg-primary/20">
                  <CreditCard className="text-primary w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-lg mb-1">
                    Mon paiement
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Paiement mobile bientôt disponible
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-secondary/50 rounded-lg p-4 border-2 border-accent/30 w-full">
          <div className="flex gap-3">
            <Info className="text-accent-foreground w-5 h-5 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Service professionnel et sécurisé
              </p>
              <p className="text-xs text-muted-foreground">
                Toutes nos nounous sont vérifiées et formées pour assurer la sécurité de vos enfants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
