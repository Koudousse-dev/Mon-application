import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { 
  LogOut, 
  Users, 
  Baby, 
  MessageSquare, 
  Calendar,
  Phone,
  MapPin,
  FileText,
  ChevronDown,
  ChevronUp,
  Bell,
  Check,
  Heart,
  UserCog,
  Eye,
  Download,
  Settings,
  Trash2,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import PushNotificationToggle from "@/components/admin/PushNotificationToggle";
import type { 
  ParentRequest, 
  NannyApplication, 
  ContactMessage,
  ParentRequestStatus,
  NannyApplicationStatus,
  Notification,
  Employee
} from "@shared/schema";

function NotificationCenter({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  isPending 
}: { 
  notifications: Notification[]; 
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isPending: boolean;
}) {
  const unreadCount = notifications.length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "nouvelle_demande":
        return <Baby className="w-4 h-4" />;
      case "nouvelle_candidature":
        return <Users className="w-4 h-4" />;
      case "nouveau_message":
        return <MessageSquare className="w-4 h-4" />;
      case "nouveau_match":
        return <Check className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              disabled={isPending}
              data-testid="button-mark-all-read"
              className="text-xs h-7"
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune nouvelle notification
          </p>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors"
                  onClick={() => onMarkAsRead(notification.id)}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="mt-1 text-primary">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{notification.titre}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(notification.dateCreation)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface DocumentInfo {
  filename: string;
  data?: string; // Optional: old documents have base64 data
  storedPath: string; // Path in Object Storage
  type: string;
  size: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set());
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    montant: "",
    motif: "",
    datePaiement: new Date().toISOString().split('T')[0],
  });
  const [deleteEmployeeDialogOpen, setDeleteEmployeeDialogOpen] = useState(false);
  const [deleteApplicationId, setDeleteApplicationId] = useState<string | null>(null);
  const [processingApplicationId, setProcessingApplicationId] = useState<string | null>(null);

  const parseDocuments = (documentsJson: string | null): DocumentInfo[] => {
    if (!documentsJson) return [];
    try {
      const docs = JSON.parse(documentsJson);
      // Ensure all documents have storedPath (always prefix legacy ones)
      return docs.map((doc: any) => ({
        ...doc,
        // If no storedPath or if it's a legacy doc (has base64 data), prefix with "legacy-"
        storedPath: doc.storedPath || `legacy-${doc.filename || Date.now()}`
      }));
    } catch {
      return [];
    }
  };

  const viewDocument = (doc: DocumentInfo) => {
    // If doc has base64 data (old format), use it
    if (doc.data) {
      const dataUrl = `data:${doc.type};base64,${doc.data}`;
      window.open(dataUrl, '_blank');
    } else if (doc.storedPath && !doc.storedPath.startsWith('legacy-')) {
      // New format: fetch from Object Storage (only if valid path)
      window.open(`/api/download/${doc.storedPath}`, '_blank');
    } else {
      // Neither data nor valid storedPath - show error
      toast({
        title: "Document indisponible",
        description: "Ce document ne peut pas être visualisé (format legacy incompatible)",
        variant: "destructive"
      });
    }
  };

  const downloadDocument = (doc: DocumentInfo) => {
    // If doc has base64 data (old format), use it
    if (doc.data) {
      const dataUrl = `data:${doc.type};base64,${doc.data}`;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = doc.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (doc.storedPath && !doc.storedPath.startsWith('legacy-')) {
      // New format: download from Object Storage (only if valid path)
      const link = document.createElement('a');
      link.href = `/api/download/${doc.storedPath}`;
      link.download = doc.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Neither data nor valid storedPath - show error
      toast({
        title: "Document indisponible",
        description: "Ce document ne peut pas être téléchargé (format legacy incompatible)",
        variant: "destructive"
      });
    }
  };

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: parentRequests = [], isLoading: requestsLoading } = useQuery<ParentRequest[]>({
    queryKey: ["/api/parent-requests"],
  });

  const { data: nannyApplications = [], isLoading: applicationsLoading } = useQuery<NannyApplication[]>({
    queryKey: ["/api/nanny-applications"],
  });

  const { data: contactMessages = [], isLoading: messagesLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/contact-messages"],
  });

  const { data: unreadNotifications = [], isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications/unread"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // Fetch employee's related application when selected
  const { data: employeeApplication } = useQuery<NannyApplication | null>({
    queryKey: ["/api/nanny-applications", selectedEmployee?.candidatureId],
    enabled: !!selectedEmployee?.candidatureId,
  });

  // Fetch employee's payment history when selected
  const { data: employeePayments = [] } = useQuery<any[]>({
    queryKey: ["/api/paiements-employes/employee", selectedEmployee?.id],
    enabled: !!selectedEmployee?.id,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      setLocation("/admin/login");
    },
  });

  const updateParentRequestStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ParentRequestStatus }) => {
      const response = await apiRequest("PATCH", `/api/parent-requests/${id}/status`, { status });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la mise à jour");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parent-requests"] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la demande a été modifié avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut",
      });
    },
  });

  const updateNannyApplicationStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: NannyApplicationStatus }) => {
      const response = await apiRequest("PATCH", `/api/nanny-applications/${id}/status`, { status });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la mise à jour");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nanny-applications"] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la candidature a été modifié avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut",
      });
    },
  });

  const markNotificationAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/notifications/${id}/mark-read`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
    },
  });

  const markAllNotificationsAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/notifications/mark-all-read", {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
      toast({
        title: "Notifications marquées comme lues",
        description: "Toutes les notifications ont été marquées comme lues",
      });
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (data: { employeId: string; montant: number; motif: string; datePaiement: string }) => {
      const response = await apiRequest("POST", "/api/paiements-employes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/paiements-employes/employee", selectedEmployee?.id] });
      toast({ title: "Paiement ajouté avec succès" });
      setPaymentDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Erreur lors de l'ajout du paiement", variant: "destructive" });
    },
  });

  const acceptApplicationMutation = useMutation({
    mutationFn: async (application: NannyApplication) => {
      // Créer l'employé (apiRequest throws if not ok)
      await apiRequest("POST", "/api/employees", {
        candidatureId: application.id,
        nom: application.nom,
        telephone: application.telephone,
        adresse: application.adresse,
        typePoste: application.typePoste,
        experience: application.experience,
        disponibilites: application.disponibilites,
        documents: application.documents,
      });
      
      // Mettre à jour le statut (apiRequest throws if not ok)
      await apiRequest("PATCH", `/api/nanny-applications/${application.id}/status`, {
        status: "accepte",
      });
    },
    onMutate: async (application) => {
      // Bloquer immédiatement pour empêcher les clics multiples
      setProcessingApplicationId(application.id);

      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: ["/api/nanny-applications"] });

      // Snapshot de l'ancien état pour rollback
      const previousApplications = queryClient.getQueryData<NannyApplication[]>(["/api/nanny-applications"]);

      // Mise à jour optimiste : changer le statut immédiatement dans le cache
      queryClient.setQueryData<NannyApplication[]>(
        ["/api/nanny-applications"],
        (old) => {
          if (!old) return old;
          return old.map((app) =>
            app.id === application.id ? { ...app, statut: "accepte" } : app
          );
        }
      );

      // Retourner le contexte pour le rollback
      return { previousApplications };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nanny-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setProcessingApplicationId(null);
      toast({
        title: "Candidature acceptée",
        description: "L'employé a été créé avec succès",
      });
    },
    onError: (error: Error, _application, context) => {
      // Rollback : restaurer l'ancien état en cas d'erreur
      if (context?.previousApplications) {
        queryClient.setQueryData(["/api/nanny-applications"], context.previousApplications);
      }
      setProcessingApplicationId(null);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'accepter la candidature",
        variant: "destructive",
      });
    },
  });

  const rejectApplicationMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      // apiRequest throws if not ok
      await apiRequest("PATCH", `/api/nanny-applications/${applicationId}/status`, {
        status: "refuse",
      });
    },
    onMutate: async (applicationId) => {
      // Bloquer immédiatement pour empêcher les clics multiples
      setProcessingApplicationId(applicationId);

      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: ["/api/nanny-applications"] });

      // Snapshot de l'ancien état pour rollback
      const previousApplications = queryClient.getQueryData<NannyApplication[]>(["/api/nanny-applications"]);

      // Mise à jour optimiste : changer le statut immédiatement dans le cache
      queryClient.setQueryData<NannyApplication[]>(
        ["/api/nanny-applications"],
        (old) => {
          if (!old) return old;
          return old.map((app) =>
            app.id === applicationId ? { ...app, statut: "refuse" } : app
          );
        }
      );

      // Retourner le contexte pour le rollback
      return { previousApplications };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nanny-applications"] });
      setProcessingApplicationId(null);
      toast({
        title: "Candidature refusée",
        description: "Le statut a été mis à jour",
      });
    },
    onError: (error: Error, _applicationId, context) => {
      // Rollback : restaurer l'ancien état en cas d'erreur
      if (context?.previousApplications) {
        queryClient.setQueryData(["/api/nanny-applications"], context.previousApplications);
      }
      setProcessingApplicationId(null);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de refuser la candidature",
        variant: "destructive",
      });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      await apiRequest("DELETE", `/api/employees/${employeeId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Employé supprimé",
        description: "L'employé a été retiré avec succès",
      });
      setEmployeeDialogOpen(false);
      setSelectedEmployee(null);
      setDeleteEmployeeDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'employé",
        variant: "destructive",
      });
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      await apiRequest("DELETE", `/api/nanny-applications/${applicationId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nanny-applications"] });
      toast({
        title: "Candidature supprimée",
        description: "La candidature a été retirée avec succès",
      });
      setDeleteApplicationId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la candidature",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/admin/login");
    }
  }, [user, userLoading, setLocation]);

  if (userLoading) {
    return (
      <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const toggleRequestExpand = (id: string) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRequests(newExpanded);
  };

  const toggleApplicationExpand = (id: string) => {
    const newExpanded = new Set(expandedApplications);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedApplications(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      en_attente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      traite: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      paye: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    
    const labels = {
      en_attente: "En attente",
      traite: "Traité",
      paye: "Payé",
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || ""}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <div className="mobile-container min-h-screen bg-background pb-20">
      <div className="p-4 sm:p-6 w-full">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-heading font-bold text-primary">
              Administration
            </h1>
            <p className="text-sm text-muted-foreground">
              Bienvenue, {(user as any)?.username || 'Administrateur'}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2 flex-wrap">
            <NotificationCenter
              notifications={unreadNotifications}
              onMarkAsRead={(id) => markNotificationAsReadMutation.mutate(id)}
              onMarkAllAsRead={() => markAllNotificationsAsReadMutation.mutate()}
              isPending={markNotificationAsReadMutation.isPending || markAllNotificationsAsReadMutation.isPending}
            />
            <Link href="/admin/profile">
              <Button
                variant="outline"
                size="sm"
                data-testid="button-profile"
              >
                <UserCog className="w-4 h-4 mr-2" />
                Profil
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-sm md:text-base font-medium flex items-center justify-start gap-2 min-w-0">
                <Baby className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <span className="truncate">Demandes Parents</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-2xl md:text-3xl font-bold text-center md:text-left" data-testid="stat-parent-requests">
                {requestsLoading ? "..." : parentRequests.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-sm md:text-base font-medium flex items-center justify-start gap-2 min-w-0">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <span className="truncate">Candidatures Nounous</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-2xl md:text-3xl font-bold text-center md:text-left" data-testid="stat-nanny-applications">
                {applicationsLoading ? "..." : nannyApplications.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-sm md:text-base font-medium flex items-center justify-start gap-2 min-w-0">
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <span className="truncate">Messages Contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-2xl md:text-3xl font-bold text-center md:text-left" data-testid="stat-contact-messages">
                {messagesLoading ? "..." : contactMessages.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Push Notifications Toggle */}
        <div className="mb-6">
          <PushNotificationToggle />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Button
            onClick={() => setLocation("/admin/prestations")}
            size="lg"
            variant="outline"
            className="w-full min-h-[44px] md:min-h-[48px]"
            data-testid="button-prestations"
          >
            <FileText className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" />
            <span className="text-sm md:text-base whitespace-nowrap overflow-hidden text-ellipsis">Prestations</span>
          </Button>
          <Button
            onClick={() => setLocation("/admin/parametres")}
            size="lg"
            variant="outline"
            className="w-full min-h-[44px] md:min-h-[48px]"
            data-testid="button-parametres"
          >
            <Settings className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" />
            <span className="text-sm md:text-base whitespace-nowrap overflow-hidden text-ellipsis">Paramètres</span>
          </Button>
          <Button
            onClick={() => setLocation("/admin/payment-config")}
            size="lg"
            variant="outline"
            className="w-full min-h-[44px] md:min-h-[48px]"
            data-testid="button-payment-config"
          >
            <CreditCard className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" />
            <span className="text-sm md:text-base whitespace-nowrap overflow-hidden text-ellipsis">Moyens de paiement</span>
          </Button>
          <Button
            onClick={() => setLocation("/admin/matching")}
            size="lg"
            className="w-full min-h-[44px] md:min-h-[48px]"
            data-testid="button-matching"
          >
            <Heart className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" />
            <span className="text-sm md:text-base whitespace-nowrap overflow-hidden text-ellipsis">Matching</span>
          </Button>
        </div>

        <Tabs defaultValue="parents" className="w-full">
          <TabsList className="grid w-full grid-cols-4 gap-1">
            <TabsTrigger value="parents" data-testid="tab-parents" className="px-2 text-xs sm:text-sm truncate">
              <span className="truncate">Demandes Parents</span>
            </TabsTrigger>
            <TabsTrigger value="nannies" data-testid="tab-nannies" className="px-2 text-xs sm:text-sm truncate">
              <span className="truncate">Candidatures</span>
            </TabsTrigger>
            <TabsTrigger value="employees" data-testid="tab-employees" className="px-2 text-xs sm:text-sm truncate">
              <span className="truncate">Employés</span>
            </TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages" className="px-2 text-xs sm:text-sm truncate">
              <span className="truncate">Messages</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parents" className="space-y-4 mt-4">
            {requestsLoading ? (
              <p className="text-center text-muted-foreground">Chargement...</p>
            ) : parentRequests.length === 0 ? (
              <p className="text-center text-muted-foreground">Aucune demande pour le moment</p>
            ) : (
              parentRequests.map((request) => (
                <Collapsible key={request.id} open={expandedRequests.has(request.id)}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader 
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => toggleRequestExpand(request.id)}
                        data-testid={`request-card-${request.id}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-medium">
                              {request.nom}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {request.typeService} - {request.forfait}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Select
                              value={request.statut || 'en_attente'}
                              onValueChange={(value) => {
                                updateParentRequestStatusMutation.mutate({ 
                                  id: request.id, 
                                  status: value as ParentRequestStatus
                                });
                              }}
                              disabled={updateParentRequestStatusMutation.isPending}
                            >
                              <SelectTrigger 
                                className="w-32 h-8 text-xs"
                                data-testid={`select-status-${request.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en_attente">En attente</SelectItem>
                                <SelectItem value="traite">Traité</SelectItem>
                                <SelectItem value="paye">Payé</SelectItem>
                              </SelectContent>
                            </Select>
                            {expandedRequests.has(request.id) ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-3">
                        <div className="grid grid-cols-1 gap-3 text-sm">
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <span>{request.telephone}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <span>{request.adresse}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Baby className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Enfants:</p>
                              <p className="text-muted-foreground">{request.nombreEnfants} enfant(s)</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <span>
                              {request.horaireDebut && request.horaireFin 
                                ? `${request.horaireDebut} - ${request.horaireFin}`
                                : 'Horaires non spécifiés'
                              }
                            </span>
                          </div>
                          {request.commentaires && (
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium">Notes:</p>
                                <p className="text-muted-foreground">{request.commentaires}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))
            )}
          </TabsContent>

          <TabsContent value="nannies" className="space-y-4 mt-4">
            {applicationsLoading ? (
              <p className="text-center text-muted-foreground">Chargement...</p>
            ) : nannyApplications.length === 0 ? (
              <p className="text-center text-muted-foreground">Aucune candidature pour le moment</p>
            ) : (
              nannyApplications.map((application) => (
                <Collapsible key={application.id} open={expandedApplications.has(application.id)}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader 
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => toggleApplicationExpand(application.id)}
                        data-testid={`application-card-${application.id}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-medium">
                              {application.nom}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {application.typePoste} - {application.experience}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {application.statut === 'accepte' || application.statut === 'refuse' ? (
                              <span 
                                className={`px-3 py-1 text-xs font-medium rounded-md ${
                                  application.statut === 'accepte' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}
                                data-testid={`status-badge-${application.id}`}
                              >
                                {application.statut === 'accepte' ? 'Accepté' : 'Refusé'}
                              </span>
                            ) : (
                              <Select
                                value={application.statut || 'en_examen'}
                                onValueChange={(value) => {
                                  updateNannyApplicationStatusMutation.mutate({ 
                                    id: application.id, 
                                    status: value as NannyApplicationStatus
                                  });
                                }}
                                disabled={updateNannyApplicationStatusMutation.isPending}
                              >
                                <SelectTrigger 
                                  className="w-32 h-8 text-xs"
                                  data-testid={`select-status-${application.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="en_examen">En examen</SelectItem>
                                  <SelectItem value="en_attente">En attente</SelectItem>
                                  <SelectItem value="traite">Traité</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            {expandedApplications.has(application.id) ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-3">
                        <div className="grid grid-cols-1 gap-3 text-sm">
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <span>{application.telephone}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <span>{application.adresse}</span>
                          </div>
                          {application.disponibilites && (
                            <div className="flex items-start gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium">Disponibilités:</p>
                                <p className="text-muted-foreground">{application.disponibilites}</p>
                              </div>
                            </div>
                          )}
                          {application.documents && (() => {
                            const docs = parseDocuments(application.documents);
                            if (docs.length === 0) return null;
                            
                            return (
                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium mb-2">Documents:</p>
                                  <div className="space-y-2">
                                    {docs.map((doc, idx) => (
                                      <div 
                                        key={idx} 
                                        className="flex items-center gap-2 p-2 bg-accent/10 rounded-md"
                                        data-testid={`document-${application.id}-${idx}`}
                                      >
                                        <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                                        <span className="text-xs flex-1 min-w-0 truncate" title={doc.filename}>
                                          {doc.filename}
                                        </span>
                                        <div className="flex gap-1 shrink-0">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              viewDocument(doc);
                                            }}
                                            data-testid={`button-view-${application.id}-${idx}`}
                                          >
                                            <Eye className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              downloadDocument(doc);
                                            }}
                                            data-testid={`button-download-${application.id}-${idx}`}
                                          >
                                            <Download className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Accept/Reject Buttons (only show if status is "traite") */}
                        {application.statut === "traite" && (
                          <div className="flex gap-2 mt-4 pt-4 border-t">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                acceptApplicationMutation.mutate(application);
                              }}
                              disabled={processingApplicationId === application.id || acceptApplicationMutation.isPending || rejectApplicationMutation.isPending}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              data-testid={`button-accept-${application.id}`}
                            >
                              {(processingApplicationId === application.id || acceptApplicationMutation.isPending) ? "Traitement..." : "Accepter"}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                rejectApplicationMutation.mutate(application.id);
                              }}
                              disabled={processingApplicationId === application.id || acceptApplicationMutation.isPending || rejectApplicationMutation.isPending}
                              className="flex-1"
                              data-testid={`button-reject-${application.id}`}
                            >
                              {(processingApplicationId === application.id || rejectApplicationMutation.isPending) ? "Traitement..." : "Refuser"}
                            </Button>
                          </div>
                        )}

                        {/* Delete Button (only show for accepted or refused applications) */}
                        {(application.statut === "accepte" || application.statut === "refuse") && (
                          <div className="flex gap-2 mt-4 pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteApplicationId(application.id);
                              }}
                              disabled={deleteApplicationMutation.isPending}
                              className="w-full text-destructive hover:bg-destructive/10"
                              data-testid={`button-delete-application-${application.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer la candidature
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))
            )}
          </TabsContent>

          <TabsContent value="employees" className="space-y-4 mt-4">
            {employeesLoading ? (
              <p className="text-center text-muted-foreground">Chargement...</p>
            ) : employees.length === 0 ? (
              <p className="text-center text-muted-foreground">Aucun employé pour le moment</p>
            ) : (
              employees.map((employee) => (
                <Card key={employee.id} data-testid={`employee-card-${employee.id}`}>
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center justify-between">
                      <span>{employee.nom}</span>
                      <Badge variant="outline">{employee.typePoste}</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {employee.telephone} • {employee.adresse}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expérience: {employee.experience}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setEmployeeDialogOpen(true);
                      }}
                      data-testid={`button-view-employee-${employee.id}`}
                    >
                      <UserCog className="w-4 h-4 mr-2" />
                      Voir le dossier
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4 mt-4">
            {messagesLoading ? (
              <p className="text-center text-muted-foreground">Chargement...</p>
            ) : contactMessages.length === 0 ? (
              <p className="text-center text-muted-foreground">Aucun message pour le moment</p>
            ) : (
              contactMessages.map((message) => (
                <Card key={message.id} data-testid={`message-card-${message.id}`}>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">
                      {message.nom}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {message.telephone}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{message.message}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Employee Details Dialog */}
      <Dialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">
                Dossier Employé: {selectedEmployee?.nom}
              </DialogTitle>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteEmployeeDialogOpen(true)}
                data-testid="button-delete-employee"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Retirer l'employé
              </Button>
            </div>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-6">
              {/* Employee Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Nom:</strong> {selectedEmployee.nom}</p>
                  <p><strong>Téléphone:</strong> {selectedEmployee.telephone}</p>
                  <p><strong>Adresse:</strong> {selectedEmployee.adresse}</p>
                  <p><strong>Type de poste:</strong> {selectedEmployee.typePoste}</p>
                  <p><strong>Expérience:</strong> {selectedEmployee.experience}</p>
                  <p><strong>Disponibilités:</strong> {selectedEmployee.disponibilites}</p>
                </CardContent>
              </Card>

              {/* Documents Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedEmployee && (() => {
                    const docs = parseDocuments(selectedEmployee.documents);
                    return docs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {docs.map((doc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 bg-accent/10 rounded-md"
                          >
                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-sm flex-1 min-w-0 truncate" title={doc.filename}>
                              {doc.filename}
                            </span>
                            <div className="flex gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => viewDocument(doc)}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => downloadDocument(doc)}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucun document disponible</p>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Payments History */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Historique des Paiements</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPaymentFormData({
                        montant: "",
                        motif: "",
                        datePaiement: new Date().toISOString().split('T')[0],
                      });
                      setPaymentDialogOpen(true);
                    }}
                    data-testid="button-add-payment"
                  >
                    Ajouter Paiement
                  </Button>
                </CardHeader>
                <CardContent>
                  {employeePayments.length > 0 ? (
                    <div className="space-y-3">
                      {employeePayments.map((payment: any) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-3 bg-accent/10 rounded-md"
                          data-testid={`payment-${payment.id}`}
                        >
                          <div>
                            <p className="font-medium">{payment.montant} FCFA</p>
                            <p className="text-sm text-muted-foreground">
                              Motif: {payment.motif} • {new Date(payment.datePaiement).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Aucun paiement enregistré pour le moment
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un Paiement</DialogTitle>
          </DialogHeader>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedEmployee) {
                addPaymentMutation.mutate({
                  employeId: selectedEmployee.id,
                  montant: parseFloat(paymentFormData.montant),
                  motif: paymentFormData.motif,
                  datePaiement: paymentFormData.datePaiement,
                });
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="montant">Montant (FCFA)</Label>
              <Input
                id="montant"
                type="number"
                value={paymentFormData.montant}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, montant: e.target.value })}
                placeholder="50000"
                required
                data-testid="input-montant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motif">Motif</Label>
              <Input
                id="motif"
                type="text"
                value={paymentFormData.motif}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, motif: e.target.value })}
                placeholder="Garde du 01/10 au 05/10"
                required
                data-testid="input-motif"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="datePaiement">Date de paiement</Label>
              <Input
                id="datePaiement"
                type="date"
                value={paymentFormData.datePaiement}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, datePaiement: e.target.value })}
                required
                data-testid="input-datePaiement"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentDialogOpen(false)}
                data-testid="button-cancel-payment"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={addPaymentMutation.isPending}
                data-testid="button-submit-payment"
              >
                {addPaymentMutation.isPending ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Employee Confirmation Dialog */}
      <AlertDialog open={deleteEmployeeDialogOpen} onOpenChange={setDeleteEmployeeDialogOpen}>
        <AlertDialogContent data-testid="alert-delete-employee">
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir retirer cet employé ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'employé "{selectedEmployee?.nom}" sera définitivement supprimé du système.
              L'historique des paiements associés sera également supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-employee">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedEmployee) {
                  deleteEmployeeMutation.mutate(selectedEmployee.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-employee"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Application Confirmation Dialog */}
      <AlertDialog open={deleteApplicationId !== null} onOpenChange={(open) => !open && setDeleteApplicationId(null)}>
        <AlertDialogContent data-testid="alert-delete-application">
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette candidature ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La candidature sera définitivement supprimée du système.
              Assurez-vous que cette candidature a bien été traitée avant de la supprimer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-application">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteApplicationId) {
                  deleteApplicationMutation.mutate(deleteApplicationId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-application"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
