import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "./auth";
import { isAuthenticated } from "./auth";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import multer from "multer";
import { Client } from "@replit/object-storage";

// Initialize Object Storage client (optional - requires bucket configuration)
// Set ENABLE_OBJECT_STORAGE=true environment variable to use Object Storage
let objectStorageClient: Client | null = null;
if (process.env.ENABLE_OBJECT_STORAGE === 'true') {
  try {
    objectStorageClient = new Client();
    console.log("✓ Object Storage enabled and initialized");
  } catch (error: any) {
    console.error("✗ Object Storage initialization failed:", error.message);
    console.warn("  Files will be stored as base64 in database");
  }
} else {
  console.log("ℹ Object Storage disabled (using base64 storage)");
  console.log("  To enable: create bucket in Replit UI (Tools → App Storage)");
  console.log("  Then set ENABLE_OBJECT_STORAGE=true environment variable");
}
import { 
  insertParentRequestSchema, 
  insertNannyApplicationSchema, 
  insertContactMessageSchema,
  updateParentRequestStatusSchema,
  updateNannyApplicationStatusSchema,
  insertNotificationSchema,
  insertPrestationSchema,
  insertParametreSiteSchema,
  insertEmployeeSchema,
  insertPaiementEmployeSchema,
  updateAdminProfileSchema,
  updatePaymentConfigSchema,
  insertBannerImageSchema,
  updateBannerImageSchema,
  insertPushSubscriptionSchema
} from "@shared/schema";
import { findBestMatches, getBestMatchForRequest, calculateMatchScore } from "@shared/matching";
import { z } from "zod";
import webpush from "web-push";

// Configure VAPID keys for web push
// Generate these using: npx web-push generate-vapid-keys
// In production, these MUST be set as environment variables
let VAPID_PUBLIC_KEY: string;
let VAPID_PRIVATE_KEY: string;

if (process.env.NODE_ENV === 'production') {
  // Production: require environment variables
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.error('❌ VAPID keys not configured! Push notifications disabled.');
    console.error('   Generate keys: npx web-push generate-vapid-keys');
    console.error('   Set environment variables: VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY');
  }
  VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
  VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
} else {
  // Development: use temporary keys (INSECURE - for testing only)
  VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "BNzF5q4e0B7_3xC-bZ4YXKjVq8WQy6-rQCJcQ7c7qVwO9z8E6JdV5Mx7Uv-4YxMwW9r8t0QpRnJvK6wXzYx9Abc";
  VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "vH8J5eN9Zm7qX3pY0wT6kR2sL4cD1aF9gB3nM5vK8jR";
  console.log('⚠️  Using dev VAPID keys - DO NOT use in production!');
}

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contact@dieuveille.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

