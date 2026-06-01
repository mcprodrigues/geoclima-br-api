import { CidadesResponse } from '../dto/cidades.response.dto';

export interface ICidadesService {
  listar(siglaUf: string, limite?: number): Promise<CidadesResponse>;
}
