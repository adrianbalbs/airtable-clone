CREATE TABLE IF NOT EXISTS "airtable-clone_view" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"table" serial NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airtable-clone_view" ADD CONSTRAINT "airtable-clone_view_table_airtable-clone_table_id_fk" FOREIGN KEY ("table") REFERENCES "public"."airtable-clone_table"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
