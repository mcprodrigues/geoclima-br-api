import { Injectable } from '@nestjs/common';
import { IClimaService } from './interfaces/clima.service.port';
import { ConsultarClimaUseCase } from './use-cases/consultar-clima.use-case';
import { ClimaResponse } from './dto/clima.response.dto';

@Injectable()
export class ClimaService implements IClimaService {
  constructor(private readonly consultarClimaUseCase: ConsultarClimaUseCase) {}

  consultar(nomeCidade: string): Promise<ClimaResponse> {
    return this.consultarClimaUseCase.execute(nomeCidade);
  }
}
