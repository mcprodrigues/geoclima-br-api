import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Verifica a saúde da aplicação e das integrações externas (BrasilAPI e Open-Meteo).',
  })
  @ApiResponse({ status: 200, description: 'Aplicação saudável' })
  @ApiResponse({
    status: 503,
    description: 'Uma ou mais dependências externas estão indisponíveis',
  })
  check() {
    return this.health.check([
      () =>
        this.http.pingCheck(
          'brasil-api',
          'https://brasilapi.com.br/api/ibge/uf/v1',
        ),
      () =>
        this.http.pingCheck(
          'open-meteo',
          'https://geocoding-api.open-meteo.com/v1/search?name=Brasilia&count=1&language=pt&format=json',
        ),
    ]);
  }
}
