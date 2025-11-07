import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// 🔧 Configuration du stockage local
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/banners");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, "banner-parentform" + ext);
  },
});

const upload = multer({ storage });

// ✅ Route d’upload
router.post("/", upload.single("banner"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier reçu" });
  }

  const fileUrl = `/uploads/banners/${req.file.filename}`;
  return res.json({ url: fileUrl });
});

export default router;
