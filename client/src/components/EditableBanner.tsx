import { useState, useRef, useEffect } from "react";
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

  // Nettoyage mémoire (important)
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(url);

    // Optionnel : callback externe
    if (onFileSelected) {
      onFileSelected(file);
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return (
    <div className="relative overflow-hidden">
      {/* ✅ L’image principale ou l’aperçu choisi */}
      <img
        src={preview || imageUrl}
        alt={alt || "Bannière"}
        className="w-full h-48 object-cover transition-all duration-300"
      />

      {/* ✅ Le texte superposé (passé en children) */}
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
