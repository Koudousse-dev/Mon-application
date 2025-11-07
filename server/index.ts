import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "./auth";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { ensureAdminExists } from "./init-db";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import uploadRoute from "./routes/uploadRoute";
import bannerRoutes from "./routes/bannerRoutes";
import path from "path";



const app = express();
// 🛡️ Security middlewares
app.use(helmet()); // Protège contre la plupart des attaques HTTP

// 🚦 Limite le nombre de requêtes par IP pour éviter les abus
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite à 100 requêtes par IP
  standardHeaders: true, // ajoute les headers RateLimit-*
  legacyHeaders: false,
});
app.use(limiter);

const PgStore = connectPgSimple(session);

// Trust Replit's reverse proxy - CRITICAL for secure cookies to work
app.set('trust proxy', 1);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
// Increase JSON body limit to handle multiple base64 file uploads
// 5MB file = ~7MB base64, allow up to 3-4 files max = ~30MB
app.use(express.json({
  limit: '30mb', // Allow up to 30MB JSON payloads for multiple file uploads
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '30mb' }));

// Verify SESSION_SECRET is set in production
if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable must be set in production");
}

// Session configuration adaptée à Render
app.set("trust proxy", 1); // important derrière le proxy Render

const isProduction = process.env.NODE_ENV === "production";

// 🛡️ Secure session & cookie configuration
app.use(
  session({
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true, // crée la table si elle n’existe pas
    }),
    secret: process.env.SESSION_SECRET || "dev-secret-only-for-development",
    resave: false,
    saveUninitialized: false,
    name: "__session", // nom explicite pour le cookie
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only en prod
      httpOnly: true, // empêche l’accès JavaScript au cookie
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // cross-site autorisé en prod
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
      path: "/", // obligatoire pour la validité du cookie
    },
  })
);


// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// ✅ Health check route for Render monitoring
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

app.use("/api/upload", uploadRoute);
// ✅ Nouvelle route d’upload de bannières
app.use("/api/upload-banner", bannerRoutes);

// ✅ Permet d'accéder aux fichiers uploadés publiquement
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


(async () => {
  // Initialize database and ensure admin user exists
  await ensureAdminExists();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // 🧩 Setup Vite or static serving (only after routes and errors)
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ✅ Launch the server
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: false,
  }, () => {
    log(`✅ Server running on http://0.0.0.0:${port}`);
  });
})();
