import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, timeout } from 'rxjs';
import { ServiceUnavailableError } from 'src/shared/errors/service-unavailable-error';
import {
  IGeocodingProvider,
  Localidade,
} from './interfaces/geocoding-provider.port';
import { siglaDoEstado } from './estados';

const HTTP_TIMEOUT_MS = 5000;
const BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

interface GeocodingResultRaw {
  name: string;
  latitude: number;
  longitude: number;
  country_code: string;
  admin1?: string;
}

interface GeocodingResponseRaw {
  results?: GeocodingResultRaw[];
}

/** Adapter do geocoding do Open-Meteo (implementa a port de geocoding). */
@Injectable()
export class OpenMeteoGeocodingAdapter implements IGeocodingProvider {
  private readonly logger = new Logger(OpenMeteoGeocodingAdapter.name);

  constructor(private readonly http: HttpService) {}

  async buscarLocalidade(nome: string): Promise<Localidade | null> {
    const url =
      `${BASE_URL}?name=${encodeURIComponent(nome)}` +
      `&count=10&language=pt&format=json`;

    let dados: GeocodingResponseRaw;
    try {
      const resposta = await firstValueFrom(
        this.http
          .get<GeocodingResponseRaw>(url, { timeout: HTTP_TIMEOUT_MS })
          .pipe(timeout(HTTP_TIMEOUT_MS)),
      );
      dados = resposta.data;
    } catch (error) {
      this.logger.error(
        `Falha no geocoding Open-Meteo para "${nome}"`,
        error as Error,
      );
      throw new ServiceUnavailableError('Open-Meteo indisponível');
    }

    const brasileiras = (dados.results ?? []).filter(
      (r) => r.country_code === 'BR',
    );
    if (brasileiras.length === 0) return null;

    const escolhida = this.escolherMelhor(brasileiras, nome);
    return {
      nome: escolhida.name,
      latitude: escolhida.latitude,
      longitude: escolhida.longitude,
      estado: siglaDoEstado(escolhida.admin1) ?? escolhida.admin1 ?? '',
    };
  }

  /**
   * Prefere correspondência exata de nome (sem acentos/caixa); senão, o primeiro
   * resultado brasileiro (o Open-Meteo já ordena por relevância).
   */
  private escolherMelhor(
    resultados: GeocodingResultRaw[],
    nome: string,
  ): GeocodingResultRaw {
    const alvo = this.semAcento(nome);
    const exato = resultados.find((r) => this.semAcento(r.name) === alvo);
    return exato ?? resultados[0];
  }

  private semAcento(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();
  }
}
