import { FactoryProvider } from "@nestjs/common";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import * as schema from "../db/schema";
import { DRIZZLE_ORM } from "./constants";

export const drizzleProvider: FactoryProvider = {
  provide: DRIZZLE_ORM,
  useFactory: () => {
    const pool = createPool({
      uri: process.env.DATABASE_URL,
    });
    return drizzle(pool, { schema, mode: "default" });
  },
};
