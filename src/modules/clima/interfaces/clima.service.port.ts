import { ClimaResponse } from '../dto/clima.response.dto';

export interface IClimaService {
  consultar(nomeCidade: string): Promise<ClimaResponse>;
}
