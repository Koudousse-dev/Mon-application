import { type ParentRequest, type InsertParentRequest, type NannyApplication, type InsertNannyApplication, type ContactMessage, type InsertContactMessage, type Notification, type InsertNotification, type Prestation, type InsertPrestation, type ParametreSite, type InsertParametreSite, type Employee, type InsertEmployee, type PaiementEmploye, type InsertPaiementEmploye, type PaymentConfig, type InsertPaymentConfig, type UpdatePaymentConfig, type BannerImage, type InsertBannerImage, type UpdateBannerImage, type PushSubscription, type InsertPushSubscription, parentRequests, nannyApplications, contactMessages, notifications, adminUsers, prestations, parametresSite, employees, paiementsEmployes, paymentConfigs, bannerImages, pushSubscriptions } from "@shared/schema";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, sql } from "drizzle-orm";

// Initialize database connection
const initDb = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }
  const sql = neon(databaseUrl);
  return drizzle({ client: sql });
};

const db = initDb();

// Create a singleton SQL client for raw queries
const getSqlClient = (() => {
  let client: ReturnType<typeof neon> | null = null;
  return () => {
    if (!client) {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is not defined");
      }
      client = neon(databaseUrl);
    }
    return client;
  };
})();

export interface IStorage {
  // Parent requests
  createParentRequest(request: InsertParentRequest): Promise<ParentRequest>;
  getParentRequests(): Promise<ParentRequest[]>;
  updateParentRequestStatus(id: string, status: string): Promise<ParentRequest>;
  
  // Nanny applications
  createNannyApplication(application: InsertNannyApplication): Promise<NannyApplication>;
  getNannyApplications(): Promise<NannyApplication[]>;
  getNannyApplicationById(id: string): Promise<NannyApplication | undefined>;
  updateNannyApplicationStatus(id: string, status: string): Promise<NannyApplication>;
  deleteNannyApplication(id: string): Promise<void>;
  
  // Contact messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  deleteContactMessage(id: string): Promise<void>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(): Promise<Notification[]>;
  getUnreadNotifications(): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<Notification>;
  markAllNotificationsAsRead(): Promise<void>;
  
  // Admin
  updateAdminPassword(id: string, passwordHash: string): Promise<void>;
  updateAdminProfile(id: string, profile: import("@shared/schema").UpdateAdminProfile): Promise<import("@shared/schema").AdminUser>;
  getAdminById(id: string): Promise<import("@shared/schema").AdminUser | undefined>;
  
  // Prestations
  createPrestation(prestation: InsertPrestation): Promise<Prestation>;
  getPrestations(): Promise<Prestation[]>;
  getPrestationById(id: string): Promise<Prestation | undefined>;
  updatePrestation(id: string, prestation: Partial<InsertPrestation>): Promise<Prestation>;
  deletePrestation(id: string): Promise<void>;
  
  // Paramètres site
  createParametreSite(parametre: InsertParametreSite): Promise<ParametreSite>;
  getParametresSite(): Promise<ParametreSite[]>;
  getParametreSiteByCle(cle: string): Promise<ParametreSite | undefined>;
  updateParametreSite(cle: string, valeur: string): Promise<ParametreSite>;
  deleteParametreSite(cle: string): Promise<void>;
  
  // Employés
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  getEmployees(): Promise<Employee[]>;
  getEmployeeById(id: string): Promise<Employee | undefined>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;
  
  // Paiements employés
  createPaiementEmploye(paiement: InsertPaiementEmploye): Promise<PaiementEmploye>;
  getPaiementsEmploye(employeId: string): Promise<PaiementEmploye[]>;
  getAllPaiementsEmployes(): Promise<PaiementEmploye[]>;
  
  // Payment configurations
  getPaymentConfigs(): Promise<PaymentConfig[]>;
  getPaymentConfigByProvider(provider: string): Promise<PaymentConfig | undefined>;
  upsertPaymentConfig(provider: string, config: UpdatePaymentConfig): Promise<PaymentConfig>;
  
  // Banner images
  getBannerImage(pageKey: string): Promise<BannerImage | undefined>;
  upsertBannerImage(pageKey: string, imageUrl: string): Promise<BannerImage>;
  
