import { useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";

export default function PushNotificationToggle() {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggle = async () => {
    setIsProcessing(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast({
          title: "Notifications désactivées",
          description: "Vous ne recevrez plus de notifications push",
        });
      } else {
        await subscribe();
        toast({
          title: "Notifications activées",
          description: "Vous recevrez maintenant des notifications pour les nouvelles demandes",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-gray-400" />
            Notifications Push
          </CardTitle>
          <CardDescription>
            Les notifications push ne sont pas supportées par ce navigateur
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
          Notifications Push
        </CardTitle>
        <CardDescription>
          Recevez des notifications sur votre téléphone pour les nouvelles demandes, candidatures et messages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            {isSubscribed ? (
              <span className="text-green-600 font-medium">✓ Activées</span>
            ) : (
              <span className="text-gray-500">Désactivées</span>
            )}
          </div>
          <Button
            onClick={handleToggle}
            disabled={isLoading || isProcessing}
            variant={isSubscribed ? "outline" : "default"}
          >
            {(isLoading || isProcessing) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : isSubscribed ? (
              <>
                <BellOff className="h-4 w-4 mr-2" />
                Désactiver
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Activer
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
