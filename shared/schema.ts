import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Validation pour les numéros de téléphone gabonais
// Format: +241 suivi de 8 chiffres (avec ou sans espaces/tirets)
export const gabonPhoneSchema = z.string()
  .min(1, "Le numéro de téléphone est obligatoire")
  .refine((val) => {
    // Enlever les espaces et tirets pour vérifier le format
    const cleaned = val.replace(/[\s\-]/g, '');
    // Doit commencer par +241 et avoir exactement 8 chiffres après
    const regex = /^\+241\d{8}$/;
    return regex.test(cleaned);
  }, {
    message: "Le numéro doit être un numéro gabonais valide (format: +241 XX XX XX XX, 8 chiffres après +241)"
  });

export const parentRequestStatuses = ["en_attente", "traite", "paye"] as const;
export const nannyApplicationStatuses = ["en_examen", "en_attente", "traite", "accepte", "refuse"] as const;

export type ParentRequestStatus = typeof parentRequestStatuses[number];
export type NannyApplicationStatus = typeof nannyApplicationStatuses[number];

export const parentRequests = pgTable("parent_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nom: text("nom").notNull(),
  telephone: text("telephone").notNull(),
  adresse: text("adresse").notNull(),
  typeService: text("type_service").notNull(),
  horaireDebut: text("horaire_debut"),
  horaireFin: text("horaire_fin"),
  nombreEnfants: integer("nombre_enfants").notNull(),
  forfait: text("forfait").notNull(),
  commentaires: text("commentaires"),
  statut: text("statut").default("en_attente"),
  dateCreation: timestamp("date_creation").defaultNow(),
});

export const nannyApplications = pgTable("nanny_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nom: text("nom").notNull(),
  telephone: text("telephone").notNull(),
  adresse: text("adresse").notNull(),
  typePoste: text("type_poste").notNull(),
  experience: text("experience").notNull(),
  disponibilites: text("disponibilites"),
  documents: text("documents"), // JSON array of document info
  statut: text("statut").default("en_examen"),
  dateCreation: timestamp("date_creation").defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nom: text("nom").notNull(),
  telephone: text("telephone").notNull(),
  message: text("message").notNull(),
  dateCreation: timestamp("date_creation").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  demandeId: varchar("demande_id"),
  montant: decimal("montant", { precision: 10, scale: 2 }),
  methode: text("methode"),
  transactionId: text("transaction_id"),
  statut: text("statut").default("en_attente"),
  dateCreation: timestamp("date_creation").defaultNow(),
  dateConfirmation: timestamp("date_confirmation"),
});

export const adminUsers = pgTable("AdminUser", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  nom: text("nom").notNull(),
  email: text("email").notNull(),
  role: text("role").default("admin"),
  dateCreation: timestamp("date_creation").defaultNow(),
});

export const notificationTypes = ["nouvelle_demande", "nouvelle_candidature", "nouveau_message", "nouveau_match"] as const;
export type NotificationType = typeof notificationTypes[number];

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  titre: text("titre").notNull(),
  message: text("message").notNull(),
  lue: boolean("lue").default(false),
  relatedId: varchar("related_id"),
  dateCreation: timestamp("date_creation").defaultNow(),
});

export const insertParentRequestSchema = createInsertSchema(parentRequests).omit({
  id: true,
  dateCreation: true,
  statut: true,
}).extend({
  nom: z.string().min(1, "Le nom est obligatoire"),
  telephone: gabonPhoneSchema,
  adresse: z.string().min(1, "L'adresse est obligatoire"),
  typeService: z.string().min(1, "Le type de service est obligatoire"),
  horaireDebut: z.string().min(1, "L'horaire de début est obligatoire"),
  horaireFin: z.string().min(1, "L'horaire de fin est obligatoire"),
  nombreEnfants: z.number().min(1, "Le nombre d'enfants doit être au moins 1"),
  forfait: z.string().min(1, "Le forfait est obligatoire"),
  commentaires: z.string().optional(),
});

export const insertNannyApplicationSchema = createInsertSchema(nannyApplications).omit({
  id: true,
  dateCreation: true,
  statut: true,
}).extend({
  nom: z.string().min(1, "Le nom est obligatoire"),
  telephone: gabonPhoneSchema,
  adresse: z.string().min(1, "L'adresse est obligatoire"),
  typePoste: z.string().min(1, "Le type de poste est obligatoire"),
  experience: z.string().min(1, "L'expérience est obligatoire"),
  disponibilites: z.string().min(1, "Les disponibilités sont obligatoires"),
  documents: z.string().optional(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  dateCreation: true,
}).extend({
  nom: z.string().min(1, "Le nom est obligatoire"),
  telephone: gabonPhoneSchema,
  message: z.string().min(1, "Le message est obligatoire"),
});

export type InsertParentRequest = z.infer<typeof insertParentRequestSchema>;
export type ParentRequest = typeof parentRequests.$inferSelect;

export type InsertNannyApplication = z.infer<typeof insertNannyApplicationSchema>;
export type NannyApplication = typeof nannyApplications.$inferSelect;

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export type Payment = typeof payments.$inferSelect;

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  dateCreation: true,
});

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

export const updateAdminProfileSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est obligatoire"),
  nom: z.string().min(1, "Le nom complet est obligatoire"),
  email: z.string().email("Email invalide"),
});

