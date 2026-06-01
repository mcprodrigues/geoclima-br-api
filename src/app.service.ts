import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'GeoClima BR (N703) — agregação de dados climáticos e geográficos do Brasil. Documentação em /api/docs.';
  }
}
