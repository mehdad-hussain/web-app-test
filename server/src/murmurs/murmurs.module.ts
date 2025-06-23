import { Module } from '@nestjs/common';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { MurmursController } from './murmurs.controller';
import { MurmursService } from './murmurs.service';

@Module({
  imports: [DrizzleModule],
  controllers: [MurmursController],
  providers: [MurmursService],
})
export class MurmursModule {} 