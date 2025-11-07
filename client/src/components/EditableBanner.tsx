import React, { useState } from "react";

interface EditableBannerProps {
  imageUrl: string;
  alt: string;
  isAdmin: boolean;
  title?: string;
  subtitle?: string;
}

export default function EditableBanner({
  imageUrl,
  alt,
  isAdmin,
  title,
  subtitle,
}: EditableBannerProps) {
  const [currentImage, setCurrentImage] = useState(imageUrl);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("banner", file);

      const response = await fetch("/api/upload-banner", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.url) {
        setCurrentImage(data.url);
      } else {
        alert("Erreur : impossible de récupérer l’URL de l’image");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l’envoi du fichier.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <img
        src={currentImage}
        alt={alt}
        className="w-full h-48 object-cover transition-all duration-500"
      />

      {/* ✅ Superposition du texte */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40 flex items-end p-4 sm:p-6">
        <div>
          {title && (
            <h2 className="text-xl font-bold text-white font-heading">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-white/90">{subtitle}</p>
          )}
        </div>
      </div>

      {/* ✅ Bouton d’édition visible uniquement pour l’admin */}
      {isAdmin && (
        <div className="absolute top-3 right-3">
          <label className="bg-white text-primary text-sm px-3 py-1 rounded cursor-pointer hover:bg-primary hover:text-white transition">
            🖼️ Changer l’image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      )}
    </div>
  );
}
