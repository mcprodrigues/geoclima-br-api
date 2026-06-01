import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppError } from 'src/shared/errors/app-error';
import { NotFoundError } from 'src/shared/errors/not-found-error';
import { CidadesService } from './cidades.service';
import { CidadesResponse } from './dto/cidades.response.dto';

@ApiTags('Cidades')
@Controller('cidades')
export class CidadesController {
  constructor(private readonly cidadesService: CidadesService) {}

  @Get(':sigla_uf')
  @ApiOperation({
    summary: 'Lista municípios de uma UF',
    description: 'Retorna os municípios da UF informada, respeitando o limite.',
  })
  @ApiParam({ name: 'sigla_uf', example: 'CE' })
  @ApiQuery({ name: 'limite', required: false, example: 10 })
  @ApiResponse({ status: 200, type: CidadesResponse })
  @ApiResponse({ status: 400, description: 'Sigla de UF inválida' })
  @ApiResponse({ status: 404, description: 'UF não encontrada' })
  @ApiResponse({ status: 503, description: 'Serviço externo indisponível' })
  async listar(
    @Param('sigla_uf') siglaUf: string,
    @Query('limite', new DefaultValuePipe(10), ParseIntPipe) limite: number,
  ): Promise<CidadesResponse> {
    try {
      return await this.cidadesService.listar(siglaUf, limite);
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
