import { FactoryProvider } from "@nestjs/common";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import * as schema from "../db/schema.js";
import { env } from "../lib/env.js";
import { DRIZZLE_ORM } from "./constants.js";

export const drizzleProvider: FactoryProvider = {
  provide: DRIZZLE_ORM,
  useFactory: async () => {
    const pool = createPool({
      uri: env.DATABASE_URL,
    });

    // Test the connection
    try {
      const connection = await pool.getConnection();
      // eslint-disable-next-line no-console
      console.log('✅ Database connection established successfully');
      connection.release();
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      throw error;
    }

    return drizzle(pool, { schema, mode: "default" });
  },
};
