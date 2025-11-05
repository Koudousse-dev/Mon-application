import express from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const router = express.Router();

const uploadDir = path.resolve(import.meta.dirname, "..", "client", "src", "assets", "stock_images");
// ou si tu veux le dossier uploads :
 // const uploadDir = path.resolve(import.meta.dirname, "..", "attached_assets", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier envoyé." });
    }

    const fileName = `${Date.now()}_${req.file.originalname}`;
    const filePath = path.join(uploadDir, fileName);

    await sharp(req.file.buffer)
      .resize(1280, 853, { fit: "cover" })
      .toFormat("jpeg")
      .jpeg({ quality: 85 })
      .toFile(filePath);

    return res.json({
      success: true,
      message: "Image uploadée avec succès !",
      fileName,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur lors du traitement de l’image." });
  }
});

export default router;