import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, timeout } from 'rxjs';
import { ServiceUnavailableError } from 'src/shared/errors/service-unavailable-error';
import {
  IForecastProvider,
  PrevisaoDiaria,
} from './interfaces/forecast-provider.port';

const HTTP_TIMEOUT_MS = 5000;
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

interface ForecastResponseRaw {
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
}

/** Adapter do forecast do Open-Meteo (implementa a port de previsão). */
@Injectable()
export class OpenMeteoForecastAdapter implements IForecastProvider {
  private readonly logger = new Logger(OpenMeteoForecastAdapter.name);

  constructor(private readonly http: HttpService) {}

  async buscarPrevisao(
    latitude: number,
    longitude: number,
  ): Promise<PrevisaoDiaria> {
    const url =
      `${BASE_URL}?latitude=${latitude}&longitude=${longitude}` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
      `&timezone=auto&forecast_days=1`;

    let dados: ForecastResponseRaw;
    try {
      const resposta = await firstValueFrom(
        this.http
          .get<ForecastResponseRaw>(url, { timeout: HTTP_TIMEOUT_MS })
          .pipe(timeout(HTTP_TIMEOUT_MS)),
      );
      dados = resposta.data;
    } catch (error) {
      this.logger.error(
        `Falha no forecast Open-Meteo (${latitude},${longitude})`,
        error as Error,
      );
      throw new ServiceUnavailableError('Open-Meteo indisponível');
    }

    const diario = dados.daily;
    if (
      !diario ||
      !Array.isArray(diario.temperature_2m_max) ||
      diario.temperature_2m_max.length === 0
    ) {
      this.logger.error('Forecast Open-Meteo retornou payload sem dados diários');
      throw new ServiceUnavailableError('Open-Meteo retornou dados inválidos');
    }

    return {
      temperaturaMin: diario.temperature_2m_min[0],
      temperaturaMax: diario.temperature_2m_max[0],
      weatherCode: diario.weather_code?.[0],
    };
  }
}