// Helper function to send push notifications to all subscribed admins
async function sendPushToAdmins(title: string, message: string, data?: any) {
  try {
    const subscriptions = await storage.getPushSubscriptions();
    
    if (subscriptions.length === 0) {
      console.log('ℹ️  No push subscriptions found, skipping push notification');
      return;
    }

    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: data || {}
    });

    const results = await Promise.allSettled(
      subscriptions.map(sub => 
        webpush.sendNotification(
          JSON.parse(sub.subscription),
          payload
        ).catch(err => {
          // Handle expired/invalid subscriptions
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.log(`🗑️  Removing invalid subscription: ${sub.id}`);
            return storage.deletePushSubscription(sub.id);
          }
          throw err;
        })
      )
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;
    
    console.log(`✓ Push notifications sent: ${successCount} succeeded, ${failureCount} failed`);
  } catch (error) {
    console.error('❌ Error sending push notifications:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Simple HTML login page (no React, no frameworks)
  app.get("/simple-login", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion Admin - Dieu veille sur nos enfants</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, hsl(145, 63%, 49%) 0%, hsl(25, 95%, 53%) 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .login-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            padding: 40px;
            width: 100%;
            max-width: 400px;
        }
        
        .lock-icon {
            width: 64px;
            height: 64px;
            background: hsl(145, 63%, 49%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            color: white;
            font-size: 32px;
        }
        
        h1 {
            text-align: center;
            color: #1a1a1a;
            margin-bottom: 8px;
            font-size: 24px;
        }
        
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 32px;
            font-size: 14px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-size: 14px;
            font-weight: 500;
        }
        
        input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.2s;
        }
        
        input:focus {
            outline: none;
            border-color: hsl(145, 63%, 49%);
        }
        
        button {
            width: 100%;
            padding: 14px;
            background: hsl(145, 63%, 49%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        button:hover {
            background: hsl(145, 63%, 44%);
        }
        
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .error-message {
            background: #fee;
            color: #c33;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            display: none;
        }
        
        .error-message.show {
            display: block;
        }
        
        .success-message {
            background: #efe;
            color: #3c3;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            display: none;
        }
        
        .success-message.show {
            display: block;
        }
        
        .default-creds {
            text-align: center;
            margin-top: 20px;
            padding: 12px;
            background: hsl(145, 25%, 97%);
            border-radius: 8px;
            font-size: 13px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="lock-icon">🔒</div>
        <h1>Administration</h1>
        <p class="subtitle">Connexion simple (sans frameworks)</p>
        
        <div id="errorMessage" class="error-message"></div>
        <div id="successMessage" class="success-message"></div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Nom d'utilisateur</label>
                <input type="text" id="username" name="username" required autocomplete="username">
            </div>
            
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="password" name="password" required autocomplete="current-password">
            </div>
            
            <button type="submit" id="submitBtn">Se connecter</button>
        </form>
        
        <div class="default-creds">
            Identifiants par défaut : admin / admin123
        </div>
    </div>
    
    <script>
        const form = document.getElementById('loginForm');
        const errorMessage = document.getElementById('errorMessage');
        const successMessage = document.getElementById('successMessage');
        const submitBtn = document.getElementById('submitBtn');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Disable button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Connexion...';
            
            // Hide messages
            errorMessage.classList.remove('show');
            successMessage.classList.remove('show');
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    successMessage.textContent = 'Connexion réussie ! Redirection...';
                    successMessage.classList.add('show');
                    
                    // Redirect to admin dashboard
                    setTimeout(() => {
                        window.location.href = '/admin';
                    }, 1000);
                } else {
                    errorMessage.textContent = data.message || 'Erreur de connexion';
                    errorMessage.classList.add('show');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Se connecter';
                }
            } catch (error) {
                errorMessage.textContent = 'Erreur réseau. Veuillez réessayer.';
                errorMessage.classList.add('show');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Se connecter';
            }
        });
    </script>
