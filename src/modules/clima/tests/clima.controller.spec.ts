import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AppError } from 'src/shared/errors/app-error';
import { NotFoundError } from 'src/shared/errors/not-found-error';
import { ServiceUnavailableError } from 'src/shared/errors/service-unavailable-error';
import { ClimaController } from '../clima.controller';
import { ClimaService } from '../clima.service';
import { ClimaResponse } from '../dto/clima.response.dto';

const mockClimaService = { consultar: jest.fn() };

function makeResponse(): ClimaResponse {
  const r = new ClimaResponse();
  r.nome = 'Fortaleza';
  r.estado = 'CE';
  r.clima = {
    temperatura_min: 24,
    temperatura_max: 32,
    condicao: 'Parcialmente nublado',
    unidades: { temperatura: '°C' },
  };
  r.consultado_em = new Date().toISOString();
  return r;
}

describe('ClimaController', () => {
  let controller: ClimaController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClimaController],
      providers: [{ provide: ClimaService, useValue: mockClimaService }],
    }).compile();

    controller = module.get<ClimaController>(ClimaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the weather response on success', async () => {
    const resposta = makeResponse();
    mockClimaService.consultar.mockResolvedValue(resposta);

    const result = await controller.consultar('Fortaleza');

    expect(mockClimaService.consultar).toHaveBeenCalledWith('Fortaleza');
    expect(result).toEqual(resposta);
  });

  it('should throw HttpException(400) when service throws AppError(400)', async () => {
    mockClimaService.consultar.mockRejectedValue(
      new AppError('Nome inválido', 400),
    );

    await expect(controller.consultar('A')).rejects.toThrow(
      new HttpException('Nome inválido', 400),
    );
  });

  it('should throw NotFoundException when service throws NotFoundError', async () => {
    mockClimaService.consultar.mockRejectedValue(
      new NotFoundError('Nenhuma cidade encontrada com o nome informado'),
    );

    await expect(controller.consultar('Xpto123')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw HttpException(503) when service throws ServiceUnavailableError', async () => {
    mockClimaService.consultar.mockRejectedValue(
      new ServiceUnavailableError('Open-Meteo indisponível'),
    );

    await expect(controller.consultar('Fortaleza')).rejects.toThrow(
      new HttpException('Open-Meteo indisponível', 503),
    );
  });

  it('should throw InternalServerErrorException for unknown errors', async () => {
    mockClimaService.consultar.mockRejectedValue(new Error('Unexpected'));

    await expect(controller.consultar('Fortaleza')).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
