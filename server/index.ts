import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "./auth";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { ensureAdminExists } from "./init-db";

const app = express();
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

// Utilisation de PostgreSQL comme store de sessions
app.use(
  session({
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true, // crée la table session si besoin
    }),
    secret: process.env.SESSION_SECRET || "dev-secret-only-for-development",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction, // cookie sécurisé uniquement en prod
      sameSite: isProduction ? "lax" : "lax", // "lax" suffit pour Render
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());


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

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0", // ✅ permet à Render (et tout autre service externe) d’y accéder
    reusePort: false,  // pas nécessaire en local
  }, () => {
    log(`✅ Server running on http://0.0.0.0:${port}`);
  });
})();
