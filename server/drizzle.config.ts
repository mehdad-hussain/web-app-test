import { defineConfig } from 'drizzle-kit';
import { env } from './src/lib/env.js';

export default defineConfig({
    out: './src/db/migrations',
    schema: './src/db/schema/index.ts',
    dialect: 'mysql',
    dbCredentials: {
        url: env.DATABASE_URL!,
    },
});
