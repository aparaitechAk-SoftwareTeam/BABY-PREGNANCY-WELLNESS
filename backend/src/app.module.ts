import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PregnancyModule } from './pregnancy/pregnancy.module';

@Module({
  imports: [AuthModule, PregnancyModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
