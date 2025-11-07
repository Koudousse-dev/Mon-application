import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// 📂 Répertoire de destination (assure-toi qu'il existe)
const uploadDir = path.join(process.cwd(), "client", "public", "uploads", "banners");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ⚙️ Configuration de multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, "banner_" + Date.now() + ext);
  },
});

const upload = multer({ storage });

// 📤 Route de téléversement de bannière
router.post("/upload-banner", upload.single("banner"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }

    // 🔗 URL publique pour React
    const publicPath = `/uploads/banners/${req.file.filename}`;
    console.log("✅ Fichier uploadé :", publicPath);

    res.json({
      success: true,
      path: publicPath, // clé utilisée côté frontend
      url: publicPath,  // compatibilité future
    });
  } catch (err) {
    console.error("Erreur upload:", err);
    res.status(500).json({ error: "Erreur serveur pendant l’upload" });
  }
});

export default router;