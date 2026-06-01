export const GEOCODING_PROVIDER = Symbol.for('GEOCODING_PROVIDER');

/** Localidade brasileira resolvida a partir do nome da cidade. */
export interface Localidade {
  nome: string;
  latitude: number;
  longitude: number;
  /** Sigla da UF (resolvida do `admin1`), ou o próprio nome do estado se desconhecido. */
  estado: string;
}

/**
 * Port de geocoding: traduz o nome de uma cidade em coordenadas.
 * Implementado por um adapter (ex.: Open-Meteo).
 */
export interface IGeocodingProvider {
  /**
   * Resolve a primeira localidade brasileira para o nome informado.
   * Retorna `null` quando não há resultado no Brasil.
   * Deve lançar `ServiceUnavailableError` em falha/timeout de rede.
   */
  buscarLocalidade(nome: string): Promise<Localidade | null>;
}
