import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ClimaController } from './clima.controller';
import { ClimaService } from './clima.service';
import { ConsultarClimaUseCase } from './use-cases/consultar-clima.use-case';
import { GEOCODING_PROVIDER } from './interfaces/geocoding-provider.port';
import { FORECAST_PROVIDER } from './interfaces/forecast-provider.port';
import { OpenMeteoGeocodingAdapter } from './open-meteo-geocoding.adapter';
import { OpenMeteoForecastAdapter } from './open-meteo-forecast.adapter';

@Module({
  imports: [HttpModule],
  controllers: [ClimaController],
  providers: [
    ClimaService,
    ConsultarClimaUseCase,
    {
      provide: GEOCODING_PROVIDER,
      useClass: OpenMeteoGeocodingAdapter,
    },
    {
      provide: FORECAST_PROVIDER,
      useClass: OpenMeteoForecastAdapter,
    },
  ],
})
export class ClimaModule {}
