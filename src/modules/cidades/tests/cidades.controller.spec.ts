import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AppError } from 'src/shared/errors/app-error';
import { NotFoundError } from 'src/shared/errors/not-found-error';
import { CidadesController } from '../cidades.controller';
import { CidadesService } from '../cidades.service';
import { CidadesResponse } from '../dto/cidades.response.dto';

const mockCidadesService = { listar: jest.fn() };

describe('CidadesController', () => {
  let controller: CidadesController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CidadesController],
      providers: [{ provide: CidadesService, useValue: mockCidadesService }],
    }).compile();

    controller = module.get<CidadesController>(CidadesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the cities response on success', async () => {
    const resposta = CidadesResponse.from('CE', ['Abaiara', 'Acarape']);
    mockCidadesService.listar.mockResolvedValue(resposta);

    const result = await controller.listar('CE', 10);

    expect(mockCidadesService.listar).toHaveBeenCalledWith('CE', 10);
    expect(result).toEqual(resposta);
  });

  it('should throw HttpException(400) when service throws AppError(400)', async () => {
    mockCidadesService.listar.mockRejectedValue(
      new AppError('A sigla da UF deve ter exatamente 2 letras', 400),
    );

    await expect(controller.listar('ceara', 10)).rejects.toThrow(
      new HttpException('A sigla da UF deve ter exatamente 2 letras', 400),
    );
  });

  it('should throw NotFoundException when service throws NotFoundError', async () => {
    mockCidadesService.listar.mockRejectedValue(
      new NotFoundError('Nenhuma UF encontrada com a sigla informada'),
    );

    await expect(controller.listar('XX', 10)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw InternalServerErrorException for unknown errors', async () => {
    mockCidadesService.listar.mockRejectedValue(new Error('Unexpected'));

    await expect(controller.listar('CE', 10)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
