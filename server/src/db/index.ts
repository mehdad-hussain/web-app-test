import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env.js";
import * as schema from "./schema.js";

const poolConnection = mysql.createPool({ uri: env.DATABASE_URL! });

export const db = drizzle(poolConnection, { schema, mode: "default" });
