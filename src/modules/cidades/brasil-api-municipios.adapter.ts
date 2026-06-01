import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom, timeout } from 'rxjs';
import { ServiceUnavailableError } from 'src/shared/errors/service-unavailable-error';
import { IMunicipiosProvider } from './interfaces/municipios-provider.port';

const HTTP_TIMEOUT_MS = 5000;
const BASE_URL = 'https://brasilapi.com.br/api/ibge/municipios/v1';

interface MunicipioRaw {
  nome: string;
  codigo_ibge: string;
}

/** Adapter de municípios via BrasilAPI/IBGE (implementa a port de municípios). */
@Injectable()
export class BrasilApiMunicipiosAdapter implements IMunicipiosProvider {
  private readonly logger = new Logger(BrasilApiMunicipiosAdapter.name);

  constructor(private readonly http: HttpService) {}

  async listarPorUf(uf: string): Promise<string[]> {
    const url = `${BASE_URL}/${uf}`;

    try {
      const { data } = await firstValueFrom(
        this.http
          .get<MunicipioRaw[]>(url, { timeout: HTTP_TIMEOUT_MS })
          .pipe(timeout(HTTP_TIMEOUT_MS)),
      );
      return Array.isArray(data) ? data.map((m) => m.nome) : [];
    } catch (error) {
      // UF inexistente: a BrasilAPI responde 404 -> lista vazia (o use-case decide o 404 de domínio).
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [];
      }
      this.logger.error(`Falha na BrasilAPI para UF "${uf}"`, error as Error);
      throw new ServiceUnavailableError('BrasilAPI indisponível');
    }
  }
}
