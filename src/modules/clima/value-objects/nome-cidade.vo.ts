import { AppError } from 'src/shared/errors/app-error';

const MIN_LENGTH = 2;

/**
 * Value object do nome da cidade. Garante a invariante de tamanho mínimo
 * (>= 2 caracteres após normalização) antes de chegar às integrações.
 */
export class NomeCidadeVO {
  private constructor(private readonly normalized: string) {}

  static criar(raw: string): NomeCidadeVO {
    const normalized = this.normalize(raw);
    if (normalized.length < MIN_LENGTH) {
      throw new AppError(
        'O nome da cidade deve ter pelo menos 2 caracteres',
        400,
      );
    }
    return new NomeCidadeVO(normalized);
  }

  get value(): string {
    return this.normalized;
  }

  private static normalize(raw: string): string {
    if (typeof raw !== 'string') return '';
    return raw.trim().replace(/\s+/g, ' ');
  }
}
