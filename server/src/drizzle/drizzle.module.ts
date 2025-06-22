import { Module } from "@nestjs/common";
import { DRIZZLE_ORM } from "./constants";
import { drizzleProvider } from "./drizzle.provider";

@Module({
  providers: [drizzleProvider],
  exports: [DRIZZLE_ORM],
})
export class DrizzleModule {}
