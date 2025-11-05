import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

interface ImageEditorProps {
  imageSrc: string;
  onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    onCropComplete(croppedArea, croppedAreaPixels);
  }, [onCropComplete]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "400px",
        background: "#333",
      }}
    >
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        aspect={1280 / 853} // 👈 Ratio de ton image actuelle
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={handleCropComplete}
      />
      <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", color: "#fff" }}>
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
      </div>
    </div>
  );
};

export default ImageEditor;