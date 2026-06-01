import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CidadesController } from './cidades.controller';
import { CidadesService } from './cidades.service';
import { ListarCidadesUseCase } from './use-cases/listar-cidades.use-case';
import { MUNICIPIOS_PROVIDER } from './interfaces/municipios-provider.port';
import { BrasilApiMunicipiosAdapter } from './brasil-api-municipios.adapter';

@Module({
  imports: [HttpModule],
  controllers: [CidadesController],
  providers: [
    CidadesService,
    ListarCidadesUseCase,
    {
      provide: MUNICIPIOS_PROVIDER,
      useClass: BrasilApiMunicipiosAdapter,
    },
  ],
})
export class CidadesModule {}
