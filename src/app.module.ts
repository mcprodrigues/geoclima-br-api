import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClimaModule } from './modules/clima/clima.module';
import { CidadesModule } from './modules/cidades/cidades.module';
import { PingModule } from './modules/ping/ping.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ClimaModule, CidadesModule, PingModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
