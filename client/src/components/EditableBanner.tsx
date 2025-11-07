import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";

interface EditableBannerProps {
  imageUrl: string;
  alt?: string;
  isAdmin?: boolean;
  onFileSelected?: (file: File) => void;
  children?: React.ReactNode;
}

export default function EditableBanner({
  imageUrl,
  alt,
  isAdmin,
  onFileSelected,
  children,
}: EditableBannerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreview(base64);
      if (onFileSelected) onFileSelected(file);
    };
    reader.readAsDataURL(file);
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return (
    <div className="relative overflow-hidden">
      {/* ✅ Affichage de l'image (preview ou image par défaut) */}
      <img
        key={preview || imageUrl}
        src={preview || imageUrl}
        alt={alt || "Bannière"}
        className="w-full h-48 object-cover transition-all duration-300"
      />

      {/* ✅ Texte superposé */}
      <div className="absolute inset-0 z-10">{children}</div>

      {/* ✅ Bouton admin */}
      {isAdmin && (
        <div className="absolute bottom-4 right-4 z-20">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
          <Button
            onClick={openFileDialog}
            className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Changer l’image
          </Button>
        </div>
      )}
    </div>
  );
}
