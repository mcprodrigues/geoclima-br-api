export const MUNICIPIOS_PROVIDER = Symbol.for('MUNICIPIOS_PROVIDER');

/**
 * Port de municípios: lista os nomes das cidades de uma UF.
 * Implementado por um adapter (ex.: BrasilAPI/IBGE).
 */
export interface IMunicipiosProvider {
  /**
   * Lista os nomes dos municípios da UF (sigla com 2 letras, maiúscula).
   * Retorna `[]` quando a UF não existe (ex.: 404 da fonte).
   * Deve lançar `ServiceUnavailableError` em falha/timeout de rede.
   */
  listarPorUf(uf: string): Promise<string[]>;
}
