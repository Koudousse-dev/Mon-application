import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

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
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // 📸 Étape 1 : choisir l’image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  // 🔍 Étape 2 : obtenir la zone rognée
  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // ✂️ Étape 3 : convertir la zone rognée en image Blob
  const getCroppedImage = async () => {
    if (!selectedImage || !croppedAreaPixels) return null;

    const image = new Image();
    image.src = selectedImage;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
    });
  };

  // 🚀 Étape 4 : envoyer l’image rognée
  const handleCropConfirm = async () => {
    const blob = await getCroppedImage();
    if (!blob) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("banner", blob, "banner.jpg");

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
      setShowCropper(false);
      setSelectedImage(null);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* ✅ Image actuelle */}
      <img
        src={currentImage}
        alt={alt}
        className="w-full h-48 object-cover transition-all duration-500"
      />

      {/* ✅ Superposition texte */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40 flex items-end p-4 sm:p-6">
        <div>
          {title && (
            <h2 className="text-xl font-bold text-white font-heading">{title}</h2>
          )}
          {subtitle && <p className="text-sm text-white/90">{subtitle}</p>}
        </div>
      </div>

      {/* ✅ Bouton admin */}
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

      {/* ✅ Fenêtre de rognage */}
      {showCropper && selectedImage && (
        <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-50">
          <div className="relative w-80 h-80 bg-gray-900">
            <Cropper
              image={selectedImage}
              crop={crop}
              zoom={zoom}
              aspect={3 / 2}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setShowCropper(false);
                setSelectedImage(null);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Annuler
            </button>
            <button
              onClick={handleCropConfirm}
              className="bg-green-600 text-white px-4 py-2 rounded"
              disabled={uploading}
            >
              Valider
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
