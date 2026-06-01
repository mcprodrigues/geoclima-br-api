/**
 * Dado de referência: nome do estado (como vem no `admin1` do geocoding) -> sigla.
 *
 * Isto NÃO são coordenadas — a resolução de latitude/longitude continua dinâmica
 * via geocoding. É apenas a normalização do nome do estado para a sigla da UF.
 */
export const ESTADO_PARA_SIGLA: Record<string, string> = {
  acre: 'AC',
  alagoas: 'AL',
  amapá: 'AP',
  amazonas: 'AM',
  bahia: 'BA',
  ceará: 'CE',
  'distrito federal': 'DF',
  'espírito santo': 'ES',
  goiás: 'GO',
  maranhão: 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  pará: 'PA',
  paraíba: 'PB',
  paraná: 'PR',
  pernambuco: 'PE',
  piauí: 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  rondônia: 'RO',
  roraima: 'RR',
  'santa catarina': 'SC',
  'são paulo': 'SP',
  sergipe: 'SE',
  tocantins: 'TO',
};

/** Devolve a sigla da UF a partir do nome do estado, ou `null` se desconhecido. */
export function siglaDoEstado(admin1: string | undefined | null): string | null {
  if (!admin1) return null;
  return ESTADO_PARA_SIGLA[admin1.trim().toLowerCase()] ?? null;
}
