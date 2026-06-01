import { Inject, Injectable, Logger } from '@nestjs/common';
import { AppError } from 'src/shared/errors/app-error';
import { NotFoundError } from 'src/shared/errors/not-found-error';
import {
  GEOCODING_PROVIDER,
  IGeocodingProvider,
} from '../interfaces/geocoding-provider.port';
import {
  FORECAST_PROVIDER,
  IForecastProvider,
} from '../interfaces/forecast-provider.port';
import { NomeCidadeVO } from '../value-objects/nome-cidade.vo';
import { ClimaResponse } from '../dto/clima.response.dto';

@Injectable()
export class ConsultarClimaUseCase {
  private readonly logger = new Logger(ConsultarClimaUseCase.name);

  constructor(
    @Inject(GEOCODING_PROVIDER)
    private readonly geocoding: IGeocodingProvider,
    @Inject(FORECAST_PROVIDER)
    private readonly forecast: IForecastProvider,
  ) {}

  async execute(nomeCidade: string): Promise<ClimaResponse> {
    try {
      const nome = NomeCidadeVO.criar(nomeCidade).value;

      const localidade = await this.geocoding.buscarLocalidade(nome);
      if (!localidade) {
        throw new NotFoundError(
          'Nenhuma cidade encontrada com o nome informado',
        );
      }

      const previsao = await this.forecast.buscarPrevisao(
        localidade.latitude,
        localidade.longitude,
      );

      return ClimaResponse.from(localidade, previsao);
    } catch (error) {
      if (error instanceof AppError) throw error;

      const err = error as Error;
      this.logger.error(`Erro ao consultar clima: ${err.message}`, err.stack);
      throw new AppError('Internal server error', 500);
    }
  }
}
