import { FactoryProvider } from "@nestjs/common";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import * as schema from "../db/schema.js";
import { env } from "../lib/env.js";
import { DRIZZLE_ORM } from "./constants.js";

export const drizzleProvider: FactoryProvider = {
  provide: DRIZZLE_ORM,
  useFactory: () => {
    const pool = createPool({
      uri: env.DATABASE_URL,
    });
    return drizzle(pool, { schema, mode: "default" });
  },
};
