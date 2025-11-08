import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cropper from "react-easy-crop";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BannerImageEditorProps {
  pageKey: "parent-form" | "nanny-form" | "contact";
  currentImageUrl?: string;
  onImageUpdated?: (newImageUrl: string) => void;
}

interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function BannerImageEditor({
  pageKey,
  currentImageUrl,
  onImageUpdated,
}: BannerImageEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "L'image ne doit pas dépasser 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Type de fichier invalide",
        description: "Seules les images sont acceptées",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string);
      setIsOpen(true);
    });
    reader.readAsDataURL(file);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const uploadMutation = useMutation({
    mutationFn: async (croppedImage: Blob) => {
      const formData = new FormData();
      formData.append("image", croppedImage, `${pageKey}-banner.jpg`);
      formData.append("pageKey", pageKey);

      const response = await fetch("/api/banners/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de l'upload");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/banners/${pageKey}`] });
      
      if (onImageUpdated) {
        onImageUpdated(data.imageUrl);
      }

      toast({
        title: "Image mise à jour",
        description: "La bannière a été changée avec succès",
      });

      setIsOpen(false);
      setImageSrc(null);
      setIsUploading(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible de charger l'image",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      uploadMutation.mutate(croppedImage);
    } catch (error) {
      toast({
        title: "Erreur de rognage",
        description: "Impossible de rogner l'image",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="secondary"
        size="sm"
        className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white shadow-lg"
      >
        <Camera className="w-4 h-4 mr-2" />
        Changer l'image
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rogner l'image</DialogTitle>
            <DialogDescription>
              Ajustez l'image à votre convenance avant de l'uploader
            </DialogDescription>
          </DialogHeader>

          {imageSrc && (
            <div className="space-y-4">
              <div className="relative h-[400px] bg-gray-100 rounded-lg overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={16 / 9}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleUpload} disabled={isUploading || !imageSrc}>
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Upload en cours..." : "Valider et uploader"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
