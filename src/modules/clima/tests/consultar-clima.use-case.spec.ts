import { Test, TestingModule } from '@nestjs/testing';
import { AppError } from 'src/shared/errors/app-error';
import { NotFoundError } from 'src/shared/errors/not-found-error';
import { ServiceUnavailableError } from 'src/shared/errors/service-unavailable-error';
import { ConsultarClimaUseCase } from '../use-cases/consultar-clima.use-case';
import {
  GEOCODING_PROVIDER,
  Localidade,
} from '../interfaces/geocoding-provider.port';
import {
  FORECAST_PROVIDER,
  PrevisaoDiaria,
} from '../interfaces/forecast-provider.port';

const mockGeocoding = { buscarLocalidade: jest.fn() };
const mockForecast = { buscarPrevisao: jest.fn() };

const localidade: Localidade = {
  nome: 'Fortaleza',
  latitude: -3.71722,
  longitude: -38.5434,
  estado: 'CE',
};

const previsao: PrevisaoDiaria = {
  temperaturaMin: 24.3,
  temperaturaMax: 31.8,
  weatherCode: 2,
};

describe('ConsultarClimaUseCase', () => {
  let useCase: ConsultarClimaUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultarClimaUseCase,
        { provide: GEOCODING_PROVIDER, useValue: mockGeocoding },
        { provide: FORECAST_PROVIDER, useValue: mockForecast },
      ],
    }).compile();

    useCase = module.get<ConsultarClimaUseCase>(ConsultarClimaUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return weather data with nome, estado and clima on success', async () => {
      mockGeocoding.buscarLocalidade.mockResolvedValue(localidade);
      mockForecast.buscarPrevisao.mockResolvedValue(previsao);

      const result = await useCase.execute('Fortaleza');

      expect(mockGeocoding.buscarLocalidade).toHaveBeenCalledWith('Fortaleza');
      expect(mockForecast.buscarPrevisao).toHaveBeenCalledWith(
        localidade.latitude,
        localidade.longitude,
      );
      expect(result.nome).toBe('Fortaleza');
      expect(result.estado).toBe('CE');
      expect(result.clima.temperatura_min).toBe(24);
      expect(result.clima.temperatura_max).toBe(32);
      expect(result.clima.condicao).toBe('Parcialmente nublado');
      expect(result.clima.unidades.temperatura).toBe('°C');
      expect(typeof result.consultado_em).toBe('string');
    });

    it('should throw AppError(400) when name has less than 2 characters', async () => {
      await expect(useCase.execute('A')).rejects.toMatchObject({
        statusCode: 400,
      });
      expect(mockGeocoding.buscarLocalidade).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when no Brazilian city is found', async () => {
      mockGeocoding.buscarLocalidade.mockResolvedValue(null);

      await expect(useCase.execute('Xpto123')).rejects.toThrow(NotFoundError);
    });

    it('should propagate ServiceUnavailableError from the geocoding provider', async () => {
      mockGeocoding.buscarLocalidade.mockRejectedValue(
        new ServiceUnavailableError('Open-Meteo indisponível'),
      );

      await expect(useCase.execute('Fortaleza')).rejects.toMatchObject({
        statusCode: 503,
      });
    });

    it('should wrap unexpected errors in AppError(500)', async () => {
      mockGeocoding.buscarLocalidade.mockRejectedValue(new Error('boom'));

      await expect(useCase.execute('Fortaleza')).rejects.toThrow(
        new AppError('Internal server error', 500),
      );
    });
  });
});
