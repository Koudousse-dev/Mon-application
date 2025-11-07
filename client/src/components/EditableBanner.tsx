import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Check, X } from "lucide-react";
import { Dialog } from "@headlessui/react";

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
  const [cropping, setCropping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const openFileDialog = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
      setSelectedFile(file);
      setCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImage = async (): Promise<string> => {
    if (!preview || !croppedAreaPixels) return preview;

    const image = await createImage(preview);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const { width, height, x, y } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;

    if (ctx) {
      ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], selectedFile?.name || "cropped.jpg", {
            type: "image/jpeg",
          });
          const croppedUrl = URL.createObjectURL(croppedFile);
          if (onFileSelected) onFileSelected(croppedFile);
          resolve(croppedUrl);
        }
      }, "image/jpeg");
    });
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", (error) => reject(error));
      img.src = url;
    });

  const handleValidateCrop = async () => {
    const croppedUrl = await getCroppedImage();
    setPreview(croppedUrl);
    setCropping(false);
  };

  return (
    <div className="relative overflow-hidden">
      {/* ✅ Image principale */}
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

      {/* ✅ Fenêtre de recadrage */}
      {cropping && (
        <Dialog open={cropping} onClose={() => setCropping(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-lg p-4 w-[90%] max-w-md">
            <div className="relative w-full h-64 bg-gray-200">
              <Cropper
                image={preview || ""}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setCropping(false)}>
                <X className="w-4 h-4 mr-2" /> Annuler
              </Button>
              <Button onClick={handleValidateCrop} className="bg-green-600 text-white hover:bg-green-700">
                <Check className="w-4 h-4 mr-2" /> Valider
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
