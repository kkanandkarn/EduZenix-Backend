import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// The CLI does not load .env files on its own. Mirror the app's convention of
// per-environment files; the first file that defines a variable wins.
const nodeEnv = process.env["NODE_ENV"] ?? "development";
loadEnv({ path: [`.env.${nodeEnv}.local`, `.env.${nodeEnv}`, ".env"], quiet: true });

export default defineConfig({
  // A directory, not a file: every .prisma file inside is merged into one schema.
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
