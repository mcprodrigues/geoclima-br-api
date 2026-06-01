import { ApiProperty } from '@nestjs/swagger';
import { Localidade } from '../interfaces/geocoding-provider.port';
import { PrevisaoDiaria } from '../interfaces/forecast-provider.port';
import { condicaoDoWeatherCode } from '../weather-codes';

class ClimaUnidades {
  @ApiProperty({ example: '°C' })
  temperatura: string;
}

class ClimaDetalhe {
  @ApiProperty({ example: 24 })
  temperatura_min: number;

  @ApiProperty({ example: 32 })
  temperatura_max: number;

  @ApiProperty({ example: 'Parcialmente nublado' })
  condicao: string;

  @ApiProperty({ type: ClimaUnidades })
  unidades: ClimaUnidades;
}

export class ClimaResponse {
  @ApiProperty({ example: 'Fortaleza' })
  nome: string;

  @ApiProperty({ example: 'CE' })
  estado: string;

  @ApiProperty({ type: ClimaDetalhe })
  clima: ClimaDetalhe;

  @ApiProperty({ example: '2025-03-15T14:30:00.000Z' })
  consultado_em: string;

  static from(
    localidade: Localidade,
    previsao: PrevisaoDiaria,
  ): ClimaResponse {
    const dto = new ClimaResponse();
    dto.nome = localidade.nome;
    dto.estado = localidade.estado;
    dto.clima = {
      temperatura_min: Math.round(previsao.temperaturaMin),
      temperatura_max: Math.round(previsao.temperaturaMax),
      condicao: condicaoDoWeatherCode(previsao.weatherCode),
      unidades: { temperatura: '°C' },
    };
    dto.consultado_em = new Date().toISOString();
    return dto;
  }
}
