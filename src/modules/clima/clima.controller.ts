import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppError } from 'src/shared/errors/app-error';
import { NotFoundError } from 'src/shared/errors/not-found-error';
import { ClimaService } from './clima.service';
import { ClimaResponse } from './dto/clima.response.dto';

@ApiTags('Clima')
@Controller('clima')
export class ClimaController {
  constructor(private readonly climaService: ClimaService) {}

  @Get(':nome_cidade')
  @ApiOperation({
    summary: 'Consulta o clima atual de uma cidade brasileira',
    description:
      'Resolve as coordenadas dinamicamente pelo nome da cidade e retorna a previsão do dia.',
  })
  @ApiParam({ name: 'nome_cidade', example: 'Fortaleza' })
  @ApiResponse({ status: 200, type: ClimaResponse })
  @ApiResponse({ status: 400, description: 'Nome da cidade inválido' })
  @ApiResponse({ status: 404, description: 'Cidade não encontrada' })
  @ApiResponse({ status: 503, description: 'Serviço externo indisponível' })
  async consultar(
    @Param('nome_cidade') nomeCidade: string,
  ): Promise<ClimaResponse> {
    try {
      return await this.climaService.consultar(nomeCidade);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof NotFoundError)
      throw new NotFoundException(error.message);
    if (error instanceof AppError)
      throw new HttpException(error.message, error.statusCode);
    throw new InternalServerErrorException(
      error instanceof Error ? error.message : 'Unexpected error',
    );
  }
}
