import { ApiProperty } from '@nestjs/swagger';

class CidadeItem {
  @ApiProperty({ example: 'Fortaleza' })
  nome: string;
}

export class CidadesResponse {
  @ApiProperty({ example: 'CE' })
  uf: string;

  @ApiProperty({ example: 5 })
  quantidade_retornada: number;

  @ApiProperty({ type: [CidadeItem] })
  cidades: CidadeItem[];

  @ApiProperty({ example: '2025-03-15T14:30:00.000Z' })
  consultado_em: string;

  static from(uf: string, nomes: string[]): CidadesResponse {
    const dto = new CidadesResponse();
    dto.uf = uf;
    dto.cidades = nomes.map((nome) => ({ nome }));
    dto.quantidade_retornada = dto.cidades.length;
    dto.consultado_em = new Date().toISOString();
    return dto;
  }
}