  // Push subscriptions
  createPushSubscription(subscription: import("@shared/schema").InsertPushSubscription): Promise<import("@shared/schema").PushSubscription>;
  getPushSubscriptions(): Promise<import("@shared/schema").PushSubscription[]>;
  getPushSubscriptionByEndpoint(endpoint: string): Promise<import("@shared/schema").PushSubscription | undefined>;
  deletePushSubscription(endpoint: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private parentRequests: Map<string, ParentRequest>;
  private nannyApplications: Map<string, NannyApplication>;
  private contactMessages: Map<string, ContactMessage>;
  private notifications: Map<string, Notification>;
  private prestations: Map<string, Prestation>;
  private parametresSite: Map<string, ParametreSite>;
  private employees: Map<string, Employee>;
  private paiementsEmployes: Map<string, PaiementEmploye>;

  constructor() {
    this.parentRequests = new Map();
    this.nannyApplications = new Map();
    this.contactMessages = new Map();
    this.notifications = new Map();
    this.prestations = new Map();
    this.parametresSite = new Map();
    this.employees = new Map();
    this.paiementsEmployes = new Map();
  }

  async createParentRequest(insertRequest: InsertParentRequest): Promise<ParentRequest> {
    const id = randomUUID();
    const request: ParentRequest = {
      ...insertRequest,
      id,
      horaireDebut: insertRequest.horaireDebut ?? null,
      horaireFin: insertRequest.horaireFin ?? null,
      commentaires: insertRequest.commentaires ?? null,
      statut: "en_attente",
      dateCreation: new Date(),
    };
    this.parentRequests.set(id, request);
    return request;
  }

  async getParentRequests(): Promise<ParentRequest[]> {
    return Array.from(this.parentRequests.values());
  }

  async updateParentRequestStatus(id: string, status: string): Promise<ParentRequest> {
    const request = this.parentRequests.get(id);
    if (!request) {
      throw new Error(`Parent request with id ${id} not found`);
    }
    const updatedRequest = { ...request, statut: status };
    this.parentRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async createNannyApplication(insertApplication: InsertNannyApplication): Promise<NannyApplication> {
    const id = randomUUID();
    const application: NannyApplication = {
      ...insertApplication,
      id,
      disponibilites: insertApplication.disponibilites ?? null,
      documents: insertApplication.documents ?? null,
      statut: "en_examen",
      dateCreation: new Date(),
    };
    this.nannyApplications.set(id, application);
    return application;
  }

  async getNannyApplications(): Promise<NannyApplication[]> {
    return Array.from(this.nannyApplications.values());
  }

  async updateNannyApplicationStatus(id: string, status: string): Promise<NannyApplication> {
    const application = this.nannyApplications.get(id);
    if (!application) {
      throw new Error(`Nanny application with id ${id} not found`);
    }
    const updatedApplication = { ...application, statut: status };
    this.nannyApplications.set(id, updatedApplication);
    return updatedApplication;
  }

  async deleteNannyApplication(id: string): Promise<void> {
    const application = this.nannyApplications.get(id);
    if (!application) {
      throw new Error(`Nanny application with id ${id} not found`);
    }
    this.nannyApplications.delete(id);
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const message: ContactMessage = {
      ...insertMessage,
      id,
      dateCreation: new Date(),
    };
    this.contactMessages.set(id, message);
    return message;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }

  async deleteContactMessage(id: string): Promise<void> {
    this.contactMessages.delete(id);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      id,
      relatedId: insertNotification.relatedId ?? null,
      lue: false,
      dateCreation: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values()).sort((a, b) => 
      (b.dateCreation?.getTime() || 0) - (a.dateCreation?.getTime() || 0)
    );
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => !n.lue)
      .sort((a, b) => 
        (b.dateCreation?.getTime() || 0) - (a.dateCreation?.getTime() || 0)
      );
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new Error(`Notification with id ${id} not found`);
    }
    const updatedNotification = { ...notification, lue: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async markAllNotificationsAsRead(): Promise<void> {
    const entries = Array.from(this.notifications.entries());
    for (const [id, notification] of entries) {
      this.notifications.set(id, { ...notification, lue: true });
    }
  }

  async updateAdminPassword(id: string, passwordHash: string): Promise<void> {
    // In-memory storage doesn't support admin users
    throw new Error("Admin password update not supported in memory storage");
  }

  async updateAdminProfile(id: string, profile: import("@shared/schema").UpdateAdminProfile): Promise<import("@shared/schema").AdminUser> {
    // In-memory storage doesn't support admin users
    throw new Error("Admin profile update not supported in memory storage");
  }

  async getAdminById(id: string): Promise<import("@shared/schema").AdminUser | undefined> {
    // In-memory storage doesn't support admin users
    throw new Error("Get admin by ID not supported in memory storage");
  }

  async getNannyApplicationById(id: string): Promise<NannyApplication | undefined> {
    return this.nannyApplications.get(id);
  }

  async createPrestation(insertPrestation: InsertPrestation): Promise<Prestation> {
    const id = randomUUID();
    const prestation: Prestation = {
      ...insertPrestation,
      id,
      horaireDebut: insertPrestation.horaireDebut ?? null,
      horaireFin: insertPrestation.horaireFin ?? null,
      image: insertPrestation.image ?? null,
      description: insertPrestation.description ?? null,
      actif: true,
      dateCreation: new Date(),
    };
    this.prestations.set(id, prestation);
    return prestation;
  }

  async getPrestations(): Promise<Prestation[]> {
    return Array.from(this.prestations.values());
  }

  async getPrestationById(id: string): Promise<Prestation | undefined> {
    return this.prestations.get(id);
  }

  async updatePrestation(id: string, updateData: Partial<InsertPrestation>): Promise<Prestation> {
    const prestation = this.prestations.get(id);
    if (!prestation) {
      throw new Error(`Prestation with id ${id} not found`);
    }
    const updatedPrestation = { ...prestation, ...updateData };
    this.prestations.set(id, updatedPrestation);
    return updatedPrestation;
  }

  async deletePrestation(id: string): Promise<void> {
    const prestation = this.prestations.get(id);
    if (!prestation) {
      throw new Error(`Prestation with id ${id} not found`);
    }
    this.prestations.delete(id);
  }

  async createParametreSite(insertParametre: InsertParametreSite): Promise<ParametreSite> {
    const id = randomUUID();
    const parametre: ParametreSite = {
      ...insertParametre,
      id,
      dateModification: new Date(),
    };
    this.parametresSite.set(id, parametre);
    return parametre;
  }

  async getParametresSite(): Promise<ParametreSite[]> {
    return Array.from(this.parametresSite.values());
  }

  async getParametreSiteByCle(cle: string): Promise<ParametreSite | undefined> {
    return Array.from(this.parametresSite.values()).find(p => p.cle === cle);
  }

  async updateParametreSite(cle: string, valeur: string): Promise<ParametreSite> {
    const parametre = Array.from(this.parametresSite.values()).find(p => p.cle === cle);
    if (!parametre) {
      throw new Error(`Parametre with key ${cle} not found`);
    }
    const updatedParametre = { ...parametre, valeur, dateModification: new Date() };
    this.parametresSite.set(parametre.id, updatedParametre);
    return updatedParametre;
  }

  async deleteParametreSite(cle: string): Promise<void> {
    const parametre = Array.from(this.parametresSite.values()).find(p => p.cle === cle);
    if (!parametre) {
      throw new Error(`Parametre with key ${cle} not found`);
    }
    this.parametresSite.delete(parametre.id);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employee: Employee = {
      ...insertEmployee,
      id,
      disponibilites: insertEmployee.disponibilites ?? null,
      documents: insertEmployee.documents ?? null,
      actif: true,
      dateEmbauche: new Date(),
    };
    this.employees.set(id, employee);
    return employee;
  }

  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async getEmployeeById(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async updateEmployee(id: string, updateData: Partial<InsertEmployee>): Promise<Employee> {
    const employee = this.employees.get(id);
    if (!employee) {
      throw new Error(`Employee with id ${id} not found`);
    }
    const updatedEmployee = { ...employee, ...updateData };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: string): Promise<void> {
    const employee = this.employees.get(id);
    if (!employee) {
      throw new Error(`Employee with id ${id} not found`);
    }
    this.employees.delete(id);
  }

  async createPaiementEmploye(insertPaiement: InsertPaiementEmploye): Promise<PaiementEmploye> {
    const id = randomUUID();
    const paiement: PaiementEmploye = {
      ...insertPaiement,
      id,
      notes: insertPaiement.notes ?? null,
      datePaiement: new Date(),
    };
    this.paiementsEmployes.set(id, paiement);
    return paiement;
  }

  async getPaiementsEmploye(employeId: string): Promise<PaiementEmploye[]> {
    return Array.from(this.paiementsEmployes.values()).filter(p => p.employeId === employeId);
  }

  async getAllPaiementsEmployes(): Promise<PaiementEmploye[]> {
    return Array.from(this.paiementsEmployes.values());
  }

  async getPaymentConfigs(): Promise<PaymentConfig[]> {
    throw new Error("Payment configs not supported in memory storage");
  }

  async getPaymentConfigByProvider(provider: string): Promise<PaymentConfig | undefined> {
    throw new Error("Payment configs not supported in memory storage");
  }

  async upsertPaymentConfig(provider: string, config: UpdatePaymentConfig): Promise<PaymentConfig> {
    throw new Error("Payment configs not supported in memory storage");
  }

  async getBannerImage(pageKey: string): Promise<BannerImage | undefined> {
    throw new Error("Banner images not supported in memory storage");
  }

  async upsertBannerImage(pageKey: string, imageUrl: string): Promise<BannerImage> {
    throw new Error("Banner images not supported in memory storage");
  }

  async createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription> {
    throw new Error("Push subscriptions not supported in memory storage");
  }

  async getPushSubscriptions(): Promise<PushSubscription[]> {
    throw new Error("Push subscriptions not supported in memory storage");
  }

  async getPushSubscriptionByEndpoint(endpoint: string): Promise<PushSubscription | undefined> {
    throw new Error("Push subscriptions not supported in memory storage");
  }

  async deletePushSubscription(endpoint: string): Promise<void> {
    throw new Error("Push subscriptions not supported in memory storage");
  }
}

export class DbStorage implements IStorage {
  async createParentRequest(insertRequest: InsertParentRequest): Promise<ParentRequest> {
    const [request] = await db.insert(parentRequests).values(insertRequest).returning();
    return request;
  }

  async getParentRequests(): Promise<ParentRequest[]> {
    return await db.select().from(parentRequests);
  }

  async updateParentRequestStatus(id: string, status: string): Promise<ParentRequest> {
    const [updatedRequest] = await db
      .update(parentRequests)
      .set({ statut: status })
      .where(eq(parentRequests.id, id))
      .returning();
    
    if (!updatedRequest) {
      throw new Error(`Parent request with id ${id} not found`);
    }
    
    return updatedRequest;
  }

  async createNannyApplication(insertApplication: InsertNannyApplication): Promise<NannyApplication> {
    const [application] = await db.insert(nannyApplications).values(insertApplication).returning();
    return application;
  }

  async getNannyApplications(): Promise<NannyApplication[]> {
    return await db.select().from(nannyApplications);
  }

  async updateNannyApplicationStatus(id: string, status: string): Promise<NannyApplication> {
    const [updatedApplication] = await db
      .update(nannyApplications)
      .set({ statut: status })
      .where(eq(nannyApplications.id, id))
      .returning();
    
    if (!updatedApplication) {
      throw new Error(`Nanny application with id ${id} not found`);
    }
    
    return updatedApplication;
  }

  async deleteNannyApplication(id: string): Promise<void> {
    const result = await db.delete(nannyApplications).where(eq(nannyApplications.id, id)).returning();
    if (result.length === 0) {
      throw new Error(`Nanny application with id ${id} not found`);
    }
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db.insert(contactMessages).values(insertMessage).returning();
    return message;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages);
  }

  async deleteContactMessage(id: string): Promise<void> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async getNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications).orderBy(desc(notifications.dateCreation));
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.lue, false))
      .orderBy(desc(notifications.dateCreation));
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ lue: true })
      .where(eq(notifications.id, id))
      .returning();
    
    if (!updatedNotification) {
      throw new Error(`Notification with id ${id} not found`);
    }
    
    return updatedNotification;
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await db.update(notifications).set({ lue: true });
  }

  async updateAdminPassword(id: string, passwordHash: string): Promise<void> {
    await db
      .update(adminUsers)
      .set({ passwordHash })
      .where(eq(adminUsers.id, id));
  }

  async updateAdminProfile(id: string, profile: import("@shared/schema").UpdateAdminProfile): Promise<import("@shared/schema").AdminUser> {
    const [updatedAdmin] = await db
      .update(adminUsers)
      .set(profile)
      .where(eq(adminUsers.id, id))
      .returning();
    
    if (!updatedAdmin) {
      throw new Error(`Admin with id ${id} not found`);
    }
    
    return updatedAdmin;
  }

  async getAdminById(id: string): Promise<import("@shared/schema").AdminUser | undefined> {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1);
    return admin;
  }

  async getNannyApplicationById(id: string): Promise<NannyApplication | undefined> {
    const [application] = await db
      .select()
      .from(nannyApplications)
      .where(eq(nannyApplications.id, id))
      .limit(1);
    return application;
  }

  async createPrestation(insertPrestation: InsertPrestation): Promise<Prestation> {
    const [prestation] = await db.insert(prestations).values(insertPrestation).returning();
    return prestation;
  }

  async getPrestations(): Promise<Prestation[]> {
    return await db.select().from(prestations);
  }

  async getPrestationById(id: string): Promise<Prestation | undefined> {
    const [prestation] = await db
      .select()
      .from(prestations)
      .where(eq(prestations.id, id))
      .limit(1);
    return prestation;
  }

  async updatePrestation(id: string, updateData: Partial<InsertPrestation>): Promise<Prestation> {
    const [updatedPrestation] = await db
      .update(prestations)
      .set(updateData)
      .where(eq(prestations.id, id))
      .returning();
    
    if (!updatedPrestation) {
      throw new Error(`Prestation with id ${id} not found`);
    }
    
    return updatedPrestation;
  }

  async deletePrestation(id: string): Promise<void> {
    const result = await db.delete(prestations).where(eq(prestations.id, id)).returning();
    if (result.length === 0) {
      throw new Error(`Prestation with id ${id} not found`);
    }
  }

  async createParametreSite(insertParametre: InsertParametreSite): Promise<ParametreSite> {
    const [parametre] = await db.insert(parametresSite).values(insertParametre).returning();
    return parametre;
  }

  async getParametresSite(): Promise<ParametreSite[]> {
    return await db.select().from(parametresSite);
  }

  async getParametreSiteByCle(cle: string): Promise<ParametreSite | undefined> {
    const [parametre] = await db
      .select()
      .from(parametresSite)
      .where(eq(parametresSite.cle, cle))
      .limit(1);
    return parametre;
  }

  async updateParametreSite(cle: string, valeur: string): Promise<ParametreSite> {
    const [updatedParametre] = await db
      .update(parametresSite)
      .set({ valeur, dateModification: new Date() })
      .where(eq(parametresSite.cle, cle))
      .returning();
    
    if (!updatedParametre) {
      throw new Error(`Parametre with key ${cle} not found`);
    }
    
    return updatedParametre;
  }

  async deleteParametreSite(cle: string): Promise<void> {
    const result = await db.delete(parametresSite).where(eq(parametresSite.cle, cle)).returning();
    if (result.length === 0) {
      throw new Error(`Parametre with key ${cle} not found`);
    }
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db.insert(employees).values(insertEmployee).returning();
    return employee;
  }

  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async getEmployeeById(id: string): Promise<Employee | undefined> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id))
      .limit(1);
    return employee;
  }

  async updateEmployee(id: string, updateData: Partial<InsertEmployee>): Promise<Employee> {
    const [updatedEmployee] = await db
      .update(employees)
      .set(updateData)
      .where(eq(employees.id, id))
      .returning();
    
    if (!updatedEmployee) {
      throw new Error(`Employee with id ${id} not found`);
    }
    
    return updatedEmployee;
  }

  async deleteEmployee(id: string): Promise<void> {
    const result = await db.delete(employees).where(eq(employees.id, id)).returning();
    if (result.length === 0) {
      throw new Error(`Employee with id ${id} not found`);
    }
  }

  async createPaiementEmploye(insertPaiement: InsertPaiementEmploye): Promise<PaiementEmploye> {
    const [paiement] = await db.insert(paiementsEmployes).values(insertPaiement).returning();
    return paiement;
  }

  async getPaiementsEmploye(employeId: string): Promise<PaiementEmploye[]> {
    return await db
      .select()
      .from(paiementsEmployes)
      .where(eq(paiementsEmployes.employeId, employeId));
  }

  async getAllPaiementsEmployes(): Promise<PaiementEmploye[]> {
    return await db.select().from(paiementsEmployes);
  }

  async getPaymentConfigs(): Promise<PaymentConfig[]> {
    return await db.select().from(paymentConfigs);
  }

  async getPaymentConfigByProvider(provider: string): Promise<PaymentConfig | undefined> {
    const [config] = await db
      .select()
      .from(paymentConfigs)
      .where(eq(paymentConfigs.provider, provider))
      .limit(1);
    return config;
  }

  async upsertPaymentConfig(provider: string, config: UpdatePaymentConfig): Promise<PaymentConfig> {
    const existing = await this.getPaymentConfigByProvider(provider);
    
    if (existing) {
      const [updated] = await db
        .update(paymentConfigs)
        .set({ ...config, dateModification: new Date() })
        .where(eq(paymentConfigs.provider, provider))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(paymentConfigs)
        .values({ provider, ...config })
        .returning();
      return created;
    }
  }

  async getBannerImage(pageKey: string): Promise<BannerImage | undefined> {
    const results = await db
      .select()
      .from(bannerImages)
      .where(eq(bannerImages.pageKey, pageKey))
      .limit(1);
    
    return results?.[0];
  }

  async upsertBannerImage(pageKey: string, imageUrl: string): Promise<BannerImage> {
    // Check if banner exists
    const results = await db
      .select()
      .from(bannerImages)
      .where(eq(bannerImages.pageKey, pageKey))
      .limit(1);
    
    const existingBanner = results?.[0];
    
    if (existingBanner) {
      // Update existing banner and increment version
      const [updated] = await db
        .update(bannerImages)
        .set({ 
          imageUrl, 
          version: sql`${bannerImages.version} + 1`,
          updatedAt: new Date()
        })
        .where(eq(bannerImages.pageKey, pageKey))
        .returning();
      
      return updated;
    } else {
      // Create new banner
      const [created] = await db
        .insert(bannerImages)
        .values({
          pageKey,
          imageUrl,
          version: 1,
          updatedAt: new Date(),
        })
        .returning();
      
      return created;
    }
  }

  async createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription> {
    const [sub] = await db.insert(pushSubscriptions).values(subscription).returning();
    return sub;
  }

  async getPushSubscriptions(): Promise<PushSubscription[]> {
    return await db.select().from(pushSubscriptions);
  }

  async getPushSubscriptionByEndpoint(endpoint: string): Promise<PushSubscription | undefined> {
    const [sub] = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
    return sub;
  }

  async deletePushSubscription(endpoint: string): Promise<void> {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  }
}

