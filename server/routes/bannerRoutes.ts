import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

// ✅ Recréer __dirname en mode ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🗂️ Dossier de stockage des bannières
const bannerDir = path.join(__dirname, "../../client/public/uploads/banners");

// Vérifie si le dossier existe, sinon le crée
if (!fs.existsSync(bannerDir)) {
  fs.mkdirSync(bannerDir, { recursive: true });
}

// Configuration de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bannerDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 🖼️ Route POST pour uploader une nouvelle bannière
router.post("/", upload.single("banner"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier reçu" });
  }

  // URL accessible publiquement
  const publicUrl = `/uploads/banners/${req.file.filename}`;

  return res.json({
    message: "Bannière uploadée avec succès",
    url: publicUrl,
  });
});

export default router;
