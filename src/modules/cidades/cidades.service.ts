import { Injectable } from '@nestjs/common';
import { ICidadesService } from './interfaces/cidades.service.port';
import { ListarCidadesUseCase } from './use-cases/listar-cidades.use-case';
import { CidadesResponse } from './dto/cidades.response.dto';

@Injectable()
export class CidadesService implements ICidadesService {
  constructor(private readonly listarCidadesUseCase: ListarCidadesUseCase) {}

  listar(siglaUf: string, limite?: number): Promise<CidadesResponse> {
    return this.listarCidadesUseCase.execute(siglaUf, limite);
  }
}
