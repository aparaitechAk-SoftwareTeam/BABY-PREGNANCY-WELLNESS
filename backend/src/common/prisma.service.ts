import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    let retries = 5;
    while (retries > 0) {
      try {
        await this.$connect();
        this.logger.log('✅ Connected to Neon Cloud PostgreSQL database.');
        break;
      } catch (err: any) {
        retries -= 1;
        this.logger.warn(`Neon DB connecting... (${5 - retries}/5). Retrying in 2s: ${err.message}`);
        if (retries === 0) {
          this.logger.error('Failed to connect to database after 5 attempts:', err.message);
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
