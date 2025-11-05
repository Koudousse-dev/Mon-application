import React, { useState } from "react";
import ImageEditor from "./ImageEditor";

const AdminImageUploader: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setShowEditor(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (_: any, areaPixels: any) => {
    setCroppedAreaPixels(areaPixels);
  };

  const handleSave = async () => {
    if (!selectedImage || !croppedAreaPixels) return;

    const response = await fetch(selectedImage);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("image", blob, "cropped-image.jpg");

    const uploadRes = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await uploadRes.json();
    alert(data.message || "Image uploadée !");
    setShowEditor(false);
  };

  return (
    <div style={{ textAlign: "center" }}>
      {!showEditor ? (
        <>
          <img
            src={imageUrl}
            alt="aperçu"
            style={{ width: "100%", maxWidth: "400px", borderRadius: "10px", cursor: "pointer" }}
            onClick={() => document.getElementById("fileInput")?.click()}
          />
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </>
      ) : (
        <>
          <ImageEditor imageSrc={selectedImage!} onCropComplete={handleCropComplete} />
          <button
            onClick={handleSave}
            style={{
              marginTop: "20px",
              background: "green",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Enregistrer
          </button>
        </>
      )}
    </div>
  );
};

export default AdminImageUploader;