import { ArrowLeft, Clock, Smartphone, CreditCard, Info, Lock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { processPayment } from "@/lib/payment";

export default function Payment() {
  const handlePaymentAttempt = async () => {
    const result = await processPayment({
      amount: 50000,
      method: 'airtel',
      userInfo: { nom: 'Test User', telephone: '+241 XX XX XX XX' },
      serviceInfo: { type: 'regulier', forfait: 'Garde régulière' }
    });
    
    if (result.error) {
      alert(result.error);
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-background">
      {/* Header */}
      <div className="bg-accent p-4 sm:p-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-foreground" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-foreground font-heading">Mon paiement</h2>
            <p className="text-sm text-muted-foreground">Bientôt disponible</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 pb-32">
        {/* Coming Soon Banner */}
        <Card className="bg-accent/20 border-2 border-accent mb-6">
          <CardContent className="text-center py-8">
            <Clock className="w-12 h-12 text-accent-foreground mb-4 mx-auto" />
            <h3 className="font-heading font-bold text-xl mb-2">Paiement mobile bientôt disponible</h3>
            <p className="text-muted-foreground mb-4">
              Vous pourrez bientôt régler vos prestations directement depuis l'application.
            </p>
            <div className="service-badge">En cours de développement</div>
          </CardContent>
        </Card>

        {/* Payment Methods Preview */}
        <h3 className="font-heading font-semibold text-lg mb-4">Méthodes de paiement à venir</h3>

        {/* Airtel Money */}
        <Card className="mb-3 opacity-60 pointer-events-none" data-testid="payment-method-airtel">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Airtel Money</h4>
                <p className="text-sm text-muted-foreground">Paiement mobile sécurisé</p>
              </div>
              <i className="fas fa-chevron-right text-muted-foreground"></i>
            </div>
          </CardContent>
        </Card>

        {/* Moov Money */}
        <Card className="mb-3 opacity-60 pointer-events-none" data-testid="payment-method-moov">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Moov Money</h4>
                <p className="text-sm text-muted-foreground">Paiement mobile instantané</p>
              </div>
              <i className="fas fa-chevron-right text-muted-foreground"></i>
            </div>
          </CardContent>
        </Card>

        {/* CinetPay */}
        <Card className="mb-6 opacity-60 pointer-events-none" data-testid="payment-method-cinetpay">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">CinetPay</h4>
                <p className="text-sm text-muted-foreground">Carte bancaire et mobile money</p>
              </div>
              <i className="fas fa-chevron-right text-muted-foreground"></i>
            </div>
          </CardContent>
        </Card>

        {/* Disabled Payment Button */}
        <Button 
          disabled 
          className="btn-primary w-full opacity-60 pointer-events-none mb-4"
          onClick={handlePaymentAttempt}
          data-testid="button-pay-disabled"
        >
          <Lock className="w-4 h-4 mr-2" />
          Payer maintenant
        </Button>

        {/* Info Message */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex gap-3">
            <Info className="text-muted-foreground w-5 h-5 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                L'intégration des services de paiement est en cours. Vous serez notifié dès qu'ils seront disponibles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
