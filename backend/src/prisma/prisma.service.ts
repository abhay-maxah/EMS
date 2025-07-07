import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    'query' | 'info' | 'warn' | 'error' | 'beforeExit'
  >
  implements OnModuleInit
{
  constructor() {
    super({
      log: ['warn', 'error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Prisma client connected to database.');
  }

  /**
   * Enable shutdown hooks to gracefully close the Prisma client connection
   * when the NestJS application is shutting down.
   */
  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      console.log('Prisma client disconnecting...');
      await app.close();
    });
  }
}
