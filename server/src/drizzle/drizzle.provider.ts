import { FactoryProvider } from "@nestjs/common";
import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import * as schema from "../db/schema";
import { env } from "../lib/env";
import { DRIZZLE_ORM } from "./constants";

export type DrizzleService = MySql2Database<typeof schema>;

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
