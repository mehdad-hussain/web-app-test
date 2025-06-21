import { Module } from "@nestjs/common";
import { DRIZZLE_ORM } from "./constants.js";
import { drizzleProvider } from "./drizzle.provider.js";

@Module({
  providers: [drizzleProvider],
  exports: [DRIZZLE_ORM],
})
export class DrizzleModule {}
