import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, User, ClipboardCheck, Send, CheckCircle } from "lucide-react";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insertParentRequestSchema, type Prestation } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { localStorage } from "@/lib/storage";
import parentFormImage from "@assets/stock_images/happy_african_childr_f11fd4ba.jpg";
import { useAdminUser } from "@/hooks/use-admin-user";
import { useBannerImage } from "@/hooks/use-banner-image";
import { HeroImageEditor } from "@/components/hero-image-editor";

export default function ParentForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const searchParams = useSearch();
  const { data: adminUser } = useAdminUser();
  const isAdmin = Boolean(adminUser?.user);
  const { heroImage, setHeroImage } = useBannerImage("parent-form", parentFormImage);

  const { data: prestations = [], isLoading: prestationsLoading } = useQuery<Prestation[]>({
    queryKey: ["/api/prestations"],
  });
  
  // Parse URL query parameters
  const urlParams = new URLSearchParams(searchParams);
  const preSelectedService = urlParams.get('service') || "";
  const preSelectedForfait = urlParams.get('forfait') || urlParams.get('service') || "";

  const form = useForm({
    resolver: zodResolver(insertParentRequestSchema),
    defaultValues: {
      nom: "",
      telephone: "",
      adresse: "",
      typeService: preSelectedService,
      horaireDebut: "",
      horaireFin: "",
      nombreEnfants: 1,
      forfait: "",
      commentaires: "",
    },
  });
  
  // Update form values when URL params and prestations are loaded
  useEffect(() => {
    if (preSelectedService) {
      form.setValue('typeService', preSelectedService);
    }
    
    // Set forfait only if it exists in the loaded prestations
    if (preSelectedForfait && !prestationsLoading && prestations.length > 0) {
      const validForfait = prestations.find(p => p.id === preSelectedForfait);
      if (validForfait) {
        form.setValue('forfait', preSelectedForfait);
      }
    }
  }, [preSelectedService, preSelectedForfait, prestations, prestationsLoading, form]);

  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      // Try to submit to server first
      try {
        const response = await apiRequest("POST", "/api/parent-requests", data);
        return await response.json();
      } catch (error) {
        // If server is offline, store locally
        await localStorage.storeParentRequest(data);
        return { offline: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parent-requests"] });
      setShowSuccess(true);
      form.reset();
      setTimeout(() => setShowSuccess(false), 5000);
    },
  });

  const onSubmit = (data: any) => {
    createRequestMutation.mutate(data);
  };

  if (showSuccess) {
    return (
      <div className="mobile-container min-h-screen bg-background">
        <div className="bg-primary p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">Demande envoyée</h2>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 pb-32 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full text-center">
            <CardContent className="pt-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-xl mb-2">Demande enregistrée avec succès !</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Notre équipe vous contactera sous peu pour finaliser votre demande.
              </p>
              <Link href="/">
                <Button data-testid="button-return-home" className="btn-primary">
                  Retourner à l'accueil
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen bg-background">
      {/* Header with Image */}
        <div className="relative overflow-hidden">
          <img 
            src={heroImage} 
            alt="Enfants heureux" 
            className="w-full h-48 object-cover transition-all duration-300"
          />
          <HeroImageEditor
            page="parent-form"
            currentUrl={heroImage}
            defaultUrl={parentFormImage}
            isAdmin={isAdmin}
            onChange={setHeroImage}
          />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40 flex items-end p-4 sm:p-6">
          <div className="flex items-center gap-4 w-full">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">Je cherche une nounou</h2>
              <p className="text-sm text-white/90">Remplissez le formulaire ci-dessous</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 sm:p-6 pb-32 w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Info Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="text-primary w-5 h-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Votre nom complet" 
                          className="input-field"
                          data-testid="input-nom"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telephone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="+241 XX XX XX XX" 
                          className="input-field"
                          data-testid="input-telephone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adresse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse / Quartier *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Votre quartier" 
                          className="input-field"
                          data-testid="input-adresse"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Service Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="text-accent-foreground w-5 h-5" />
                  Détails du service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="typeService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de service recherché *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-field" data-testid="select-type-service">
                            <SelectValue placeholder="Sélectionnez un service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="regulier">Garde régulière</SelectItem>
                          <SelectItem value="occasionnel">Garde occasionnelle</SelectItem>
                          <SelectItem value="weekend">Week-end</SelectItem>
                          <SelectItem value="devoirs">Aide aux devoirs</SelectItem>
                          <SelectItem value="personne">Aide à la personne (mobilité réduite)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="horaireDebut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heure de début</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="time" 
                            className="input-field"
                            data-testid="input-horaire-debut"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="horaireFin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heure de fin</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="time" 
                            className="input-field"
                            data-testid="input-horaire-fin"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="nombreEnfants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre d'enfants *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger className="input-field" data-testid="select-nombre-enfants">
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 enfant</SelectItem>
                          <SelectItem value="2">2 enfants</SelectItem>
                          <SelectItem value="3">3 enfants</SelectItem>
                          <SelectItem value="4">4 enfants ou plus</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="forfait"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forfait choisi *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={prestationsLoading}>
                        <FormControl>
                          <SelectTrigger className="input-field" data-testid="select-forfait">
                            <SelectValue placeholder={prestationsLoading ? "Chargement des forfaits..." : "Sélectionnez un forfait"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {prestationsLoading ? (
                            <SelectItem value="loading" disabled>Chargement...</SelectItem>
                          ) : prestations.length === 0 ? (
                            <SelectItem value="empty" disabled>Aucun forfait disponible</SelectItem>
                          ) : (
                            prestations.map((prestation) => (
                              <SelectItem key={prestation.id} value={prestation.id}>
                                {prestation.nom} - {prestation.prix > 0 ? `${prestation.prix.toLocaleString()} ${prestation.unite}` : prestation.unite}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commentaires"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commentaires additionnels</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Informations supplémentaires..." 
                          className="input-field"
                          rows={4}
                          data-testid="textarea-commentaires"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="btn-primary w-full" 
              disabled={createRequestMutation.isPending}
              data-testid="button-submit"
            >
              <Send className="w-4 h-4 mr-2" />
              {createRequestMutation.isPending ? "Envoi en cours..." : "Envoyer ma demande"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
