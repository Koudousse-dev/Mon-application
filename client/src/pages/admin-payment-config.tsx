import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, Smartphone, DollarSign, Eye, EyeOff, Check } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import type { PaymentConfig } from "@shared/schema";

const paymentConfigSchema = z.object({
  actif: z.boolean(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  configJson: z.string().optional(),
});

type PaymentConfigForm = z.infer<typeof paymentConfigSchema>;

interface PaymentProvider {
  id: string;
  name: string;
  icon: typeof CreditCard;
  description: string;
  fields: {
    apiKey: { label: string; placeholder: string };
    apiSecret: { label: string; placeholder: string };
    configJson?: { label: string; placeholder: string; description: string };
  };
}

const providers: PaymentProvider[] = [
  {
    id: "airtel_money",
    name: "Airtel Money",
    icon: Smartphone,
    description: "Configuration pour les paiements via Airtel Money",
    fields: {
      apiKey: { label: "Clé API", placeholder: "Votre clé API Airtel Money" },
      apiSecret: { label: "Secret API", placeholder: "Votre secret API Airtel Money" },
      configJson: {
        label: "Configuration additionnelle (JSON)",
        placeholder: '{"apiUrl": "https://api.airtel.africa", "merchantId": "..."}',
        description: "URL de l'API, ID marchand, etc. (format JSON)"
      },
    },
  },
  {
    id: "moov_money",
    name: "Moov Money",
    icon: DollarSign,
    description: "Configuration pour les paiements via Moov Money",
    fields: {
      apiKey: { label: "Clé API", placeholder: "Votre clé API Moov Money" },
      apiSecret: { label: "Secret API", placeholder: "Votre secret API Moov Money" },
      configJson: {
        label: "Configuration additionnelle (JSON)",
        placeholder: '{"apiUrl": "https://api.moov-africa.ga", "merchantCode": "..."}',
        description: "URL de l'API, code marchand, etc. (format JSON)"
      },
    },
  },
  {
    id: "cinetpay",
    name: "CinetPay",
    icon: CreditCard,
    description: "Configuration pour les paiements via CinetPay",
    fields: {
      apiKey: { label: "Clé API", placeholder: "Votre clé API CinetPay" },
      apiSecret: { label: "Site ID", placeholder: "Votre Site ID CinetPay" },
      configJson: {
        label: "Configuration additionnelle (JSON)",
        placeholder: '{"callbackUrl": "https://votre-site.com/callback", "returnUrl": "..."}',
        description: "URLs de callback et retour (format JSON)"
      },
    },
  },
];

function ProviderCard({ provider }: { provider: PaymentProvider }) {
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);

  const { data: config, isLoading } = useQuery<PaymentConfig>({
    queryKey: [`/api/payment-configs/${provider.id}`],
    retry: false,
  });

  const form = useForm<PaymentConfigForm>({
    resolver: zodResolver(paymentConfigSchema),
    values: {
      actif: config?.actif || false,
      apiKey: config?.apiKey || "",
      apiSecret: config?.apiSecret || "",
      configJson: config?.configJson || "",
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (data: PaymentConfigForm) => {
      const response = await apiRequest("PUT", `/api/payment-configs/${provider.id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/payment-configs/${provider.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/payment-configs'] });
      toast({
        title: "Configuration enregistrée",
        description: `La configuration ${provider.name} a été mise à jour avec succès.`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la configuration.",
      });
    },
  });

  const onSubmit = (data: PaymentConfigForm) => {
    updateConfigMutation.mutate(data);
  };

  const maskSecret = (value: string | null | undefined) => {
    if (!value || value.length === 0) return "";
    if (value.length <= 4) return "****";
    return "****" + value.slice(-4);
  };

  const Icon = provider.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-circle bg-primary/20">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{provider.name}</CardTitle>
              <CardDescription>{provider.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor={`${provider.id}-active`} className="text-sm font-medium">
              {form.watch("actif") ? (
                <span className="text-green-600" data-testid={`status-${provider.id}`}>Actif</span>
              ) : (
                <span className="text-muted-foreground" data-testid={`status-${provider.id}`}>Inactif</span>
              )}
            </Label>
            <Switch
              id={`${provider.id}-active`}
              checked={form.watch("actif")}
              onCheckedChange={(checked) => form.setValue("actif", checked)}
              data-testid={`switch-${provider.id}`}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{provider.fields.apiKey.label}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showApiKey ? "text" : "password"}
                        placeholder={provider.fields.apiKey.placeholder}
                        className="pr-10"
                        data-testid={`input-api-key-${provider.id}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowApiKey(!showApiKey)}
                        data-testid={`toggle-api-key-${provider.id}`}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  {field.value && !showApiKey && (
                    <p className="text-xs text-muted-foreground">
                      Valeur actuelle: {maskSecret(field.value)}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{provider.fields.apiSecret.label}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showApiSecret ? "text" : "password"}
                        placeholder={provider.fields.apiSecret.placeholder}
                        className="pr-10"
                        data-testid={`input-api-secret-${provider.id}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowApiSecret(!showApiSecret)}
                        data-testid={`toggle-api-secret-${provider.id}`}
                      >
                        {showApiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  {field.value && !showApiSecret && (
                    <p className="text-xs text-muted-foreground">
                      Valeur actuelle: {maskSecret(field.value)}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {provider.fields.configJson && (
              <FormField
                control={form.control}
                name="configJson"
                render={({ field }) => {
                  const configField = provider.fields.configJson!;
                  return (
                    <FormItem>
                      <FormLabel>{configField.label}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={configField.placeholder}
                          rows={3}
                          data-testid={`input-config-json-${provider.id}`}
                        />
                      </FormControl>
                      <FormDescription>{configField.description}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}

            <Button
              type="submit"
              className="btn-primary w-full"
              disabled={updateConfigMutation.isPending}
              data-testid={`button-save-${provider.id}`}
            >
              <Check className="w-4 h-4 mr-2" />
              {updateConfigMutation.isPending ? "Enregistrement..." : "Enregistrer la configuration"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function AdminPaymentConfig() {
  return (
    <div className="mobile-container min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-primary text-white shadow-md">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Moyens de paiement</h1>
              <p className="text-sm text-white/80">Configuration des API de paiement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 pb-32 space-y-6 w-full">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ Information</h3>
            <p className="text-sm text-blue-800">
              Configurez vos moyens de paiement ici. Activez/désactivez chaque méthode et ajoutez vos clés API.
              Les clés sont stockées de manière sécurisée et ne sont pas affichées en clair.
            </p>
          </div>

          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      </div>
    </div>
  );
}
