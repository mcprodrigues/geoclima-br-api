import { Test, TestingModule } from '@nestjs/testing';
import { AppError } from 'src/shared/errors/app-error';
import { NotFoundError } from 'src/shared/errors/not-found-error';
import { ServiceUnavailableError } from 'src/shared/errors/service-unavailable-error';
import { ListarCidadesUseCase } from '../use-cases/listar-cidades.use-case';
import { MUNICIPIOS_PROVIDER } from '../interfaces/municipios-provider.port';

const mockMunicipios = { listarPorUf: jest.fn() };

const CIDADES_CE = [
  'Abaiara',
  'Acarape',
  'Acaraú',
  'Acopiara',
  'Aiuaba',
  'Alcântaras',
  'Altaneira',
];

describe('ListarCidadesUseCase', () => {
  let useCase: ListarCidadesUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListarCidadesUseCase,
        { provide: MUNICIPIOS_PROVIDER, useValue: mockMunicipios },
      ],
    }).compile();

    useCase = module.get<ListarCidadesUseCase>(ListarCidadesUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return cities respecting the limit and uppercasing the UF', async () => {
      mockMunicipios.listarPorUf.mockResolvedValue(CIDADES_CE);

      const result = await useCase.execute('ce', 3);

      expect(mockMunicipios.listarPorUf).toHaveBeenCalledWith('CE');
      expect(result.uf).toBe('CE');
      expect(result.quantidade_retornada).toBe(3);
      expect(result.cidades).toHaveLength(3);
      expect(result.cidades[0]).toEqual({ nome: 'Abaiara' });
    });

    it('should default the limit to 10 when not provided', async () => {
      mockMunicipios.listarPorUf.mockResolvedValue(CIDADES_CE);

      const result = await useCase.execute('CE');

      expect(result.quantidade_retornada).toBe(CIDADES_CE.length); // < 10 disponíveis
    });

    it('should clamp the limit to the [1, 100] range', async () => {
      mockMunicipios.listarPorUf.mockResolvedValue(CIDADES_CE);

      const result = await useCase.execute('CE', 999);

      expect(result.quantidade_retornada).toBe(CIDADES_CE.length);
    });

    it('should throw AppError(400) when the UF sigla is invalid', async () => {
      await expect(useCase.execute('ceara', 5)).rejects.toMatchObject({
        statusCode: 400,
      });
      expect(mockMunicipios.listarPorUf).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when the provider returns an empty list', async () => {
      mockMunicipios.listarPorUf.mockResolvedValue([]);

      await expect(useCase.execute('XX', 5)).rejects.toThrow(NotFoundError);
    });

    it('should propagate ServiceUnavailableError from the provider', async () => {
      mockMunicipios.listarPorUf.mockRejectedValue(
        new ServiceUnavailableError('BrasilAPI indisponível'),
      );

      await expect(useCase.execute('CE', 5)).rejects.toMatchObject({
        statusCode: 503,
      });
    });

    it('should wrap unexpected errors in AppError(500)', async () => {
      mockMunicipios.listarPorUf.mockRejectedValue(new Error('boom'));

      await expect(useCase.execute('CE', 5)).rejects.toThrow(
        new AppError('Internal server error', 500),
      );
    });
  });
});
