/**
 * Conversão dos códigos WMO (`weather_code` do Open-Meteo) para condição em
 * português. Referência: https://open-meteo.com/en/docs (WMO Weather codes).
 */
export const WEATHER_CODE_PT: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Nevoeiro',
  48: 'Nevoeiro com geada',
  51: 'Garoa leve',
  53: 'Garoa moderada',
  55: 'Garoa densa',
  56: 'Garoa congelante leve',
  57: 'Garoa congelante densa',
  61: 'Chuva leve',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  66: 'Chuva congelante leve',
  67: 'Chuva congelante forte',
  71: 'Neve leve',
  73: 'Neve moderada',
  75: 'Neve forte',
  77: 'Grãos de neve',
  80: 'Pancadas de chuva leves',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva violentas',
  85: 'Pancadas de neve leves',
  86: 'Pancadas de neve fortes',
  95: 'Trovoada',
  96: 'Trovoada com granizo leve',
  99: 'Trovoada com granizo forte',
};

/** Devolve a condição em português para um `weather_code`, com fallback. */
export function condicaoDoWeatherCode(code: number | undefined | null): string {
  if (code === undefined || code === null) return 'Indisponível';
  return WEATHER_CODE_PT[code] ?? 'Condição desconhecida';
}
