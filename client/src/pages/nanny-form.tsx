import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, IdCard, Briefcase, FileUp, Check, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insertNannyApplicationSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { localStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import nannyFormImage from "@assets/stock_images/professional_african_fd0ffe5f.jpg";
import BannerImageEditor from "@/components/admin/BannerImageEditor";
import { useBannerImage } from "@/hooks/useBannerImage";

interface UploadedFile {
  filename: string;
  storedPath: string;
  size: number;
  type: string;
  data?: string; // base64 data
}

export default function NannyForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: authData } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const user = authData?.user;
  const isAdmin = user?.role === "admin";
  const bannerImage = useBannerImage("nanny-form", nannyFormImage);

  const form = useForm({
    resolver: zodResolver(insertNannyApplicationSchema),
    defaultValues: {
      nom: "",
      telephone: "",
      adresse: "",
      typePoste: "",
      experience: "",
      disponibilites: "",
      documents: "",
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await apiRequest("POST", "/api/nanny-applications", data);
        return await response.json();
      } catch (error) {
        await localStorage.storeNannyApplication(data);
        return { offline: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nanny-applications"] });
      setShowSuccess(true);
      form.reset();
      setUploadedFiles([]);
      setTimeout(() => setShowSuccess(false), 5000);
    },
  });

  const onSubmit = (data: any) => {
    const applicationData = {
      ...data,
      documents: JSON.stringify(uploadedFiles.map(f => ({
        filename: f.filename,
        storedPath: f.storedPath,
        size: f.size,
        type: f.type,
        data: f.data // Include base64 data
      }))),
    };
    createApplicationMutation.mutate(applicationData);
  };

  const handleFileUpload = () => {
    // Open file picker
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: `${file.name} dépasse la limite de 5MB`,
          variant: "destructive"
        });
        continue;
      }

      // Upload file
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          toast({
            title: "Erreur d'upload",
            description: error.message || "Impossible d'uploader le fichier",
            variant: "destructive"
          });
          continue;
        }

        const uploadedFile = await response.json();
        setUploadedFiles(prev => [...prev, uploadedFile]);
        
        toast({
          title: "Fichier uploadé",
          description: `${uploadedFile.filename} a été uploadé avec succès`,
        });
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Erreur d'upload",
          description: "Une erreur est survenue lors de l'upload",
          variant: "destructive"
        });
      }
    }

    setIsUploading(false);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (showSuccess) {
    return (
      <div className="mobile-container min-h-screen bg-background">
        <div className="bg-accent p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-foreground" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-foreground font-heading">Candidature envoyée</h2>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 pb-32 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full text-center">
            <CardContent className="pt-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-xl mb-2">Candidature enregistrée !</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Nous vous contacterons après examen de votre dossier.
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
          src={bannerImage} 
          alt="Nounou professionnelle" 
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 to-secondary/40 flex items-end p-4 sm:p-6">
          <div className="flex items-center gap-4 w-full">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">Postuler comme nounou</h2>
              <p className="text-sm text-white/90">Rejoignez notre équipe</p>
            </div>
          </div>
        </div>
        {isAdmin && (
          <BannerImageEditor
            pageKey="nanny-form"
            currentImageUrl={bannerImage}
          />
        )}
      </div>

      {/* Form Content */}
      <div className="p-4 sm:p-6 pb-32 w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IdCard className="text-primary w-5 h-5" />
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

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="text-accent-foreground w-5 h-5" />
                  Expérience professionnelle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="typePoste"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de poste souhaité *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-field" data-testid="select-type-poste">
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="nounou">Nounou</SelectItem>
                          <SelectItem value="devoirs">Aide aux devoirs</SelectItem>
                          <SelectItem value="personne">Aide à la personne</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expérience *</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Décrivez votre expérience dans la garde d'enfants..." 
                          className="input-field"
                          rows={4}
                          data-testid="textarea-experience"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="disponibilites"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disponibilités *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-field" data-testid="select-disponibilites">
                            <SelectValue placeholder="Sélectionnez vos disponibilités" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lundi-vendredi">Lundi - Vendredi</SelectItem>
                          <SelectItem value="weekend">Week-end</SelectItem>
                          <SelectItem value="nuits">Nuits</SelectItem>
                          <SelectItem value="flexible">Flexible (tous horaires)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Document Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="text-primary w-5 h-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  data-testid="file-input"
                />
                
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center transition-all duration-300 cursor-pointer hover:border-primary hover:bg-secondary"
                  onClick={handleFileUpload}
                  data-testid="file-upload-area"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-12 h-12 text-primary mb-3 mx-auto animate-spin" />
                      <p className="font-medium mb-1">Upload en cours...</p>
                    </>
                  ) : (
                    <>
                      <FileUp className="w-12 h-12 text-muted-foreground mb-3 mx-auto" />
                      <p className="font-medium mb-1">Téléverser vos documents</p>
                      <p className="text-sm text-muted-foreground mb-3">CV, CNI, Photo (PDF, JPG, PNG - max 5MB)</p>
                      <div className="service-badge">
                        <Check className="w-3 h-3 mr-1 inline" />
                        Ajouter des fichiers
                      </div>
                    </>
                  )}
                </div>

                {/* Uploaded Files Preview */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <FileUp className="w-8 h-8 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium" data-testid={`file-name-${index}`}>{file.filename}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="text-destructive"
                          data-testid={`button-remove-file-${index}`}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="btn-primary w-full" 
              disabled={createApplicationMutation.isPending}
              data-testid="button-submit"
            >
              <Check className="w-4 h-4 mr-2" />
              {createApplicationMutation.isPending ? "Envoi en cours..." : "Soumettre ma candidature"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
