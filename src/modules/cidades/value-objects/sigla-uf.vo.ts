import { AppError } from 'src/shared/errors/app-error';

/**
 * Value object da sigla da UF. Garante a invariante de "exatamente 2 letras"
 * e normaliza para maiúsculas antes de chegar à integração.
 */
export class SiglaUfVO {
  private constructor(private readonly normalized: string) {}

  static criar(raw: string): SiglaUfVO {
    const sigla = (raw ?? '').trim();
    if (!/^[A-Za-z]{2}$/.test(sigla)) {
      throw new AppError('A sigla da UF deve ter exatamente 2 letras', 400);
    }
    return new SiglaUfVO(sigla.toUpperCase());
  }

  get value(): string {
    return this.normalized;
  }
}
