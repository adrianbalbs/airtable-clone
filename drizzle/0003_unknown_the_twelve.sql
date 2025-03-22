DO $$ BEGIN
 CREATE TYPE "public"."column_type" AS ENUM('text', 'number');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airtable-clone_column" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"table" serial NOT NULL,
	"type" "column_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airtable-clone_rows" (
	"id" serial PRIMARY KEY NOT NULL,
	"table" serial NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airtable-clone_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"base" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airtable-clone_column" ADD CONSTRAINT "airtable-clone_column_table_airtable-clone_table_id_fk" FOREIGN KEY ("table") REFERENCES "public"."airtable-clone_table"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airtable-clone_rows" ADD CONSTRAINT "airtable-clone_rows_table_airtable-clone_table_id_fk" FOREIGN KEY ("table") REFERENCES "public"."airtable-clone_table"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airtable-clone_table" ADD CONSTRAINT "airtable-clone_table_base_airtable-clone_base_id_fk" FOREIGN KEY ("base") REFERENCES "public"."airtable-clone_base"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "row_data_idx" ON "airtable-clone_rows" USING gin ("data");