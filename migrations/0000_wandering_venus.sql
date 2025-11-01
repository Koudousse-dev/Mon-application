CREATE TABLE "AdminUser" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"nom" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'admin',
	"date_creation" timestamp DEFAULT now(),
	CONSTRAINT "AdminUser_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text NOT NULL,
	"telephone" text NOT NULL,
	"message" text NOT NULL,
	"date_creation" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidature_id" varchar NOT NULL,
	"nom" text NOT NULL,
	"telephone" text NOT NULL,
	"adresse" text NOT NULL,
	"type_poste" text NOT NULL,
	"experience" text NOT NULL,
	"disponibilites" text,
	"documents" text,
	"actif" boolean DEFAULT true,
	"date_embauche" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nanny_applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text NOT NULL,
	"telephone" text NOT NULL,
	"adresse" text NOT NULL,
	"type_poste" text NOT NULL,
	"experience" text NOT NULL,
	"disponibilites" text,
	"documents" text,
	"statut" text DEFAULT 'en_examen',
	"date_creation" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"titre" text NOT NULL,
	"message" text NOT NULL,
	"lue" boolean DEFAULT false,
	"related_id" varchar,
	"date_creation" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "paiements_employes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employe_id" varchar NOT NULL,
	"montant" integer NOT NULL,
	"motif" text NOT NULL,
	"date_paiement" timestamp DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "parametres_site" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cle" text NOT NULL,
	"valeur" text NOT NULL,
	"date_modification" timestamp DEFAULT now(),
	CONSTRAINT "parametres_site_cle_unique" UNIQUE("cle")
);
--> statement-breakpoint
CREATE TABLE "parent_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text NOT NULL,
	"telephone" text NOT NULL,
	"adresse" text NOT NULL,
	"type_service" text NOT NULL,
	"horaire_debut" text,
	"horaire_fin" text,
	"nombre_enfants" integer NOT NULL,
	"forfait" text NOT NULL,
	"commentaires" text,
	"statut" text DEFAULT 'en_attente',
	"date_creation" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"actif" boolean DEFAULT false,
	"api_key" text,
	"api_secret" text,
	"config_json" text,
	"date_modification" timestamp DEFAULT now(),
	CONSTRAINT "payment_configs_provider_unique" UNIQUE("provider")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"demande_id" varchar,
	"montant" numeric(10, 2),
	"methode" text,
	"transaction_id" text,
	"statut" text DEFAULT 'en_attente',
	"date_creation" timestamp DEFAULT now(),
	"date_confirmation" timestamp
);
--> statement-breakpoint
CREATE TABLE "prestations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text NOT NULL,
	"description" text NOT NULL,
	"horaire_debut" text,
	"horaire_fin" text,
	"prix" integer NOT NULL,
	"unite" text DEFAULT 'FCFA' NOT NULL,
	"image" text,
	"actif" boolean DEFAULT true,
	"date_creation" timestamp DEFAULT now()
);
