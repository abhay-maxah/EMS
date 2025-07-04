import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Makes PrismaService available everywhere
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export PrismaService to be used in other modules
})
export class PrismaModule {}
