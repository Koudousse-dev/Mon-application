import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getCroppedImageBlob } from "@/lib/crop-image";
import { BANNER_QUERY_KEY, type BannerPage, type BannerResponse } from "@/lib/banners";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, UploadCloud, ImagePlus } from "lucide-react";

type AcceptedMime = "image/jpeg" | "image/png" | "image/webp";

interface HeroImageEditorProps {
  page: BannerPage;
  currentUrl: string;
  defaultUrl: string;
  isAdmin: boolean;
  onChange: (url: string) => void;
}

const MIME_EXTENSIONS: Record<AcceptedMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function HeroImageEditor({ page, currentUrl, defaultUrl, isAdmin, onChange }: HeroImageEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedMime, setSelectedMime] = useState<AcceptedMime>("image/jpeg");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isAdmin) {
    return null;
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const resetState = () => {
    setImageSrc(null);
    setSelectedMime("image/jpeg");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const determineMimeFromUrl = (url: string): AcceptedMime => {
    const normalized = url.split("?")[0]?.toLowerCase() ?? "";
    if (normalized.endsWith(".png")) {
      return "image/png";
    }
    if (normalized.endsWith(".webp")) {
      return "image/webp";
    }
    return "image/jpeg";
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "Merci de sélectionner une image inférieure à 3MB.",
        variant: "destructive",
      });
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast({
        title: "Format non pris en charge",
        description: "Seuls les formats JPG, PNG ou WEBP sont acceptés.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setSelectedMime(file.type as AcceptedMime);
    };
    reader.onerror = () => {
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire le fichier sélectionné.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUseExistingImage = () => {
    const source = currentUrl || defaultUrl;
    setSelectedMime(determineMimeFromUrl(source));
    setImageSrc(source);
  };

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      toast({
        title: "Aucune image sélectionnée",
        description: "Téléchargez une image puis ajustez le cadrage avant de sauvegarder.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const outputType: AcceptedMime = selectedMime === "image/png" || selectedMime === "image/webp" ? selectedMime : "image/jpeg";
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, {
        width: 1600,
        height: 900,
        mimeType: outputType,
        quality: outputType === "image/jpeg" ? 0.9 : 1,
      });

      const extension = MIME_EXTENSIONS[outputType];
      const fileName = `banner-${page}-${Date.now()}.${extension}`;
      const file = new File([blob], fileName, { type: outputType });

      const formData = new FormData();
      formData.append("file", file);

      const isCustomBanner = currentUrl.startsWith("/uploads/banners/");
      if (isCustomBanner) {
        formData.append("previousUrl", currentUrl);
      }

      const uploadResponse = await fetch("/api/banners/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const uploadJson = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadJson?.message || "Échec de l'upload de l'image");
      }

      const updateResponse = await apiRequest("PUT", `/api/banners/${page}`, {
        url: uploadJson.url,
      });
      const updated = await updateResponse.json();

      queryClient.setQueryData<BannerResponse | undefined>([BANNER_QUERY_KEY], (old) => ({
        ...(old ?? {}),
        [page]: updated.url,
      }));

      onChange(uploadJson.url);
      toast({
        title: "Image mise à jour",
        description: "La bannière a été modifiée avec succès.",
      });

      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de mettre à jour la bannière.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-3 right-3 z-10 bg-white/80 text-primary hover:bg-white shadow-md"
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          Changer l&apos;image
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mettre à jour l&apos;image de la bannière</DialogTitle>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />

        {!imageSrc ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/40">
            <UploadCloud className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="mb-3 text-sm text-muted-foreground">Formats acceptés : JPG, PNG ou WEBP (max. 3MB)</p>
            <div className="flex items-center gap-2">
              <Button onClick={() => fileInputRef.current?.click()} size="sm">
                Sélectionner une image
              </Button>
              <Button variant="outline" size="sm" onClick={handleUseExistingImage}>
                Utiliser l&apos;image actuelle
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative h-[320px] w-full overflow-hidden rounded-lg bg-black/60">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                cropShape="rect"
                showGrid
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                restrictPosition
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Zoom</span>
                <span>{zoom.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) => setZoom(parseFloat(event.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Changer d&apos;image
              </Button>
              <Button variant="ghost" size="sm" onClick={handleUseExistingImage} className="text-muted-foreground">
                Recharger l&apos;image actuelle
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !imageSrc}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
