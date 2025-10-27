import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, User, Lock, Mail, Shield, Check, Edit, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { updateAdminProfileSchema } from "@shared/schema";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est obligatoire"),
  newPassword: z.string().min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string().min(1, "La confirmation est obligatoire"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
type UpdateProfileForm = z.infer<typeof updateAdminProfileSchema>;

export default function AdminProfile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Fetch current user info
  const { data: authData, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  const user = (authData as any)?.user;

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const profileForm = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateAdminProfileSchema),
    defaultValues: {
      username: user?.username || "",
      nom: user?.nom || "",
      email: user?.email || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileForm) => {
      const response = await apiRequest("PUT", "/api/admin/profile", data);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsEditingProfile(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été modifiées avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le profil.",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordForm) => {
      const response = await apiRequest("POST", "/api/admin/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await response.json();
    },
    onSuccess: () => {
      setShowSuccess(true);
      form.reset();
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été changé avec succès.",
      });
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de changer le mot de passe. Vérifiez votre mot de passe actuel.",
      });
    },
  });

  const onSubmit = (data: ChangePasswordForm) => {
    changePasswordMutation.mutate(data);
  };

  const onProfileSubmit = (data: UpdateProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  // Update form when user data changes
  useEffect(() => {
    if (user && !isEditingProfile) {
      profileForm.setValue('username', user.username);
      profileForm.setValue('nom', user.nom);
      profileForm.setValue('email', user.email);
    }
  }, [user, isEditingProfile, profileForm]);

  if (isLoading) {
    return (
      <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user) {
    navigate("/admin/login");
    return null;
  }

  return (
    <div className="mobile-container min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="text-white" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">Profil Administrateur</h2>
            <p className="text-sm text-white/90">Gérer votre compte</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 pb-32 space-y-6 w-full">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="text-primary w-5 h-5" />
                Informations du compte
              </CardTitle>
              {!isEditingProfile ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                  data-testid="button-edit-profile"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setIsEditingProfile(false);
                    profileForm.reset();
                  }}
                  data-testid="button-cancel-edit"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEditingProfile ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="icon-circle bg-primary/20 shrink-0">
                    <Shield className="text-primary w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">Nom d'utilisateur</p>
                    <p className="font-semibold break-words" data-testid="text-username">{user.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="icon-circle bg-accent/30 shrink-0">
                    <User className="text-accent-foreground w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">Nom complet</p>
                    <p className="font-semibold break-words" data-testid="text-fullname">{user.nom}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="icon-circle bg-secondary shrink-0">
                    <Mail className="text-secondary-foreground w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold break-words" data-testid="text-email">{user.email}</p>
                  </div>
                </div>
              </>
            ) : (
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'utilisateur *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Votre nom d'utilisateur" 
                            className="input-field"
                            data-testid="input-username"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
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
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="votre@email.com" 
                            className="input-field"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="btn-primary w-full" 
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {updateProfileMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="text-primary w-5 h-5" />
              Changer le mot de passe
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showSuccess && (
              <div className="bg-green-50 border-2 border-green-300 text-green-800 p-4 rounded-lg mb-4 flex items-center gap-2">
                <Check className="w-5 h-5" />
                <p className="text-sm font-medium">Mot de passe changé avec succès !</p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe actuel *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password"
                          placeholder="Votre mot de passe actuel" 
                          className="input-field"
                          data-testid="input-current-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nouveau mot de passe *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password"
                          placeholder="Au moins 6 caractères" 
                          className="input-field"
                          data-testid="input-new-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le nouveau mot de passe *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password"
                          placeholder="Retapez le nouveau mot de passe" 
                          className="input-field"
                          data-testid="input-confirm-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="btn-primary w-full" 
                  disabled={changePasswordMutation.isPending}
                  data-testid="button-submit"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {changePasswordMutation.isPending ? "Changement en cours..." : "Changer le mot de passe"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="bg-secondary/50 rounded-lg p-4 border-2 border-accent/30 w-full">
          <p className="text-sm text-foreground">
            <strong>Conseil de sécurité :</strong> Utilisez un mot de passe fort avec au moins 8 caractères, incluant des lettres, des chiffres et des symboles.
          </p>
        </div>
      </div>
    </div>
  );
}
