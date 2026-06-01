export const FORECAST_PROVIDER = Symbol.for('FORECAST_PROVIDER');

/** Previsão diária do dia atual para uma coordenada. */
export interface PrevisaoDiaria {
  temperaturaMin: number;
  temperaturaMax: number;
  weatherCode: number;
}

/**
 * Port de previsão do tempo: a partir de coordenadas, devolve a previsão do dia.
 * Implementado por um adapter (ex.: Open-Meteo).
 */
export interface IForecastProvider {
  /**
   * Busca a previsão do dia atual para a coordenada.
   * Deve lançar `ServiceUnavailableError` em falha/timeout de rede ou payload inválido.
   */
  buscarPrevisao(latitude: number, longitude: number): Promise<PrevisaoDiaria>;
}