</body>
</html>`);
  });
  
  // Authentication routes
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Erreur d'authentification" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Identifiants incorrects" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Erreur de session" });
        }
        const { passwordHash, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de déconnexion" });
      }
      res.json({ message: "Déconnexion réussie" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      const { passwordHash, ...userWithoutPassword } = req.user as any;
      res.json({ user: userWithoutPassword });
    } else {
      res.status(401).json({ message: "Non authentifié" });
    }
  });

  // Admin password change route
  app.post("/api/admin/change-password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Mot de passe actuel et nouveau mot de passe requis" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 6 caractères" });
      }

      const sessionUser = req.user as any;
      
      if (!sessionUser || !sessionUser.id) {
        return res.status(500).json({ message: "Erreur d'authentification" });
      }
      
      // Fetch the latest admin user from database to prevent stale session attacks
      const currentAdmin = await storage.getAdminById(sessionUser.id);
      
      if (!currentAdmin || !currentAdmin.passwordHash) {
        return res.status(500).json({ message: "Erreur d'authentification" });
      }
      
      // Verify current password against the latest hash from database
      const isValidPassword = await bcrypt.compare(currentPassword, currentAdmin.passwordHash);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Mot de passe actuel incorrect" });
      }

      // Hash new password and update
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await storage.updateAdminPassword(currentAdmin.id, newPasswordHash);

      res.json({ message: "Mot de passe changé avec succès" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Erreur lors du changement de mot de passe" });
    }
  });

  // Admin profile update route
  app.put("/api/admin/profile", isAuthenticated, async (req, res) => {
    try {
      const sessionUser = req.user as any;
      
      if (!sessionUser || !sessionUser.id) {
        return res.status(500).json({ message: "Erreur d'authentification" });
      }

      // Validate input
      const result = updateAdminProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: result.error.issues 
        });
      }

      // Update profile
      const updatedAdmin = await storage.updateAdminProfile(sessionUser.id, result.data);
      
      // Return updated user without password
      const { passwordHash, ...userWithoutPassword } = updatedAdmin;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
    }
  });
  
  // File upload configuration
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Type de fichier non autorisé. Seuls les PDF, JPG et PNG sont acceptés.'));
      }
    },
  });

  // File upload route - stores files in Object Storage if available, otherwise base64
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier fourni" });
      }

      const timestamp = Date.now();
      const originalName = req.file.originalname;
      
      // Try to upload to Object Storage if available
      if (objectStorageClient) {
        const storedPath = `documents/${timestamp}-${originalName}`;
        const uploadResult = await objectStorageClient.uploadFromBytes(storedPath, req.file.buffer);
        
        if (!uploadResult.ok) {
          throw new Error(uploadResult.error?.message || "Erreur lors de l'upload vers Object Storage");
        }

        // Return file info (Object Storage mode)
        return res.json({
          filename: originalName,
          storedPath: storedPath,
          size: req.file.size,
          type: req.file.mimetype
        });
      } else {
        // Fallback to base64 storage
        const base64Data = req.file.buffer.toString('base64');
        const fileId = `${timestamp}-${originalName}`;

        // Return file info with base64 data (legacy mode)
        return res.json({
          filename: originalName,
          storedPath: fileId,
          size: req.file.size,
          type: req.file.mimetype,
          data: base64Data
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.message && error.message.includes('Type de fichier')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ 
        message: "Erreur lors de l'upload du fichier",
        details: error.message 
      });
    }
  });

  // File download route - retrieves files from Object Storage (if available)
  app.get("/api/download/:path(*)", async (req, res) => {
    try {
      if (!objectStorageClient) {
        return res.status(503).json({ 
          message: "Object Storage non configuré. Veuillez utiliser les documents base64." 
        });
      }

      const filePath = req.params.path;
      
      // Download file from Object Storage
      const downloadResult = await objectStorageClient.downloadAsBytes(filePath);
      
      if (!downloadResult.ok) {
        return res.status(404).json({ message: "Fichier non trouvé" });
      }

      // Extract filename from path
      const filename = filePath.split('/').pop() || 'download';
      
      // Set appropriate content type based on file extension
      const extension = filename.split('.').pop()?.toLowerCase();
      const contentTypes: Record<string, string> = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png'
      };
      const contentType = contentTypes[extension || ''] || 'application/octet-stream';

      // Send file
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.send(downloadResult.value);
    } catch (error: any) {
      console.error('Download error:', error);
      res.status(500).json({ 
        message: "Erreur lors du téléchargement du fichier",
        details: error.message 
      });
    }
  });
  
  // Parent request routes
  app.post("/api/parent-requests", async (req, res) => {
    try {
      const data = insertParentRequestSchema.parse(req.body);
      const request = await storage.createParentRequest(data);
      
      // Create notification for new parent request
      await storage.createNotification({
        type: "nouvelle_demande",
        titre: "Nouvelle demande parent",
        message: `${request.nom} a soumis une demande pour ${request.typeService}`,
        relatedId: request.id
      });

      // Send push notification to admins
      await sendPushToAdmins(
        "Nouvelle demande parent",
        `${request.nom} a soumis une demande pour ${request.typeService}`,
        { type: "nouvelle_demande", id: request.id }
      );

      // Check for potential matches
      const nannies = await storage.getNannyApplications();
      const bestMatch = getBestMatchForRequest(request, nannies);
      
      if (bestMatch && bestMatch.score >= 50) {
        await storage.createNotification({
          type: "nouveau_match",
          titre: "Nouveau match trouvé!",
          message: `Match de ${bestMatch.score}% entre ${request.nom} et ${bestMatch.nanny.nom}`,
          relatedId: request.id
        });
      }
      
      res.json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/parent-requests", async (req, res) => {
    try {
      const requests = await storage.getParentRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/parent-requests/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = updateParentRequestStatusSchema.parse(req.body);
      
      const updatedRequest = await storage.updateParentRequestStatus(id, status);
      res.json(updatedRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status value", errors: error.errors });
      }
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Nanny application routes
  app.post("/api/nanny-applications", async (req, res) => {
    try {
      const data = insertNannyApplicationSchema.parse(req.body);
      const application = await storage.createNannyApplication(data);
      
      // Create notification for new nanny application
      await storage.createNotification({
        type: "nouvelle_candidature",
        titre: "Nouvelle candidature nounou",
        message: `${application.nom} a postulé pour ${application.typePoste}`,
        relatedId: application.id
      });

      // Send push notification to admins
      await sendPushToAdmins(
        "Nouvelle candidature nounou",
        `${application.nom} a postulé pour ${application.typePoste}`,
        { type: "nouvelle_candidature", id: application.id }
      );

      // Check for potential matches with pending parent requests
      const requests = await storage.getParentRequests();
      const pendingRequests = requests.filter(r => r.statut === "en_attente");
      
      for (const request of pendingRequests) {
        const matchScore = calculateMatchScore(request, application);
        
        if (matchScore.score >= 50) {
          await storage.createNotification({
            type: "nouveau_match",
            titre: "Nouveau match trouvé!",
            message: `Match de ${matchScore.score}% entre ${request.nom} et ${application.nom}`,
            relatedId: application.id
          });
          break; // Only notify for the best match
        }
      }
      
      res.json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/nanny-applications", async (req, res) => {
    try {
      const applications = await storage.getNannyApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/nanny-applications/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = updateNannyApplicationStatusSchema.parse(req.body);
      
      const updatedApplication = await storage.updateNannyApplicationStatus(id, status);
      res.json(updatedApplication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status value", errors: error.errors });
      }
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/nanny-applications/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNannyApplication(id);
      res.json({ message: "Candidature supprimée avec succès" });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Contact message routes
  app.post("/api/contact-messages", async (req, res) => {
    try {
      const data = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(data);
      
      // Create notification for new contact message
      await storage.createNotification({
        type: "nouveau_message",
        titre: "Nouveau message de contact",
        message: `${message.nom} a envoyé un message`,
        relatedId: message.id
      });

      // Send push notification to admins
      await sendPushToAdmins(
        "Nouveau message de contact",
        `${message.nom} a envoyé un message`,
        { type: "nouveau_message", id: message.id }
      );
      
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/contact-messages", async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notification routes (protected)
  app.post("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const data = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(data);
      res.json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/notifications/unread", isAuthenticated, async (req, res) => {
    try {
      const notifications = await storage.getUnreadNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/notifications/:id/mark-read", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(id);
      res.json(notification);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/notifications/mark-all-read", isAuthenticated, async (req, res) => {
    try {
      await storage.markAllNotificationsAsRead();
      res.json({ message: "Toutes les notifications ont été marquées comme lues" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Matching routes (protected)
  app.get("/api/matches", isAuthenticated, async (req, res) => {
    try {
      const minScore = req.query.minScore ? parseInt(req.query.minScore as string) : 30;
      const requests = await storage.getParentRequests();
      const nannies = await storage.getNannyApplications();
      
      const matches = findBestMatches(requests, nannies, minScore);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/matches/request/:requestId", isAuthenticated, async (req, res) => {
    try {
      const { requestId } = req.params;
      const requests = await storage.getParentRequests();
      const nannies = await storage.getNannyApplications();
      
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        return res.status(404).json({ message: "Parent request not found" });
      }
      
      const bestMatch = getBestMatchForRequest(request, nannies);
      if (!bestMatch) {
        return res.json({ message: "No suitable match found" });
      }
      
      res.json(bestMatch);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Prestations routes
  app.post("/api/prestations", isAuthenticated, async (req, res) => {
    try {
      const data = insertPrestationSchema.parse(req.body);
      const prestation = await storage.createPrestation(data);
      res.json(prestation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur serveur" });
      }
    }
  });

  app.get("/api/prestations", async (req, res) => {
    try {
      const prestations = await storage.getPrestations();
      res.json(prestations);
    } catch (err: any) {
      console.error("❌ Erreur dans /api/prestations :", err);
      res.status(500).json({
        message: "Erreur serveur",
        error: err?.message || String(err),
        stack: err?.stack,
      });
    }
  });

  app.get("/api/prestations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const prestation = await storage.getPrestationById(id);
      if (!prestation) {
        return res.status(404).json({ message: "Prestation non trouvée" });
      }
      res.json(prestation);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.patch("/api/prestations/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const prestation = await storage.updatePrestation(id, data);
      res.json(prestation);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.delete("/api/prestations/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePrestation(id);
      res.json({ message: "Prestation supprimée avec succès" });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ message: "Prestation non trouvée" });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Paramètres site routes
  app.post("/api/parametres-site", isAuthenticated, async (req, res) => {
    try {
      const data = insertParametreSiteSchema.parse(req.body);
      const parametre = await storage.createParametreSite(data);
      res.json(parametre);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur serveur" });
      }
    }
  });

  app.get("/api/parametres-site", async (req, res) => {
    try {
      const parametres = await storage.getParametresSite();
      res.json(parametres);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.get("/api/parametres-site/:cle", async (req, res) => {
    try {
      const { cle } = req.params;
      const parametre = await storage.getParametreSiteByCle(cle);
      if (!parametre) {
        return res.status(404).json({ message: "Paramètre non trouvé" });
      }
      res.json(parametre);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.patch("/api/parametres-site/:cle", isAuthenticated, async (req, res) => {
    try {
      const { cle } = req.params;
      const { valeur } = req.body;
      if (!valeur) {
        return res.status(400).json({ message: "Valeur requise" });
      }
      const parametre = await storage.updateParametreSite(cle, valeur);
      res.json(parametre);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.delete("/api/parametres-site/:cle", isAuthenticated, async (req, res) => {
    try {
      const { cle } = req.params;
      await storage.deleteParametreSite(cle);
      res.json({ message: "Paramètre supprimé avec succès" });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ message: "Paramètre non trouvé" });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Employees routes
  app.post("/api/employees", isAuthenticated, async (req, res) => {
    try {
      const { candidatureId } = req.body;
      if (!candidatureId) {
        return res.status(400).json({ message: "ID de candidature requis" });
      }

      // Récupérer la candidature
      const candidature = await storage.getNannyApplicationById(candidatureId);
      if (!candidature) {
        return res.status(404).json({ message: "Candidature non trouvée" });
      }

      // Créer l'employé à partir de la candidature
      const employeeData = insertEmployeeSchema.parse({
        candidatureId: candidature.id,
        nom: candidature.nom,
        telephone: candidature.telephone,
        adresse: candidature.adresse,
        typePoste: candidature.typePoste,
        experience: candidature.experience,
        disponibilites: candidature.disponibilites,
        documents: candidature.documents,
        actif: true,
        dateEmbauche: new Date()
      });

      const employee = await storage.createEmployee(employeeData);
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur serveur" });
      }
    }
  });

  app.get("/api/employees", isAuthenticated, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.get("/api/employees/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployeeById(id);
      if (!employee) {
        return res.status(404).json({ message: "Employé non trouvé" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.patch("/api/employees/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const employee = await storage.updateEmployee(id, data);
      res.json(employee);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.delete("/api/employees/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEmployee(id);
      res.json({ message: "Employé supprimé avec succès" });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Paiements employés routes
  app.post("/api/paiements-employes", isAuthenticated, async (req, res) => {
    try {
      const data = insertPaiementEmployeSchema.parse(req.body);
      const paiement = await storage.createPaiementEmploye(data);
      res.json(paiement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur serveur" });
      }
    }
  });

  app.get("/api/paiements-employes/employee/:employeeId", isAuthenticated, async (req, res) => {
    try {
      const { employeeId } = req.params;
      const paiements = await storage.getPaiementsEmploye(employeeId);
      res.json(paiements);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.get("/api/paiements-employes", isAuthenticated, async (req, res) => {
    try {
      const paiements = await storage.getAllPaiementsEmployes();
      res.json(paiements);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Payment configurations routes
  app.get("/api/payment-configs", isAuthenticated, async (req, res) => {
    try {
      const configs = await storage.getPaymentConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.get("/api/payment-configs/:provider", isAuthenticated, async (req, res) => {
    try {
      const { provider } = req.params;
      const config = await storage.getPaymentConfigByProvider(provider);
      if (!config) {
        return res.status(404).json({ message: "Configuration non trouvée" });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.put("/api/payment-configs/:provider", isAuthenticated, async (req, res) => {
    try {
      const { provider } = req.params;
      const data = updatePaymentConfigSchema.parse(req.body);
      const config = await storage.upsertPaymentConfig(provider, data);
      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur serveur" });
      }
    }
  });

  // Banner images routes (admin only)
  const bannerUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Type de fichier non autorisé. Seules les images JPG, PNG et WebP sont acceptées.'));
      }
    },
  });

  app.post("/api/banners/upload", isAuthenticated, bannerUpload.single('image'), async (req, res) => {
    try {
      // Verify admin role
      if ((req.user as any)?.role !== 'admin') {
        return res.status(403).json({ message: "Accès réservé aux administrateurs" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Aucune image fournie" });
      }

      const { pageKey } = req.body;
      if (!pageKey || !['parent-form', 'nanny-form', 'contact'].includes(pageKey)) {
        return res.status(400).json({ message: "pageKey invalide" });
      }

      const extension = req.file.originalname.split('.').pop();
      // Use fixed filename to overwrite old image (no timestamp)
      const filename = `${pageKey}.${extension}`;
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const bannersDir = path.resolve(process.cwd(), 'uploads', 'banners');
      const uploadPath = path.join(bannersDir, filename);
      
      // Ensure directory exists
      await fs.mkdir(bannersDir, { recursive: true });
      
      // Delete old banner files for this page (any extension) before uploading new one
      try {
        const files = await fs.readdir(bannersDir);
        for (const file of files) {
          if (file.startsWith(`${pageKey}.`) && file !== filename) {
            await fs.unlink(path.join(bannersDir, file));
          }
        }
      } catch (error) {
        // Directory might not exist yet, that's okay
      }
      
      // Save new image (overwrites if same extension)
      await fs.writeFile(uploadPath, req.file.buffer);

      // Create URL path
      const imageUrl = `/uploads/banners/${filename}`;

      // Upsert banner image in database
      const banner = await storage.upsertBannerImage(pageKey, imageUrl);
      
      res.json(banner);
    } catch (error: any) {
      console.error('Banner upload error:', error);
      if (error.message && error.message.includes('Type de fichier')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ 
        message: "Erreur lors de l'upload de la bannière",
        details: error.message 
      });
    }
  });

  app.get("/api/banners/:pageKey", async (req, res) => {
    try {
      const { pageKey } = req.params;
      if (!['parent-form', 'nanny-form', 'contact'].includes(pageKey)) {
        return res.status(400).json({ message: "pageKey invalide" });
      }

      const banner = await storage.getBannerImage(pageKey);
      if (!banner) {
        return res.status(404).json({ message: "Bannière non trouvée" });
      }
      
      res.json(banner);
    } catch (error: any) {
      console.error('❌ Erreur dans /api/banners/:pageKey :', error);
      res.status(500).json({ message: "Erreur serveur", details: error.message });
    }
  });

  // Push notification routes
  
  // Get VAPID public key
  app.get("/api/push/vapid-public-key", (req, res) => {
    res.json({ publicKey: VAPID_PUBLIC_KEY });
  });

  // Subscribe to push notifications (admin only)
  app.post("/api/push/subscribe", isAuthenticated, async (req, res) => {
    try {
      // Verify admin role
      if ((req.user as any)?.role !== 'admin') {
        return res.status(403).json({ message: "Accès réservé aux administrateurs" });
      }

      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(400).json({ message: "ID utilisateur manquant" });
      }

      const subscription = insertPushSubscriptionSchema.parse({
        userId,
        endpoint: req.body.endpoint,
        p256dh: req.body.keys.p256dh,
        auth: req.body.keys.auth,
      });

      // Check if subscription already exists
      const existing = await storage.getPushSubscriptionByEndpoint(subscription.endpoint);
      if (existing) {
        return res.json({ message: "Déjà abonné", subscription: existing });
      }

      const newSubscription = await storage.createPushSubscription(subscription);
      res.json({ message: "Abonnement créé avec succès", subscription: newSubscription });
    } catch (error: any) {
      console.error('Push subscription error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Erreur lors de l'abonnement", details: error.message });
    }
  });

  // Unsubscribe from push notifications
  app.post("/api/push/unsubscribe", isAuthenticated, async (req, res) => {
    try {
      const { endpoint } = req.body;
      if (!endpoint) {
        return res.status(400).json({ message: "Endpoint manquant" });
      }

      await storage.deletePushSubscription(endpoint);
      res.json({ message: "Désabonnement réussi" });
    } catch (error: any) {
      console.error('Push unsubscribe error:', error);
      res.status(500).json({ message: "Erreur lors du désabonnement", details: error.message });
    }
  });

  // Send push notification to all subscribed admins (admin only)
  app.post("/api/push/send", isAuthenticated, async (req, res) => {
    try {
      // Verify admin role
      if ((req.user as any)?.role !== 'admin') {
        return res.status(403).json({ message: "Accès réservé aux administrateurs" });
      }

      const { title, body, url, tag } = req.body;

      const subscriptions = await storage.getPushSubscriptions();
      if (subscriptions.length === 0) {
        return res.json({ message: "Aucun abonné", sent: 0 });
      }

      const payload = JSON.stringify({ title, body, url, tag });
      const sendPromises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          );
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          // If subscription is invalid, delete it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await storage.deletePushSubscription(sub.endpoint);
          }
          return { success: false, endpoint: sub.endpoint, error: error.message };
        }
      });

      const results = await Promise.all(sendPromises);
      const sent = results.filter(r => r.success).length;
      
      res.json({ 
        message: `Notification envoyée à ${sent}/${subscriptions.length} abonnés`,
        sent,
        total: subscriptions.length,
        results 
      });
    } catch (error: any) {
      console.error('Push send error:', error);
      res.status(500).json({ message: "Erreur lors de l'envoi", details: error.message });
    }
  });

  // Serve uploaded banner images as static files with no-cache headers
  const express = await import('express');
  app.use('/uploads/banners', express.default.static('uploads/banners', {
    setHeaders: (res) => {
      // Disable caching to prevent showing old images after updates
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }));
  
  // Serve other uploaded files normally (with default caching)
  app.use('/uploads', express.default.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