// Use database storage in production, memory storage for testing
export const storage = process.env.NODE_ENV === 'test' ? new MemStorage() : new DbStorage();

/**
 * Initialize banner storage by creating the banners.json file with default structure
 * if it doesn't exist. This ensures the banner endpoints work immediately.
 */
export async function initializeBannerStorage(): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');
  const bannersDir = path.resolve(process.cwd(), 'uploads', 'banners');
  const bannersFile = path.join(bannersDir, 'banners.json');
  
  try {
    // Ensure directory exists
    await fs.mkdir(bannersDir, { recursive: true });
    
    let needsInitialization = false;
    
    // Check if file exists and has valid content
    try {
      const data = await fs.readFile(bannersFile, 'utf-8');
      const banners = JSON.parse(data.trim() || '{}');
      
      // Check if all three required pages exist
      const requiredPages = ['parent-form', 'nanny-form', 'contact'];
      needsInitialization = !requiredPages.every(page => banners[page]);
    } catch {
      // File doesn't exist or is invalid, needs initialization
      needsInitialization = true;
    }
    
    if (needsInitialization) {
      const defaultBanners: Record<string, BannerImage> = {
        'parent-form': {
          id: randomUUID(),
          pageKey: 'parent-form',
          imageUrl: '',
          version: 0,
          updatedAt: new Date(),
        },
        'nanny-form': {
          id: randomUUID(),
          pageKey: 'nanny-form',
          imageUrl: '',
          version: 0,
          updatedAt: new Date(),
        },
        'contact': {
          id: randomUUID(),
          pageKey: 'contact',
          imageUrl: '',
          version: 0,
          updatedAt: new Date(),
        },
      };
      
      await fs.writeFile(bannersFile, JSON.stringify(defaultBanners, null, 2));
      console.log('✓ Banner storage initialized with default structure');
    }
  } catch (error) {
    console.error('Failed to initialize banner storage:', error);
    throw error;
  }
}
