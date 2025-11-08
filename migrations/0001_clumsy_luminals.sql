CREATE TABLE "banner_images" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_key" text NOT NULL,
	"image_url" text NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "banner_images_page_key_unique" UNIQUE("page_key")
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
