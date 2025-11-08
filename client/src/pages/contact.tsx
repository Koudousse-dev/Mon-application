import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, Phone, MapPin, MessageSquare, Send, Clock, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insertContactMessageSchema, type ParametreSite } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { localStorage } from "@/lib/storage";
import contactImage from "@assets/stock_images/warm_african_mother__19616505.jpg";
import BannerImageEditor from "@/components/admin/BannerImageEditor";
import { useBannerImage } from "@/hooks/useBannerImage";

export default function Contact() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);

  const { data: parametres = [], isLoading: parametresLoading } = useQuery<ParametreSite[]>({
    queryKey: ["/api/parametres-site"],
  });

  const { data: authData } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const user = authData?.user;
  const isAdmin = user?.role === "admin";
  const currentBannerImage = useBannerImage("contact", contactImage);

  const email = parametresLoading ? "Chargement..." : (parametres.find(p => p.cle === "email")?.valeur || "contact@gardedesenfantsgabon.com");
  const telephone = parametresLoading ? "Chargement..." : (parametres.find(p => p.cle === "telephone")?.valeur || "+241 XX XX XX XX");
  const adresse = parametresLoading ? "Chargement..." : (parametres.find(p => p.cle === "adresse")?.valeur || "Libreville, Gabon");

  const form = useForm({
    resolver: zodResolver(insertContactMessageSchema),
    defaultValues: {
      nom: "",
      telephone: "",
      message: "",
    },
  });

  const createMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await apiRequest("POST", "/api/contact-messages", data);
        return await response.json();
      } catch (error) {
        await localStorage.storeContactMessage(data);
        return { offline: true };
      }
    },
    onSuccess: () => {
      setShowSuccess(true);
      form.reset();
      setTimeout(() => setShowSuccess(false), 5000);
    },
  });

  const onSubmit = (data: any) => {
    createMessageMutation.mutate(data);
  };

  if (showSuccess) {
    return (
      <div className="mobile-container min-h-screen bg-background">
        <div className="bg-primary p-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">Message envoyé</h2>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 pb-32 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full text-center">
            <CardContent className="pt-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-xl mb-2">Message envoyé !</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Nous vous répondrons dans les plus brefs délais.
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
          src={bannerImageUrl || currentBannerImage} 
          alt="Contact - Famille heureuse" 
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40 flex items-end p-6">
          <div className="flex items-center gap-4 w-full">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">Nous contacter</h2>
              <p className="text-sm text-white/90">Nous sommes à votre écoute</p>
            </div>
          </div>
        </div>
        {isAdmin && (
          <BannerImageEditor
            pageKey="contact"
            currentImageUrl={currentBannerImage}
            onImageUpdated={(newUrl) => setBannerImageUrl(newUrl)}
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 pb-32">
        {/* Contact Info Cards */}
        <div className="grid gap-4 mb-6 w-full">
          {/* Email */}
          <Card data-testid="contact-email">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="icon-circle bg-primary/20 shrink-0">
                  <Mail className="text-primary w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-semibold text-sm sm:text-base break-words">{email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phone */}
          <Card data-testid="contact-phone">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="icon-circle bg-accent/30 shrink-0">
                  <Phone className="text-accent-foreground w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Téléphone</p>
                  <p className="font-semibold">{telephone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card data-testid="contact-address">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="icon-circle bg-secondary shrink-0">
                  <MapPin className="text-secondary-foreground w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Adresse</p>
                  <p className="font-semibold">{adresse}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="text-primary w-5 h-5" />
              Envoyez-nous un message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Votre nom" 
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
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message *</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Votre message..." 
                          className="input-field"
                          rows={5}
                          data-testid="textarea-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="btn-primary w-full" 
                  disabled={createMessageMutation.isPending}
                  data-testid="button-submit"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createMessageMutation.isPending ? "Envoi en cours..." : "Envoyer le message"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <div className="mt-6 bg-secondary/50 rounded-lg p-4 border-2 border-accent/30 w-full">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="text-accent-foreground w-4 h-4" />
            Horaires d'ouverture
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between" data-testid="hours-weekday">
              <span className="text-muted-foreground">Lundi - Vendredi</span>
              <span className="font-medium">8h00 - 18h00</span>
            </div>
            <div className="flex justify-between" data-testid="hours-saturday">
              <span className="text-muted-foreground">Samedi</span>
              <span className="font-medium">9h00 - 15h00</span>
            </div>
            <div className="flex justify-between" data-testid="hours-sunday">
              <span className="text-muted-foreground">Dimanche</span>
              <span className="font-medium">Fermé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
