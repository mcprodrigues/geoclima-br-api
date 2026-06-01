import { Inject, Injectable, Logger } from '@nestjs/common';
import { AppError } from 'src/shared/errors/app-error';
import { NotFoundError } from 'src/shared/errors/not-found-error';
import {
  IMunicipiosProvider,
  MUNICIPIOS_PROVIDER,
} from '../interfaces/municipios-provider.port';
import { SiglaUfVO } from '../value-objects/sigla-uf.vo';
import { CidadesResponse } from '../dto/cidades.response.dto';

const LIMITE_PADRAO = 10;
const LIMITE_MIN = 1;
const LIMITE_MAX = 100;

@Injectable()
export class ListarCidadesUseCase {
  private readonly logger = new Logger(ListarCidadesUseCase.name);

  constructor(
    @Inject(MUNICIPIOS_PROVIDER)
    private readonly municipios: IMunicipiosProvider,
  ) {}

  async execute(siglaUf: string, limiteRaw?: number): Promise<CidadesResponse> {
    try {
      const uf = SiglaUfVO.criar(siglaUf).value;
      const limite = this.normalizarLimite(limiteRaw);

      const nomes = await this.municipios.listarPorUf(uf);
      if (nomes.length === 0) {
        throw new NotFoundError('Nenhuma UF encontrada com a sigla informada');
      }

      return CidadesResponse.from(uf, nomes.slice(0, limite));
    } catch (error) {
      if (error instanceof AppError) throw error;

      const err = error as Error;
      this.logger.error(`Erro ao listar cidades: ${err.message}`, err.stack);
      throw new AppError('Internal server error', 500);
    }
  }

  /** Restringe o limite ao intervalo [1, 100], com default 10. */
  private normalizarLimite(limiteRaw?: number): number {
    if (limiteRaw === undefined || limiteRaw === null) return LIMITE_PADRAO;
    if (!Number.isFinite(limiteRaw)) return LIMITE_PADRAO;
    const inteiro = Math.trunc(limiteRaw);
    return Math.min(LIMITE_MAX, Math.max(LIMITE_MIN, inteiro));
  }
}
