import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface EditableBannerProps {
  imageUrl: string;
  alt: string;
  isAdmin?: boolean;
}

/**
 * ✅ EditableBanner corrigé pour Render :
 * - Utilise le dossier public `/assets/...`
 * - Permet à l’admin de changer l’image (à implémenter ensuite)
 * - Fonctionne aussi sans compte admin (lecture simple)
 */
const EditableBanner: React.FC<EditableBannerProps> = ({ imageUrl, alt, isAdmin = false }) => {
  const [currentImage, setCurrentImage] = useState(imageUrl);

  // ✅ Correction principale : forcer le bon chemin public
  const resolvedUrl = currentImage?.startsWith("/assets/")
    ? currentImage
    : `/assets/${currentImage?.replace(/^\/+/, "")}`;

  const handleChange = () => {
    if (!isAdmin) return;

    // Plus tard : on ouvrira un sélecteur ou un upload ici
    alert("Fonction de changement d’image à venir !");
  };

  return (
    <div className="relative overflow-hidden">
      <img
        src={resolvedUrl}
        alt={alt}
        className="w-full h-48 object-cover"
      />
      {isAdmin && (
        <div className="absolute bottom-2 right-2">
          <Button size="sm" onClick={handleChange} className="bg-primary text-white">
            🖼️ Changer l’image
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditableBanner;