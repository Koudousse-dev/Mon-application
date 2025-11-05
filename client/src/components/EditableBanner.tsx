import React, { useState } from "react";

interface EditableBannerProps {
  imageUrl: string;
  alt?: string;
  isAdmin?: boolean;
}

const EditableBanner: React.FC<EditableBannerProps> = ({
  imageUrl,
  alt = "Bannière",
  isAdmin = false,
}) => {
  const [preview, setPreview] = useState(imageUrl);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.fileName) {
        // Met à jour l'image affichée
        const newImageUrl = `/attached_assets/stock_images/${data.fileName}`;
        setPreview(newImageUrl);
        alert("✅ Image mise à jour avec succès !");
      } else {
        alert("❌ Erreur lors de la mise à jour de l'image");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Une erreur est survenue pendant l’envoi.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: "relative", textAlign: "center" }}>
      <img
        src={preview}
        alt={alt}
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "0.5rem",
          objectFit: "cover",
        }}
      />

      {isAdmin && (
        <label
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "#16a34a",
            color: "white",
            padding: "6px 10px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {uploading ? "Chargement..." : "Changer l’image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>
      )}
    </div>
  );
};

export default EditableBanner;