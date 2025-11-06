import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface EditableBannerProps {
  imageUrl: string;
  alt: string;
  isAdmin?: boolean;
}

/**
 * ✅ EditableBanner final :
 * - Affiche une image (stockée dans /public/assets)
 * - Permet à l’administrateur de la remplacer via /api/upload
 * - Se met à jour sans recharger la page
 */
const EditableBanner: React.FC<EditableBannerProps> = ({ imageUrl, alt, isAdmin = false }) => {
  const [currentImage, setCurrentImage] = useState(imageUrl);
  const [uploading, setUploading] = useState(false);

  // Correction du chemin d’accès public
  const resolvedUrl = currentImage?.startsWith("/assets/")
    ? currentImage
    : `/assets/${currentImage?.replace(/^\/+/, "")}`;

  // Quand l’admin choisit une nouvelle image
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      // 🔥 Appel API backend /api/upload
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success && result.fileName) {
        setCurrentImage(`/assets/stock_images/${result.fileName}`);
      } else {
        alert("Échec de l’upload de l’image.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors du téléchargement de l’image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <img
        src={resolvedUrl}
        alt={alt}
        className="w-full h-48 object-cover"
      />

      {/* ✅ Si l’utilisateur est admin, on affiche le bouton */}
      {isAdmin && (
        <div className="absolute bottom-2 right-2 flex flex-col items-end">
          <label htmlFor="banner-upload" className="cursor-pointer">
            <Button
              asChild
              size="sm"
              className="bg-primary text-white hover:bg-primary/90"
              disabled={uploading}
            >
              <span>
                {uploading ? "Chargement..." : "🖼️ Changer l’image"}
              </span>
            </Button>
          </label>
          <input
            id="banner-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
};

export default EditableBanner;