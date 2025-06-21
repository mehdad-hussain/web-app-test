import { createEnv } from "@t3-oss/env-core";
import "dotenv/config";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    JWT_ACCESS_SECRET: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().min(1),
    JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().min(1),
    PORT: z.coerce.number().default(4000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    CORS_ORIGIN: z.string().url(),
  },
  runtimeEnv: process.env,
  clientPrefix: "VITE_",
  client: {},
});