export type UpdateAdminProfile = z.infer<typeof updateAdminProfileSchema>;

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  dateCreation: true,
  lue: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export const updateParentRequestStatusSchema = z.object({
  status: z.enum(parentRequestStatuses),
});

export const updateNannyApplicationStatusSchema = z.object({
  status: z.enum(nannyApplicationStatuses),
});

// Table des prestations de services (éditables par admin)
export const prestations = pgTable("prestations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nom: text("nom").notNull(),
  description: text("description").notNull(),
  horaireDebut: text("horaire_debut"),
  horaireFin: text("horaire_fin"),
  prix: integer("prix").notNull(),
  unite: text("unite").notNull().default("FCFA"),
  image: text("image"), // ✅ nouveau champ pour l’URL de l’image
  actif: boolean("actif").default(true),
  dateCreation: timestamp("date_creation").defaultNow(),
});

// Table des paramètres du site (infos de contact éditables)
export const parametresSite = pgTable("parametres_site", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cle: text("cle").notNull().unique(), // 'email', 'telephone', 'adresse', etc.
  valeur: text("valeur").notNull(),
  dateModification: timestamp("date_modification").defaultNow(),
});

// Table des employés (créés depuis candidatures acceptées)
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidatureId: varchar("candidature_id").notNull(), // Lien vers nanny_applications
  nom: text("nom").notNull(),
  telephone: text("telephone").notNull(),
  adresse: text("adresse").notNull(),
  typePoste: text("type_poste").notNull(),
  experience: text("experience").notNull(),
  disponibilites: text("disponibilites"),
  documents: text("documents"), // JSON array of document info
  actif: boolean("actif").default(true),
  dateEmbauche: timestamp("date_embauche").defaultNow(),
});

// Table des paiements aux employés
export const paiementsEmployes = pgTable("paiements_employes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeId: varchar("employe_id").notNull(),
  montant: integer("montant").notNull(),
  motif: text("motif").notNull(), // Ex: "Garde du 01/10 au 05/10"
  datePaiement: timestamp("date_paiement").defaultNow(),
  notes: text("notes"),
});

// Schemas Zod pour les nouvelles tables
export const insertPrestationSchema = createInsertSchema(prestations).omit({
  id: true,
  dateCreation: true,
  actif: true,
}).extend({
  nom: z.string().min(1, "Le nom est obligatoire"),
  description: z.string().min(1, "La description est obligatoire"),
  prix: z.number().min(0, "Le prix doit être positif"),
  unite: z.string().default("FCFA"),
  horaireDebut: z.string().optional(),
  horaireFin: z.string().optional(),
});

export const insertParametreSiteSchema = createInsertSchema(parametresSite).omit({
  id: true,
  dateModification: true,
}).extend({
  cle: z.string().min(1, "La clé est obligatoire"),
  valeur: z.string().min(1, "La valeur est obligatoire"),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  dateEmbauche: true,
  actif: true,
}).extend({
  candidatureId: z.string().min(1, "L'ID de candidature est obligatoire"),
  nom: z.string().min(1, "Le nom est obligatoire"),
  telephone: z.string().min(1, "Le téléphone est obligatoire"),
  adresse: z.string().min(1, "L'adresse est obligatoire"),
  typePoste: z.string().min(1, "Le type de poste est obligatoire"),
  experience: z.string().min(1, "L'expérience est obligatoire"),
  disponibilites: z.string().nullish(),
  documents: z.string().nullish(),
});

export const insertPaiementEmployeSchema = createInsertSchema(paiementsEmployes).omit({
  id: true,
  datePaiement: true,
}).extend({
  employeId: z.string().min(1, "L'ID de l'employé est obligatoire"),
  montant: z.number().min(0, "Le montant doit être positif"),
  motif: z.string().min(1, "Le motif est obligatoire"),
  notes: z.string().optional(),
});

// Types TypeScript
export type InsertPrestation = z.infer<typeof insertPrestationSchema>;
export type Prestation = typeof prestations.$inferSelect;

export type InsertParametreSite = z.infer<typeof insertParametreSiteSchema>;
export type ParametreSite = typeof parametresSite.$inferSelect;

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertPaiementEmploye = z.infer<typeof insertPaiementEmployeSchema>;
export type PaiementEmploye = typeof paiementsEmployes.$inferSelect;

// Table des configurations de paiements mobiles
export const paymentProviders = ["airtel_money", "moov_money", "cinetpay"] as const;
export type PaymentProvider = typeof paymentProviders[number];

export const paymentConfigs = pgTable("payment_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull().unique(), // airtel_money, moov_money, cinetpay
  actif: boolean("actif").default(false),
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  configJson: text("config_json"), // JSON pour configs additionnelles (URLs, IDs, etc.)
  dateModification: timestamp("date_modification").defaultNow(),
});

export const insertPaymentConfigSchema = createInsertSchema(paymentConfigs).omit({
  id: true,
  dateModification: true,
}).extend({
  provider: z.enum(paymentProviders),
  actif: z.boolean().default(false),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  configJson: z.string().optional(),
});

export const updatePaymentConfigSchema = z.object({
  actif: z.boolean(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  configJson: z.string().optional(),
});

export type InsertPaymentConfig = z.infer<typeof insertPaymentConfigSchema>;
export type UpdatePaymentConfig = z.infer<typeof updatePaymentConfigSchema>;
export type PaymentConfig = typeof paymentConfigs.$inferSelect;
