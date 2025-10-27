import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

type ParametreSite = {
  id: string;
  cle: string;
  valeur: string;
  dateModification: Date;
};

export default function AdminParametres() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    telephone: "",
    adresse: "",
  });

  // Fetch all site parameters (array of key-value pairs)
  const { data: parametres = [], isLoading } = useQuery<ParametreSite[]>({
    queryKey: ["/api/parametres-site"],
  });

  // Load data into form when fetched
  useEffect(() => {
    if (parametres.length > 0) {
      const emailParam = parametres.find(p => p.cle === "email");
      const telephoneParam = parametres.find(p => p.cle === "telephone");
      const adresseParam = parametres.find(p => p.cle === "adresse");

      setFormData({
        email: emailParam?.valeur || "",
        telephone: telephoneParam?.valeur || "",
        adresse: adresseParam?.valeur || "",
      });
    }
  }, [parametres]);

  // Update mutation (creates or updates all 3 parameters)
  // Note: apiRequest already checks response.ok via throwIfResNotOk
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Fetch fresh data to check existence (apiRequest throws if not ok)
      const response = await apiRequest("GET", "/api/parametres-site");
      const freshParametres = await response.json() as ParametreSite[];
      
      // Check which parameters exist in fresh data
      const emailExists = freshParametres.find(p => p.cle === "email");
      const telephoneExists = freshParametres.find(p => p.cle === "telephone");
      const adresseExists = freshParametres.find(p => p.cle === "adresse");

      // Create or update each parameter (apiRequest throws if not ok)
      const updates = await Promise.all([
        (async () => {
          const res = emailExists
            ? await apiRequest("PATCH", "/api/parametres-site/email", { valeur: data.email })
            : await apiRequest("POST", "/api/parametres-site", { cle: "email", valeur: data.email });
          return res.json();
        })(),
        (async () => {
          const res = telephoneExists
            ? await apiRequest("PATCH", "/api/parametres-site/telephone", { valeur: data.telephone })
            : await apiRequest("POST", "/api/parametres-site", { cle: "telephone", valeur: data.telephone });
          return res.json();
        })(),
        (async () => {
          const res = adresseExists
            ? await apiRequest("PATCH", "/api/parametres-site/adresse", { valeur: data.adresse })
            : await apiRequest("POST", "/api/parametres-site", { cle: "adresse", valeur: data.adresse });
          return res.json();
        })(),
      ]);
      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parametres-site"] });
      toast({ title: "Paramètres mis à jour avec succès" });
    },
    onError: (error: any) => {
      console.error("Error updating parameters:", error);
      toast({ 
        title: "Erreur lors de la mise à jour", 
        description: error?.message || "Vérifiez les logs pour plus de détails",
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setLocation("/admin")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour au Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold font-heading">Paramètres du Site</h1>
          <p className="text-white/90 mt-2">Gérer les informations de contact</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Chargement...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Informations de Contact</CardTitle>
              <CardDescription>
                Ces informations seront affichées sur la page Contact publique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email de contact</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="contact@example.com"
                    required
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone de contact</Label>
                  <Input
                    id="telephone"
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => handleInputChange("telephone", e.target.value)}
                    placeholder="+241 XX XX XX XX"
                    required
                    data-testid="input-telephone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Input
                    id="adresse"
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => handleInputChange("adresse", e.target.value)}
                    placeholder="Libreville, Gabon"
                    required
                    data-testid="input-adresse"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateMutation.isPending}
                  data-testid="button-save"
                >
                  {updateMutation.isPending ? (
                    "Enregistrement..."
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
