import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  ArrowLeft,
  Heart,
  MapPin,
  Calendar,
  Award,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEffect } from "react";
import type { Match } from "@shared/matching";

export default function MatchingPage() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/admin/login");
    }
  }, [user, userLoading, setLocation]);

  if (userLoading || matchesLoading) {
    return (
      <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getScoreColor = (score: number): string => {
    if (score >= 70) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-blue-600 dark:text-blue-400";
    if (score >= 30) return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getScoreBg = (score: number): string => {
    if (score >= 70) return "bg-green-100 dark:bg-green-900";
    if (score >= 50) return "bg-blue-100 dark:bg-blue-900";
    if (score >= 30) return "bg-yellow-100 dark:bg-yellow-900";
    return "bg-gray-100 dark:bg-gray-900";
  };

  return (
    <div className="mobile-container min-h-screen bg-background pb-20">
      <div className="p-4 sm:p-6 w-full">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/admin")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-primary">
              Suggestions de Matching
            </h1>
            <p className="text-sm text-muted-foreground">
              {matches.length} correspondance{matches.length > 1 ? 's' : ''} trouvée{matches.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {matches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Aucune correspondance trouvée pour le moment
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Les matches apparaîtront automatiquement quand des profils compatibles seront disponibles
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <Card key={`${match.requestId}-${match.nannyId}`} className="overflow-hidden">
                <CardHeader className={`${getScoreBg(match.score)} pb-3`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Heart className="w-5 h-5 text-primary" />
                        Match trouvé
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Score de compatibilité
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getScoreColor(match.score)}`}>
                        {match.score}%
                      </div>
                    </div>
                  </div>
                  <Progress value={match.score} className="mt-3 h-2" />
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800">
                          Demande Parent
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="font-semibold text-foreground">{match.request.nom}</p>
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            {match.request.telephone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {match.request.adresse}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {match.request.typeService}
                          </div>
                          {match.request.horaireDebut && match.request.horaireFin && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {match.request.horaireDebut} - {match.request.horaireFin}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                          Nounou Suggérée
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="font-semibold text-foreground">{match.nanny.nom}</p>
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            {match.nanny.telephone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {match.nanny.adresse}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Award className="w-4 h-4" />
                            {match.nanny.typePoste}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Award className="w-4 h-4" />
                            {match.nanny.experience}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {match.reasons.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-2">
                        Raisons du matching :
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {match.reasons.map((reason, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary"
                            className="text-xs"
                          >
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = `tel:${match.nanny.telephone}`;
                      }}
                      data-testid={`button-call-${match.nannyId}`}
                      className="flex-1"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Appeler la nounou
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = `tel:${match.request.telephone}`;
                      }}
                      data-testid={`button-call-parent-${match.requestId}`}
                      className="flex-1"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Appeler le parent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
